// 0.9 신뢰 경계 회귀망 - 입력 문 하나에서 시작한 예외나 활성 문맥이 밖으로 새지 않아야 한다.
import { JSDOM } from 'jsdom';
import { DEFAULT_BUILDERS, importDoc, parseNodes, safeUrl } from '../src/html/index.js';
import { writeHtmlFile, writeNabiFile } from '../src/io/index.js';
import { $toJson } from '../src/schema/index.js';
import { $hasBuiltinAttrSchema } from '../src/schema/cocoon.js';
import { diffDocs } from '../src/diff/index.js';
import { renderStoredHtml as renderSsrStoredHtml } from '../src/ssr.js';
import {
  createNabiWith,
  makeRegistry,
  nabiOptionsOf,
  renderStoredEditorHtml,
  renderStoredHtml,
  type Wing,
} from '../src/wing/index.js';
import { createNabi } from '../src/editor/index.js';
import { defaultWings, makeImageWing } from '../src/wings/index.js';
import { ioFiltersOf, makePasteFlow, mountFile, mountSurface } from '../src/surface/index.js';
import { done, eq, ok } from './net.js';

const quietly = <T>(run: () => T): T => {
  const real = console.error;
  console.error = () => undefined;
  try {
    return run();
  } finally {
    console.error = real;
  }
};

{
  const page = writeHtmlFile({
    title: 'x',
    sheets: [],
    body: '',
    lang: 'en" onload="globalThis.__nabiLangAttack=1',
  });
  const dom = new JSDOM(page);
  ok(
    'HTML file lang - 속성 경계를 닫아 onload 속성을 만들지 않는다',
    !dom.window.document.documentElement.hasAttribute('onload'),
    page.split('\n')[1],
  );
  dom.window.close();
}

{
  const page = writeHtmlFile({
    title: 'x',
    sheets: [],
    body: '',
    lang: 'zh-Hant-TW',
    dir: 'rtl" onload="globalThis.__nabiDirAttack=1' as never,
  });
  const dom = new JSDOM(page);
  eq('HTML file lang - 유효한 language tag는 보존한다', dom.window.document.documentElement.lang, 'zh-Hant-TW');
  ok(
    'HTML file dir - 런타임의 잘못된 dir 값도 속성 경계를 못 연다',
    !dom.window.document.documentElement.hasAttribute('onload') &&
      !dom.window.document.documentElement.hasAttribute('dir'),
  );
  dom.window.close();
}

for (const value of [
  '/\\evil.example/x',
  'https:\\evil.example/x',
  'java\u0000script:alert(1)',
  'java\tscript:alert(1)',
  'java\nscript:alert(1)',
  'jav&#x61;script:alert(1)',
  '&#106;avascript:alert(1)',
]) {
  eq(`URL corpus - parser 보정 우회 거절: ${JSON.stringify(value)}`, safeUrl(value, true), null);
}
ok(
  'URL corpus - 정상 URL과 image-only local URL은 보존한다',
  safeUrl('https://example.com/a?x=1&y=2') !== null &&
    safeUrl('/images/a.png') === '/images/a.png' &&
    safeUrl('blob:https://example.com/1', true) !== null &&
    safeUrl('data:image/png;base64,AA', true) !== null &&
    safeUrl('blob:https://example.com/1') === null &&
    safeUrl('data:image/svg+xml,<svg/>', true) === null,
);

{
  let claimed = 0;
  const claimant: Wing = {
    w: 'exClaimant',
    place: 'tool',
    claim: () => {
      claimed += 1;
      return [{ w: 'p', ch: ['claimed active subtree'] }];
    },
  };
  const registry = makeRegistry([...defaultWings, claimant]);
  const doc = importDoc(
    ['script', 'ScRiPt', 'style', 'template', 'svg', 'math', 'object', 'embed', 'base', 'meta']
      .map((tag) => ({
        kind: 'element' as const,
        tag,
        attrs: {},
        children: [{ kind: 'text' as const, text: `active ${tag}` }],
      }))
      .concat([
        {
          kind: 'element' as const,
          tag: 'iframe',
          attrs: { srcdoc: '<script>alert(1)</script>' },
          children: [],
        },
        {
          kind: 'element' as const,
          tag: 'IFRAME',
          attrs: { SRCDOC: '<script>alert(1)</script>' },
          children: [],
        },
        {
          kind: 'element' as const,
          tag: 'iframe',
          attrs: { src: 'https://evil.example/embed' },
          children: [],
        },
      ]),
    { env: registry.env, claim: registry.claim },
  );
  eq('DROP_TAG - active subtree는 모두 custom claim보다 먼저 끊는다', claimed, 0);
  eq('DROP_TAG - claim이 active subtree 본문을 문서로 되살리지 못한다', $toJson(doc), [{ w: 'p', ch: [] }]);

  const youtube = importDoc(
    [{ kind: 'element', tag: 'iframe', attrs: { src: 'https://www.youtube.com/embed/6j-gQmaZ9Zk' }, children: [] }],
    { env: registry.env, claim: registry.claim },
  );
  eq('iframe - 허용한 YouTube도 custom claim보다 먼저 canonical node가 된다', $toJson(youtube), [
    { w: 'p', ch: [{ w: 'youtube', a: { v: '6j-gQmaZ9Zk' }, ch: [] }] },
  ]);
  eq('iframe - 허용한 YouTube에도 custom claim을 부르지 않는다', claimed, 0);
}

{
  const poison: Wing = {
    w: 'exPoison',
    place: 'mark',
    toHtml: DEFAULT_BUILDERS['b'],
    repair: () => {
      throw new Error('repair poison');
    },
  };
  const registry = makeRegistry([poison]);
  const input = [{ w: 'p', ch: [{ w: 'exPoison', ch: ['x'] }] }];
  let result: ReturnType<typeof diffDocs> = null;
  let threw = false;
  const real = console.error;
  console.error = () => undefined;
  try {
    result = diffDocs(input, input, registry);
  } catch {
    threw = true;
  } finally {
    console.error = real;
  }
  ok('diff JSON - wing repair 예외를 입력 거절(null)로 격리한다', !threw && result === null);
}

{
  const { nabi } = createNabiWith(defaultWings, { doc: [{ w: 'p', ch: ['기존'] }] });
  let getterCalls = 0;
  const accessor = Object.create(null) as Record<string, unknown>;
  Object.defineProperty(accessor, 'w', {
    enumerable: true,
    get() {
      getterCalls += 1;
      throw new Error('raw getter must not run');
    },
  });
  Object.defineProperty(accessor, 'ch', { enumerable: true, value: [] });

  const attrAccessor: Record<string, unknown> = {};
  Object.defineProperty(attrAccessor, 'onerror', {
    enumerable: true,
    get() {
      getterCalls += 1;
      throw new Error('attr getter must not run');
    },
  });

  const cyclic: { w: string; ch: unknown[] } = { w: 'p', ch: [] };
  cyclic.ch.push(cyclic);
  const inherited = Object.create({ w: 'p', ch: [] }) as unknown;
  const dated = new Date() as Date & { w?: string; ch?: unknown[] };
  dated.w = 'p';
  dated.ch = [];
  const polluted = JSON.parse('[{"w":"p","a":{"__proto__":"poison"},"ch":[]}]') as unknown;
  const constructorKey = JSON.parse('[{"w":"p","constructor":"poison","ch":[]}]') as unknown;
  const sparse = new Array<unknown>(1);
  const customArray = Object.setPrototypeOf([], { inherited: true });

  const rejected: readonly (readonly [string, unknown])[] = [
    ['accessor node', [accessor]],
    ['accessor attrs', [{ w: 'p', a: attrAccessor, ch: [] }]],
    ['cycle', [cyclic]],
    ['inherited node', [inherited]],
    ['non-plain node', [dated]],
    ['prototype pollution attrs', polluted],
    ['constructor pollution node', constructorKey],
    ['sparse root', sparse],
    ['custom array prototype', customArray],
  ];
  for (const [name, value] of rejected) {
    ok(`raw tree - ${name}를 원자적으로 거절한다`, !nabi.setJson(value));
    eq(`raw tree - ${name} 거절 뒤 문서는 그대로다`, nabi.getJson(), [{ w: 'p', ch: ['기존'] }]);
  }
  eq('raw tree - accessor getter를 한 번도 실행하지 않는다', getterCalls, 0);

  const copied = [{ w: 'p', a: { a: 'c' }, ch: ['복사본'] }];
  ok('raw tree - plain own-data tree는 받는다', nabi.setJson(copied));
  copied[0]!.a.a = 'l';
  copied[0]!.ch[0] = '바깥 변경';
  eq('raw tree - 입력 객체와 배열을 canonical own-data copy로 끊는다', nabi.getJson(), [
    { w: 'p', a: { a: 'c' }, ch: ['복사본'] },
  ]);
}

{
  const { nabi } = createNabiWith(defaultWings);
  const raw = [
    {
      w: 'p',
      ch: [
        { w: '__proto__', ch: ['첫째'] },
        { w: 'constructor', ch: ['둘째'] },
        { w: 'toString', ch: ['셋째'] },
      ],
    },
  ];
  ok('raw tree - prototype 이름의 낯선 wrapper도 내용만 안전하게 받는다', nabi.setJson(raw));
  eq('raw tree - 미등록 wrapper와 attrs는 canonical JSON에 남지 않는다', nabi.getJson(), [
    { w: 'p', ch: ['첫째둘째셋째'] },
  ]);

  let html: string | null = null;
  let editorHtml: string | null = null;
  let threw = false;
  try {
    html = nabi.getHtml();
    editorHtml = nabi.getEditorHtml();
  } catch {
    threw = true;
  }
  ok('raw tree - prototype 이름의 w가 HTML 문에서 예외를 내지 않는다', !threw);
  eq('raw tree - prototype 이름의 낯선 w는 보기 HTML에서 껍데기만 벗긴다', html, '<p>첫째둘째셋째</p>');
  eq(
    'raw tree - prototype 이름의 낯선 w는 편집기 HTML에서도 내용만 보존한다',
    editorHtml,
    '<p data-key="n0">첫째둘째셋째</p>',
  );
}

{
  const mark: Wing = {
    w: 'exKnownMark',
    place: 'mark',
    attrs: ['exTone'],
    toHtml: DEFAULT_BUILDERS['b'],
  };
  const box: Wing = {
    w: 'exKnownBox',
    place: 'container',
    holds: 'blocks',
    attrs: ['exTone'],
    parts: { exKnownPart: { holds: 'blocks', attrs: ['exFlag'], boolAttrs: ['exFlag'] } },
    toHtml: DEFAULT_BUILDERS['quote'],
    partHtml: { exKnownPart: DEFAULT_BUILDERS['quote'] },
  };
  const { nabi } = createNabiWith([mark, box]);
  const attack = { onclick: 'alert(1)', style: 'background:url(javascript:x)', href: 'javascript:x' };
  ok(
    'closed node vocabulary - unknown inline/block/root wrapper를 내용만 보존해 받는다',
    nabi.setJson([
      {
        w: 'evilRoot',
        a: attack,
        ch: [
          {
            w: 'p',
            ch: ['A', { w: 'evilInline', a: attack, ch: [{ w: 'exKnownMark', a: { exTone: 'blue' }, ch: ['B'] }] }],
          },
          {
            w: 'evilBlock',
            a: attack,
            ch: [
              { w: 'p', ch: ['C'] },
              { w: 'p', ch: ['D'] },
            ],
          },
          { w: 'evilEmpty', a: attack, ch: [] },
          { w: 'table', a: attack, ch: [{ w: 'p', ch: ['E'] }] },
          {
            w: 'p',
            ch: [
              {
                w: 'exKnownBox',
                a: { exTone: 'green' },
                ch: [{ w: 'exKnownPart', a: { exFlag: 1 }, ch: [{ w: 'p', ch: ['F'] }] }],
              },
            ],
          },
          { w: 'p', ch: ['G', { w: 'evilInline', a: attack, ch: [{ w: 'exKnownBox', ch: [] }] }, 'H'] },
        ],
      },
    ]),
  );
  eq('closed node vocabulary - unknown attrs는 사라지고 등록 custom node/part는 보존된다', nabi.getJson(), [
    { w: 'p', ch: ['A', { w: 'exKnownMark', a: { exTone: 'blue' }, ch: ['B'] }] },
    { w: 'p', ch: ['C'] },
    { w: 'p', ch: ['D'] },
    { w: 'p', ch: ['E'] },
    {
      w: 'p',
      ch: [
        {
          w: 'exKnownBox',
          a: { exTone: 'green' },
          ch: [{ w: 'exKnownPart', a: { exFlag: 1 }, ch: [{ w: 'p', ch: ['F'] }] }],
        },
      ],
    },
    { w: 'p', ch: ['G'] },
    { w: 'p', ch: [{ w: 'exKnownBox', ch: [] }] },
    { w: 'p', ch: ['H'] },
  ]);
}

{
  const { nabi, registry } = createNabiWith(defaultWings);
  ok(
    'closed node vocabulary - paragraph 안 unknown wrapper의 registered lump를 받는다',
    nabi.setJson([
      {
        w: 'p',
        ch: [
          'A',
          {
            w: 'evil',
            a: { onclick: 'alert(1)' },
            ch: [{ w: 'img', a: { src: 'https://example.com/a.png' }, ch: [] }],
          },
          'B',
        ],
      },
    ]),
  );
  eq('closed node vocabulary - unknown 안 image도 유실하지 않고 문단을 같은 방식으로 쪼갠다', nabi.getJson(), [
    { w: 'p', ch: ['A'] },
    { w: 'p', ch: [{ w: 'img', a: { src: 'https://example.com/a.png' }, ch: [] }] },
    { w: 'p', ch: ['B'] },
  ]);
  const fromHtml = importDoc(
    [
      {
        kind: 'element',
        tag: 'p',
        attrs: {},
        children: [
          { kind: 'text', text: 'A' },
          {
            kind: 'element',
            tag: 'evil',
            attrs: { onclick: 'alert(1)' },
            children: [{ kind: 'element', tag: 'img', attrs: { src: 'https://example.com/a.png' }, children: [] }],
          },
          { kind: 'text', text: 'B' },
        ],
      },
    ],
    { env: registry.env, ...(registry.claim ? { claim: registry.claim } : {}) },
  );
  eq('closed node vocabulary - 같은 HTML과 raw tree의 canonical 결과가 같다', nabi.getJson(), $toJson(fromHtml));

  for (const wrapped of [false, true]) {
    const unsafe = { w: 'img', a: { src: 'javascript:alert(1)' }, ch: [] };
    const rawChild = wrapped ? { w: 'evil', a: { onclick: 'alert(1)' }, ch: [unsafe] } : unsafe;
    ok(
      `closed node vocabulary - unsafe image를 포함한 raw tree를 받는다 (${wrapped ? 'wrapped' : 'direct'})`,
      nabi.setJson([
        {
          w: 'p',
          ch: ['A', rawChild, 'B'],
        },
      ]),
    );
    const htmlChild: ReturnType<typeof parseNodes>[number] = wrapped
      ? {
          kind: 'element' as const,
          tag: 'evil',
          attrs: { onclick: 'alert(1)' },
          children: [{ kind: 'element' as const, tag: 'img', attrs: { src: 'javascript:alert(1)' }, children: [] }],
        }
      : { kind: 'element' as const, tag: 'img', attrs: { src: 'javascript:alert(1)' }, children: [] };
    const rejectedHtml = importDoc(
      [
        {
          kind: 'element',
          tag: 'p',
          attrs: {},
          children: [{ kind: 'text', text: 'A' }, htmlChild, { kind: 'text', text: 'B' }],
        },
      ],
      { env: registry.env, ...(registry.claim ? { claim: registry.claim } : {}) },
    );
    eq(
      `closed node vocabulary - rejected lump는 문단을 쪼개지 않고 HTML과 같은 결과다 (${wrapped ? 'wrapped' : 'direct'})`,
      nabi.getJson(),
      [{ w: 'p', ch: ['AB'] }],
    );
    eq(
      `closed node vocabulary - rejected lump raw/HTML canonical parity (${wrapped ? 'wrapped' : 'direct'})`,
      nabi.getJson(),
      $toJson(rejectedHtml),
    );
  }

  for (const inner of [[], ['X']] as const) {
    ok(
      `closed node vocabulary - root unknown의 ${inner.length === 0 ? 'empty' : 'inline'} 내용도 받는다`,
      nabi.setJson(['A', { w: 'evil', a: { onclick: 'alert(1)' }, ch: inner }, 'B']),
    );
    const fromUnknownHtml = importDoc(
      [
        { kind: 'text', text: 'A' },
        {
          kind: 'element',
          tag: 'evil',
          attrs: { onclick: 'alert(1)' },
          children: inner.map((text) => ({ kind: 'text' as const, text })),
        },
        { kind: 'text', text: 'B' },
      ],
      { env: registry.env, ...(registry.claim ? { claim: registry.claim } : {}) },
    );
    eq(
      `closed node vocabulary - root unknown은 inline 이웃을 쪼개지 않는다 (${inner.length === 0 ? 'empty' : 'inline'})`,
      nabi.getJson(),
      [{ w: 'p', ch: [inner.length === 0 ? 'AB' : 'AXB'] }],
    );
    eq(
      `closed node vocabulary - root unknown raw/HTML canonical parity (${inner.length === 0 ? 'empty' : 'inline'})`,
      nabi.getJson(),
      $toJson(fromUnknownHtml),
    );
  }

  for (const wrapped of [false, true]) {
    const unsafe = { w: 'img', a: { src: 'javascript:alert(1)' }, ch: [] };
    const rawUnsafe = wrapped ? { w: 'evil', ch: [unsafe] } : unsafe;
    ok(
      `closed node vocabulary - root rejected lump를 받는다 (${wrapped ? 'wrapped' : 'direct'})`,
      nabi.setJson(['A', rawUnsafe, 'B']),
    );
    eq(
      `closed node vocabulary - root rejected lump는 inline 이웃을 쪼개지 않는다 (${wrapped ? 'wrapped' : 'direct'})`,
      nabi.getJson(),
      [{ w: 'p', ch: ['AB'] }],
    );

    ok(
      `closed node vocabulary - block holder rejected lump를 받는다 (${wrapped ? 'wrapped' : 'direct'})`,
      nabi.setJson([
        {
          w: 'p',
          ch: [{ w: 'quote', ch: ['A', rawUnsafe, 'B'] }],
        },
      ]),
    );
    const htmlUnsafe: ReturnType<typeof parseNodes>[number] = wrapped
      ? {
          kind: 'element',
          tag: 'evil',
          attrs: {},
          children: [{ kind: 'element', tag: 'img', attrs: { src: 'javascript:alert(1)' }, children: [] }],
        }
      : { kind: 'element', tag: 'img', attrs: { src: 'javascript:alert(1)' }, children: [] };
    const holderHtml = importDoc(
      [
        {
          kind: 'element',
          tag: 'blockquote',
          attrs: {},
          children: [{ kind: 'text', text: 'A' }, htmlUnsafe, { kind: 'text', text: 'B' }],
        },
      ],
      { env: registry.env, ...(registry.claim ? { claim: registry.claim } : {}) },
    );
    eq(
      `closed node vocabulary - block holder rejected lump는 inline 이웃을 쪼개지 않는다 (${wrapped ? 'wrapped' : 'direct'})`,
      nabi.getJson(),
      [{ w: 'p', ch: [{ w: 'quote', ch: [{ w: 'p', ch: ['AB'] }] }] }],
    );
    eq(
      `closed node vocabulary - block holder rejected lump raw/HTML parity (${wrapped ? 'wrapped' : 'direct'})`,
      nabi.getJson(),
      $toJson(holderHtml),
    );
  }
}

const CLOSED_KEYS: Readonly<Record<string, readonly string[]>> = {
  p: ['h', 'a', 'dc'],
  br: [],
  b: [],
  i: [],
  u: [],
  s: [],
  sub: [],
  sup: [],
  hl: ['c'],
  tc: ['c'],
  fs: ['v'],
  tf: ['v'],
  a: ['href', 'file'],
  ul: [],
  li: [],
  ol: [],
  oli: [],
  tl: [],
  tli: ['ck'],
  quote: [],
  details: ['o'],
  summary: [],
  code: ['lang'],
  hr: [],
  table: ['sort'],
  tr: [],
  td: ['colspan', 'rowspan', 'th'],
  img: ['src', 'w'],
  youtube: ['v', 'w'],
};

const ACTIVE_ATTRS = {
  onclick: 'globalThis.__nabiAttack=1',
  onerror: 'globalThis.__nabiAttack=1',
  style: 'background:url(javascript:x)',
  srcdoc: '<script>x</script>',
  bogus: 'x',
};

const rawClosed = [
  {
    w: 'p',
    a: { h: 2, a: 'c', dc: 1, ...ACTIVE_ATTRS },
    ch: [
      { w: 'b', a: ACTIVE_ATTRS, ch: ['b'] },
      { w: 'i', a: ACTIVE_ATTRS, ch: ['i'] },
      { w: 'u', a: ACTIVE_ATTRS, ch: ['u'] },
      { w: 's', a: ACTIVE_ATTRS, ch: ['s'] },
      { w: 'sub', a: ACTIVE_ATTRS, ch: ['sub'] },
      { w: 'sup', a: ACTIVE_ATTRS, ch: ['sup'] },
      { w: 'hl', a: { c: 'yellow', ...ACTIVE_ATTRS }, ch: ['hl'] },
      { w: 'tc', a: { c: 'green', ...ACTIVE_ATTRS }, ch: ['tc'] },
      { w: 'fs', a: { v: 'lg', ...ACTIVE_ATTRS }, ch: ['fs'] },
      { w: 'tf', a: { v: 'serif', ...ACTIVE_ATTRS }, ch: ['tf'] },
      { w: 'a', a: { href: 'https://example.com/x', file: 'txt', ...ACTIVE_ATTRS }, ch: ['a'] },
      { w: 'br', a: ACTIVE_ATTRS, ch: [] },
      '<script>는 정상 텍스트이고 javascript:도 정상 텍스트다',
    ],
  },
  { w: 'p', ch: [{ w: 'img', a: { src: '/image.png', w: '60', ...ACTIVE_ATTRS }, ch: [] }] },
  { w: 'p', ch: [{ w: 'youtube', a: { v: '6j-gQmaZ9Zk', w: '70', ...ACTIVE_ATTRS }, ch: [] }] },
  { w: 'p', ch: [{ w: 'hr', a: ACTIVE_ATTRS, ch: [] }] },
  { w: 'p', ch: [{ w: 'quote', a: ACTIVE_ATTRS, ch: [{ w: 'p', ch: ['quote'] }] }] },
  {
    w: 'p',
    ch: [
      {
        w: 'details',
        a: { o: 1, ...ACTIVE_ATTRS },
        ch: [
          { w: 'summary', a: ACTIVE_ATTRS, ch: ['summary'] },
          { w: 'p', ch: ['details'] },
        ],
      },
    ],
  },
  { w: 'p', ch: [{ w: 'code', a: { lang: 'ts', ...ACTIVE_ATTRS }, ch: ['code'] }] },
  { w: 'p', ch: [{ w: 'ul', a: ACTIVE_ATTRS, ch: [{ w: 'li', a: ACTIVE_ATTRS, ch: [{ w: 'p', ch: ['ul'] }] }] }] },
  { w: 'p', ch: [{ w: 'ol', a: ACTIVE_ATTRS, ch: [{ w: 'oli', a: ACTIVE_ATTRS, ch: [{ w: 'p', ch: ['ol'] }] }] }] },
  {
    w: 'p',
    ch: [{ w: 'tl', a: ACTIVE_ATTRS, ch: [{ w: 'tli', a: { ck: 1, ...ACTIVE_ATTRS }, ch: [{ w: 'p', ch: ['tl'] }] }] }],
  },
  {
    w: 'p',
    ch: [
      {
        w: 'table',
        a: { sort: 1, ...ACTIVE_ATTRS },
        ch: [
          {
            w: 'tr',
            a: ACTIVE_ATTRS,
            ch: [{ w: 'td', a: { colspan: '2', th: 1, ...ACTIVE_ATTRS }, ch: [{ w: 'p', ch: ['cell'] }] }],
          },
        ],
      },
    ],
  },
];

{
  const missing = defaultWings.flatMap((wing) => {
    if (wing.place !== 'mark' && wing.place !== 'void' && wing.place !== 'container') return [];
    return [wing.w, ...Object.keys(wing.parts ?? {})].filter((w) => !$hasBuiltinAttrSchema(w));
  });
  eq('built-in catalog - 모든 node와 part에 닫힌 attr schema가 있다', missing, []);

  const { nabi } = createNabiWith(defaultWings);
  ok('closed attrs - 전체 built-in corpus를 받는다', nabi.setJson(rawClosed));
  const unknown: string[] = [];
  const walk = (value: unknown): void => {
    if (typeof value === 'string' || typeof value !== 'object' || value === null) return;
    const node = value as { w?: string; a?: Record<string, unknown>; ch?: unknown[] };
    const allowed = node.w ? CLOSED_KEYS[node.w] : undefined;
    if (allowed) {
      for (const key of Object.keys(node.a ?? {})) if (!allowed.includes(key)) unknown.push(`${node.w}.${key}`);
    }
    for (const child of node.ch ?? []) walk(child);
  };
  for (const node of nabi.getJson()) walk(node);
  eq('closed attrs - 미등록 on*/style/srcdoc/기타 attrs가 getJson에 0개다', unknown, []);
  const once = nabi.getJson();
  ok('closed attrs - normalize 결과를 다시 받는다', nabi.setJson(once));
  eq('closed attrs - normalize가 idempotent다', nabi.getJson(), once);
}

{
  const custom: Wing = {
    w: 'exNote',
    place: 'mark',
    attrs: ['exValue'],
    toHtml: DEFAULT_BUILDERS['b'],
  };
  const { nabi } = createNabiWith([...defaultWings, custom]);
  ok(
    'custom attrs - built-in bool/active 이름을 custom 계약에서 전역으로 걷지 않는다',
    nabi.setJson([
      {
        w: 'p',
        ch: [
          {
            w: 'exNote',
            a: { exValue: 'kept', ck: 'drop', style: 'drop' },
            ch: ['custom'],
          },
        ],
      },
    ]),
  );
  eq('custom attrs - 선언한 ex attr만 보존한다', nabi.getJson(), [
    {
      w: 'p',
      ch: [
        {
          w: 'exNote',
          a: { exValue: 'kept' },
          ch: ['custom'],
        },
      ],
    },
  ]);
}

{
  const original = defaultWings.find((wing) => wing.w === 'code') as Wing;
  const clone: Wing = { ...original };
  const marker = Object.getOwnPropertySymbols(clone)
    .map((symbol) => (clone as unknown as Record<symbol, unknown>)[symbol])
    .find(
      (value): value is { readonly ownerW: unknown; readonly attrTypes: unknown } =>
        typeof value === 'object' && value !== null && 'ownerW' in value && 'attrTypes' in value,
    );
  ok(
    'closed attrs - spread clone의 owner-bound internal schema 표식은 immutable이다',
    marker?.ownerW === 'code' &&
      Array.isArray(marker.attrTypes) &&
      Object.isFrozen(marker) &&
      Object.isFrozen(marker.attrTypes),
  );
  const { nabi } = createNabiWith([clone]);
  ok(
    'closed attrs - 문서화된 object spread clone도 internal schema 표식을 지킨다',
    nabi.setJson([
      {
        w: 'p',
        ch: [{ w: 'code', a: { lang: 'ts', onclick: 'attack', style: 'attack', bogus: 'attack' }, ch: ['x'] }],
      },
    ]),
  );
  eq('closed attrs - spread clone에서도 허용 attr만 남는다', nabi.getJson(), [
    { w: 'p', ch: [{ w: 'code', a: { lang: 'ts' }, ch: ['x'] }] },
  ]);
}

{
  const image = makeImageWing();
  const { nabi } = createNabiWith([image]);
  ok(
    'closed attrs - 공식 make*Wing 직접 산출물도 internal schema를 지킨다',
    nabi.setJson([
      {
        w: 'p',
        ch: [{ w: 'img', a: { src: 'https://example.com/x.png', onclick: 'attack', style: 'attack' }, ch: [] }],
      },
    ]),
  );
  eq('closed attrs - 공식 factory 산출물에도 허용 attr만 남는다', nabi.getJson(), [
    { w: 'p', ch: [{ w: 'img', a: { src: 'https://example.com/x.png' }, ch: [] }] },
  ]);
}

{
  let getterCalls = 0;
  const element: Record<string, unknown> = { kind: 'element', attrs: {}, children: [] };
  Object.defineProperty(element, 'tag', {
    enumerable: true,
    get() {
      getterCalls += 1;
      throw new Error('parse getter must not run');
    },
  });
  const registry = makeRegistry(defaultWings);
  const nabi = createNabi({
    ...nabiOptionsOf(registry, { doc: [{ w: 'p', ch: ['기존'] }] }),
    parseHtml: () => [element] as never,
  });
  ok('parse callback - accessor ParseNode를 원자적으로 거절한다', !nabi.setHtml('<p>x</p>'));
  eq('parse callback - ParseNode getter를 실행하지 않는다', getterCalls, 0);
  eq('parse callback - 거절 뒤 문서는 그대로다', nabi.getJson(), [{ w: 'p', ch: ['기존'] }]);
}

{
  let getterCalls = 0;
  const claimed: Record<string, unknown> = { ch: [] };
  Object.defineProperty(claimed, 'w', {
    enumerable: true,
    get() {
      getterCalls += 1;
      throw new Error('claim getter must not run');
    },
  });
  const claimWing: Wing = {
    w: 'exClaim',
    place: 'tool',
    claim: () => [claimed as never],
  };
  const registry = makeRegistry([...defaultWings, claimWing]);
  const nabi = createNabi({
    ...nabiOptionsOf(registry, { doc: [{ w: 'p', ch: ['기존'] }] }),
    parseHtml: () => [{ kind: 'element', tag: 'ex-claim', attrs: {}, children: [] }],
  });
  ok(
    'claim callback - accessor tree를 예외 없이 거절한다',
    quietly(() => !nabi.setHtml('<ex-claim/>')),
  );
  eq('claim callback - 반환 tree getter를 실행하지 않는다', getterCalls, 0);
  eq('claim callback - 거절 뒤 문서는 그대로다', nabi.getJson(), [{ w: 'p', ch: ['기존'] }]);
}

{
  let getterCalls = 0;
  const poisoned: Record<string, unknown> = { ch: [] };
  Object.defineProperty(poisoned, 'w', {
    enumerable: true,
    get() {
      getterCalls += 1;
      throw new Error('command getter must not run');
    },
  });
  const commandWing: Wing = {
    w: 'exCommand',
    place: 'tool',
    commands: {
      runPoison: (_doc, selection) => ({ doc: [poisoned] as never, selection }),
      mutateSame: (doc, selection) => {
        const first = doc[0] as unknown as Record<string, unknown>;
        try {
          Object.defineProperty(first, 'w', { enumerable: true, get: () => 'img' });
        } catch {
          // frozen callback snapshot
        }
        try {
          (first['ch'] as unknown[]).push(poisoned);
        } catch {
          // frozen callback snapshot
        }
        return { doc, selection };
      },
    },
  };
  const { nabi } = createNabiWith([commandWing], { doc: [{ w: 'p', ch: ['기존'] }] });
  let threw = false;
  let applied = true;
  quietly(() => {
    try {
      applied = nabi.applyCommand('runPoison');
    } catch {
      threw = true;
    }
  });
  ok('command callback - accessor tree를 false로 격리한다', !threw && !applied);
  eq('command callback - 반환 tree getter를 실행하지 않는다', getterCalls, 0);
  eq('command callback - 거절 뒤 문서는 그대로다', nabi.getJson(), [{ w: 'p', ch: ['기존'] }]);
  eq(
    'command callback - 같은 doc 변조 시도도 무변화로 격리한다',
    quietly(() => nabi.applyCommand('mutateSame')),
    false,
  );
  eq('command callback - 같은 doc 변조 뒤 내부 문서는 그대로다', nabi.getJson(), [{ w: 'p', ch: ['기존'] }]);
  eq('command callback - 같은 doc에 심으려던 getter도 실행되지 않는다', getterCalls, 0);
}

{
  const doc = Array.from({ length: 2_000 }, (_unused, index) => ({ w: 'p', ch: [`line ${index}`] }));
  const { nabi } = createNabiWith(defaultWings, { doc });
  const realFreeze = Object.freeze;
  let freezes = 0;
  Object.freeze = ((value: object) => {
    freezes += 1;
    return realFreeze(value);
  }) as typeof Object.freeze;
  let inserted = false;
  try {
    inserted = nabi.applyCommand('insertText', { text: 'x' });
  } finally {
    Object.freeze = realFreeze;
  }
  ok(
    'core command - 긴 문서 입력이 전체 callback freeze-clone을 만들지 않는다',
    inserted && freezes < 20,
    `${freezes}`,
  );
}

{
  let getterCalls = 0;
  const poisoned: Record<string, unknown> = { ch: [] };
  Object.defineProperty(poisoned, 'w', {
    enumerable: true,
    get() {
      getterCalls += 1;
      throw new Error('paste getter must not run');
    },
  });
  const { nabi } = createNabiWith(defaultWings, { doc: [{ w: 'p', ch: ['기존'] }] });
  const paste = makePasteFlow({
    nabi,
    locale: () => 'ko',
    filters: [
      {
        id: 'poison',
        label: 'Poison',
        paste: () => ({ id: 'poison', label: 'Poison', build: () => [poisoned as never] }),
      },
    ],
  });
  let threw = false;
  quietly(() => {
    try {
      paste({ custom: '', html: '<p>x</p>', plain: '', files: [], types: ['text/html'] }, []);
    } catch {
      threw = true;
    }
  });
  ok('paste callback - accessor tree를 붙이지 않고 예외를 격리한다', !threw);
  eq('paste callback - build 반환 tree getter를 실행하지 않는다', getterCalls, 0);
  eq('paste callback - 거절 뒤 문서는 그대로다', nabi.getJson(), [{ w: 'p', ch: ['기존'] }]);
}

{
  const repairWing: Wing = {
    w: 'exPasteRepair',
    place: 'mark',
    toHtml: DEFAULT_BUILDERS['b'],
    repair: () => {
      throw new Error('paste repair must be contained');
    },
  };
  const { nabi } = createNabiWith([repairWing], { doc: [{ w: 'p', ch: ['기존'] }] });
  const paste = makePasteFlow({
    nabi,
    locale: () => 'ko',
    filters: [
      {
        id: 'repair-poison',
        label: 'Repair poison',
        paste: () => ({
          id: 'repair-poison',
          label: 'Repair poison',
          build: () => [{ w: 'p', ch: [{ w: 'exPasteRepair', ch: ['x'] }] }],
        }),
      },
    ],
  });
  ok(
    'paste callback - 반환 tree normalize/repair 예외도 입구에서 격리한다',
    quietly(() => {
      paste({ custom: '', html: '<p>x</p>', plain: '', files: [], types: ['text/html'] }, []);
      return true;
    }),
  );
  eq('paste callback - repair 예외 뒤 문서는 그대로다', nabi.getJson(), [{ w: 'p', ch: ['기존'] }]);
}

{
  type RepairMode = 'attrs' | 'same-mutate' | 'getter' | 'wrong-type' | 'cycle';
  let mode: RepairMode = 'attrs';
  let getterCalls = 0;
  const original = defaultWings.find((wing) => wing.w === 'code') as Wing;
  const clone: Wing = {
    ...original,
    repair: (node) => {
      if (mode === 'attrs') return { ...node, a: { lang: 'ts', onerror: 'attack', style: 'attack' } };
      if (mode === 'same-mutate') {
        try {
          (node as unknown as { a: Record<string, string> }).a = { onerror: 'attack', style: 'attack' };
        } catch {
          // frozen callback snapshot
        }
        return node;
      }
      if (mode === 'wrong-type') return { ...node, w: 'img' };
      if (mode === 'getter') {
        const value: Record<string, unknown> = { ch: [] };
        Object.defineProperty(value, 'w', {
          enumerable: true,
          get() {
            getterCalls += 1;
            throw new Error('repair getter must not run');
          },
        });
        return value as never;
      }
      const value: { w: string; ch: unknown[] } = { w: 'code', ch: [] };
      value.ch.push(value);
      return value as never;
    },
  };
  const { nabi } = createNabiWith([clone], { doc: [{ w: 'p', ch: ['기존'] }] });
  ok(
    'repair callback - closed attrs를 다시 주입하지 못한다',
    nabi.setJson([{ w: 'p', ch: [{ w: 'code', ch: ['x'] }] }]),
  );
  eq('repair callback - 반환 뒤 closed schema를 다시 적용한다', nabi.getJson(), [
    { w: 'p', ch: [{ w: 'code', a: { lang: 'ts' }, ch: ['x'] }] },
  ]);
  mode = 'same-mutate';
  ok(
    'repair callback - 같은 node 변조 시도는 동결 clone에만 닿는다',
    nabi.setJson([{ w: 'p', ch: [{ w: 'code', a: { lang: 'js' }, ch: ['same'] }] }]),
  );
  eq('repair callback - 같은 node 반환에도 내부 tree는 오염되지 않는다', nabi.getJson(), [
    { w: 'p', ch: [{ w: 'code', a: { lang: 'js' }, ch: ['same'] }] },
  ]);
  const stable = nabi.getJson();
  for (const bad of ['getter', 'wrong-type', 'cycle'] as const) {
    mode = bad;
    ok(
      `repair callback - ${bad} 반환을 원자적으로 거절한다`,
      quietly(() => !nabi.setJson([{ w: 'p', ch: [{ w: 'code', ch: ['bad'] }] }])),
    );
    eq(`repair callback - ${bad} 거절 뒤 문서는 그대로다`, nabi.getJson(), stable);
  }
  eq('repair callback - 반환 getter를 실행하지 않는다', getterCalls, 0);
}

const CROSS_TEXT = '<script>normal text</script> javascript: normal text';
const CROSS_RAW = [
  {
    w: 'p',
    a: { onclick: 'globalThis.__nabiAttack+=1', style: 'background:url(javascript:x)', srcdoc: '<script>x</script>' },
    ch: [
      CROSS_TEXT,
      {
        w: 'a',
        a: { href: 'jav&#x61;script:globalThis.__nabiAttack+=1', onclick: 'globalThis.__nabiAttack+=1' },
        ch: [' unsafe link'],
      },
      { w: 'a', a: { href: '//evil.example/x', formaction: 'javascript:attack' }, ch: [' protocol-relative link'] },
    ],
  },
  {
    w: 'p',
    ch: [
      {
        w: 'img',
        a: {
          src: 'https://example.invalid/image.png',
          srcset: 'javascript:attack 1x',
          formaction: 'javascript:attack',
          onerror: 'globalThis.__nabiAttack+=1',
          style: 'background:url(javascript:x)',
          srcdoc: '<script>x</script>',
        },
        ch: [],
      },
    ],
  },
  { w: 'p', ch: [{ w: 'img', a: { src: 'data:image/svg+xml,<svg onload="globalThis.__nabiAttack+=1"/>' }, ch: [] }] },
  { w: 'p', ch: [{ w: 'img', a: { src: '//evil.example/x' }, ch: [] }] },
];

const CROSS_HTML =
  '<script>globalThis.__nabiAttack+=1</script>' +
  '<style>body{background:url(javascript:x)}</style>' +
  '<template><img src=x onerror="globalThis.__nabiAttack+=1"></template>' +
  '<svg onload="globalThis.__nabiAttack+=1"><script>globalThis.__nabiAttack+=1</script></svg>' +
  '<svg><foreignObject><img src=x onerror="globalThis.__nabiAttack+=1"></foreignObject><a xlink:href="javascript:globalThis.__nabiAttack+=1">x</a></svg>' +
  '<math><mtext onclick="globalThis.__nabiAttack+=1">x</mtext></math>' +
  '<iframe srcdoc="<script>globalThis.__nabiAttack+=1</script>"></iframe>' +
  '<base href="javascript:globalThis.__nabiAttack+=1"><meta http-equiv="refresh" content="0;url=javascript:globalThis.__nabiAttack+=1">' +
  '<object data="javascript:globalThis.__nabiAttack+=1"><param name=x value=y></object>' +
  '<embed src="data:text/html,<script>globalThis.__nabiAttack+=1</script>">' +
  '<form action="javascript:globalThis.__nabiAttack+=1"><button formaction="javascript:globalThis.__nabiAttack+=1">x</button></form>' +
  '<p onclick="globalThis.__nabiAttack+=1" style="background:url(javascript:x)">' +
  '&lt;script&gt;normal text&lt;/script&gt; javascript: normal text' +
  '<a href="jav&#x61;script:globalThis.__nabiAttack+=1" onclick="globalThis.__nabiAttack+=1"> unsafe link</a>' +
  '<img src="https:\\evil.example/x" srcset="javascript:globalThis.__nabiAttack+=1 1x" onerror="globalThis.__nabiAttack+=1">' +
  '<img src="data:image/svg+xml,<svg onload=globalThis.__nabiAttack+=1></svg>"></p>';

const safeDom = (name: string, html: string | null): void => {
  if (html === null) {
    ok(name, false, 'null');
    return;
  }
  const dom = new JSDOM(`<body>${html}</body>`, {
    runScripts: 'dangerously',
    url: 'https://example.test/',
    beforeParse(window) {
      (window as unknown as { __nabiAttack: number }).__nabiAttack = 0;
    },
  });
  const body = dom.window.document.body;
  for (const el of Array.from(body.querySelectorAll('*'))) {
    el.dispatchEvent(new dom.window.Event('click'));
    el.dispatchEvent(new dom.window.Event('error'));
    el.dispatchEvent(new dom.window.Event('load'));
  }
  const active = body.querySelector(
    'script,style,noscript,template,svg,math,iframe,object,embed,applet,form,input,button,select,textarea,base,meta,link,[srcdoc]',
  );
  const sinkAttrs = Array.from(body.querySelectorAll('*')).flatMap((el) =>
    Array.from(el.attributes)
      .filter(
        (attr) => /^on/i.test(attr.name) || attr.name.toLowerCase() === 'style' || attr.name.toLowerCase() === 'srcdoc',
      )
      .map((attr) => `${el.tagName}.${attr.name}`),
  );
  const unsafeUrls = Array.from(body.querySelectorAll('[href],[src]')).flatMap((el) =>
    ['href', 'src'].flatMap((name) => {
      const value = el.getAttribute(name);
      return value !== null &&
        (/\\|[\u0000-\u001f\u007f]/.test(value) || /^\s*(?:javascript|vbscript|data:text|data:image\/svg)/i.test(value))
        ? [`${el.tagName}.${name}=${value}`]
        : [];
    }),
  );
  for (const el of Array.from(body.querySelectorAll('*'))) {
    for (const name of ['srcset', 'formaction', 'action', 'data', 'xlink:href']) {
      const value = el.getAttribute(name);
      if (value !== null) unsafeUrls.push(`${el.tagName}.${name}=${value}`);
    }
  }
  const sentinel = (dom.window as unknown as { __nabiAttack: number }).__nabiAttack;
  ok(
    name,
    active === null &&
      sinkAttrs.length === 0 &&
      unsafeUrls.length === 0 &&
      sentinel === 0 &&
      body.textContent?.includes(CROSS_TEXT) === true,
    JSON.stringify({ active: active?.tagName, sinkAttrs, unsafeUrls, sentinel, html }),
  );
  dom.window.close();
};

{
  const { nabi } = createNabiWith(defaultWings);
  ok('cross corpus - setJson 입구가 raw attack tree를 받는다', nabi.setJson(CROSS_RAW));
  safeDom('cross corpus - setJson/render DOM sink가 닫혀 있다', nabi.getHtml());
  safeDom('cross corpus - editor render DOM sink가 닫혀 있다', nabi.getEditorHtml());
}

{
  const registry = makeRegistry(defaultWings);
  safeDom('cross corpus - stored render가 닫혀 있다', renderStoredHtml(CROSS_RAW, registry));
  safeDom('cross corpus - stored editor render가 닫혀 있다', renderStoredEditorHtml(CROSS_RAW, registry));
  safeDom('cross corpus - SSR entry render가 닫혀 있다', renderSsrStoredHtml(CROSS_RAW, registry));
  const diff = diffDocs(CROSS_RAW, [{ w: 'p', ch: [CROSS_TEXT, ' changed'] }], registry);
  const diffHtml = diff ? [...diff.before, ...diff.after].map((block) => block.html).join('') : null;
  safeDom('cross corpus - diff 양쪽 HTML sink가 닫혀 있다', diffHtml);
}

{
  const parserOwner = new JSDOM('<!doctype html><html><body></body></html>');
  const previous = globalThis.DOMParser;
  (globalThis as { DOMParser: typeof DOMParser }).DOMParser = parserOwner.window
    .DOMParser as unknown as typeof DOMParser;
  try {
    let claimGetterCalls = 0;
    const claimed: Record<string, unknown> = { ch: [] };
    Object.defineProperty(claimed, 'w', {
      enumerable: true,
      get() {
        claimGetterCalls += 1;
        throw new Error('diff claim getter must not run');
      },
    });
    const claimRegistry = makeRegistry([
      ...defaultWings,
      { w: 'exDiffClaim', place: 'tool', claim: () => [claimed as never] } satisfies Wing,
    ]);
    ok(
      'diff HTML - invalid claim 반환은 빈 문서가 아니라 null로 격리한다',
      quietly(() => diffDocs('<diff-claim></diff-claim>', [{ w: 'p', ch: ['safe'] }], claimRegistry)) === null,
    );
    eq('diff HTML - claim 반환 getter를 실행하지 않는다', claimGetterCalls, 0);

    const direct = createNabiWith(defaultWings);
    ok('cross corpus - setHtml attack corpus를 안전하게 읽는다', direct.nabi.setHtml(CROSS_HTML));
    safeDom('cross corpus - setHtml/render DOM sink가 닫혀 있다', direct.nabi.getHtml());

    const equivalentTree = createNabiWith(defaultWings);
    const equivalentHtml = createNabiWith(defaultWings);
    const equivalentText = '<script>safe text</script>';
    ok(
      'cross corpus - 동등한 raw tree 공격을 정규화한다',
      equivalentTree.nabi.setJson([
        {
          w: 'p',
          a: { onclick: 'attack', style: 'attack' },
          ch: [
            equivalentText,
            { w: 'a', a: { href: 'javascript:attack', onclick: 'attack' }, ch: [' unsafe link'] },
            { w: 'img', a: { src: 'data:image/svg+xml,<svg onload=attack/>', onerror: 'attack' }, ch: [] },
          ],
        },
      ]),
    );
    ok(
      'cross corpus - 동등한 HTML 공격을 정규화한다',
      equivalentHtml.nabi.setHtml(
        '<p onclick="attack" style="attack">&lt;script&gt;safe text&lt;/script&gt;' +
          '<a href="javascript:attack" onclick="attack"> unsafe link</a>' +
          '<img src="data:image/svg+xml,&lt;svg onload=attack/&gt;" onerror="attack"></p>',
      ),
    );
    eq(
      'cross corpus - 동등한 raw tree와 HTML 공격의 canonical tree가 같다',
      equivalentHtml.nabi.getJson(),
      equivalentTree.nabi.getJson(),
    );

    const pasted = createNabiWith(defaultWings);
    const paste = makePasteFlow({
      nabi: pasted.nabi,
      filters: ioFiltersOf({ registry: pasted.registry, parse: parseNodes }),
      locale: () => 'ko',
    });
    paste({ custom: '', html: CROSS_HTML, plain: '', files: [], types: ['text/html'] }, []);
    safeDom('cross corpus - paste/render DOM sink가 닫혀 있다', pasted.nabi.getHtml());

    const opened = createNabiWith(defaultWings);
    const files = [
      { name: 'attack.nabi', text: writeNabiFile(CROSS_RAW) },
      { name: 'attack.html', text: CROSS_HTML },
    ];
    const file = mountFile({
      ...opened,
      parse: parseNodes,
      store: {
        save: () => undefined,
        open: async () => files.shift() ?? null,
      },
    });
    ok('cross corpus - .nabi file 입구가 raw tree를 안전하게 읽는다', await file.open());
    safeDom('cross corpus - .nabi file/render DOM sink가 닫혀 있다', opened.nabi.getHtml());
    ok('cross corpus - .html file 입구가 active HTML을 안전하게 읽는다', await file.open());
    safeDom('cross corpus - .html file/render DOM sink가 닫혀 있다', opened.nabi.getHtml());
    file.unmount();

    const hydrated = createNabiWith(defaultWings, { doc: CROSS_RAW });
    const dom = new JSDOM('<div id="root"></div>', {
      runScripts: 'dangerously',
      beforeParse(window) {
        (window as unknown as { __nabiAttack: number }).__nabiAttack = 0;
      },
    });
    const root = dom.window.document.getElementById('root') as HTMLElement;
    root.innerHTML = renderStoredEditorHtml(CROSS_RAW, hydrated.registry) ?? '';
    root.firstElementChild?.setAttribute('onclick', 'globalThis.__nabiAttack+=1');
    const surface = mountSurface({ ...hydrated, root, hydrate: true });
    safeDom('cross corpus - hydrate mismatch를 입양하지 않고 canonical DOM으로 되쓴다', root.innerHTML);
    surface.unmount();
    dom.window.close();
  } finally {
    (globalThis as { DOMParser: typeof DOMParser }).DOMParser = previous;
    parserOwner.window.close();
  }
}

done('regression-trust');
