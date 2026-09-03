// 신뢰 경계 그물 — 들어올 때(HTML·JSON 입구가 같은 답)와 나갈 때(어떤 입력도 출력에서 안 터짐) 두 번 잡는다. 요점은 경로 대칭이다: 같은 공격 문자열을 두 문에 넣으면 트리가 같아야 한다.
// Trust-boundary net — checked twice, on the way in (HTML and JSON entry points must agree) and on the way out (no input should produce executable output). The core idea is path symmetry: the same attack string through either gate must yield the same tree.
import {
  $createNabiWith,
  createNabiWith,
  makeRegistry,
  renderStoredEditorHtml,
  renderStoredHtml,
} from '../src/wing/index.js';
import { defaultWings, makeImageWing } from '../src/wings/index.js';
import { tinyHtml } from './tiny-html.js';
import { done, eq, ok } from './net.js';

const stand = (allowLocalUrls = false) =>
  $createNabiWith(defaultWings, { parseHtml: tinyHtml, ...(allowLocalUrls ? { allowLocalUrls } : {}) }).nabi;

// --- 1. 경로 대칭 — 같은 공격이 두 문에서 같은 트리를 낸다 -------------------------------------

// [이름, HTML 로 넣는 모양, 그와 같은 뜻의 나비트리 JSON]
const PAIRS: readonly (readonly [string, string, unknown[]])[] = [
  [
    'javascript: 링크',
    '<p><a href="javascript:alert(1)">클릭</a></p>',
    [{ w: 'p', ch: [{ w: 'a', a: { href: 'javascript:alert(1)' }, ch: ['클릭'] }] }],
  ],
  [
    '대소문자를 섞은 스킴 흉내',
    '<p><a href="JaVaScRiPt:alert(1)">클릭</a></p>',
    [{ w: 'p', ch: [{ w: 'a', a: { href: 'JaVaScRiPt:alert(1)' }, ch: ['클릭'] }] }],
  ],
  [
    'vbscript: 링크',
    '<p><a href="vbscript:msgbox(1)">클릭</a></p>',
    [{ w: 'p', ch: [{ w: 'a', a: { href: 'vbscript:msgbox(1)' }, ch: ['클릭'] }] }],
  ],
  [
    'data:text/html 링크',
    '<p><a href="data:text/html,&lt;script&gt;">클릭</a></p>',
    [{ w: 'p', ch: [{ w: 'a', a: { href: 'data:text/html,<script>' }, ch: ['클릭'] }] }],
  ],
  [
    '프로토콜 상대 주소 링크',
    '<p><a href="//evil.com/x">클릭</a></p>',
    [{ w: 'p', ch: [{ w: 'a', a: { href: '//evil.com/x' }, ch: ['클릭'] }] }],
  ],
  [
    // 빈 칸 교정(repairCell)과 독 거르기가 같은 걸음에 있다 — 교정한다고 거르기가 느슨해지면 안 된다.
    // Cell repair and poison filtering happen in the same step — repairing malformed cells must never loosen the filtering.
    '표칸 교정 속의 javascript: 링크 (빈 칸 동반)',
    '<table><tr><td><a href="javascript:alert(1)">클릭</a></td><td></td></tr></table>',
    [
      {
        w: 'p',
        ch: [
          {
            w: 'table',
            ch: [
              {
                w: 'tr',
                ch: [
                  { w: 'td', ch: [{ w: 'a', a: { href: 'javascript:alert(1)' }, ch: ['클릭'] }] },
                  { w: 'td', ch: [] },
                ],
              },
            ],
          },
        ],
      },
    ],
  ],
  [
    '따옴표를 끼운 형광펜 값',
    '<p><mark data-color="yellow&quot; onmouseover=&quot;alert(1)">글</mark></p>',
    [{ w: 'p', ch: [{ w: 'hl', a: { c: 'yellow" onmouseover="alert(1)' }, ch: ['글'] }] }],
  ],
  [
    '목록 밖 형광펜 값',
    '<p><mark data-color="chartreuse">글</mark></p>',
    [{ w: 'p', ch: [{ w: 'hl', a: { c: 'chartreuse' }, ch: ['글'] }] }],
  ],
  [
    '목록 밖 글자 크기',
    '<p><span data-nabi-size="999px">글</span></p>',
    [{ w: 'p', ch: [{ w: 'fs', a: { v: '999px' }, ch: ['글'] }] }],
  ],
  [
    'javascript: 그림',
    '<p><img src="javascript:alert(1)"/></p>',
    [{ w: 'p', ch: [{ w: 'img', a: { src: 'javascript:alert(1)' }, ch: [] }] }],
  ],
  [
    '프로토콜 상대 주소 그림',
    '<p><img src="//evil.com/x.png"/></p>',
    [{ w: 'p', ch: [{ w: 'img', a: { src: '//evil.com/x.png' }, ch: [] }] }],
  ],
];

for (const [name, html, json] of PAIRS) {
  const fromHtml = stand();
  fromHtml.setHtml(html);
  const fromJson = stand();
  fromJson.setJson(json);
  eq(`경로 대칭 — ${name}`, fromJson.getJson(), fromHtml.getJson());
}

// --- 2. 저장값 불변식 — 어떤 입력을 넣어도 트리에 독이 안 남는다 ---------------------------------

// 트리 전체를 훑어 attr 값 하나하나를 본다 — 출력만 보는 시험은 예전에 이 구멍을 못 잡았다. 출력은 처음부터 안전했고, 새는 곳은 저장값이었다.
// Walks the whole tree checking every attribute value — an output-only test previously missed this hole, since the output was safe all along and the leak was in the stored value.
const POISON = /javascript:|vbscript:|data:text\/html|onerror=|onmouseover=|^\/\//i;

function poisonedAttrs(value: unknown): string[] {
  const found: string[] = [];
  const walk = (node: unknown): void => {
    if (Array.isArray(node)) {
      for (const item of node) walk(item);
      return;
    }
    if (typeof node !== 'object' || node === null) return;
    const el = node as { a?: Record<string, unknown>; ch?: unknown };
    for (const [key, raw] of Object.entries(el.a ?? {})) {
      if (typeof raw === 'string' && POISON.test(raw)) found.push(`${key}=${raw}`);
    }
    walk(el.ch);
  };
  walk(value);
  return found;
}

for (const [name, html, json] of PAIRS) {
  const fromHtml = stand();
  fromHtml.setHtml(html);
  const htmlPoison = poisonedAttrs(fromHtml.getJson());
  ok(`저장값 — HTML 입구: ${name}`, htmlPoison.length === 0, htmlPoison);

  const fromJson = stand();
  fromJson.setJson(json);
  const jsonPoison = poisonedAttrs(fromJson.getJson());
  ok(`저장값 — JSON 입구: ${name}`, jsonPoison.length === 0, jsonPoison);
}

// --- 3. 출력 불변식 — 어떤 입력을 넣어도 실행되는 것이 안 나간다 ---------------------------------

const ATTACKS: readonly string[] = [
  '<p><script>alert(1)</script>뒤</p>',
  '<p><img src="x" onerror="alert(1)"/></p>',
  '<p><a href="javascript:alert(1)">클릭</a></p>',
  '<p><svg><script>alert(1)</script></svg></p>',
  '<p><iframe src="https://evil.com/"></iframe></p>',
  '<p onclick="alert(1)" style="x">글</p>',
  '<p><form><input name="x"/></form></p>',
  '<p>&lt;script&gt;alert(1)&lt;/script&gt;</p>',
];

const RUNS = /<script|javascript:|\son\w+\s*=/i;

for (const attack of ATTACKS) {
  const nabi = stand();
  nabi.setHtml(attack);
  const out = nabi.getHtml();
  ok(`출력 — 실행되는 것이 없다: ${attack.slice(0, 34)}`, !RUNS.test(out), [out]);
  // 편집기 화면도 같은 조립을 탄다 — 한쪽만 안전한 일이 없어야 한다.
  // The editor's own display goes through the same assembly — only one side being safe is not acceptable.
  const seen = nabi.getEditorHtml();
  ok(`편집기 출력 — 실행되는 것이 없다: ${attack.slice(0, 34)}`, !RUNS.test(seen), [seen]);
}

// --- 4. 자리별 문 — 가는 자리와 가져오는 자리 -----------------------------------------------------

{
  // `allowLocalUrls` 는 가져오는 자리에만 산다 — 업로드 미리보기용으로 연 것이 링크에까지 열리면 `data:image/svg+xml`을 문 `a`가 문서에 박힌다.
  // `allowLocalUrls` applies only to the import side — if opening it for upload previews also opened it for links, an `a` tag could carry `data:image/svg+xml` into the document.
  const local = stand(true);
  local.setHtml('<p><a href="data:image/svg+xml,&lt;svg onload=x&gt;">클릭</a></p>');
  eq('allowLocal 이어도 링크는 data: 를 안 받는다', local.getJson(), [{ w: 'p', ch: ['클릭'] }]);

  const blobLink = stand(true);
  blobLink.setHtml('<p><a href="blob:https://x/1">클릭</a></p>');
  eq('allowLocal 이어도 링크는 blob: 을 안 받는다', blobLink.getJson(), [{ w: 'p', ch: ['클릭'] }]);

  // 그림 자리에서는 산다 — 업로드 미리보기가 이 길로 그려진다. 짝이라 한쪽만 켜면 안 된다: 문서와 그림 wing의 `allowLocalUrls`가 함께 열려야 그 주소가 산다.
  // For images it does apply — upload previews render through this path. It's a pair, so opening only one side isn't enough: both the document's and the image wing's `allowLocalUrls` must be open together for the URL to work.
  const localImage = (): ReturnType<typeof stand> =>
    $createNabiWith([...defaultWings.filter((wing) => wing.w !== 'img'), makeImageWing({ allowLocalUrls: true })], {
      allowLocalUrls: true,
      parseHtml: tinyHtml,
    }).nabi;

  const preview = localImage();
  preview.setHtml('<p><img src="data:image/png;base64,AA"/></p>');
  ok('짝을 맞춰 열면 그림은 data:image 를 받는다', preview.getHtml().includes('data:image/png'));

  // svg 만은 짝을 맞춰 열어도 안 받는다 — 스크립트를 품는 유일한 그림 형식이다.
  // SVG alone is rejected even with both sides open — it's the only image format that can carry a script.
  const svg = localImage();
  svg.setHtml('<p><img src="data:image/svg+xml,&lt;svg onload=x&gt;"/></p>');
  ok('짝을 맞춰 열어도 그림은 data:image/svg+xml 을 안 받는다', !svg.getHtml().includes('svg+xml'));
}

// --- 5. 저장본 문 — 에디터 없이 그려도 같은 신뢰 경계다 (090) -----------------------------------

{
  // renderStoredHtml은 setJson→getHtml과 같은 걸음이어야 한다 — 갈리면 댓글 목록·SSR만 덜 씻긴 HTML을 받는다.
  // renderStoredHtml must take the same steps as setJson→getHtml — if the paths diverge, comment feeds and SSR alone would get under-sanitized HTML.
  const registry = makeRegistry(defaultWings);
  for (const [name, , json] of PAIRS) {
    const seen = stand();
    seen.setJson(json);
    eq(`저장본 문 — 에디터와 같은 보기 HTML: ${name}`, renderStoredHtml(json, registry), seen.getHtml());
    eq(`저장본 문 — 에디터와 같은 편집기 HTML: ${name}`, renderStoredEditorHtml(json, registry), seen.getEditorHtml());
    const out = renderStoredHtml(json, registry) ?? '';
    ok(`저장본 문 — 실행되는 것이 없다: ${name}`, !RUNS.test(out), [out]);
  }

  // 거절은 setJson 과 같은 규칙 — 문서 전체(배열)가 아니면 안 받는다.
  ok(
    '저장본 문 — 나비트리가 아니면 null',
    renderStoredHtml({ w: 'p' }, registry) === null &&
      renderStoredEditorHtml('글자열', registry) === null &&
      renderStoredHtml([{ ch: [] }], registry) === null,
  );
}

done('xss');
