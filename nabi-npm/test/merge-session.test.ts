import { caretAt } from '../src/caret/index.js';
import { hostOf } from '../src/editor/host.js';
import { createMergeSession, type MergeChange, type MergeSession, type MergeState } from '../src/merge/session.js';
import type { ElementNode, NabiDoc, NabiNode } from '../src/schema/types.js';
import { defaultWings } from '../src/ssr.js';
import { simpleMark } from '../src/wing/index.js';
import { done, eq, ok } from './net.js';

const p = (...ch: NabiNode[]): ElementNode => ({ w: 'p', ch });
const doc = (...text: string[]): NabiDoc => text.map((value) => p(value));
const create = (
  base = doc('before', 'base', 'after'),
  local = doc('before', 'mine', 'after'),
  incoming = doc('before', 'theirs', 'after'),
): MergeSession =>
  createMergeSession({ base, local, incoming, wings: defaultWings, editorOptions: { typingMergeMs: 0 } });
const caret = (session: MergeSession, paragraph: number, offset: number): void => {
  ok('유효한 편집 위치를 선택한다', session.nabi.select(caretAt({ path: [paragraph], offset })));
};
const range = (session: MergeSession, start: number, from: number, end: number, to: number): void => {
  ok(
    '유효한 편집 범위를 선택한다',
    session.nabi.select({ anchor: { path: [start], offset: from }, focus: { path: [end], offset: to } }),
  );
};
const ranges = (session: MergeSession): unknown =>
  session
    .getState()
    .conflicts.map(({ resultStart, resultEnd, status, ambiguous }) => [resultStart, resultEnd, status, ambiguous]);

{
  const session = create(doc('a', 'b'), doc('A', 'b'), doc('a', 'B'));
  eq('독립 변경은 세션을 열 때 자동 머지한다', session.nabi.getJson(), doc('A', 'B'));
  eq('자동 머지가 모두 끝나면 바로 확인할 수 있다', session.getState().canConfirm, true);
  eq('자동 머지는 사용자의 undo 항목이 아니다', session.nabi.undo(), false);
  session.dispose();
}

{
  const session = create();
  const id = session.getState().conflicts[0]!.id;
  const original = session.nabi.getJson();
  const events: MergeState[] = [];
  const stop = session.onChange((state) => events.push(state));
  caret(session, 1, 2);
  const selection = session.nabi.getSelection();
  eq('선택만 바뀐 것은 머지 revision을 올리지 않는다', session.getState().revision, 0);
  ok('내 내용을 그대로 채택해도 해결 동작은 성공한다', session.resolve(id, 'current'));
  eq('내용 불변 해결은 문서 내용을 바꾸지 않는다', session.nabi.getJson(), original);
  eq('내용 불변 해결도 확인을 연다', [session.getState().unresolvedCount, session.getState().canConfirm], [0, true]);
  eq('같은 해결을 반복해 undo 항목을 만들지 않는다', session.resolve(id, 'current'), false);
  eq('해결 이벤트는 한 번 발생한다', events.length, 1);
  ok('내용 불변 해결을 undo한다', session.nabi.undo());
  eq('undo는 미해결 상태를 복원한다', [session.getState().unresolvedCount, session.getState().canConfirm], [1, false]);
  eq('undo는 선택도 복원한다', session.nabi.getSelection(), selection);
  eq('내용 불변 undo 뒤에도 문서는 같다', session.nabi.getJson(), original);
  ok('내용 불변 해결을 redo한다', session.nabi.redo());
  eq('redo는 해결 상태를 복원한다', session.getState().conflicts[0]!.status, 'current');
  eq('상태만 바뀌는 history도 이벤트와 revision을 올린다', [events.length, session.getState().revision], [3, 3]);
  ok(
    '상태와 충돌 목록은 동결된 스냅샷이다',
    Object.isFrozen(events[0]) && Object.isFrozen(events[0]!.conflicts) && Object.isFrozen(events[0]!.conflicts[0]),
  );
  eq('이전 스냅샷은 undo 뒤에도 바뀌지 않는다', events[0]!.unresolvedCount, 0);
  stop();
  session.dispose();
}

{
  const session = create();
  const id = session.getState().conflicts[0]!.id;
  caret(session, 1, 4);
  ok('현재 내용으로 해결한다', session.resolve(id, 'current'));
  ok('해결한 구간에서 평소 입력을 한다', session.nabi.applyCommand('insertText', { text: '!' }));
  eq(
    '해결 뒤 다시 수정해도 해결 상태를 유지한다',
    [session.getState().conflicts[0]!.status, session.getState().canConfirm],
    ['current', true],
  );
  eq('다시 편집한 내용을 보존한다', session.nabi.getJson(), doc('before', 'mine!', 'after'));
  ok('일반 수정만 undo한다', session.nabi.undo());
  eq('일반 수정 undo는 해결 상태를 유지한다', session.getState().unresolvedCount, 0);
  eq('일반 수정 undo의 문서', session.nabi.getJson(), doc('before', 'mine', 'after'));
  ok('그다음 해결 자체를 undo한다', session.nabi.undo());
  eq('해결 자체 undo만 다시 미해결로 만든다', session.getState().unresolvedCount, 1);
  ok('해결을 redo한다', session.nabi.redo());
  ok('일반 수정을 redo한다', session.nabi.redo());
  eq(
    '문서와 해결 상태를 같이 재현한다',
    [session.nabi.getJson(), session.getState().unresolvedCount],
    [doc('before', 'mine!', 'after'), 0],
  );
  session.dispose();
}

{
  const session = create();
  const id = session.getState().conflicts[0]!.id;
  caret(session, 1, 2);
  ok('오른쪽 전체 줄을 채택한다', session.resolve(id, 'incoming'));
  eq('오른쪽 채택은 대상 줄만 바꾼다', session.nabi.getJson(), doc('before', 'theirs', 'after'));
  eq('채택 상태를 기록한다', session.getState().conflicts[0]!.status, 'incoming');
  ok('채택을 undo한다', session.nabi.undo());
  eq(
    '채택 undo는 글과 미해결을 함께 돌린다',
    [session.nabi.getJson(), session.getState().unresolvedCount],
    [doc('before', 'mine', 'after'), 1],
  );
  ok('채택을 redo한다', session.nabi.redo());
  eq(
    '채택 redo는 글과 해결을 함께 돌린다',
    [session.nabi.getJson(), session.getState().unresolvedCount],
    [doc('before', 'theirs', 'after'), 0],
  );
  ok('다른 원본을 선택해 결과를 바꿀 수 있다', session.resolve(id, 'base'));
  eq('왼쪽은 시작 버전으로 복원한다', session.nabi.getJson(), doc('before', 'base', 'after'));
  session.dispose();
}

{
  const session = create();
  const id = session.getState().conflicts[0]!.id;
  caret(session, 0, 2);
  ok('충돌 앞의 문단을 나눈다', session.nabi.applyCommand('splitParagraph'));
  eq('앞 문단 분할만큼 충돌 위치가 이동한다', ranges(session), [[2, 3, 'unresolved', false]]);
  ok('이동한 충돌에서 오른쪽을 채택한다', session.resolve(id, 'incoming'));
  eq('채택은 앞의 편집 결과를 보존한다', session.nabi.getJson(), doc('be', 'fore', 'theirs', 'after'));
  ok('채택 뒤 undo', session.nabi.undo());
  ok('문단 분할 뒤 undo', session.nabi.undo());
  eq('위치도 원래대로 돌아온다', ranges(session), [[1, 2, 'unresolved', false]]);
  session.dispose();
}

{
  const session = create();
  const id = session.getState().conflicts[0]!.id;
  caret(session, 1, 0);
  ok('충돌 시작 바로 앞에 문단을 삽입한다', session.nabi.applyCommand('splitParagraph'));
  caret(session, 1, 0);
  ok('새 문단에 독립적인 내용을 쓴다', session.nabi.applyCommand('insertText', { text: 'new paragraph' }));
  eq('충돌 시작 경계의 독립 삽입은 충돌 범위에 들어가지 않는다', ranges(session), [[2, 3, 'unresolved', false]]);
  ok('삽입 뒤에도 원래 충돌을 채택한다', session.resolve(id, 'incoming'));
  eq(
    '충돌 채택으로 바로 앞에 새로 쓴 문단을 지우지 않는다',
    session.nabi.getJson(),
    doc('before', 'new paragraph', 'theirs', 'after'),
  );
  session.dispose();
}

{
  const session = create();
  const id = session.getState().conflicts[0]!.id;
  caret(session, 2, 0);
  ok('충돌 끝 바로 뒤에 문단을 삽입한다', session.nabi.applyCommand('splitParagraph'));
  caret(session, 2, 0);
  ok('뒤의 새 문단에 내용을 쓴다', session.nabi.applyCommand('insertText', { text: 'after conflict' }));
  eq('충돌 끝 경계의 독립 삽입은 충돌 범위에 들어가지 않는다', ranges(session), [[1, 2, 'unresolved', false]]);
  ok('뒤에 문단을 넣어도 충돌을 채택한다', session.resolve(id, 'incoming'));
  eq(
    '채택으로 뒤의 새 문단을 지우지 않는다',
    session.nabi.getJson(),
    doc('before', 'theirs', 'after conflict', 'after'),
  );
  session.dispose();
}

{
  const session = create();
  const id = session.getState().conflicts[0]!.id;
  caret(session, 1, 2);
  ok('미해결 문단 안을 분할한다', session.nabi.applyCommand('splitParagraph'));
  eq('충돌 내부 분할은 두 조각을 포함한다', ranges(session), [[1, 3, 'unresolved', false]]);
  eq('직접 글을 고쳤다는 이유만으로 해결하지 않는다', session.getState().canConfirm, false);
  ok('충돌 조각 전체에 오른쪽을 채택한다', session.resolve(id, 'incoming'));
  eq('분할한 충돌은 원본 한 문단으로 바뀐다', session.nabi.getJson(), doc('before', 'theirs', 'after'));
  session.dispose();
}

{
  const session = create();
  const id = session.getState().conflicts[0]!.id;
  range(session, 1, 0, 1, 4);
  ok('미해결 내용을 전부 지운다', session.nabi.applyCommand('deleteRange'));
  eq('글자를 지워도 미해결은 남는다', session.getState().unresolvedCount, 1);
  eq('빈 문단은 아직 원래 충돌 범위다', ranges(session), [[1, 2, 'unresolved', false]]);
  ok('빈 결과를 현재 내용으로 해결한다', session.resolve(id, 'current'));
  eq('사용자가 빈 결과를 채택해야 확인이 열린다', session.getState().canConfirm, true);
  session.dispose();
}

{
  const session = create(
    doc('before', 'base', 'middle', 'base2', 'after'),
    doc('before', 'mine', 'middle', 'mine2', 'after'),
    doc('before', 'theirs', 'middle', 'theirs2', 'after'),
  );
  const ids = session.getState().conflicts.map((conflict) => conflict.id);
  range(session, 0, 2, 4, 2);
  ok('여러 충돌을 가로질러 삭제한다', session.nabi.applyCommand('deleteRange'));
  eq(
    '큰 삭제 후에도 충돌 수와 ID를 유지한다',
    [session.getState().unresolvedCount, session.getState().conflicts.map((conflict) => conflict.id)],
    [2, ids],
  );
  ok(
    '대응을 잃은 구간은 명시적으로 모호함을 남긴다',
    session.getState().conflicts.every((conflict) => conflict.ambiguous),
  );
  eq('모호한 범위의 원본 덮어쓰기를 막는다', session.resolve(ids[0]!, 'incoming'), false);
  ok('현재 결과를 첫 충돌의 해결로 명시한다', session.resolve(ids[0]!, 'current'));
  eq('다른 미해결 충돌은 그대로 남는다', session.getState().unresolvedCount, 1);
  ok('나머지 충돌도 현재 결과로 해결한다', session.resolve(ids[1]!, 'current'));
  eq('명시적으로 전부 해결해야 확인이 열린다', session.getState().canConfirm, true);
  ok('두 번째 해결 undo', session.nabi.undo());
  ok('첫 번째 해결 undo', session.nabi.undo());
  ok('큰 삭제 undo', session.nabi.undo());
  eq('큰 삭제 undo는 원래 두 범위와 안전한 대응을 복원한다', ranges(session), [
    [1, 2, 'unresolved', false],
    [3, 4, 'unresolved', false],
  ]);
  session.dispose();
}

{
  const session = create(doc('before', 'base', 'after'), doc('before', 'after'), doc('before', 'theirs', 'after'));
  const id = session.getState().conflicts[0]!.id;
  eq('내 쪽 삭제 충돌은 길이 0인 위치를 유지한다', ranges(session), [[1, 1, 'unresolved', false]]);
  caret(session, 0, 2);
  ok('삭제 충돌 앞에 문단을 나눈다', session.nabi.applyCommand('splitParagraph'));
  eq('길이 0인 위치도 앞의 변경만큼 이동한다', ranges(session), [[2, 2, 'unresolved', false]]);
  ok('삭제 충돌에서 오른쪽을 복구한다', session.resolve(id, 'incoming'));
  eq('길이 0인 충돌 채택은 정확한 위치에 삽입한다', session.nabi.getJson(), doc('be', 'fore', 'theirs', 'after'));
  eq('삽입으로 해결한 충돌은 새로 채택한 범위를 가리킨다', ranges(session), [[2, 3, 'incoming', false]]);
  ok('삽입으로 해결한 뒤 다른 원본으로 다시 선택한다', session.resolve(id, 'base'));
  eq(
    '다른 원본 재선택은 앞선 내용을 교체하고 중복 삽입하지 않는다',
    session.nabi.getJson(),
    doc('be', 'fore', 'base', 'after'),
  );
  ok('다른 원본 선택을 undo한다', session.nabi.undo());
  ok('복구를 undo한다', session.nabi.undo());
  eq('복구 undo는 길이 0과 미해결을 돌린다', ranges(session), [[2, 2, 'unresolved', false]]);
  session.dispose();
}

{
  const session = create(doc('a', 'b'), doc('same', 'same'), doc('X', 'Y'));
  const ids = session.getState().conflicts.map((conflict) => conflict.id);
  range(session, 0, 0, 1, 0);
  ok('내용이 같은 미해결 문단 중 첫 문단을 지운다', session.nabi.applyCommand('deleteRange'));
  eq('반복 문단 삭제 뒤에도 모든 충돌은 남는다', session.getState().unresolvedCount, 2);
  ok(
    '반복 내용의 대응을 확정할 수 없으면 덮어쓰기 전에 모호함을 표시한다',
    session.getState().conflicts.every((conflict) => conflict.ambiguous),
  );
  eq('모호한 첫 충돌을 채택해 남은 둘째 문단을 덮지 않는다', session.resolve(ids[0]!, 'incoming'), false);
  eq('거절된 채택은 남아 있던 다른 충돌 내용을 보존한다', session.nabi.getJson(), doc('same'));
  ok('반복 문단 삭제를 undo한다', session.nabi.undo());
  eq('undo는 두 충돌의 확실한 원래 위치를 복원한다', ranges(session), [
    [0, 1, 'unresolved', false],
    [1, 2, 'unresolved', false],
  ]);
  session.dispose();
}

{
  const session = create(
    doc('before', 'base', 'middle', 'base2', 'after'),
    doc('before', 'mine', 'middle', 'mine2', 'after'),
    doc('before', 'theirs', 'middle', 'theirs2', 'after'),
  );
  const ids = session.getState().conflicts.map((conflict) => conflict.id);
  caret(session, 1, 2);
  ok('첫 충돌 내부에 줄을 나눈다', session.nabi.applyCommand('splitParagraph'));
  eq('첫 충돌은 늘고 나머지는 뒤로 이동한다', ranges(session), [
    [1, 3, 'unresolved', false],
    [4, 5, 'unresolved', false],
  ]);
  ok('두 번째 충돌부터 해결한다', session.resolve(ids[1]!, 'incoming'));
  eq('역순 해결은 첫 충돌을 자동 해결하지 않는다', session.getState().unresolvedCount, 1);
  ok('첫 번째 충돌을 한 문단으로 채택한다', session.resolve(ids[0]!, 'incoming'));
  eq('앞 범위 축소가 이미 해결한 뒤 범위도 이동시킨다', ranges(session), [
    [1, 2, 'incoming', false],
    [3, 4, 'incoming', false],
  ]);
  eq('둘 다 원하는 문단을 채택한다', session.nabi.getJson(), doc('before', 'theirs', 'middle', 'theirs2', 'after'));
  session.dispose();
}

{
  const session = create(doc('same', 'same'), doc('same'), doc('changed', 'same'));
  const id = session.getState().conflicts[0]!.id;
  eq('초기 반복 대응의 큰 충돌 조각은 아직 안전하게 선택할 수 있다', session.getState().conflicts[0]!.ambiguous, false);
  ok('반복 대응으로 넓힌 초기 충돌은 전체 오른쪽을 선택할 수 있다', session.resolve(id, 'incoming'));
  eq('안전하게 넓힌 조각을 통째로 채택한다', session.nabi.getJson(), doc('changed', 'same'));
  session.dispose();
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
  const session = create(
    [p('before'), table('a', 'b'), p('after')],
    [p('before'), table('A', 'b'), p('after')],
    [p('before'), table('a', 'B'), p('after')],
  );
  const id = session.getState().conflicts[0]!.id;
  ok('실제 편집기의 표 안 캐럿을 선택한다', session.nabi.select(caretAt({ path: [1, 0, 0, 0, 0], offset: 1 })));
  ok('충돌 표의 셀도 일반 편집 명령으로 수정한다', session.nabi.applyCommand('insertText', { text: '!' }));
  eq('셀을 고쳐도 표 전체의 미해결 범위를 보존한다', ranges(session), [[1, 2, 'unresolved', false]]);
  ok('직접 고친 표를 현재 내용으로 해결한다', session.resolve(id, 'current'));
  eq('표의 직접 수정 내용을 보존한다', session.nabi.getJson(), [p('before'), table('A!', 'b'), p('after')]);
  ok('표 해결을 undo한다', session.nabi.undo());
  eq(
    '표 해결 undo는 직접 고친 글과 미해결을 함께 유지한다',
    [session.nabi.getJson(), session.getState().unresolvedCount],
    [[p('before'), table('A!', 'b'), p('after')], 1],
  );
  ok('표의 직접 입력을 undo한다', session.nabi.undo());
  eq('셀 편집 undo도 일반 history와 같다', session.nabi.getJson(), [p('before'), table('A', 'b'), p('after')]);
  session.dispose();
}

{
  const br: ElementNode = { w: 'br', ch: [] };
  const session = create([p('a', br, 'b', br, 'c')], [p('A', br, 'b', br, 'C')], [p('X', br, 'b', br, 'Z')]);
  const ids = session.getState().conflicts.map((conflict) => conflict.id);
  caret(session, 0, 2);
  ok('br 문단의 충돌 사이에 줄을 삽입한다', session.nabi.applyCommand('insertLine'));
  eq('같은 문단 안에서도 충돌은 논리적 줄 위치를 추적한다', ranges(session), [
    [0, 1, 'unresolved', false],
    [3, 4, 'unresolved', false],
  ]);
  ok('같은 문단의 첫 충돌 줄을 채택한다', session.resolve(ids[0]!, 'incoming'));
  ok('같은 문단의 끝 충돌 줄을 채택한다', session.resolve(ids[1]!, 'incoming'));
  eq('논리적 줄 채택은 문단과 사용자가 추가한 줄을 유지한다', session.nabi.getJson(), [p('X', br, br, 'b', br, 'Z')]);
  eq('논리적 줄 충돌을 모두 풀어야 확인할 수 있다', session.getState().canConfirm, true);
  session.dispose();
}

{
  const session = create();
  const id = session.getState().conflicts[0]!.id;
  const events: MergeState[] = [];
  session.onChange((state) => events.push(state));
  const first = session.hold();
  const second = session.hold();
  eq('확정 대기 중에는 충돌 채택을 거절한다', session.resolve(id, 'current'), false);
  first();
  first();
  eq('한 hold를 중복 해제해도 다른 hold는 남는다', session.resolve(id, 'current'), false);
  second();
  ok('모든 대기가 끝나면 해결할 수 있다', session.resolve(id, 'current'));
  eq('해결 후 확인할 수 있다', session.getState().canConfirm, true);
  const third = session.hold();
  eq('충돌이 없어도 진행 중 입력의 확정을 기다린다', session.getState().canConfirm, false);
  third();
  eq('입력이 확정되면 확인이 다시 열린다', session.getState().canConfirm, true);
  const unlock = hostOf(session.nabi).lock('test upload');
  eq('편집기 비동기 잠금도 확인을 막는다', session.getState().canConfirm, false);
  eq('편집기 잠금은 원본 채택도 막는다', session.resolve(id, 'base'), false);
  unlock();
  eq('잠금 해제 후 결과는 그대로 확인할 수 있다', session.getState().canConfirm, true);
  const before = events.length;
  session.dispose();
  session.dispose();
  eq('해제한 세션은 확인할 수 없다', session.getState().canConfirm, false);
  eq('해제한 세션은 해결할 수 없다', session.resolve(id, 'base'), false);
  const release = session.hold();
  release();
  caret(session, 1, 0);
  session.nabi.applyCommand('insertText', { text: 'after dispose' });
  eq('해제 뒤의 편집은 세션 콜백을 호출하지 않는다', events.length, before);
}

{
  const errors: unknown[] = [];
  const session = createMergeSession({
    base: doc('a'),
    local: doc('b'),
    incoming: doc('c'),
    wings: defaultWings,
    editorOptions: { onError: (error) => errors.push(error) },
  });
  const id = session.getState().conflicts[0]!.id;
  let observed = 0;
  session.onChange(() => {
    throw new Error('listener failed');
  });
  session.onChange(() => {
    observed += 1;
  });
  ok('리스너 실패는 해결을 되돌리지 않는다', session.resolve(id, 'current'));
  eq('다른 리스너는 계속 호출한다', observed, 1);
  eq('리스너 오류를 호스트에 보고한다', errors.length, 1);
  eq('없는 ID는 현재 상태를 바꾸지 않는다', session.resolve('missing', 'current'), false);
  eq('잘못된 해결 값은 거절한다', session.resolve(id, 'not-a-resolution' as 'current'), false);
  eq('거절은 revision을 올리지 않는다', session.getState().revision, 1);
  session.dispose();
}

{
  let broken = false;
  const failure = new Error('custom repair failed');
  const errors: unknown[] = [];
  const wing = {
    ...simpleMark({ w: 'exReview' }),
    repair(node: ElementNode) {
      if (broken) throw failure;
      return node;
    },
  };
  const marked = (text: string): NabiDoc => [p({ w: 'exReview', ch: [text] })];
  const session = createMergeSession({
    base: marked('base'),
    local: marked('local'),
    incoming: marked('incoming'),
    wings: [wing],
    editorOptions: {
      onError(error) {
        errors.push(error);
        throw new Error('error reporter failed');
      },
    },
  });
  const id = session.getState().conflicts[0]!.id;
  const before = session.getState();
  broken = true;
  eq('원본 채택 중 사용자 날개 repair 예외는 false로 거절한다', session.resolve(id, 'incoming'), false);
  ok('원본 채택 계산 오류를 editorOptions.onError에 전달한다', errors.length === 1 && errors[0] === failure);
  eq('실패한 원본 채택은 현재 문서를 보존한다', session.nabi.getJson(), marked('local'));
  eq('실패한 원본 채택은 충돌과 revision을 보존한다', session.getState(), before);
  eq('실패한 원본 채택은 undo 항목을 만들지 않는다', session.nabi.undo(), false);
  broken = false;
  ok('실패 원인을 고친 뒤 원본 채택을 다시 할 수 있다', session.resolve(id, 'incoming'));
  eq(
    '재시도는 오른쪽 내용과 해결 상태를 반영한다',
    [session.nabi.getJson(), session.getState().unresolvedCount],
    [marked('incoming'), 0],
  );
  ok('성공한 재시도만 undo에 남는다', session.nabi.undo());
  eq(
    '재시도 undo는 원래 내용과 미해결을 복원한다',
    [session.nabi.getJson(), session.getState().unresolvedCount],
    [marked('local'), 1],
  );
  session.dispose();
}

{
  const session = create(doc('a', 'b', 'c'), doc('A', 'B', 'C'), doc('X', 'Y', 'Z'));
  const changes = session.getChanges('incoming');
  eq(
    '연속 충돌도 한 줄씩 비교 행을 노출한다',
    changes.map(({ sourceStart, sourceEnd, resultStart, resultEnd }) => [
      sourceStart,
      sourceEnd,
      resultStart,
      resultEnd,
    ]),
    [
      [0, 1, 0, 1],
      [1, 2, 1, 2],
      [2, 3, 2, 3],
    ],
  );
  ok(
    '변경 행과 관련 충돌 목록을 동결한다',
    Object.isFrozen(changes) &&
      changes.every((change) => Object.isFrozen(change) && Object.isFrozen(change.conflictIds)),
  );
  ok('연속 충돌 중 가운데 줄만 옮긴다', session.applyChange(changes[1]!));
  eq('선택한 한 줄만 바꾼다', session.nabi.getJson(), doc('A', 'Y', 'C'));
  eq(
    '선택한 줄의 충돌만 해결한다',
    session.getState().conflicts.map(({ status }) => status),
    ['unresolved', 'incoming', 'unresolved'],
  );
  eq('지난 revision의 다른 행도 다시 조회해야 한다', session.applyChange(changes[0]!), false);
  eq('반영된 줄의 화살표는 사라진다', session.getChanges('incoming').length, 2);
  ok('한 줄 반영을 한 번에 undo한다', session.nabi.undo());
  eq(
    'undo는 줄과 충돌 상태를 함께 되돌린다',
    [session.nabi.getJson(), session.getState().unresolvedCount],
    [doc('A', 'B', 'C'), 3],
  );
  ok('한 줄 반영을 redo한다', session.nabi.redo());
  eq('redo는 반영된 줄만 다시 살린다', session.nabi.getJson(), doc('A', 'Y', 'C'));
  session.dispose();
}

{
  const session = create(doc('a', 'b', 'c'), doc('A', 'b', 'c'), doc('a', 'b', 'C'));
  eq('충돌 없는 자동 병합에서도 시작 버전과의 모든 차이를 노출한다', session.getChanges('base').length, 2);
  eq('충돌 없는 현재 수정도 오른쪽에서 한 줄씩 되돌릴 수 있다', session.getChanges('incoming').length, 1);
  ok('자동 병합된 마지막 줄을 시작 버전으로 되돌린다', session.applyChange(session.getChanges('base')[1]!));
  eq('다른 쪽의 독립 수정은 보존한다', session.nabi.getJson(), doc('A', 'b', 'c'));
  eq('충돌 없는 수정은 확정을 막지 않는다', session.getState().canConfirm, true);
  session.dispose();
}

{
  const session = create(
    doc('start', 'end'),
    doc('start', 'mine1', 'mine2', 'end'),
    doc('start', 'theirs1', 'theirs2', 'theirs3', 'end'),
  );
  eq('서로 다른 여러 줄 삽입은 하나의 충돌이다', session.getState().unresolvedCount, 1);
  eq(
    '길이가 다른 삽입 충돌도 줄별 수정과 삽입을 나눈다',
    session.getChanges('incoming').map(({ kind }) => kind),
    ['replace', 'replace', 'insert'],
  );
  ok('충돌 끝의 추가 줄을 먼저 옮긴다', session.applyChange(session.getChanges('incoming')[2]!));
  eq('일부 삽입은 미해결과 늘어난 범위를 유지한다', ranges(session), [[1, 4, 'unresolved', false]]);
  eq('추가 줄만 결과에 들어간다', session.nabi.getJson(), doc('start', 'mine1', 'mine2', 'theirs3', 'end'));
  ok('둘째 줄도 따로 옮긴다', session.applyChange(session.getChanges('incoming')[1]!));
  eq('아직 남은 첫 줄 때문에 해결하지 않는다', session.getState().unresolvedCount, 1);
  ok('마지막 남은 첫 줄을 옮긴다', session.applyChange(session.getChanges('incoming')[0]!));
  eq('충돌의 모든 줄을 옮기면 해결한다', ranges(session), [[1, 4, 'incoming', false]]);
  eq('한 줄씩 옮긴 최종 문서', session.nabi.getJson(), doc('start', 'theirs1', 'theirs2', 'theirs3', 'end'));
  ok('마지막 줄 반영만 undo한다', session.nabi.undo());
  eq('undo는 먼저 옮긴 줄을 남긴다', session.nabi.getJson(), doc('start', 'mine1', 'theirs2', 'theirs3', 'end'));
  eq('마지막 반영 undo는 충돌을 다시 연다', session.getState().unresolvedCount, 1);
  session.dispose();
}

{
  const session = create(
    doc('start', 'end'),
    doc('start', 'mine1', 'mine2', 'end'),
    doc('start', 'theirs1', 'theirs2', 'end'),
  );
  eq(
    '시작 버전에 없는 삽입은 한 줄씩 삭제 행이 된다',
    session.getChanges('base').map(({ kind }) => kind),
    ['delete', 'delete'],
  );
  ok('삽입된 첫 줄만 없앤다', session.applyChange(session.getChanges('base')[0]!));
  eq(
    '남은 삽입 줄은 미해결이다',
    [session.nabi.getJson(), ranges(session)],
    [doc('start', 'mine2', 'end'), [[1, 2, 'unresolved', false]]],
  );
  ok('남은 삽입 줄을 없앤다', session.applyChange(session.getChanges('base')[0]!));
  eq(
    '모든 삽입을 취소하면 시작 버전으로 해결된다',
    [session.nabi.getJson(), ranges(session)],
    [doc('start', 'end'), [[1, 1, 'base', false]]],
  );
  session.dispose();
}

{
  const br: ElementNode = { w: 'br', ch: [] };
  const session = create([p('a', br, 'b', br, 'c')], [p('A', br, 'B', br, 'C')], [p('X', br, 'Y', br, 'Z')]);
  eq('명시적 줄바꿈도 줄별 비교 행을 만든다', session.getChanges('incoming').length, 3);
  ok('문단 안의 가운데 줄만 옮긴다', session.applyChange(session.getChanges('incoming')[1]!));
  eq('줄 반영이 문단을 나누거나 이웃 줄을 바꾸지 않는다', session.nabi.getJson(), [p('A', br, 'Y', br, 'C')]);
  session.dispose();

  const heading: NabiDoc = [{ w: 'p', a: { h: 1 }, ch: ['a', br, 'b'] }];
  const styled = create([p('a', br, 'b')], [p('a', br, 'B')], heading);
  eq(
    '문단 속성 충돌은 줄 속성을 잃지 않게 묶는다',
    styled
      .getChanges('incoming')
      .map(({ sourceStart, sourceEnd, resultStart, resultEnd }) => [sourceStart, sourceEnd, resultStart, resultEnd]),
    [[0, 2, 0, 2]],
  );
  ok('문단 속성 변경을 온전히 옮긴다', styled.applyChange(styled.getChanges('incoming')[0]!));
  eq('제목 속성과 전체 줄을 함께 보존한다', styled.nabi.getJson(), heading);
  eq('전체 속성 충돌 반영으로 해결한다', styled.getState().unresolvedCount, 0);
  styled.dispose();
}

{
  const repeated = create(doc('same', 'same'), doc('same'), doc('changed', 'same'));
  eq(
    '반복 줄의 모호한 초기 대응은 전체 보호 구간으로 표시한다',
    repeated
      .getChanges('incoming')
      .map(({ sourceStart, sourceEnd, resultStart, resultEnd }) => [sourceStart, sourceEnd, resultStart, resultEnd]),
    [[0, 2, 0, 1]],
  );
  ok('반복 줄의 전체 보호 구간은 안전하게 옮긴다', repeated.applyChange(repeated.getChanges('incoming')[0]!));
  eq('반복 줄은 중복 삽입하지 않는다', repeated.nabi.getJson(), doc('changed', 'same'));
  eq('보호 구간 전체 반영은 해결한다', repeated.getState().unresolvedCount, 0);
  repeated.dispose();

  const moved = create(doc('a', 'b', 'c'), doc('b', 'c', 'a'), doc('A', 'b', 'c'));
  eq('이동 충돌을 줄마다 잘못 복제하지 않도록 묶는다', moved.getChanges('incoming').length, 1);
  ok('전체 이동 구간을 반영한다', moved.applyChange(moved.getChanges('incoming')[0]!));
  eq('이동 전후의 중복을 남기지 않는다', moved.nabi.getJson(), doc('A', 'b', 'c'));
  moved.dispose();
}

{
  const session = create();
  const change = session.getChanges('incoming')[0]!;
  const before = session.nabi.getJson();
  eq('변조한 범위는 거절한다', session.applyChange({ ...change, resultStart: 0 }), false);
  eq('변조한 소스 범위는 거절한다', session.applyChange({ ...change, sourceEnd: 0 }), false);
  eq('변조한 충돌 ID는 거절한다', session.applyChange({ ...change, conflictIds: [] }), false);
  eq('없는 변경 ID는 거절한다', session.applyChange({ ...change, id: 'missing' }), false);
  eq('잘못된 변경 입력은 거절한다', session.applyChange(null as unknown as MergeChange), false);
  let accessed = false;
  eq(
    '변경 입력의 접근자를 실행하지 않는다',
    session.applyChange({
      ...change,
      get revision() {
        accessed = true;
        return change.revision;
      },
    }),
    false,
  );
  eq('접근자는 호출되지 않았다', accessed, false);
  eq('거절은 문서와 revision을 보존한다', [session.nabi.getJson(), session.getState().revision], [before, 0]);
  const release = session.hold();
  eq('hold는 줄 반영 가능 상태도 닫는다', session.getState().canApply, false);
  eq('hold 중에는 줄 반영을 막는다', session.applyChange(change), false);
  release();
  eq('hold 해제는 줄 반영을 다시 연다', session.getState().canApply, true);
  const unlock = hostOf(session.nabi).lock('test upload');
  eq('편집 잠금 중에는 줄 반영을 막는다', session.applyChange(change), false);
  unlock();
  ok('현재 스냅샷의 복사도 검증 후 적용한다', session.applyChange({ ...change }));
  eq('같은 스냅샷을 두 번 반영하지 않는다', session.applyChange(change), false);
  session.dispose();
  eq('해제한 세션의 줄은 반영하지 않는다', session.applyChange(change), false);
  eq('해제한 세션은 비교 행을 노출하지 않는다', session.getChanges('incoming'), []);
}

{
  const session = create(
    doc('before', 'base', 'middle', 'base2', 'after'),
    doc('before', 'mine', 'middle', 'mine2', 'after'),
    doc('before', 'theirs', 'middle', 'theirs2', 'after'),
  );
  range(session, 0, 2, 4, 2);
  ok('여러 충돌을 지나가며 직접 삭제한다', session.nabi.applyCommand('deleteRange'));
  const change = session.getChanges('incoming').find((candidate) => candidate.conflictIds.length > 0)!;
  eq('대응을 잃은 충돌의 줄은 모호함을 노출한다', change.ambiguous, true);
  eq('모호한 충돌을 줄 반영으로 우회하지 않는다', session.applyChange(change), false);
  session.dispose();
}

{
  const session = create(doc('b'), doc('a', 'b', 'c'), doc('c', 'b', 'a'));
  eq(
    '서로 다른 충돌의 같은 글을 이동으로 오인하지 않는다',
    session
      .getChanges('incoming')
      .map(({ sourceStart, sourceEnd, resultStart, resultEnd }) => [sourceStart, sourceEnd, resultStart, resultEnd]),
    [
      [0, 1, 0, 1],
      [2, 3, 2, 3],
    ],
  );
  ok('뒤쪽 충돌부터 한 줄 반영한다', session.applyChange(session.getChanges('incoming')[1]!));
  ok('앞쪽 충돌을 한 줄 반영한다', session.applyChange(session.getChanges('incoming')[0]!));
  eq(
    '같은 글이 교차해도 선택한 충돌만 해결한다',
    [session.nabi.getJson(), session.getState().unresolvedCount],
    [doc('c', 'b', 'a'), 0],
  );
  session.dispose();
}

{
  const session = create(doc('start', 'a', 'b', 'end'), doc('start', 'end'), doc('start', 'X', 'Y', 'end'));
  const ids = session.getState().conflicts.map(({ id }) => id);
  eq(
    '같은 삭제 위치에서도 소스 줄로 충돌을 구분한다',
    session.getChanges('incoming').map(({ conflictIds }) => conflictIds),
    [[ids[0]], [ids[1]]],
  );
  ok('삭제된 둘째 줄을 먼저 복구한다', session.applyChange(session.getChanges('incoming')[1]!));
  eq('먼저 올 첫 줄의 빈 충돌 위치는 뒤로 밀지 않는다', ranges(session), [
    [1, 1, 'unresolved', false],
    [1, 2, 'incoming', false],
  ]);
  ok('삭제된 첫 줄을 앞에 복구한다', session.applyChange(session.getChanges('incoming')[0]!));
  eq(
    '역순 복구해도 원본 줄 순서를 지킨다',
    [session.nabi.getJson(), ranges(session)],
    [
      doc('start', 'X', 'Y', 'end'),
      [
        [1, 2, 'incoming', false],
        [2, 3, 'incoming', false],
      ],
    ],
  );
  session.dispose();
}

{
  const br: ElementNode = { w: 'br', ch: [] };
  for (const marked of [false, true]) {
    const line = (text: string, ...rest: NabiNode[]): ElementNode =>
      marked ? p({ w: 'b', ch: [text, ...rest] }) : p(text, ...rest);
    const base = [line('a'), p('after')];
    const incoming = [line('a', br, 'b'), p('after')];
    const session = create(base, base, incoming);
    const deletion = session.getChanges('base').find(({ kind }) => kind === 'delete')!;
    ok('br로 이어진 마지막 줄을 독립적으로 삭제한다', session.applyChange(deletion));
    eq('마지막 줄 삭제는 앞의 br도 없애고 다음 문단은 보존한다', session.nabi.getJson(), base);
    eq('삭제한 끝 줄을 빈 줄 화살표로 다시 만들지 않는다', session.getChanges('base'), []);
    ok('마지막 줄 삭제를 undo한다', session.nabi.undo());
    eq('undo는 중첩 서식과 줄바꿈을 복원한다', session.nabi.getJson(), incoming);
    session.dispose();
  }
}

done('merge-session');
