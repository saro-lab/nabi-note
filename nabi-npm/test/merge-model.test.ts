import { JSDOM } from 'jsdom';
import { defaultWings, makeRegistry } from '../src/ssr.js';
import { $toJson } from '../src/schema/json.js';
import type { ElementNode, NabiDoc, NabiNode } from '../src/schema/types.js';
import { mergeDocs } from '../src/merge/model.js';
import { normalizeMergeInput } from '../src/merge/input.js';
import { joinMergeUnits, mergeNodeKey, mergeUnitKey, replaceMergeRange, splitMergeUnits } from '../src/merge/units.js';
import { done, eq, ok } from './net.js';

const registry = makeRegistry(defaultWings);
const p = (...ch: NabiNode[]): ElementNode => ({ w: 'p', ch });
const doc = (...text: string[]): NabiDoc => text.map((value) => p(value));
const plain = (value: NabiDoc): unknown => $toJson(value);
const br: ElementNode = { w: 'br', ch: [] };
const normalize = (value: unknown): NabiDoc => {
  const normalized = normalizeMergeInput(value, registry);
  if (!normalized) throw new Error(`Invalid test document: ${JSON.stringify(value)}`);
  return normalized;
};

{
  const base = doc('제목', '첫 문단', '둘째 문단');
  const local = doc('제목', '내 첫 문단', '둘째 문단');
  const incoming = doc('제목', '첫 문단', '새 둘째 문단');
  const result = mergeDocs(base, local, incoming, registry)!;
  eq('이웃 문단의 독립 수정은 모두 자동으로 반영한다', plain(result.result), doc('제목', '내 첫 문단', '새 둘째 문단'));
  eq('이웃 변경은 충돌을 만들지 않는다', result.conflicts, []);
  const shared = mergeDocs(
    base,
    doc('새 제목', '내 첫 문단', '둘째 문단'),
    doc('새 제목', '첫 문단', '둘째 문단'),
    registry,
  )!;
  eq(
    '연속 변경 중 같은 수정은 한 번 반영하고 독립 수정은 자동 반영한다',
    plain(shared.result),
    doc('새 제목', '내 첫 문단', '둘째 문단'),
  );
  eq('연속 변경을 표시용 묶음 때문에 충돌로 묶지 않는다', shared.conflicts, []);
}

{
  const result = mergeDocs(doc('a b c'), doc('A b c'), doc('a b C'), registry)!;
  eq('같은 줄의 서로 다른 단어 수정은 충돌이다', result.conflicts.length, 1);
  eq('충돌의 처음 결과는 내 버전이다', plain(result.result), doc('A b c'));
  const conflict = result.conflicts[0]!;
  eq('충돌 범위는 논리적 줄 단위다', [conflict.resultStart, conflict.resultEnd], [0, 1]);
  eq(
    '오른쪽 조각으로 해당 범위만 바꿀 수 있다',
    plain(replaceMergeRange(result.result, 0, 1, conflict.incoming, registry)),
    doc('a b C'),
  );
  eq(
    '시작 버전 조각으로 복원할 수 있다',
    plain(replaceMergeRange(result.result, 0, 1, conflict.base, registry)),
    doc('a b c'),
  );
}

{
  const base = [p({ w: 'b', ch: ['가😀', br, '둘째', br, '셋째'] })];
  const local = [p({ w: 'b', ch: ['가😺', br, '둘째', br, '셋째'] })];
  const incoming = [p({ w: 'b', ch: ['가😀', br, '둘째', br, '새 셋째'] })];
  const normalized = normalize(base);
  const units = splitMergeUnits(normalized, registry);
  eq('br는 중첩 마크 안에서도 논리적 줄을 나눈다', units.length, 3);
  eq(
    '위치는 UTF-16과 줄바꿈 한 단위를 센다',
    units.map(({ start, end }) => [start, end]),
    [
      [0, 4],
      [4, 7],
      [7, 9],
    ],
  );
  eq('분할과 조립은 중첩 서식을 보존한다', plain(joinMergeUnits(units, registry)), plain(normalized));
  const result = mergeDocs(base, local, incoming, registry)!;
  eq('같은 문단 안에서도 br로 나뉜 다른 줄은 자동 머지한다', plain(result.result), [
    p({ w: 'b', ch: ['가😺', br, '둘째', br, '새 셋째'] }),
  ]);
  eq('br 독립 변경에는 충돌이 없다', result.conflicts.length, 0);
  const heading = mergeDocs(
    [p('a', br, 'b')],
    [p('a', br, 'B')],
    [{ w: 'p', a: { h: 1 }, ch: ['a', br, 'b'] }],
    registry,
  )!;
  eq('문단 속성 변경과 다른 줄 수정은 문단 전체 충돌로 남긴다', heading.conflicts[0]!.base.length, 2);
  eq('문단 속성과 줄을 섞어 임의의 문단 경계를 만들지 않는다', plain(heading.result), [p('a', br, 'B')]);
  const partial = replaceMergeRange(
    normalize([{ w: 'p', a: { h: 1 }, ch: ['a', br, 'B'] }]),
    1,
    2,
    splitMergeUnits(normalize([p('b')]), registry),
    registry,
  );
  eq('직접 서식을 바꾼 문단의 일부 줄을 채택할 때 문단 경계를 만들지 않는다', plain(partial), [
    { w: 'p', a: { h: 1 }, ch: ['a', br, 'b'] },
  ]);
  const endings = [
    p(br),
    p('a', br),
    p({ w: 'b', ch: ['b', br] }, 'plain'),
    p('a', { w: 'b', ch: ['b', br, 'c'] }, 'd'),
  ];
  for (const paragraph of endings) {
    const tree = normalize([paragraph]);
    eq(
      '빈 줄과 마크 경계가 분할 왕복에서 남는다',
      plain(joinMergeUnits(splitMergeUnits(tree, registry), registry)),
      plain(tree),
    );
  }
}

{
  const base = doc('a', 'b', 'c');
  const removed = mergeDocs(base, doc('a', 'c'), doc('a', 'B', 'c'), registry)!;
  eq('삭제와 수정은 충돌이다', removed.conflicts.length, 1);
  eq(
    '삭제된 충돌은 길이 0인 결과 위치다',
    [removed.conflicts[0]!.resultStart, removed.conflicts[0]!.resultEnd],
    [1, 1],
  );
  eq(
    '삭제 충돌에서 오른쪽 내용을 복구한다',
    plain(replaceMergeRange(removed.result, 1, 1, removed.conflicts[0]!.incoming, registry)),
    doc('a', 'B', 'c'),
  );
  const both = mergeDocs(base, doc('a'), doc('a', 'b'), registry)!;
  eq('같은 삭제는 한 번만 적용하고 다른 삭제도 적용한다', plain(both.result), doc('a'));
  eq('겹치는 같은 삭제는 충돌이 아니다', both.conflicts.length, 0);
  const added = mergeDocs(base, doc('a', 'mine', 'b', 'c'), doc('a', 'theirs', 'b', 'c'), registry)!;
  eq('같은 위치의 서로 다른 삽입은 충돌이다', added.conflicts.length, 1);
  eq('삽입 충돌의 시작 조각은 비어 있다', added.conflicts[0]!.base.length, 0);
  eq(
    '삽입 충돌은 오른쪽 문서의 정확한 줄 범위를 가진다',
    [added.conflicts[0]!.incomingStart, added.conflicts[0]!.incomingEnd],
    [1, 2],
  );
  const sameAdded = mergeDocs(base, doc('a', 'new', 'b', 'c'), doc('a', 'new', 'b', 'c'), registry)!;
  eq('같은 삽입은 중복하지 않는다', plain(sameAdded.result), doc('a', 'new', 'b', 'c'));
  eq('같은 삽입에는 충돌이 없다', sameAdded.conflicts, []);
}

{
  const result = mergeDocs(
    doc('a', 'b', 'c'),
    doc('local before', 'a', 'B', 'c'),
    doc('incoming before', 'a', 'X', 'c'),
    registry,
  )!;
  const units = splitMergeUnits(result.incoming, registry);
  eq(
    '앞의 삽입을 지난 충돌도 오른쪽 줄 위치를 추적한다',
    result.conflicts.map(({ incomingStart, incomingEnd }) => [incomingStart, incomingEnd]),
    [
      [0, 1],
      [2, 3],
    ],
  );
  for (const conflict of result.conflicts) {
    eq(
      '오른쪽 충돌 좌표는 저장된 오른쪽 조각과 일치한다',
      units.slice(conflict.incomingStart, conflict.incomingEnd).map(mergeUnitKey),
      conflict.incoming.map(mergeUnitKey),
    );
  }
}

{
  const table = (a: string, b: string): ElementNode =>
    p({
      w: 'table',
      ch: [
        {
          w: 'tr',
          ch: [
            { w: 'td', ch: [p(a)] },
            { w: 'td', ch: [p(b)] },
          ],
        },
      ],
    });
  const list = (a: string, b: string): ElementNode =>
    p({
      w: 'ul',
      ch: [
        { w: 'li', ch: [p(a)] },
        { w: 'li', ch: [p(b)] },
      ],
    });
  const float = (a: string, b: string): ElementNode => p({ w: 'float', a: { side: 'left', w: 40 }, ch: [p(a), p(b)] });
  for (const structure of [table, list, float]) {
    const result = mergeDocs(
      [structure('a', 'b'), p('end')],
      [structure('A', 'b'), p('end')],
      [structure('a', 'B'), p('END')],
      registry,
    )!;
    eq('복잡한 구조 내부는 서로 다른 부분을 고쳐도 전체 충돌이다', result.conflicts.length, 1);
    eq('구조 충돌 밖의 수정은 자동 반영한다', plain(result.result), [structure('A', 'b'), p('END')]);
    eq('구조 전체를 하나의 단위로 다룬다', result.conflicts[0]!.base.length, 1);
  }
  const bold = [p({ w: 'b', ch: ['a'] })];
  const italic = [p({ w: 'i', ch: ['a'] })];
  eq('글자가 같아도 서식이 다르면 충돌이다', mergeDocs(doc('a'), bold, italic, registry)!.conflicts.length, 1);
  const red = [p({ w: 'a', a: { href: 'https://example.com/a' }, ch: ['same'] })];
  const blue = [p({ w: 'a', a: { href: 'https://example.com/b' }, ch: ['same'] })];
  const other = [p({ w: 'a', a: { href: 'https://example.com/c' }, ch: ['same'] })];
  eq('링크 속성만 달라도 충돌이다', mergeDocs(red, blue, other, registry)!.conflicts.length, 1);
}

{
  const repeated = mergeDocs(doc('same', 'same'), doc('same'), doc('changed', 'same'), registry)!;
  eq('반복 문단 삭제의 모호한 대응은 자동 머지하지 않는다', repeated.conflicts.length, 1);
  eq('반복된 위치를 포함해 충돌을 넓힌다', repeated.conflicts[0]!.base.length, 2);
  eq('모호함을 충돌에 남긴다', repeated.conflicts[0]!.reason, 'ambiguous');
  const moved = mergeDocs(doc('a', 'b', 'c'), doc('b', 'c', 'a'), doc('A', 'b', 'c'), registry)!;
  eq('이동과 원래 위치의 수정은 충돌로 남긴다', moved.conflicts.length, 1);
  eq(
    '이동 충돌은 선택할 때 중복 삽입하지 않게 전체 이동 구간을 포함한다',
    plain(
      replaceMergeRange(
        moved.result,
        moved.conflicts[0]!.resultStart,
        moved.conflicts[0]!.resultEnd,
        moved.conflicts[0]!.incoming,
        registry,
      ),
    ),
    doc('A', 'b', 'c'),
  );
}

{
  const samples: NabiDoc[] = [
    [],
    doc(''),
    doc('a'),
    doc('b'),
    doc('a', 'a'),
    doc('a', 'b'),
    doc('b', 'a'),
    doc('a', 'b', 'a'),
    doc('a', 'b', 'c'),
    doc('c', 'b', 'a'),
    [p('a', br, 'b')],
  ];
  for (const base of samples) {
    for (const side of samples) {
      for (const [local, incoming] of [
        [base, side],
        [side, base],
        [side, side],
      ]) {
        const result = mergeDocs(base, local, incoming, registry)!;
        eq('한쪽 변경과 같은 양쪽 변경의 기본 법칙', plain(result.result), plain(normalize(side)));
        eq('기본 법칙은 미해결 충돌을 만들지 않는다', result.conflicts.length, 0);
      }
    }
  }
}

{
  const source = doc('a', 'b');
  const before = JSON.stringify(source);
  const result = mergeDocs(source, doc('A', 'b'), doc('a', 'B'), registry)!;
  eq('입력을 바꾸지 않는다', JSON.stringify(source), before);
  ok('입력의 객체를 동결하지 않는다', !Object.isFrozen(source[0]));
  ok('공개 계산 결과는 깊게 동결한다', Object.isFrozen(result) && Object.isFrozen(result.result[0]!.ch));
  const changedIds = source.map((node, index) => ({ ...node, _id: `different-${index}` }));
  eq('내부 ID는 문서 변경이 아니다', mergeDocs(source, changedIds, source, registry)!.conflicts.length, 0);
  eq(
    '키는 속성 순서에 무관하다',
    mergeNodeKey(p({ w: 'a', a: { href: 'https://example.com', file: 'name' }, ch: ['a'] })),
    mergeNodeKey(p({ w: 'a', a: { file: 'name', href: 'https://example.com' }, ch: ['a'] })),
  );
  const units = splitMergeUnits(normalize(source), registry);
  eq(
    '줄 키는 위치에 의존하지 않는다',
    mergeUnitKey(units[0]!),
    mergeUnitKey({ ...units[0]!, paragraph: 99, start: 12, end: 13 }),
  );
  let nested: NabiNode = 'nested text';
  for (let depth = 0; depth < 24; depth += 1) nested = { w: 'b', ch: [nested] };
  ok('중첩 서식의 정규키는 반복 문자열 이스케이프로 커지지 않는다', mergeNodeKey(nested).length < 1000);
  eq('깊은 중첩 서식도 손실 없이 비교한다', plain(mergeDocs([p(nested)], [p(nested)], [p(nested)], registry)!.result), [
    p(nested),
  ]);
  const invalid = [p({ w: 'not-registered', ch: ['kept text'] })];
  eq('등록되지 않은 날개를 지우며 성공하지 않는다', mergeDocs(source, invalid, source, registry), null);
  eq(
    '버려질 속성을 포함한 JSON은 거절한다',
    normalizeMergeInput([{ w: 'p', a: { h: 99 }, ch: ['text'] }], registry),
    null,
  );
  eq(
    '잘못된 링크를 벗기며 성공하지 않는다',
    normalizeMergeInput([p({ w: 'a', a: { href: 'javascript:alert(1)' }, ch: ['text'] })], registry),
    null,
  );
  eq('정규화가 버릴 자식을 가진 단말은 거절한다', normalizeMergeInput([p({ w: 'hr', ch: ['lost'] })], registry), null);
  eq(
    '접근자는 실행하지 않고 거절한다',
    normalizeMergeInput(
      [
        {
          get w(): string {
            throw new Error('must not execute');
          },
          ch: [],
        },
      ],
      registry,
    ),
    null,
  );
  const cycle: { w: string; ch: unknown[] } = { w: 'p', ch: [] };
  cycle.ch.push(cycle);
  eq('순환 JSON은 거절한다', normalizeMergeInput([cycle], registry), null);
  eq('이웃 문자열과 텍스트 줄바꿈은 손실 없이 정규화한다', plain(normalize([p('', 'a', 'b\r\nc')])), [
    p('ab', br, 'c'),
  ]);
  eq('DOM 없는 HTML은 거절한다', mergeDocs('<p>a</p>', '<p>b</p>', '<p>a</p>', registry), null);
}

{
  const browser = new JSDOM('');
  const previous = globalThis.DOMParser;
  globalThis.DOMParser = browser.window.DOMParser;
  try {
    const result = mergeDocs('<p>a</p><p>b</p>', '<p>A</p><p>b</p>', '<p>a</p><p>B</p>', registry)!;
    eq('HTML도 같은 트리 머지를 한다', plain(result.result), doc('A', 'B'));
    eq(
      '없는 HTML 날개도 지워 성공하지 않는다',
      normalizeMergeInput('<p><strong>a</strong></p>', makeRegistry([])),
      null,
    );
    const unsafe = normalizeMergeInput('<p>a<script>bad()</script></p>', registry)!;
    eq('HTML의 기존 보안 경계는 유지한다', plain(unsafe), doc('a'));
  } finally {
    if (previous === undefined) Reflect.deleteProperty(globalThis, 'DOMParser');
    else globalThis.DOMParser = previous;
    browser.window.close();
  }
}

done('merge-model');
