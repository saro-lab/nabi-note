// html 그물 — 조립 스냅샷·왕복 멱등·XSS·빈 문단 받침.
//
// ** 의 절반은 이 그물이 도는 것 자체다** — 러너는 Node 다. 조립 경로가 DOM 어휘를 하나라도
// 쓰면 여기서 죽는다(그리고 경계 시험이 소스에서 먼저 잡는다). 들여오기는 DOM 이 필요한 유일한
// 자리라, 코어(`import.ts`)를 최소 엘리먼트 모양 위에 짜고 그물은 초소형 토크나이저로 그 모양을
// 지어 왕복을 잰다 — `parse.ts`(DOMParser 어댑터)만 브라우저에서 도는 얇은 껍데기다.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { makeEnv } from '../src/schema/env.js';
import { $fromJson, $toJson } from '../src/schema/json.js';
import type { ElementNode, NabiDoc, NabiNode } from '../src/schema/types.js';
import { renderEditorHtml, renderHtml, renderParagraphHtml } from '../src/html/render.js';
import { importDoc } from '../src/html/import.js';
import { fragmentOf, singleLumpOf } from '../src/html/paste.js';
import { safeUrl } from '../src/html/url.js';
import type { HtmlOptions } from '../src/html/contract.js';
import { tinyHtml } from './tiny-html.js';
import { done, eq, ok } from './net.js';

// 07 이 wing 선언에서 지을 환경을, 여기서는 확정된 기본 wing 갈래로 손수 짓는다.
const ENV = makeEnv({
  voids: ['hr', 'img', 'youtube'],
  lumps: ['hr', 'img', 'youtube', 'table', 'ul', 'ol', 'tl', 'quote', 'details', 'code'],
  blockHolders: ['table', 'tr', 'td', 'ul', 'li', 'ol', 'oli', 'tl', 'tli', 'quote', 'details'],
  inlineHolders: ['summary', 'code'],
  boolAttrs: ['dc', 'o', 'ck'],
});

const OPT: HtmlOptions = { env: ENV };

const read = (html: string, options: Partial<HtmlOptions> = {}): NabiDoc =>
  importDoc(tinyHtml(html), { env: ENV,...options });

const json = (doc: NabiDoc): string => JSON.stringify($toJson(doc));

// 의 전체 예시 — 확정 스키마의 정본 문서다.
const EX = [
  { w: 'p', a: { h: 1, a: 'c' }, ch: ['제목글'] },
  {
    w: 'p',
    a: { a: 'c', dc: 1 },
    ch: [
      '맨글자 ',
      { w: 'b', ch: ['굵게'] },
      { w: 'i', ch: ['기울임'] },
      { w: 'u', ch: ['밑줄'] },
      { w: 's', ch: ['취소선'] },
      { w: 'sub', ch: ['아래첨자'] },
      { w: 'sup', ch: ['위첨자'] },
      { w: 'hl', a: { c: 'yellow' }, ch: ['형광펜'] },
      { w: 'tc', a: { c: 'green' }, ch: ['글자색'] },
      { w: 'fs', a: { v: 'lg' }, ch: ['큰 글자'] },
      { w: 'tf', a: { v: 'serif' }, ch: ['세리프'] },
      { w: 'a', a: { href: 'https://example.com' }, ch: ['링크'] },
      { w: 'a', a: { href: '/f/x.png', file: '첨부.png' }, ch: ['첨부'] },
      { w: 'br', ch: [] },
      '둘째 라인',
    ],
  },
  { w: 'p', a: { a: 'c' }, ch: [{ w: 'img', a: { src: '/logo/x.svg', w: '40' }, ch: [] }] },
  { w: 'p', ch: [{ w: 'youtube', a: { v: '6j-gQmaZ9Zk', w: '60' }, ch: [] }] },
  { w: 'p', ch: [{ w: 'hr', ch: [] }] },
  {
    w: 'p',
    a: { a: 'c' },
    ch: [
      {
        w: 'table',
        ch: [
          {
            w: 'tr',
            ch: [
              { w: 'td', a: { colspan: '2' }, ch: [{ w: 'p', ch: ['칸 글', { w: 'br', ch: [] }, '둘째 줄'] }] },
            ],
          },
        ],
      },
    ],
  },
  { w: 'p', ch: [{ w: 'ul', ch: [{ w: 'li', ch: [{ w: 'p', ch: ['글머리 항목'] }] }] }] },
  { w: 'p', ch: [{ w: 'ol', ch: [{ w: 'oli', ch: [{ w: 'p', ch: ['번호 항목'] }] }] }] },
  { w: 'p', ch: [{ w: 'tl', ch: [{ w: 'tli', a: { ck: 1 }, ch: [{ w: 'p', ch: ['체크된 항목'] }] }] }] },
  { w: 'p', ch: [{ w: 'quote', ch: [{ w: 'p', ch: ['인용 글'] }] }] },
  {
    w: 'p',
    ch: [{ w: 'details', a: { o: 1 }, ch: [{ w: 'summary', ch: ['접기 제목'] }, { w: 'p', ch: ['접기 속 글'] }] }],
  },
  { w: 'p', ch: [{ w: 'code', a: { lang: 'ts' }, ch: ['const x = 1', { w: 'br', ch: [] }, 'const y = 2'] }] },
];

const doc = $fromJson(EX, ENV);
ok('확정 스키마의 예시가 나비트리로 읽힌다', doc !== null);
const EXAMPLE: NabiDoc = doc ?? [];

// --- 조립 — 보기 HTML 스냅샷 -----------------------------------------------------------------

// 이 글자열이 곧 계약이다: 태그 대응·속성 이름·라인·받침·표 겉옷이 한 줄에 다 들어 있다.
const VIEW =
  '<h1 data-nabi-align="c">제목글</h1>' +
  '<p data-nabi-align="c" data-nabi-dropcap="1">맨글자 <b>굵게</b><i>기울임</i><u>밑줄</u><s>취소선</s>' +
  '<sub>아래첨자</sub><sup>위첨자</sup><mark data-color="yellow">형광펜</mark>' +
  '<span data-color="green">글자색</span><span data-nabi-size="lg">큰 글자</span>' +
  '<span data-nabi-typeface="serif">세리프</span><a href="https://example.com/">링크</a>' +
  // 첨부에는 `download` 가 붙는다 — 여는 것이 아니라 받는 것이라고 말하는 자리다(값은 없다).
  '<a href="/f/x.png" data-nabi-file="첨부.png" download>첨부</a><br/>둘째 라인</p>' +
  '<div data-nabi-p data-nabi-align="c"><img src="/logo/x.svg" alt data-nabi-width="40"/></div>' +
  '<div data-nabi-p><iframe src="https://www.youtube-nocookie.com/embed/6j-gQmaZ9Zk" title="YouTube"' +
  ' allowfullscreen loading="lazy" data-nabi-width="60"></iframe></div>' +
  '<div data-nabi-p><hr/></div>' +
  '<div data-nabi-p data-nabi-align="c"><div class="nabi-scroll"><table><tr>' +
  '<td colspan="2"><p>칸 글<br/>둘째 줄</p></td></tr></table></div></div>' +
  '<div data-nabi-p><ul><li><p>글머리 항목</p></li></ul></div>' +
  '<div data-nabi-p><ol><li><p>번호 항목</p></li></ol></div>' +
  '<div data-nabi-p><ul data-nabi-list="task"><li data-nabi-checked="true"><p>체크된 항목</p></li></ul></div>' +
  '<div data-nabi-p><blockquote><p>인용 글</p></blockquote></div>' +
  '<div data-nabi-p><details open><summary>접기 제목</summary><p>접기 속 글</p></details></div>' +
  '<div data-nabi-p><pre data-nabi-lang="ts"><code class="language-ts">const x = 1<br/>const y = 2</code></pre></div>';

const view = renderHtml(EXAMPLE, OPT);
eq('보기 HTML 은 예시 전체를 고정된 한 모양으로 낸다', view, VIEW);
ok('조립이 Node(러너)에서 실제로 돈다', view.length > 0);

const editor = renderEditorHtml(EXAMPLE, OPT);
// 편집기가 보기와 갈리는 곳은 **둘뿐이다** — 재그리기의 자리(`data-key`)와 첨부의 봉인(101).
// 봉인은 편집기에서만 첨부를 캐럿이 안 드는 섬으로 만드는 손이라, 저장·발행값에는 영영 안 나간다.
// 셋째가 생기면 이 자물쇠가 먼저 운다 — 편집기와 보기가 조용히 갈라지는 것을 막는 자리다.
const SEAL = ' contenteditable="false" draggable="false"';
const bare = editor.replace(/ data-key="[^"]*"/g, '').split(SEAL).join('');
ok('편집기 HTML 은 같은 조립에 data-key 와 첨부 봉인만 더 붙는다', bare === view, [bare.slice(0, 200)]);
ok(
  '첨부는 편집기에서 봉해진다 — 캐럿이 안 드는 섬',
  editor.includes('data-nabi-file="\uCCA8\uBD80.png" download' + SEAL),
);
ok('보통 링크는 안 봉한다 — 그 글자는 사람이 쓴 문장이다', editor.includes('<a href="https://example.com/">'));
ok('봉인은 보기(저장·발행)값에 안 나간다', !view.includes('contenteditable') && !view.includes('draggable'));
ok('data-key 는 문단 급 이상에만 붙는다 (마크·라인에는 없다)', !/<(b|i|mark|span|a|br)\b[^>]*data-key/.test(editor));
ok('문단에는 data-key 가 붙는다', editor.startsWith('<h1 data-key="n0"'));
ok('물건·컨테이너에도 data-key 가 붙는다 (부분 재그리기의 자리)', editor.includes('<table data-key="n5.0">'));

// --- 조립 — 문단의 세 얼굴 -------------------------------------------------------------------

eq(
  '빈 문단은 출력에서도 한 줄이다 (받침)',
  renderHtml([{ w: 'p', ch: [] }], OPT),
  '<p><br/></p>',
);
eq(
  '빈 문단의 받침은 편집기에서도 같다',
  renderEditorHtml([{ w: 'p', ch: [], _id: 'k1' }], OPT),
  '<p data-key="k1"><br/></p>',
);
// 끝의 라인 — 브라우저가 블록 맨 끝의 `<br>` 를 줄바꿈으로 안 그려서, 글 끝의 첫 Shift+Enter 가
// 화면에서 무시된 것처럼 보였다. 화면에만 받침을 하나 더 세운다. **발행값은 안 변한다.**
{
  const line: ElementNode = { w: 'br', ch: [] };
  const tail = (ch: NabiNode[]): NabiDoc => [{ w: 'p', ch, _id: 'k1' }];
  eq('끝이 라인이면 발행값은 그대로다', renderHtml(tail(['abc', line]), OPT), '<p>abc<br/></p>');
  eq(
    '끝이 라인이면 편집기 화면에만 받침이 하나 더 선다',
    renderEditorHtml(tail(['abc', line]), OPT),
    '<p data-key="k1">abc<br/><br data-nabi-filler/></p>',
);
  eq(
    '가운데 라인에는 안 붙는다 — 끝일 때만이다',
    renderEditorHtml(tail(['abc', line, 'def']), OPT),
    '<p data-key="k1">abc<br/>def</p>',
);
  // 홀더는 문단만이 아니다 — 칸·항목·요약·코드가 같은 문(`ctx.filled`)을 지난다.
  const inCell: NabiDoc = [
    { w: 'p', ch: [{ w: 'table', ch: [{ w: 'tr', ch: [{ w: 'td', ch: [{ w: 'p', ch: ['a', line] }] }] }] }] },
  ];
  ok('표 칸 속의 끝 라인도 받침을 받는다', renderEditorHtml(inCell, OPT).includes('a<br/><br data-nabi-filler/>'));
  ok('그 받침은 발행값에 없다', !renderHtml(inCell, OPT).includes('filler'));
}

eq('제목은 속성이 태그를 정한다', renderHtml([{ w: 'p', a: { h: 3 }, ch: ['셋'] }], OPT), '<h3>셋</h3>');
eq('제목 범위 밖 값은 제목이 아니다', renderHtml([{ w: 'p', a: { h: 7 }, ch: ['일곱'] }], OPT), '<p>일곱</p>');
eq(
  '정렬은 data-nabi-align 으로 나간다',
  renderHtml([{ w: 'p', a: { a: 'r' }, ch: ['오른쪽'] }], OPT),
  '<p data-nabi-align="r">오른쪽</p>',
);
eq('목록 밖 정렬 값은 아무도 안 말한다', renderHtml([{ w: 'p', a: { a: 'center' }, ch: ['가'] }], OPT), '<p>가</p>');
eq(
  '드롭캡은 data-nabi-dropcap 으로 나간다',
  renderHtml([{ w: 'p', a: { dc: 1 }, ch: ['가'] }], OPT),
  '<p data-nabi-dropcap="1">가</p>',
);
eq(
  '래퍼문단은 div 다 — p 는 표·리스트를 못 품는다',
  renderHtml([{ w: 'p', a: { a: 'c', dc: 1, h: 2 }, ch: [{ w: 'hr', ch: [] }] }], OPT),
  '<div data-nabi-p data-nabi-align="c"><hr/></div>',
);
eq(
  '라인은 br 하나다',
  renderHtml([{ w: 'p', ch: ['앞', { w: 'br', ch: [] }, '뒤'] }], OPT),
  '<p>앞<br/>뒤</p>',
);
eq(
  '빈 칸·빈 항목에도 받침이 선다',
  renderHtml([{ w: 'p', ch: [{ w: 'table', ch: [{ w: 'tr', ch: [{ w: 'td', ch: [] }] }] }] }], OPT),
  '<div data-nabi-p><div class="nabi-scroll"><table><tr><td><br/></td></tr></table></div></div>',
);
eq(
  '접기는 보기에서 글쓴이가 고른 대로, 편집기에서는 늘 펼쳐진다',
  renderHtml([{ w: 'p', ch: [{ w: 'details', ch: [{ w: 'summary', ch: ['제목'] }] }] }], OPT),
  '<div data-nabi-p><details><summary>제목</summary></details></div>',
);
// 편집기도 저장값 그대로 그린다 — 삼각형을 누른 것이 곧 저장될 모습이라, 화면과 값이 한 몸이다.
eq(
  '편집기의 접기도 저장값 그대로다 (닫혀 있으면 닫혀 그린다)',
  renderEditorHtml([{ w: 'p', ch: [{ w: 'details', ch: [{ w: 'summary', ch: ['제목'] }] }] }], OPT),
  '<div data-nabi-p><details><summary>제목</summary></details></div>',
);
eq(
  '편집기의 접기 — 펼쳐 저장이면 펼쳐 그린다',
  renderEditorHtml([{ w: 'p', ch: [{ w: 'details', a: { o: 1 }, ch: [{ w: 'summary', ch: ['제목'] }] }] }], OPT),
  '<div data-nabi-p><details open><summary>제목</summary></details></div>',
);
eq(
  '조립을 아는 이가 없는 타입은 껍데기를 벗는다',
  renderHtml([{ w: 'p', ch: [{ w: 'blink', ch: ['속만'] }] }], OPT),
  '<p>속만</p>',
);
eq(
  '조립 맵은 인자로 갈아 끼운다 (07 이 wing 의 toHtml 로 잇는 자리)',
  renderHtml([{ w: 'p', ch: [{ w: 'b', ch: ['굵게'] }] }], {
    env: ENV,
    builders: { b: (_node, children, ctx) => ctx.element('strong', children()) },
  }),
  '<p><strong>굵게</strong></p>',
);

// --- XSS — `a` 안은 전부 검증 대상이다 -------------------------------------------------------

eq(
  '글자는 이스케이프된다 — 스크립트가 태그로 서지 않는다',
  renderHtml([{ w: 'p', ch: ['<script>alert(1)</script>'] }], OPT),
  '<p>&lt;script&gt;alert(1)&lt;/script&gt;</p>',
);
// 공격을 나르는 칸은 **글자를 그대로 받는 칸**이어야 한다 — 첨부 표식(`file`)이 그 자리다
// (그림의 `alt` 는 대체 글을 걷으면서 값을 안 받게 됐다).
eq(
  '속성 값의 따옴표 탈출은 막힌다',
  renderHtml([{ w: 'p', ch: [{ w: 'a', a: { href: '/x.png', file: '" onerror="alert(1)' }, ch: ['글'] }] }], OPT),
  '<p><a href="/x.png" data-nabi-file="&quot; onerror=&quot;alert(1)" download>글</a></p>',
);
eq(
  '닫힌 태그 탈출 시도도 값일 뿐이다',
  renderHtml([{ w: 'p', ch: [{ w: 'a', a: { href: '/x.png', file: '"><script>x</script>' }, ch: ['글'] }] }], OPT),
  '<p><a href="/x.png" data-nabi-file="&quot;&gt;&lt;script&gt;x&lt;/script&gt;" download>글</a></p>',
);
// 그림의 `alt` 는 **언제나 빈 값**이다 — 대체 글은 걷었지만 속성은 남긴다. `alt` 가 아예 없는
// 그림을 낭독기는 파일 이름으로 읽어 주소를 소리 내지만, 빈 `alt` 는 "읽을 글이 없다" 는 뜻이라
// 조용히 지나간다. 없는 것보다 빈 것이 낫다.
eq(
  '그림은 언제나 빈 alt 를 단다',
  renderHtml([{ w: 'p', ch: [{ w: 'img', a: { src: '/x.png' }, ch: [] }] }], OPT),
  '<div data-nabi-p><img src="/x.png" alt/></div>',
);
eq(
  '들여올 때 옛 문서의 대체 글은 안 들인다',
  json(read('<p><img src="/x.png" alt="옛 설명"/></p>')),
  '[{"w":"p","ch":[{"w":"img","a":{"src":"/x.png"},"ch":[]}]}]',
);
eq(
  'javascript: 링크는 링크가 아니라 평문이다',
  renderHtml([{ w: 'p', ch: [{ w: 'a', a: { href: 'javascript:alert(1)' }, ch: ['눌러'] }] }], OPT),
  '<p>눌러</p>',
);
eq(
  'javascript: 그림은 없는 것으로 친다 (래퍼문단만 받침을 안고 남는다)',
  renderHtml([{ w: 'p', ch: [{ w: 'img', a: { src: 'javascript:alert(1)' }, ch: [] }] }], OPT),
  '<div data-nabi-p><br/></div>',
);
eq(
  '낯선 wing 이 낸 태그 이름도 문법을 못 깬다',
  renderHtml([{ w: 'p', ch: [{ w: 'x', ch: ['속'] }] }], {
    env: ENV,
    builders: { x: (_node, children, ctx) => ctx.element('p onload=alert(1)', children()) },
  }),
  '<p>속</p>',
);
ok('safeUrl — http(s) 절대 주소는 받는다', safeUrl('https://example.com/a') === 'https://example.com/a');
ok('safeUrl — 상대 경로는 그대로 둔다', safeUrl('/f/x.png') === '/f/x.png');
ok('safeUrl — 상대 경로에 스킴 흉내가 섞이면 거절한다', safeUrl('./a:b') === null);
ok('safeUrl — javascript: 는 거절한다', safeUrl('javascript:alert(1)') === null);
ok('safeUrl — data:text/html 은 allowLocal 이어도 거절한다', safeUrl('data:text/html,<b>x', true) === null);
ok('safeUrl — data:image 는 allowLocal 일 때만 받는다', safeUrl('data:image/png;base64,AA', true) !== null && safeUrl('data:image/png;base64,AA') === null);
// 프로토콜 상대 주소 — 스킴이 없어 상대 경로처럼 보이지만 **호스트가 바뀐다.** 피싱·오픈
// 리다이렉트이고, 그림이면 문서를 여는 순간 남의 서버로 요청이 나가 IP·Referer 가 샌다.
ok('safeUrl — 프로토콜 상대 주소(//)는 거절한다', safeUrl('//evil.com/x') === null);
ok('safeUrl — allowLocal 이어도 // 는 거절한다', safeUrl('//evil.com/x', true) === null);
ok('safeUrl — 앞뒤 공백을 털고도 // 는 거절한다', safeUrl('  //evil.com/x  ') === null);
// SVG 는 스크립트를 품는 유일한 그림 형식이다 — `data:` 로 실려 오면 그림의 얼굴을 한 문서다.
ok('safeUrl — data:image/svg+xml 은 allowLocal 이어도 거절한다', safeUrl('data:image/svg+xml,<svg/>', true) === null);
ok('safeUrl — blob: 은 allowLocal 일 때만 받는다', safeUrl('blob:https://x/1', true) !== null && safeUrl('blob:https://x/1') === null);
// 대소문자·공백을 섞은 스킴 흉내.
for (const bad of ['JavaScript:alert(1)', ' javascript:alert(1)', 'vbscript:msgbox(1)', 'data:text/html;base64,PHNjcmlwdD4=']) {
  ok(`safeUrl — 거절: ${bad}`, safeUrl(bad, true) === null);
}

// --- 들여오기 — 태그 → 노드 역대응 -----------------------------------------------------------

eq(
  '스크립트는 속까지 버린다 — 껍데기만 벗기면 본문이 글자로 되살아난다',
  json(read('<p>앞<script>alert(1)</script>뒤</p>')),
  json(read('<p>앞뒤</p>')),
);
eq('낯선 속성(onerror)은 들어오지 않는다', json(read('<p onclick="x()">글</p>')), '[{"w":"p","ch":["글"]}]');

// **이사 온 서식** — 서체·글자 크기는 한때 문단 속성이었고 지금은 마크다. 그 시절 문서는 블록에
// 그 표식을 달고 있는데, 지금 규칙으로 그냥 읽으면 문단 속성 화이트리스트에 없어 조용히 사라진다
// (nabi-web 의 예문이 그렇게 사라졌다). 속 전체를 덮는 마크 하나로 옮겨 뜻을 지킨다.
eq(
  '블록의 서체는 속 전체를 덮는 마크가 된다',
  json(read('<p data-nabi-typeface="serif">글</p>')),
  '[{"w":"p","ch":[{"w":"tf","a":{"v":"serif"},"ch":["글"]}]}]',
);
eq(
  '블록의 글자 크기도 같은 길이다',
  json(read('<p data-nabi-size="lg">글</p>')),
  '[{"w":"p","ch":[{"w":"fs","a":{"v":"lg"},"ch":["글"]}]}]',
);
eq(
  '문단 속성(제목·정렬)은 그대로 남고 마크만 덧입는다',
  json(read('<h2 data-nabi-typeface="mono" data-nabi-align="c">글</h2>')),
  '[{"w":"p","a":{"h":2,"a":"c"},"ch":[{"w":"tf","a":{"v":"mono"},"ch":["글"]}]}]',
);
eq(
  '속의 마크는 그대로 살아 그 안에 든다',
  json(read('<p data-nabi-typeface="serif">앞 <b>굵게</b> 뒤</p>')),
  '[{"w":"p","ch":[{"w":"tf","a":{"v":"serif"},"ch":["앞 ",{"w":"b","ch":["굵게"]}," 뒤"]}]}]',
);
// 값 검사는 이 층의 일이 아니다 — 들여오기는 읽고, 목록 밖 값은 뒤의 repair 가 껍데기째 걷는다
// (span 으로 온 것과 **같은 길**이다). 편집기를 지나면 사라지는 것이 그 증거다.
eq(
  '들여오기는 값을 안 가린다 — 마크로 옮기기만 한다',
  json(read('<p data-nabi-typeface="nonsense">글</p>')),
  '[{"w":"p","ch":[{"w":"tf","a":{"v":"nonsense"},"ch":["글"]}]}]',
);
eq(
  'javascript: 주소는 들여올 때도 평문이 된다',
  json(read('<p><a href="javascript:alert(1)">눌러</a></p>')),
  '[{"w":"p","ch":["눌러"]}]',
);
eq(
  '<p> 와 <div data-nabi-p> 는 둘 다 문단이다',
  json(read('<p>글</p><div data-nabi-p><hr/></div>')),
  '[{"w":"p","ch":["글"]},{"w":"p","ch":[{"w":"hr","ch":[]}]}]',
);
eq(
  '문단을 품은 껍데기는 문단이 아니라 묶음이다',
  json(read('<div><p>가</p><p>나</p></div>')),
  '[{"w":"p","ch":["가"]},{"w":"p","ch":["나"]}]',
);
eq('빈 문단의 받침은 도로 빈 문단이 된다', json(read('<p><br></p>')), '[{"w":"p","ch":[]}]');
eq('제목·정렬·드롭캡은 되읽힌다', json(read('<h2 data-nabi-align="c" data-nabi-dropcap="1">제목</h2>')), '[{"w":"p","a":{"h":2,"a":"c","dc":1},"ch":["제목"]}]');
eq(
  '표의 횡스크롤 겉옷과 tbody 는 벗겨진다',
  json(read('<div class="nabi-scroll"><table><tbody><tr><td>칸</td></tr></tbody></table></div>')),
  '[{"w":"p","ch":[{"w":"table","ch":[{"w":"tr","ch":[{"w":"td","ch":[{"w":"p","ch":["칸"]}]}]}]}]}]',
);
eq(
  '블록 자리의 들여쓰기 공백은 문단이 되지 않는다',
  json(read('<ul>\n  <li>\n    <p>항목</p>\n  </li>\n</ul>')),
  '[{"w":"p","ch":[{"w":"ul","ch":[{"w":"li","ch":[{"w":"p","ch":["항목"]}]}]}]}]',
);
eq(
  '출력 관례의 체크박스도 체크로 읽는다',
  json(read('<ul data-nabi-list="task"><li><input type="checkbox" checked><p>한</p></li></ul>')),
  '[{"w":"p","ch":[{"w":"tl","ch":[{"w":"tli","a":{"ck":1},"ch":[{"w":"p","ch":["한"]}]}]}]}]',
);
eq(
  '바깥 관례(pre > code.language-*)의 언어도 따라온다',
  json(read('<pre><code class="language-js">a<br>b</code></pre>')),
  '[{"w":"p","ch":[{"w":"code","a":{"lang":"js"},"ch":["a",{"w":"br","ch":[]},"b"]}]}]',
);

// --- 왕복 ------------------------------------------------------------------------------------

const back = read(view);
eq('왕복 — render → parse → cocoon → render 가 같은 글자열이다 (멱등)', renderHtml(back, OPT), view);
eq(
  '왕복 — 트리도 그대로다 (주소는 URL 표준형으로 한 번 다듬어진다)',
  json(back),
  JSON.stringify($toJson(EXAMPLE)).replace('https://example.com', 'https://example.com/'),
);
eq('왕복 — 두 번째 걸음은 아무것도 안 바꾼다 f(f(x)) = f(x)', json(read(renderHtml(back, OPT))), json(back));
eq('왕복 — 편집기 HTML 도 같은 트리로 되읽힌다', json(read(renderEditorHtml(EXAMPLE, OPT))), json(back));

// --- 붙여넣기 자료 ---------------------------------------------------------------------------

eq('빈 조각에는 빈 문단이 딸려 오지 않는다', fragmentOf(read('')), []);
const lumpFragment = read('<div data-nabi-p><hr/></div>');
eq(
  '단일 물건 조각은 그 물건을 내준다 — 빈 문단은 자식만 갈면 래퍼문단이 된다',
  singleLumpOf(fragmentOf(lumpFragment), ENV)?.w,
  'hr',
);
ok('글 조각은 단일 물건이 아니다', singleLumpOf(fragmentOf(read('<p>글</p>')), ENV) === null);
ok('물건 둘은 단일 물건이 아니다', singleLumpOf(fragmentOf(read('<hr/><hr/>')), ENV) === null);

// --- 경계 -----------------------------------------------------------------------------------

const index = readFileSync(fileURLToPath(new URL('../src/html/index.ts', import.meta.url)), 'utf8');
ok('이스케이프 함수는 층 밖으로 안 나간다 (06 규칙)', !/\bescape/i.test(index), [index]);

// 문단 하나만 다시 그리는 문(부분 재그리기·SSR 조각)이 전체 조립과 같은 값을 낸다.
const first = EXAMPLE[0] as ElementNode;
eq('문단 하나 조립은 전체 조립의 한 걸음과 같다', renderParagraphHtml(first, OPT), '<h1 data-nabi-align="c">제목글</h1>');
eq(
  '문단 하나 조립도 편집기 갈래를 갖는다 (hydrate 조각)',
  renderParagraphHtml(first, OPT, true),
  '<h1 data-key="n0" data-nabi-align="c">제목글</h1>',
);

done('html');
