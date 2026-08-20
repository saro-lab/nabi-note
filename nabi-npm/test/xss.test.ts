// 신뢰 경계 그물 — 밖에서 온 값이 문서에 박히기까지의 두 줄을 잡는다.
//
//   ① 들어올 때 한 번 — HTML 입구(`setHtml`)와 JSON 입구(`setJson`)가 **같은 답**을 내야 한다.
//      한쪽만 엄격하면 출력은 안 터져도 **저장값이 오염된다**: 그 JSON 을 읽는 다른 것(모바일 앱의
//      자체 렌더러, 검색 인덱서, 메일 템플릿)에서 터진다. 실제로 그랬고, 그 재발을 여기서 막는다.
//   ② 나갈 때 한 번 — 어떤 입력을 넣어도 출력 HTML 에 실행되는 것이 없어야 한다.
//
// 이 그물의 요점은 **경로 대칭**이다. 개별 방어를 하나씩 세는 것이 아니라, "같은 공격 문자열을
// 두 문에 넣으면 트리가 같다" 는 한 문장을 공격 목록 전체에 대해 확인한다.
import { createNabiWith, makeRegistry, renderStoredEditorHtml, renderStoredHtml } from '../src/wing/index.js';
import { defaultWings, makeImageWing } from '../src/wings/index.js';
import { tinyHtml } from './tiny-html.js';
import { done, eq, ok } from './net.js';

const stand = (allowLocalUrls = false) =>
  createNabiWith(defaultWings, { parseHtml: tinyHtml, ...(allowLocalUrls ? { allowLocalUrls } : {}) }).nabi;

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
    // 빈 칸 교정(repairCell, ailog 102)과 독 거르기가 **같은 걸음**에 있다 — 교정하는 길이
    // 열렸다고 거르기가 느슨해지면 안 된다. 독 링크는 평문이 되고 빈 칸은 문단 하나로 선다.
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
                ch: [{ w: 'td', ch: [{ w: 'a', a: { href: 'javascript:alert(1)' }, ch: ['클릭'] }] }, { w: 'td', ch: [] }],
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

// 트리 전체를 훑어 attr 값 하나하나를 본다. 출력만 보는 시험은 ★1 을 못 잡았다 — 출력은
// 처음부터 안전했고, 새는 곳이 **저장값**이었다.
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
  const seen = nabi.getEditorHtml();
  ok(`편집기 출력 — 실행되는 것이 없다: ${attack.slice(0, 34)}`, !RUNS.test(seen), [seen]);
}

// --- 4. 자리별 문 — 가는 자리와 가져오는 자리 -----------------------------------------------------

{
  // `allowLocalUrls` 는 **가져오는 자리에만** 산다. 호스트가 업로드 미리보기 하나를 켜려고 연
  // 것이 링크에까지 열리면, `data:image/svg+xml` 을 문 `a` 가 문서에 박힌다 — SVG 는 스크립트를
  // 품는 유일한 그림 형식이다.
  const local = stand(true);
  local.setHtml('<p><a href="data:image/svg+xml,&lt;svg onload=x&gt;">클릭</a></p>');
  eq('allowLocal 이어도 링크는 data: 를 안 받는다', local.getJson(), [{ w: 'p', ch: ['클릭'] }]);

  const blobLink = stand(true);
  blobLink.setHtml('<p><a href="blob:https://x/1">클릭</a></p>');
  eq('allowLocal 이어도 링크는 blob: 을 안 받는다', blobLink.getJson(), [{ w: 'p', ch: ['클릭'] }]);

  // 그림 자리에서는 산다 — 업로드 미리보기가 이 길로 그려진다. **짝이라 한쪽만 켜면 안 된다**:
  // 문서의 `allowLocalUrls` 와 그림 wing 의 `allowLocalUrls` 가 함께 열려야 그 주소가 산다.
  const localImage = (): ReturnType<typeof stand> =>
    createNabiWith(
      [...defaultWings.filter((wing) => wing.w !== 'img'), makeImageWing({ allowLocalUrls: true })],
      { parseHtml: tinyHtml, allowLocalUrls: true },
    ).nabi;

  const preview = localImage();
  preview.setHtml('<p><img src="data:image/png;base64,AA"/></p>');
  ok('짝을 맞춰 열면 그림은 data:image 를 받는다', preview.getHtml().includes('data:image/png'));

  // svg 만은 짝을 맞춰 열어도 안 받는다 — 스크립트를 품는 유일한 그림 형식이다.
  const svg = localImage();
  svg.setHtml('<p><img src="data:image/svg+xml,&lt;svg onload=x&gt;"/></p>');
  ok('짝을 맞춰 열어도 그림은 data:image/svg+xml 을 안 받는다', !svg.getHtml().includes('svg+xml'));
}

// --- 5. 저장본 문 — 에디터 없이 그려도 같은 신뢰 경계다 (090) -----------------------------------

{
  // renderStoredHtml 은 setJson→getHtml 과 **같은 걸음**($fromJson→cocoon→조립)이어야 한다.
  // 두 길이 갈리면 댓글 목록·SSR 만 덜 씻긴 HTML 을 받는다 — 대칭이 곧 방어다.
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
