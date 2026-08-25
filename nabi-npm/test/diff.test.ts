// diff 그물 — Myers 편집 열·HTML 글자 강조·블록 매칭(추가/삭제/이동/글자 변경)·렌더 모델.
// 전부 DOM 없이 돈다 — diffDocs 는 조립 HTML 글자열 위에서 일하기 때문이다.
import { defaultWings, makeRegistry, renderStoredHtml } from '../src/ssr.js';
import { diffDocs } from '../src/diff/index.js';
import { diffSeq } from '../src/diff/myers.js';
import { changedRanges, htmlText, paintHtml } from '../src/diff/paint.js';
import { done, eq, ok } from './net.js';

const registry = makeRegistry(defaultWings);

// --- Myers 편집 열 ------------------------------------------------------------------------------

{
  const runs = diffSeq([...'abc'], [...'abc']);
  eq('같은 열은 eq 하나다', runs, [{ op: 'eq', a: 0, b: 0, n: 3 }]);
}
{
  const runs = diffSeq([...'ac'], [...'abc']);
  eq('가운데 삽입', runs, [
    { op: 'eq', a: 0, b: 0, n: 1 },
    { op: 'ins', a: 1, b: 1, n: 1 },
    { op: 'eq', a: 1, b: 2, n: 1 },
  ]);
}
{
  const runs = diffSeq([...'abc'], [...'ac']);
  eq('가운데 삭제', runs, [
    { op: 'eq', a: 0, b: 0, n: 1 },
    { op: 'del', a: 1, b: 1, n: 1 },
    { op: 'eq', a: 2, b: 1, n: 1 },
  ]);
}
{
  const runs = diffSeq([...''], [...'abc']);
  eq('빈 것에서 전부 삽입', runs, [{ op: 'ins', a: 0, b: 0, n: 3 }]);
  eq('전부 삭제', diffSeq([...'ab'], []), [{ op: 'del', a: 0, b: 0, n: 2 }]);
  eq('둘 다 빈 열', diffSeq([], []), []);
}
{
  // 편집 열의 불변식 — 어떤 입력이든 a 쪽 소비량과 b 쪽 소비량이 원본 길이와 같다.
  const cases: [string, string][] = [
    ['kitten', 'sitting'],
    ['가나다라마', '가나마다라'],
    ['같은 글', '같은 글'],
    ['', '뭔가'],
    ['aXbXcXd', 'bYcYd'],
  ];
  for (const [a, b] of cases) {
    const ca = [...a];
    const cb = [...b];
    let usedA = 0;
    let usedB = 0;
    let rebuiltB = '';
    for (const run of diffSeq(ca, cb)) {
      if (run.op !== 'ins') usedA += run.n;
      if (run.op !== 'del') usedB += run.n;
      if (run.op === 'eq') rebuiltB += ca.slice(run.a, run.a + run.n).join('');
      if (run.op === 'ins') rebuiltB += cb.slice(run.b, run.b + run.n).join('');
    }
    ok(`소비량 보존 (${a} → ${b})`, usedA === ca.length && usedB === cb.length);
    ok(`eq+ins 로 b 가 복원된다 (${a} → ${b})`, rebuiltB === b, rebuiltB);
  }
}
{
  // 서로게이트 쌍 — 코드포인트 단위라 이모지 한가운데가 갈라지지 않는다.
  const runs = diffSeq([...'a😀b'], [...'a😺b']);
  eq('이모지 하나가 통째로 바뀐다', runs, [
    { op: 'eq', a: 0, b: 0, n: 1 },
    { op: 'del', a: 1, b: 1, n: 1 },
    { op: 'ins', a: 2, b: 1, n: 1 },
    { op: 'eq', a: 2, b: 2, n: 1 },
  ]);
}

// --- HTML 글자 걷기·강조 ------------------------------------------------------------------------

{
  const html = '<p>a<b>b&amp;c</b>d</p>';
  eq('htmlText 는 엔티티를 풀어 센다', htmlText(html), 'ab&cd');
}
{
  // b&cd 구간(1~5)을 입힌다 — <b> 경계를 걸치므로 span 이 경계마다 끊긴다.
  const html = '<p>a<b>b&amp;c</b>d</p>';
  const painted = paintHtml(html, [{ start: 1, end: 5 }], 'x');
  eq(
    '경계를 걸친 구간은 조각마다 span 이 선다',
    painted,
    '<p>a<b><span class="x">b&amp;c</span></b><span class="x">d</span></p>',
  );
  eq('입힌 뒤에도 글자 내용은 같다', htmlText(painted), htmlText(html));
  eq(
    '엔티티는 통째로 한 글자다',
    paintHtml(html, [{ start: 2, end: 3 }], 'x'),
    '<p>a<b>b<span class="x">&amp;</span>c</b>d</p>',
  );
}
{
  const html = '<p>가나다</p>';
  eq('구간이 없으면 원문 그대로다', paintHtml(html, [], 'x'), html);
  const runs = diffSeq([...'가나다'], [...'가라다']);
  const { del, ins } = changedRanges(runs);
  eq('del 구간', del, [{ start: 1, end: 2 }]);
  eq('ins 구간', ins, [{ start: 1, end: 2 }]);
  eq(
    '한 글자 강조',
    paintHtml(html, del, 'nabi-diff-del'),
    '<p>가<span class="nabi-diff-del">나</span>다</p>',
  );
}

// --- 블록 매칭 — 같음 ---------------------------------------------------------------------------

const DOC = [
  { w: 'p', a: { h: 1 }, ch: ['제목'] },
  { w: 'p', ch: ['첫 문단이다.'] },
  { w: 'p', ch: [{ w: 'b', ch: ['굵게'] }, ' 섞인 문단.'] },
  { w: 'p', ch: ['마지막 문단.'] },
];

{
  const result = diffDocs(DOC, DOC, registry);
  ok('같은 문서 — 결과가 있다', result !== null);
  if (result) {
    ok('같은 문서 — 전부 same', result.entries.every((entry) => entry.kind === 'same'));
    eq('같은 문서 — 변경 목록이 빈다', result.changes, []);
    eq(
      '블록 조립을 이으면 renderStoredHtml 과 같다',
      result.before.map((block) => block.html).join(''),
      renderStoredHtml(DOC, registry),
    );
  }
}

// --- 블록 매칭 — 추가/삭제 ----------------------------------------------------------------------

{
  const after = [...DOC.slice(0, 2), { w: 'p', ch: ['끼어든 새 문단.'] }, ...DOC.slice(2)];
  const result = diffDocs(DOC, after, registry);
  ok('문단 추가 — 결과가 있다', result !== null);
  if (result) {
    eq('문단 추가 — 변경은 하나다', result.changes.length, 1);
    const entry = result.entries[result.changes[0] as number];
    eq('문단 추가 — added 로 잡힌다', entry?.kind, 'added');
    eq('문단 추가 — after 쪽 2번 블록이다', entry?.after, 2);
    eq('문단 추가 — before 쪽은 없다', entry?.before, null);
  }
}
{
  const after = [...DOC.slice(0, 1), ...DOC.slice(2)];
  const result = diffDocs(DOC, after, registry);
  ok('문단 삭제 — 결과가 있다', result !== null);
  if (result) {
    eq('문단 삭제 — 변경은 하나다', result.changes.length, 1);
    const entry = result.entries[result.changes[0] as number];
    eq('문단 삭제 — removed 로 잡힌다', entry?.kind, 'removed');
    eq('문단 삭제 — before 쪽 1번 블록이다', entry?.before, 1);
    eq('문단 삭제 — after 쪽은 없다', entry?.after, null);
  }
}

// --- 블록 매칭 — 이동 ---------------------------------------------------------------------------

{
  // 1번 문단이 맨 끝으로 — 내용이 같으므로 removed+added 가 아니라 moved 하나로 접힌다.
  const after = [DOC[0], DOC[2], DOC[3], DOC[1]];
  const result = diffDocs(DOC, after, registry);
  ok('문단 이동 — 결과가 있다', result !== null);
  if (result) {
    const moved = result.entries.filter((entry) => entry.kind === 'moved');
    eq('문단 이동 — moved 하나다', moved.length, 1);
    eq('문단 이동 — before 1번', moved[0]?.before, 1);
    eq('문단 이동 — after 3번', moved[0]?.after, 3);
    ok(
      '문단 이동 — removed·added 는 없다',
      result.entries.every((entry) => entry.kind !== 'removed' && entry.kind !== 'added'),
    );
  }
}

// --- 블록 매칭 — 글자 변경 ----------------------------------------------------------------------

{
  const after = [DOC[0], { w: 'p', ch: ['첫 문단이라네.'] }, DOC[2], DOC[3]];
  const result = diffDocs(DOC, after, registry);
  ok('글자 변경 — 결과가 있다', result !== null);
  if (result) {
    eq('글자 변경 — 변경은 하나다', result.changes.length, 1);
    const entry = result.entries[result.changes[0] as number];
    eq('글자 변경 — changed 로 짝이 잡힌다', entry?.kind, 'changed');
    eq('글자 변경 — 같은 자리끼리다', [entry?.before, entry?.after], [1, 1]);
    ok('글자 변경 — 양쪽에 구간이 있다', (entry?.beforeRanges?.length ?? 0) > 0 && (entry?.afterRanges?.length ?? 0) > 0);
    const beforeHtml = result.before[1]?.html ?? '';
    const afterHtml = result.after[1]?.html ?? '';
    ok('글자 변경 — before 에 del span', beforeHtml.includes('class="nabi-diff-del"'), beforeHtml);
    ok('글자 변경 — after 에 ins span', afterHtml.includes('class="nabi-diff-ins"'), afterHtml);
    eq('글자 변경 — 강조를 입혀도 글자는 같다', [htmlText(beforeHtml), htmlText(afterHtml)], ['첫 문단이다.', '첫 문단이라네.']);
  }
}
{
  // 마크 경계를 걸친 변경 — span 이 태그 짝을 깨지 않는다.
  const before = [{ w: 'p', ch: ['앞 ', { w: 'b', ch: ['굵은 글'] }, ' 뒤'] }];
  const after = [{ w: 'p', ch: ['앞 ', { w: 'b', ch: ['굵은 말'] }, ' 뒤에 더'] }];
  const result = diffDocs(before, after, registry);
  ok('마크 경계 변경 — 결과가 있다', result !== null);
  if (result) {
    const afterHtml = result.after[0]?.html ?? '';
    const opens = afterHtml.split('<span').length - 1;
    const closes = afterHtml.split('</span>').length - 1;
    ok('마크 경계 변경 — span 여닫이가 짝이 맞는다', opens > 0 && opens === closes, afterHtml);
    eq('마크 경계 변경 — 글자 내용은 원문과 같다', htmlText(afterHtml), '앞 굵은 말 뒤에 더');
  }
}

// --- 거절 ---------------------------------------------------------------------------------------

{
  ok('나비트리가 아니면 null', diffDocs({ not: 'tree' }, DOC, registry) === null);
  // HTML 글자열 갈래는 DOMParser 가 필요하다 — 없는 환경(Node)에서는 같은 답(null)으로 거절한다.
  ok('DOM 없는 곳의 HTML 입력은 null', diffDocs('<p>hi</p>', DOC, registry) === null);
}

done('diff');
