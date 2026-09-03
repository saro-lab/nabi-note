// md 그물 — 부분집합 파서·조립기·스니핑을 검사한다. 등록된 wing만 서는 규칙과 파서·조립의 왕복 닫힘을 증명한다. DOM·편집기 없이, 순수 함수만으로.
// Markdown test net for the subset parser, renderer, and sniffing — proves that only registered wings fire and that parse/render form a closed roundtrip, using pure functions only (no DOM, no editor).
import { parseMarkdown, renderMarkdown, smellsMarkdown, type MdEnv, type MdOptions } from '../src/io/index.js';
import { cocoon, type ElementNode, type NabiDoc } from '../src/schema/index.js';
import { makeRegistry } from '../src/wing/index.js';
import { defaultWings } from '../src/wings/index.js';
import { done, eq, ok } from './net.js';

// 어휘 전부가 등록된 환경 — 문법마다 세우는 모양을 잴 때 쓴다.
const all: MdEnv = { has: () => true };
const only = (...ws: readonly string[]): MdEnv => ({ has: (w) => ws.includes(w) });
const none: MdEnv = { has: () => false };

const md = (text: string, env: MdEnv = all): readonly ElementNode[] => parseMarkdown(text, env);
const p = (ch: readonly unknown[]): unknown => ({ w: 'p', ch });
const br = { w: 'br', ch: [] };

// --- 블록 ------------------------------------------------------------------------------------
{
  eq('제목은 문단의 h 속성이다', md('### 셋'), [{ w: 'p', a: { h: 3 }, ch: ['셋'] }]);
  eq('닫는 # 은 표식이지 글이 아니다', md('## 둘 ##'), [{ w: 'p', a: { h: 2 }, ch: ['둘'] }]);
  eq('#{7} 은 제목이 아니다', md('####### 일곱'), [p(['####### 일곱'])]);

  eq('구분선은 hr 하나다', md('---'), [{ w: 'hr', ch: [] }]);
  eq('별 셋도 구분선이다', md('***'), [{ w: 'hr', ch: [] }]);

  eq('이어진 줄은 한 문단으로 잇는다', md('앞줄\n뒷줄'), [p(['앞줄 뒷줄'])]);
  eq('빈 줄이 문단을 가른다', md('첫째\n\n둘째'), [p(['첫째']), p(['둘째'])]);
  eq('줄 끝 공백 둘은 라인이다', md('하나  \n둘'), [p(['하나', br, '둘'])]);
  eq('줄 끝 역슬래시도 라인이다', md('하나\\\n둘'), [p(['하나', br, '둘'])]);

  eq('인용은 속을 다시 블록으로 읽는다', md('> 한 줄\n>\n> - 목록'), [
    { w: 'quote', ch: [p(['한 줄']), { w: 'ul', ch: [{ w: 'li', ch: [p(['목록'])] }] }] },
  ]);
  eq('중첩 인용은 안 한다 — 속의 > 는 글자다', md('> 겉\n> > 속'), [{ w: 'quote', ch: [p(['겉 > 속'])] }]);

  eq('코드 울타리의 언어는 lang 이 되고 속은 평문과 라인뿐이다', md('```ts\na\n\n`b`\n```'), [
    { w: 'code', a: { lang: 'ts' }, ch: ['a', br, br, '`b`'] },
  ]);
  eq('언어 없는 울타리는 lang 이 없다', md('```\na\n```'), [{ w: 'code', ch: ['a'] }]);
}

// --- 목록 ------------------------------------------------------------------------------------
{
  eq('글머리 목록은 ul > li > p 다', md('- 하나\n- 둘'), [
    {
      w: 'ul',
      ch: [
        { w: 'li', ch: [p(['하나'])] },
        { w: 'li', ch: [p(['둘'])] },
      ],
    },
  ]);
  eq('번호 목록은 ol > oli > p 다', md('1. 하나\n2) 둘'), [
    {
      w: 'ol',
      ch: [
        { w: 'oli', ch: [p(['하나'])] },
        { w: 'oli', ch: [p(['둘'])] },
      ],
    },
  ]);
  eq('체크가 글머리보다 먼저다 — 켠 항목만 ck 를 든다', md('- [ ] 안 함\n- [x] 함'), [
    {
      w: 'tl',
      ch: [
        { w: 'tli', ch: [p(['안 함'])] },
        { w: 'tli', a: { ck: 1 }, ch: [p(['함'])] },
      ],
    },
  ]);
  eq('들여쓴 항목은 앞 항목 속으로 들어간다', md('- 겉\n  - 속\n- 다시 겉'), [
    {
      w: 'ul',
      ch: [
        { w: 'li', ch: [p(['겉']), { w: 'ul', ch: [{ w: 'li', ch: [p(['속'])] }] }] },
        { w: 'li', ch: [p(['다시 겉'])] },
      ],
    },
  ]);
  eq('가족이 갈리면 목록도 갈린다', md('- 글머리\n1. 번호'), [
    { w: 'ul', ch: [{ w: 'li', ch: [p(['글머리'])] }] },
    { w: 'ol', ch: [{ w: 'oli', ch: [p(['번호'])] }] },
  ]);
}

// --- 표 --------------------------------------------------------------------------------------
{
  eq('표의 머리 줄은 td 의 th 속성이다', md('| a | b |\n|---|---|\n| 1 | 2 |'), [
    {
      w: 'table',
      ch: [
        {
          w: 'tr',
          ch: [
            { w: 'td', a: { th: 1 }, ch: [p(['a'])] },
            { w: 'td', a: { th: 1 }, ch: [p(['b'])] },
          ],
        },
        {
          w: 'tr',
          ch: [
            { w: 'td', ch: [p(['1'])] },
            { w: 'td', ch: [p(['2'])] },
          ],
        },
      ],
    },
  ]);
  eq('표는 1열도 인식한다', md('| 한칸 |\n|:-:|\n| 값 |'), [
    {
      w: 'table',
      ch: [
        { w: 'tr', ch: [{ w: 'td', a: { th: 1 }, ch: [p(['한칸'])] }] },
        { w: 'tr', ch: [{ w: 'td', ch: [p(['값'])] }] },
      ],
    },
  ]);
  eq('짧은 줄은 빈 칸으로 채운다 — 표는 격자다', md('| a | b |\n|---|---|\n| 1 |'), [
    {
      w: 'table',
      ch: [
        {
          w: 'tr',
          ch: [
            { w: 'td', a: { th: 1 }, ch: [p(['a'])] },
            { w: 'td', a: { th: 1 }, ch: [p(['b'])] },
          ],
        },
        {
          w: 'tr',
          ch: [
            { w: 'td', ch: [p(['1'])] },
            { w: 'td', ch: [{ w: 'p', ch: [] }] },
          ],
        },
      ],
    },
  ]);
  eq('구분선이 안 따라오면 표가 아니다', md('| a | b |'), [p(['| a | b |'])]);
}

// --- 인라인 ----------------------------------------------------------------------------------
{
  eq('굵게·기울임·취소선', md('**굵** *기* ~~취~~'), [
    p([{ w: 'b', ch: ['굵'] }, ' ', { w: 'i', ch: ['기'] }, ' ', { w: 's', ch: ['취'] }]),
  ]);
  eq('밑줄 표기도 같은 마크다', md('__굵__ _기_'), [p([{ w: 'b', ch: ['굵'] }, ' ', { w: 'i', ch: ['기'] }])]);
  eq('낱말 속 밑줄은 강조가 아니다', md('snake_case_name'), [p(['snake_case_name'])]);
  eq('코드 조각은 tf:mono 다', md('`x`'), [p([{ w: 'tf', a: { v: 'mono' }, ch: ['x'] }])]);
  eq('mono 를 안 받는 어휘면 원문 그대로다', md('`x`', { has: () => true, hasValue: () => false }), [p(['`x`'])]);

  eq('링크는 a 마크다', md('[집](https://nabi.example/)'), [
    p([{ w: 'a', a: { href: 'https://nabi.example/' }, ch: ['집'] }]),
  ]);
  eq('꺾쇠 주소도 링크다', md('<https://nabi.example/>'), [
    p([{ w: 'a', a: { href: 'https://nabi.example/' }, ch: ['https://nabi.example/'] }]),
  ]);
  eq('맨 URL 도 링크다 — 끝의 문장부호는 뗀다', md('https://nabi.example/a 를 보라.'), [
    p([{ w: 'a', a: { href: 'https://nabi.example/a' }, ch: ['https://nabi.example/a'] }, ' 를 보라.']),
  ]);
  eq('safeUrl 을 통과 못 한 주소는 링크가 아니라 평문이다', md('[x](javascript:alert(1))'), [
    p(['[x](javascript:alert(1))']),
  ]);
  eq('그림은 src 만 싣는다 — 대체 글은 안 받는 갈래다', md('![대체](https://nabi.example/a.png)'), [
    p([{ w: 'img', a: { src: 'https://nabi.example/a.png' }, ch: [] }]),
  ]);
  eq('나쁜 주소의 그림은 원문 글자로 남는다', md('![](javascript:x)'), [p(['![](javascript:x)'])]);
  eq('이스케이프한 표식은 글자다', md('\\*not italic\\*'), [p(['*not italic*'])]);
  eq('짝이 없는 표식도 글자다', md('별 하나 * 만 있다'), [p(['별 하나 * 만 있다'])]);
}

// --- 레지스트리 문 ----------------------------------------------------------------------------
{
  eq('받아 줄 wing 이 하나도 없으면 아무 문법도 안 선다', md('# 제목\n- 하나\n> 인용\n---', none), [
    p(['# 제목 - 하나 > 인용 ---']),
  ]);
  eq('등록된 문법만 선다 — ul 뿐이면 목록만 선다', md('# 제목\n- 하나', only('ul')), [
    p(['# 제목']),
    { w: 'ul', ch: [{ w: 'li', ch: [p(['하나'])] }] },
  ]);
  eq('b 가 없으면 굵게 표식은 글자다', md('**굵**', only('i')), [p(['**굵**'])]);
  eq('a 가 없으면 링크는 글자다', md('[t](https://nabi.example/)', none), [p(['[t](https://nabi.example/)'])]);
}

// --- cocoon 과 맞물린다 -------------------------------------------------------------------------
// 파서는 래퍼문단을 안 씌운다 — 물건을 감싸고 쪼개는 마지막 한 걸음은 cocoon 의 몫이다.
// The parser doesn't wrap bare objects in paragraphs — that final wrapping/splitting step belongs to cocoon.
{
  const env = makeRegistry(defaultWings).env;
  const doc = cocoon([...md('- 하나\n\n---')], env);
  ok(
    '맨몸 목록·구분선이 cocoon 을 지나면 래퍼문단을 입는다',
    doc.length === 2 && doc.every((block) => block.w === 'p'),
  );
  ok(
    '래퍼문단 속이 곧 파서가 세운 물건이다',
    (doc[0]?.ch[0] as ElementNode).w === 'ul' && (doc[1]?.ch[0] as ElementNode).w === 'hr',
  );
}

// --- 조립 (실제 어휘로 — 진짜 wing 들이 든 toMd 를 잰다) ------------------------------------------
const registry = makeRegistry(defaultWings);

const mdOptions: MdOptions = {
  env: registry.env,
  builders: registry.mdBuilders,
  html: { env: registry.env, builders: registry.builders },
};

// 등록된 어휘를 그대로 본 파서 환경 — 붙여넣기 판이 실제로 쓰는 판정이다. 값 마크는 wing의 currentValue에게 직접 물어본다.
// A parser environment mirroring what's actually registered — the same check the paste picker uses. Value marks are checked against the wing's own currentValue.
const wingEnv: MdEnv = {
  has: (w) => registry.wingOf(w) !== null || registry.ownerOf(w) !== null,
  hasValue: (w, value) => registry.wingOf(w)?.currentValue?.({ w, a: { v: value }, ch: [] }) === value,
};

const render = (blocks: readonly ElementNode[]): string => renderMarkdown(cocoon([...blocks], registry.env), mdOptions);
const reread = (text: string): NabiDoc => cocoon([...parseMarkdown(text, wingEnv)], registry.env);

{
  eq('제목은 # × n 이다', render([{ w: 'p', a: { h: 3 }, ch: ['셋'] }]), '### 셋');
  eq('맨 문단은 그대로다', render([{ w: 'p', ch: ['그냥 글'] }]), '그냥 글');
  eq(
    '블록 사이는 빈 줄 하나다',
    render([
      { w: 'p', ch: ['위'] },
      { w: 'p', ch: ['아래'] },
    ]),
    '위\n\n아래',
  );
  eq('라인은 줄 끝 공백 둘이다', render([{ w: 'p', ch: ['위', { w: 'br', ch: [] }, '아래'] }]), '위  \n아래');

  eq(
    '강조 셋은 제 표식을 두른다',
    render([
      {
        w: 'p',
        ch: [
          { w: 'b', ch: ['굵'] },
          { w: 'i', ch: ['기'] },
          { w: 's', ch: ['취'] },
        ],
      },
    ]),
    '**굵***기*~~취~~',
  );
  eq('고정폭 서체는 코드 조각이다', render([{ w: 'p', ch: [{ w: 'tf', a: { v: 'mono' }, ch: ['x'] }] }]), '`x`');
  eq(
    '링크는 [글](주소) 다',
    render([{ w: 'p', ch: [{ w: 'a', a: { href: 'https://nabi.example/a' }, ch: ['집'] }] }]),
    '[집](https://nabi.example/a)',
  );
  eq(
    '그림은 대체 글 없는 ![](주소) 다 — 폭은 잃는다',
    render([{ w: 'img', a: { src: 'https://n.example/a.png', w: '60' }, ch: [] }]),
    '![](https://n.example/a.png)',
  );
  eq('구분선은 하이픈 셋이다', render([{ w: 'hr', ch: [] }]), '---');

  eq(
    '인용은 빈 줄에도 > 를 단다 — 그것이 속의 문단 경계다',
    render([
      {
        w: 'quote',
        ch: [
          { w: 'p', ch: ['첫'] },
          { w: 'p', ch: ['둘'] },
        ],
      },
    ]),
    '> 첫\n>\n> 둘',
  );
  eq(
    '목록은 항목이 붙어 서고 중첩은 들여쓰기다',
    render([
      {
        w: 'ul',
        ch: [
          {
            w: 'li',
            ch: [
              { w: 'p', ch: ['겉'] },
              { w: 'ul', ch: [{ w: 'li', ch: [{ w: 'p', ch: ['속'] }] }] },
            ],
          },
          { w: 'li', ch: [{ w: 'p', ch: ['다시'] }] },
        ],
      },
    ]),
    '- 겉\n  - 속\n- 다시',
  );
  eq(
    '번호는 목록이 매긴다 — 항목은 제가 몇 째인지 모른다',
    render([
      {
        w: 'ol',
        ch: [
          { w: 'oli', ch: [{ w: 'p', ch: ['하나'] }] },
          { w: 'oli', ch: [{ w: 'p', ch: ['둘'] }] },
        ],
      },
    ]),
    '1. 하나\n2. 둘',
  );
  eq(
    '체크는 켠 것만 x 다',
    render([
      {
        w: 'tl',
        ch: [
          { w: 'tli', ch: [{ w: 'p', ch: ['안'] }] },
          { w: 'tli', a: { ck: 1 }, ch: [{ w: 'p', ch: ['함'] }] },
        ],
      },
    ]),
    '- [ ] 안\n- [x] 함',
  );
  eq(
    '코드는 울타리 안의 평문이다 — 이스케이프가 없다',
    render([{ w: 'code', a: { lang: 'ts' }, ch: ['a * b', { w: 'br', ch: [] }, 'c'] }]),
    '```ts\na * b\nc\n```',
  );
  eq(
    '표는 파이프 격자다 — 머리 줄 다음에 구분 줄이 선다',
    render([
      {
        w: 'table',
        ch: [
          {
            w: 'tr',
            ch: [
              { w: 'td', a: { th: 1 }, ch: [{ w: 'p', ch: ['a'] }] },
              { w: 'td', a: { th: 1 }, ch: [{ w: 'p', ch: ['b'] }] },
            ],
          },
          {
            w: 'tr',
            ch: [
              { w: 'td', ch: [{ w: 'p', ch: ['1'] }] },
              { w: 'td', ch: [{ w: 'p', ch: ['2'] }] },
            ],
          },
        ],
      },
    ]),
    '| a | b |\n| --- | --- |\n| 1 | 2 |',
  );
}

// --- 이스케이프 — 파서의 `\` 와 짝이다 -----------------------------------------------------------
{
  eq(
    '평문 속 표식 글자는 막는다',
    render([{ w: 'p', ch: ['별 * 밑줄 _ 대괄호 [x] 파이프 | 물결 ~ 백틱 ` 부등호 <'] }]),
    '별 \\* 밑줄 \\_ 대괄호 \\[x\\] 파이프 \\| 물결 \\~ 백틱 \\` 부등호 \\<',
  );
  eq('줄머리 표식은 줄머리에서만 막는다', render([{ w: 'p', ch: ['- 목록이 아니다'] }]), '\\- 목록이 아니다');
  eq('번호 줄머리는 점을 막는다', render([{ w: 'p', ch: ['1. 번호가 아니다'] }]), '1\\. 번호가 아니다');
  eq('샾은 줄 안에서는 글자 그대로다', render([{ w: 'p', ch: ['C# 과 # 은 글자다'] }]), 'C# 과 # 은 글자다');
  eq('막은 글은 되읽으면 그대로 돌아온다', reread(render([{ w: 'p', ch: ['별 * 과 [x] 와 | 하나'] }])), [
    { w: 'p', ch: ['별 * 과 [x] 와 | 하나'], _id: 'n0' },
  ]);
}

// --- html 폴백 — md 에 자리가 없는 것은 그 노드만 html 로 떨어진다 --------------------------------
{
  eq(
    'toMd 없는 마크는 html 이다 (밑줄)',
    render([{ w: 'p', ch: ['앞', { w: 'u', ch: ['밑'] }, '뒤'] }]),
    '앞<u>밑</u>뒤',
  );
  ok(
    'toMd 없는 물건은 html 이다 (유튜브)',
    render([{ w: 'youtube', a: { v: 'abcdefghijk' }, ch: [] }]).startsWith('<iframe'),
  );
  ok(
    'toMd 없는 컨테이너는 속째 html 이다 (접기)',
    render([
      {
        w: 'details',
        a: { o: 1 },
        ch: [
          { w: 'summary', ch: ['제목'] },
          { w: 'p', ch: ['속'] },
        ],
      },
    ]) === '<details open><summary>제목</summary><p>속</p></details>',
  );
  eq(
    '정렬 문단은 html 이다 — md 에 정렬이 없다',
    render([{ w: 'p', a: { a: 'c' }, ch: ['가운데'] }]),
    '<p data-nabi-align="c">가운데</p>',
  );
  eq(
    '드롭캡 문단도 html 이다',
    render([{ w: 'p', a: { dc: 1 }, ch: ['첫 글자'] }]),
    '<p data-nabi-dropcap="1">첫 글자</p>',
  );
  ok(
    '병합된 표는 통째로 html 이다 — 반쯤 적으면 격자가 흐트러진다',
    render([
      {
        w: 'table',
        ch: [
          { w: 'tr', ch: [{ w: 'td', a: { th: 1, colspan: '2' }, ch: [{ w: 'p', ch: ['한 칸'] }] }] },
          {
            w: 'tr',
            ch: [
              { w: 'td', ch: [{ w: 'p', ch: ['가'] }] },
              { w: 'td', ch: [{ w: 'p', ch: ['나'] }] },
            ],
          },
        ],
      },
    ]).includes('colspan="2"'),
  );
  ok(
    '머리 줄이 첫 줄이 아닌 표도 html 이다',
    render([
      {
        w: 'table',
        ch: [
          {
            w: 'tr',
            ch: [
              { w: 'td', ch: [{ w: 'p', ch: ['가'] }] },
              { w: 'td', ch: [{ w: 'p', ch: ['나'] }] },
            ],
          },
          {
            w: 'tr',
            ch: [
              { w: 'td', a: { th: 1 }, ch: [{ w: 'p', ch: ['a'] }] },
              { w: 'td', a: { th: 1 }, ch: [{ w: 'p', ch: ['b'] }] },
            ],
          },
        ],
      },
    ]).startsWith('<div class="nabi-scroll">'),
  );
  ok(
    '첨부 링크는 html 이다 — 표식이 곧 뜻인데 md 에 실을 칸이 없다',
    render([{ w: 'p', ch: [{ w: 'a', a: { href: 'https://n.example/a.pdf', file: 'pdf' }, ch: ['첨부'] }] }]).includes(
      'data-nabi-file="pdf"',
    ),
  );
  eq(
    '고정폭 아닌 서체는 html 이다',
    render([{ w: 'p', ch: [{ w: 'tf', a: { v: 'serif' }, ch: ['세리프'] }] }]),
    '<span data-nabi-typeface="serif">세리프</span>',
  );
  eq(
    '조립 맵을 안 주면 전부 html 이다 — 등록이 곧 어휘다',
    renderMarkdown(cocoon([{ w: 'ul', ch: [{ w: 'li', ch: [{ w: 'p', ch: ['하나'] }] }] }], registry.env), {
      env: registry.env,
      html: { env: registry.env, builders: registry.builders },
    }),
    '<ul><li><p>하나</p></li></ul>',
  );
}

// --- 왕복 — md 로 표현되는 문서는 조립하고 되읽어도 같은 문서다 ------------------------------------
{
  const source: readonly ElementNode[] = [
    { w: 'p', a: { h: 1 }, ch: ['나비 문서'] },
    {
      w: 'p',
      ch: [
        '평문에 ',
        { w: 'b', ch: ['굵게'] },
        ' 와 ',
        { w: 'i', ch: ['기울임'] },
        ' 와 ',
        { w: 's', ch: ['취소'] },
        ' 가 있다.',
      ],
    },
    { w: 'p', ch: ['별 * 과 밑줄 _ 과 대괄호 [x] 와 파이프 | 와 물결 ~ 와 부등호 <'] },
    { w: 'p', ch: ['- 목록처럼 보이는 글'] },
    {
      w: 'p',
      ch: [
        '코드 ',
        { w: 'tf', a: { v: 'mono' }, ch: ['x = 1'] },
        ' 와 ',
        { w: 'a', a: { href: 'https://nabi.example/a' }, ch: ['링크'] },
      ],
    },
    {
      w: 'quote',
      ch: [
        { w: 'p', ch: ['첫 줄'] },
        { w: 'p', ch: ['둘째 줄'] },
      ],
    },
    {
      w: 'ul',
      ch: [
        {
          w: 'li',
          ch: [
            { w: 'p', ch: ['겉'] },
            { w: 'ul', ch: [{ w: 'li', ch: [{ w: 'p', ch: ['속'] }] }] },
          ],
        },
        { w: 'li', ch: [{ w: 'p', ch: ['다시 겉'] }] },
      ],
    },
    {
      w: 'ol',
      ch: [
        { w: 'oli', ch: [{ w: 'p', ch: ['하나'] }] },
        { w: 'oli', ch: [{ w: 'p', ch: ['둘'] }] },
      ],
    },
    {
      w: 'tl',
      ch: [
        { w: 'tli', ch: [{ w: 'p', ch: ['안 함'] }] },
        { w: 'tli', a: { ck: 1 }, ch: [{ w: 'p', ch: ['함'] }] },
      ],
    },
    { w: 'code', a: { lang: 'ts' }, ch: ['const a = 1', { w: 'br', ch: [] }, 'const b = 2'] },
    {
      w: 'table',
      ch: [
        {
          w: 'tr',
          ch: [
            { w: 'td', a: { th: 1 }, ch: [{ w: 'p', ch: ['이름'] }] },
            { w: 'td', a: { th: 1 }, ch: [{ w: 'p', ch: ['값'] }] },
          ],
        },
        {
          w: 'tr',
          ch: [
            { w: 'td', ch: [{ w: 'p', ch: ['가'] }] },
            { w: 'td', ch: [{ w: 'p', ch: ['나'] }] },
          ],
        },
      ],
    },
    { w: 'img', a: { src: 'https://nabi.example/a.png' }, ch: [] },
    { w: 'hr', ch: [] },
    { w: 'p', ch: ['끝 줄 하나', { w: 'br', ch: [] }, '이어진 줄'] },
  ];
  eq('md 로 표현되는 문서는 왕복이 닫힌다', reread(render(source)), cocoon([...source], registry.env));
}

// --- 스니핑 ------------------------------------------------------------------------------------
{
  ok('평범한 산문은 마크다운이 아니다', !smellsMarkdown('평범한 산문이다. 표식이 하나도 없다.'));
  ok('여러 줄 산문도 마크다운이 아니다', !smellsMarkdown('첫째 줄이다.\n둘째 줄이다.\n셋째 줄이다.'));
  const signals = [
    '## 제목',
    '> 인용',
    '- 목록',
    '1. 번호',
    '```ts',
    '---',
    '| a |\n|---|',
    '[t](u)',
    '![](u)',
    '**굵게**',
    '~~취소~~',
  ];
  ok(
    '신호 하나면 마크다운이다',
    signals.every((text) => smellsMarkdown(text)),
    signals.filter((text) => !smellsMarkdown(text)),
  );
}

done('md');
