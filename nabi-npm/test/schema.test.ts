// schema 그물 — 왕복 멱등·래퍼 불변식·빈 문단 보존·_id 결정성·attrs 정책·런 뷰.
import { cocoon } from '../src/schema/cocoon.js';
import { isWrapper, makeEnv } from '../src/schema/env.js';
import { $fromJson, $parseJson, $toJson } from '../src/schema/json.js';
import { lengthOf, marksBefore, runsOf } from '../src/schema/runs.js';
import { isElement, type ElementNode, type NabiNode } from '../src/schema/types.js';
import { done, eq, ok } from './net.js';

// 07 이 wing 선언에서 지을 환경을, 여기서는 확정된 기본 wing 갈래로 손수 짓는다.
const ENV = makeEnv({
  voids: ['hr', 'img', 'youtube'],
  lumps: ['hr', 'img', 'youtube', 'table', 'ul', 'ol', 'tl', 'quote', 'details', 'code'],
  blockHolders: ['table', 'tr', 'td', 'ul', 'li', 'ol', 'oli', 'tl', 'tli', 'quote', 'details'],
  inlineHolders: ['summary', 'code'],
  boolAttrs: ['dc', 'o', 'ck'],
});

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
  { w: 'p', a: { a: 'c' }, ch: [{ w: 'img', a: { src: '/logo/x.svg', alt: '설명', w: '40' }, ch: [] }] },
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
    ch: [
      { w: 'details', a: { o: 1 }, ch: [{ w: 'summary', ch: ['접기 제목'] }, { w: 'p', ch: ['접기 속 글'] }] },
    ],
  },
  { w: 'p', ch: [{ w: 'code', a: { lang: 'ts' }, ch: ['const x = 1', { w: 'br', ch: [] }, 'const y = 2'] }] },
];

// --- 왕복 멱등 -----------------------------------------------------------------------------

const doc = $fromJson(EX, ENV);
ok('전체 예시를 받는다', doc !== null);
if (doc === null) {
  done('schema');
  throw new Error('unreachable');
}

const json1 = $toJson(doc);
eq('왕복이 예시를 그대로 돌려준다', json1, EX);
const doc2 = $fromJson(json1, ENV);
eq('f(f(x)) = f(x) — 두 번 돌려도 같다', doc2 === null ? null : $toJson(doc2), json1);
ok('사용자 JSON 에 _ 필드가 없다', !JSON.stringify(json1).includes('"_'));

// --- _id — 결정성·유일성·안정성 ------------------------------------------------------------

const ids = (nodes: readonly NabiNode[]): string[] => {
  const out: string[] = [];
  const walk = (list: readonly NabiNode[]): void => {
    for (const node of list) {
      if (!isElement(node)) continue;
      out.push(node._id ?? '(없음)');
      walk(node.ch);
    }
  };
  walk(nodes);
  return out;
};

const all = ids(doc);
ok('모든 엘리먼트에 _id 가 있다', !all.includes('(없음)'));
ok('_id 가 유일하다', new Set(all).size === all.length);
eq('같은 JSON 은 같은 _id 를 얻는다 (결정성)', ids($fromJson(EX, ENV) ?? []), all);
ok('고친 트리를 다시 고쳐도 참조가 그대로다 (멱등·구조 공유)', cocoon(doc, ENV) === doc);

const kept = $fromJson([{ w: 'p', ch: [] }], ENV) ?? [];
const keptAgain = cocoon(kept, ENV);
ok('이미 실린 유효한 _id 는 지킨다 (안정성)', keptAgain[0] === kept[0]);
const hack = $fromJson([{ w: 'p', ch: [], _id: 'HACK' } as unknown as Record<string, unknown>], ENV) ?? [];
ok('밖에서 온 _id 는 받지 않는다', hack[0]?._id !== 'HACK');
const dupe = cocoon(
  [
    { w: 'p', ch: [], _id: 'same' },
    { w: 'p', ch: [], _id: 'same' },
  ],
  ENV,
);
ok('겹친 _id 는 둘째가 새 키를 받는다', dupe[0]?._id === 'same' && dupe[1]?._id !== 'same' && dupe[1]?._id !== undefined);
const unsafe = cocoon([{ w: 'p', ch: [], _id: '"><script>' }], ENV);
ok('위험한 글자의 _id 는 다시 짓는다', unsafe[0]?._id === 'n0');

// --- 래퍼 불변식 ----------------------------------------------------------------------------

const bare = $fromJson([{ w: 'img', a: { src: '/x.png' }, ch: [] }], ENV) ?? [];
eq('맨몸 물건은 래퍼문단을 입는다', $toJson(bare), [{ w: 'p', ch: [{ w: 'img', a: { src: '/x.png' }, ch: [] }] }]);
ok('입힌 것이 래퍼문단으로 판별된다', bare[0] !== undefined && isWrapper(bare[0], ENV));

const mixed = $fromJson([{ w: 'p', ch: ['앞', { w: 'img', a: { src: '/x.png' }, ch: [] }, '뒤'] }], ENV) ?? [];
eq('물건+글 문단은 셋으로 쪼개진다', $toJson(mixed), [
  { w: 'p', ch: ['앞'] },
  { w: 'p', ch: [{ w: 'img', a: { src: '/x.png' }, ch: [] }] },
  { w: 'p', ch: ['뒤'] },
]);

const two = $fromJson([{ w: 'p', ch: [{ w: 'img', a: { src: '/1.png' }, ch: [] }, { w: 'img', a: { src: '/2.png' }, ch: [] }] }], ENV) ?? [];
ok('이미지 둘이 든 문단은 래퍼문단 둘이 된다', two.length === 2 && isWrapper(two[0] as ElementNode, ENV) && isWrapper(two[1] as ElementNode, ENV));

const wrapAttrs = $fromJson([{ w: 'p', a: { a: 'c', h: 2, dc: 1 }, ch: [{ w: 'img', a: { src: '/x.png' }, ch: [] }] }], ENV) ?? [];
eq('래퍼문단의 attrs 는 정렬만 남는다', (wrapAttrs[0] as ElementNode).a, { a: 'c' });

const inDetails = $fromJson([{ w: 'p', ch: [{ w: 'details', ch: [{ w: 'summary', ch: ['제목'] }, { w: 'table', ch: [{ w: 'tr', ch: [{ w: 'td', ch: [] }] }] }] }] }], ENV) ?? [];
const detailsNode = (inDetails[0] as ElementNode).ch[0] as ElementNode;
ok('컨테이너 속 맨몸 물건도 래퍼문단을 입는다 (재귀)', isElement(detailsNode.ch[1] as NabiNode) && isWrapper(detailsNode.ch[1] as NabiNode, ENV));

const inMark = $fromJson([{ w: 'p', ch: [{ w: 'b', ch: ['글', { w: 'img', a: { src: '/x.png' }, ch: [] }] }] }], ENV) ?? [];
eq('마크 속에 잘못 선 물건은 걷힌다', $toJson(inMark), [{ w: 'p', ch: [{ w: 'b', ch: ['글'] }] }]);

// --- 빈 문단·문단 규칙 ----------------------------------------------------------------------

const blanks = $fromJson([{ w: 'p', ch: [] }, { w: 'p', ch: [] }, { w: 'p', ch: [] }], ENV) ?? [];
ok('빈 문단은 걷지 않는다 (엔터 연타 공백)', blanks.length === 3 && blanks.every((p) => p.ch.length === 0));
const empty = $fromJson([], ENV) ?? [];
eq('빈 문서에는 캐럿이 설 빈 문단 하나가 선다', $toJson(empty), [{ w: 'p', ch: [] }]);

const loose = $fromJson(['안녕', '하세요', { w: 'b', ch: ['굵게'] }] as unknown[], ENV) ?? [];
eq('떠도는 글자·마크는 문단으로 모인다 (이웃 글자는 잇는다)', $toJson(loose), [
  { w: 'p', ch: ['안녕하세요', { w: 'b', ch: ['굵게'] }] },
]);

const nested = $fromJson([{ w: 'p', ch: ['a', { w: 'p', ch: ['b'] }] }], ENV) ?? [];
eq('문단 속 문단은 껍데기를 벗는다', $toJson(nested), [{ w: 'p', ch: ['ab'] }]);

// --- attrs 정책 -----------------------------------------------------------------------------

const pAttrs = $fromJson([{ w: 'p', a: { h: 3, a: 'c', dc: 1, tf: 'serif', fs: 'lg', x: 'y' }, ch: ['글'] }], ENV) ?? [];
eq('글 문단 attrs 는 h·a·dc 화이트리스트다 (서체·크기는 마크로 갔다)', (pAttrs[0] as ElementNode).a, { h: 3, a: 'c', dc: 1 });
const badAttrs = $fromJson([{ w: 'p', a: { h: 7, a: 'center', dc: 0 }, ch: ['글'] }], ENV) ?? [];
ok('h 는 1~6, a 는 첫 글자, dc 는 1 만 — 어긋난 값은 걷는다', (badAttrs[0] as ElementNode).a === undefined);
const hString = $fromJson([{ w: 'p', a: { h: '1' }, ch: ['글'] }], ENV) ?? [];
ok('h 의 문자열 값은 걷는다 (숫자만)', (hString[0] as ElementNode).a === undefined);

const boolAttr = $fromJson([{ w: 'p', ch: [{ w: 'tl', ch: [{ w: 'tli', a: { ck: 0 }, ch: [{ w: 'p', ch: ['a'] }] }, { w: 'tli', a: { ck: '1' }, ch: [{ w: 'p', ch: ['b'] }] }, { w: 'tli', a: { ck: 1 }, ch: [{ w: 'p', ch: ['c'] }] }] }] }], ENV) ?? [];
const tlNode = (boolAttr[0] as ElementNode).ch[0] as ElementNode;
const ckOf = (i: number): unknown => (tlNode.ch[i] as ElementNode).a?.['ck'];
ok('불리언 attr 는 숫자 1 만 남는다 (0·"1" 은 걷는다)', ckOf(0) === undefined && ckOf(1) === undefined && ckOf(2) === 1);

const junk = $fromJson([{ w: 'p', ch: [], foo: { bad: true }, _sneak: 'x' } as unknown as Record<string, unknown>], ENV);
eq('모르는 여벌 키와 _ 키는 벗긴다', junk === null ? null : $toJson(junk), [{ w: 'p', ch: [] }]);

// --- 블록 자리 정리 ------------------------------------------------------------------------

const voidKids = $fromJson([{ w: 'img', a: { src: '/x.png' }, ch: ['잘못 든 글'] }], ENV) ?? [];
eq('단말의 속은 강제로 빈다', $toJson(voidKids), [{ w: 'p', ch: [{ w: 'img', a: { src: '/x.png' }, ch: [] }] }]);

const looseQuote = $fromJson([{ w: 'quote', ch: ['맨글'] }], ENV) ?? [];
eq('블록 홀더 속 떠도는 글은 문단으로 감싼다', $toJson(looseQuote), [
  { w: 'p', ch: [{ w: 'quote', ch: [{ w: 'p', ch: ['맨글'] }] }] },
]);
const looseTd = $fromJson([{ w: 'table', ch: [{ w: 'tr', ch: [{ w: 'td', ch: ['칸 글'] }] }] }], ENV) ?? [];
const tdNode = (((looseTd[0] as ElementNode).ch[0] as ElementNode).ch[0] as ElementNode).ch[0] as ElementNode;
eq('칸 속 떠도는 글도 문단을 입는다', $toJson([tdNode] as unknown as readonly ElementNode[]), [
  { w: 'td', ch: [{ w: 'p', ch: ['칸 글'] }] },
]);

// --- repair 위임 ----------------------------------------------------------------------------

const repaired = cocoon(
  [{ w: 'table', ch: [] }],
  makeEnv({
    lumps: ['table'],
    blockHolders: ['table'],
    repair: { table: (node) => ({...node, a: {...node.a, fixed: '1' } }) },
  }),
);
const tableNode = (repaired[0] as ElementNode).ch[0] as ElementNode;
ok('타입별 복구는 repair 훅에 위임된다', tableNode.a?.['fixed'] === '1');

// --- 거절 (나비트리가 아니면 null) ----------------------------------------------------------

ok('루트가 배열이 아니면 거절', $fromJson({ w: 'root', ch: [] }, ENV) === null);
ok('w 없는 엘리먼트는 거절', $fromJson([{ ch: [] }], ENV) === null);
ok('w 가 문자열이 아니면 거절', $fromJson([{ w: 1, ch: [] }], ENV) === null);
ok('ch 가 배열이 아니면 거절', $fromJson([{ w: 'p', ch: 'x' }], ENV) === null);
ok('attr 값이 객체면 거절', $fromJson([{ w: 'p', a: { k: {} }, ch: [] }], ENV) === null);
ok('깨진 JSON 글자열은 거절', $parseJson('{no', ENV) === null);
ok('ch 를 뺀 말단은 받는다', $fromJson([{ w: 'p', ch: [{ w: 'img', a: { src: '/x.png' } }] }], ENV) !== null);

// --- 런 뷰 ----------------------------------------------------------------------------------

const runsDoc = $fromJson(
  [{ w: 'p', ch: ['12', { w: 'b', ch: ['34', { w: 'br', ch: [] }, '5'] }, '6'] }],
  ENV,
) ?? [];
const runsP = runsDoc[0] as ElementNode;
const runs = runsOf(runsP);
eq(
  '런 뷰 — 중첩 마크가 평평하게 펴진다',
  runs.map((run) => (run.kind === 'text' ? `${run.text}/${run.marks.map((m) => m.w).join('')}` : `[${run.node.w}]/${run.marks.map((m) => m.w).join('')}`)),
  ['12/', '34/b', '[br]/b', '5/b', '6/'],
);
eq('칸 수 — 글자 하나·단말 하나가 각각 한 칸', lengthOf(runsP), 7);
eq('오프셋 0 앞에는 마크가 없다', marksBefore(runsP, 0).map((m) => m.w), []);
eq('글자 앞 마크 — b 속 글자', marksBefore(runsP, 3).map((m) => m.w), ['b']);
eq('라인(br)도 마크 안에 선다', marksBefore(runsP, 5).map((m) => m.w), ['b']);
eq('마크 밖 글자 앞에는 마크가 없다', marksBefore(runsP, 7).map((m) => m.w), []);

const wrapperP = bare[0] as ElementNode;
const withLumps = (w: string): boolean => w === 'br' || ENV.lumps.has(w);
eq('래퍼문단의 칸 수는 1 — 캐럿 자리는 0/1 둘뿐', lengthOf(wrapperP, withLumps), 1);

done('schema');
