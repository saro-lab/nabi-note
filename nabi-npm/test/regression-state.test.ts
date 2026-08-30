// 0.9 상태 회귀망 - API 경계의 값 객체, keyed 순서, 비동기 입력의 revision을 따로 고정한다.
import { JSDOM } from 'jsdom';
import type { Selection } from '../src/caret/index.js';
import type { IoFilter, PasteData } from '../src/io/index.js';
import { boxObject, createNabiWith, type Wing } from '../src/wing/index.js';
import { defaultWings } from '../src/wings/index.js';
import {
  insertFragmentOp,
  makePasteFlow,
  makeSurfaceActions,
  mountSurface,
  tryInputRule,
} from '../src/surface/index.js';
import { done, eq, ok } from './net.js';
import { hostOf } from '../src/editor/index.js';

function deferred<T>(): { promise: Promise<T>; resolve: (value: T) => void } {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}

{
  const longText = '가나다라마바사아자차카타파하'.repeat(16000);
  const said: string[] = [];
  const { nabi } = createNabiWith([], {
    doc: [{ w: 'p', ch: [longText] }],
    toast: (_level, message) => said.push(message),
  });
  const paragraph = nabi.getJson()[0] as { w?: unknown; ch?: unknown } | undefined;
  ok(
    'Q18 hidden cap - 대표적인 긴 문자열도 생성과 getJson 왕복에서 그대로 보존한다',
    paragraph?.w === 'p' &&
      Array.isArray(paragraph.ch) &&
      paragraph.ch.length === 1 &&
      paragraph.ch[0] === longText &&
      said.length === 0,
  );
}

{
  const { nabi } = createNabiWith([], { doc: [{ w: 'p', ch: ['ab'] }] });
  const offered: Selection = {
    anchor: { path: [0], offset: 0 },
    focus: { path: [0], offset: 1 },
  };
  ok('selection snapshot - 범위 선택을 받는다', nabi.select(offered));
  try {
    (offered.focus as { offset: number }).offset = 0;
  } catch {
    // 동결된 값이면 외부 쓰기가 거절되는 것이 계약이다.
  }
  eq(
    'selection snapshot - select에 넘긴 객체의 뒤늦은 변이가 내부 상태를 못 바꾼다',
    nabi.getSelection().focus.offset,
    1,
  );
  const snapshot = nabi.getSelection();
  ok(
    'selection snapshot - 공개 selection과 position/path는 모두 동결된다',
    Object.isFrozen(snapshot) &&
      Object.isFrozen(snapshot.anchor) &&
      Object.isFrozen(snapshot.anchor.path) &&
      Object.isFrozen(snapshot.focus) &&
      Object.isFrozen(snapshot.focus.path),
  );
}

{
  const { nabi } = createNabiWith([], { doc: [{ w: 'p', ch: ['ab'] }] });
  nabi.select({
    anchor: { path: [0], offset: 0 },
    focus: { path: [0], offset: 1 },
  });
  const exposed = nabi.getSelection();
  try {
    (exposed.anchor as { offset: number }).offset = 1;
  } catch {
    // 동결된 snapshot이면 이 쓰기가 거절된다.
  }
  eq('selection snapshot - getSelection 반환값의 변이가 내부 상태를 못 바꾼다', nabi.getSelection().anchor.offset, 0);
}

{
  const dom = new JSDOM('<div id="editor"></div>');
  const root = dom.window.document.getElementById('editor') as HTMLElement;
  const { nabi, registry } = createNabiWith([], {
    doc: [
      { w: 'p', ch: ['첫째'] },
      { w: 'p', ch: ['둘째'] },
    ],
  });
  const surface = mountSurface({ nabi, registry, root });
  hostOf(nabi).applyRaw((doc, selection) => ({ doc: [doc[1]!, doc[0]!], selection }), 'reorderTop');
  eq('top-level reorder - 참조가 같은 문단의 순서만 바뀌어도 DOM을 새 순서로 옮긴다', root.textContent, '둘째첫째');
  surface.unmount();
  dom.window.close();
}

{
  const choice = deferred<number>();
  const said: string[] = [];
  const { nabi } = createNabiWith([], {
    doc: [{ w: 'p', ch: ['AB'] }],
    ask: { choose: () => choice.promise },
    toast: (_level, message) => said.push(message),
  });
  const custom: IoFilter = {
    id: 'custom',
    label: 'Custom',
    paste: () => ({ id: 'custom', label: 'Custom', build: () => [{ w: 'p', ch: ['붙임'] }] }),
  };
  const flow = makePasteFlow({ nabi, filters: [custom], locale: () => 'ko' });
  nabi.select({
    anchor: { path: [0], offset: 1 },
    focus: { path: [0], offset: 1 },
  });
  const data: PasteData = { custom: '', html: '', plain: 'X', files: [], types: ['text/plain'] };
  flow(data, []);
  nabi.applyCommand('insertText', { text: 'Y' });
  choice.resolve(0);
  await new Promise((resolve) => setTimeout(resolve, 0));
  eq('async paste - 판을 기다리는 동안 revision이 바뀌면 오래된 붙여넣기를 취소한다', nabi.getJson(), [
    { w: 'p', ch: ['AYB'] },
  ]);
  eq('async paste - revision 취소는 사용자에게 한 번 알린다', said, ['문서가 바뀌어 붙여넣기를 취소했습니다.']);
}

{
  const errors: unknown[] = [];
  let listenerReached = 0;
  let commandRuns = 0;
  const broken = boxObject({ w: 'exBroken' });
  const wing: Wing = {
    ...broken,
    repair: () => {
      throw new Error('repair exploded');
    },
    commands: {
      mutateThenThrow(doc, selection, args, env) {
        commandRuns += 1;
        try {
          (doc as unknown[]).push('poison');
        } catch {
          /* frozen callback tree */
        }
        try {
          (selection.focus.path as number[]).push(9);
        } catch {
          /* frozen selection */
        }
        try {
          (args['nested'] as { value: number }).value = 9;
        } catch {
          /* frozen args */
        }
        try {
          (env.lumps as Set<string>).add('poison');
        } catch {
          /* read-only facade */
        }
        throw new Error('command exploded');
      },
      returnBadSelection(doc, selection) {
        commandRuns += 1;
        return {
          doc,
          selection: { anchor: selection.anchor, focus: { path: [99], offset: 0 } },
        };
      },
      returnBrokenNode(doc, selection) {
        commandRuns += 1;
        return { doc: [...doc, { w: 'exBroken', ch: [] }], selection };
      },
      countCommand(doc, selection) {
        commandRuns += 1;
        return { doc, selection };
      },
    },
  };
  const { nabi } = createNabiWith([wing], {
    doc: [{ w: 'p', ch: ['ab'] }],
    onError: (error) => {
      errors.push(error);
      throw new Error('reporter exploded');
    },
  });
  nabi.select({ anchor: { path: [0], offset: 2 }, focus: { path: [0], offset: 2 } });
  const offered = { nested: { value: 1 } };
  ok(
    'command rollback - callback이 내부 clone을 변이하고 던져도 false다',
    !nabi.applyCommand('mutateThenThrow', offered),
  );
  eq(
    'command rollback - doc와 외부 args는 원상 유지된다',
    [nabi.getJson(), offered],
    [[{ w: 'p', ch: ['ab'] }], { nested: { value: 1 } }],
  );
  eq('command rollback - selection도 원상 유지된다', nabi.getSelection().focus, { path: [0], offset: 2 });
  ok(
    'command rollback - 잘못된 selection 결과도 같은 doc 참조와 무관하게 거절한다',
    !nabi.applyCommand('returnBadSelection'),
  );
  ok('command rollback - repair 예외를 false로 바꾼다', !nabi.applyCommand('returnBrokenNode'));
  eq('command rollback - 실패 셋 뒤에도 doc는 그대로다', nabi.getJson(), [{ w: 'p', ch: ['ab'] }]);
  ok('command rollback - 실패가 history를 만들지 않는다', !nabi.undo());

  let getterCalls = 0;
  const accessor = Object.defineProperty({}, 'value', {
    enumerable: true,
    get() {
      getterCalls += 1;
      return 1;
    },
  });
  const cycle: Record<string, unknown> = {};
  cycle['self'] = cycle;
  const inherited = Object.create({ value: 1 }) as Record<string, unknown>;
  const beforeRejected = commandRuns;
  ok('command args - accessor를 실행하지 않고 preflight에서 거절한다', !nabi.applyCommand('countCommand', accessor));
  ok('command args - cycle을 실행 전에 거절한다', !nabi.applyCommand('countCommand', cycle));
  ok('command args - custom prototype을 실행 전에 거절한다', !nabi.applyCommand('countCommand', inherited));
  ok(
    'command args - 불신 args에서 getter와 command는 한 번도 실행되지 않는다',
    getterCalls === 0 && commandRuns === beforeRejected,
  );

  nabi.onChange(() => {
    throw new Error('first listener exploded');
  });
  nabi.onChange(() => {
    listenerReached += 1;
  });
  ok(
    'listener isolation - 앞 listener와 onError가 던져도 command는 성공한다',
    nabi.applyCommand('insertText', { text: 'c' }),
  );
  ok('listener isolation - 뒤 listener도 독립적으로 호출된다', listenerReached === 1);
  ok('onError - command/repair/result/listener 실패가 좁은 경계로 보고된다', errors.length >= 7);
}

{
  const realNow = Date.now;
  let now = 10_000;
  Date.now = () => now;
  try {
    const merged = createNabiWith([], { typingMergeMs: 1_000 }).nabi;
    merged.applyCommand('insertText', { text: 'a' });
    now += 1_000;
    merged.applyCommand('insertText', { text: 'b' });
    now += 1_001;
    merged.applyCommand('insertText', { text: 'c' });
    merged.undo();
    eq('typing merge window - 경계 안 입력만 한 undo 단위다', merged.getJson(), [{ w: 'p', ch: ['ab'] }]);
    merged.undo();
    eq('typing merge window - 합쳐진 앞 입력도 한 번에 걷힌다', merged.getJson(), [{ w: 'p', ch: [] }]);

    const separate = createNabiWith([], { undoLimit: 2, typingMergeMs: 0 }).nabi;
    separate.applyCommand('insertText', { text: 'a' });
    separate.applyCommand('insertText', { text: 'b' });
    separate.applyCommand('insertText', { text: 'c' });
    separate.undo();
    separate.undo();
    eq('undo options - 0 merge와 상한 2는 마지막 두 snapshot만 남긴다', separate.getJson(), [{ w: 'p', ch: ['a'] }]);
    ok('undo options - 상한 밖 snapshot은 더 되돌릴 수 없다', !separate.undo());
  } finally {
    Date.now = realNow;
  }

  for (const value of [0, -1, 1.5, Number.POSITIVE_INFINITY]) {
    let rejected = false;
    try {
      createNabiWith([], { undoLimit: value });
    } catch {
      rejected = true;
    }
    ok(`undo options - undoLimit ${String(value)} 거절`, rejected);
  }
  for (const value of [-1, Number.POSITIVE_INFINITY, Number.NaN]) {
    let rejected = false;
    try {
      createNabiWith([], { typingMergeMs: value });
    } catch {
      rejected = true;
    }
    ok(`undo options - typingMergeMs ${String(value)} 거절`, rejected);
  }
}

{
  const family = '👨‍👩‍👧‍👦';
  const flag = '🇰🇷';
  const text = `A${family}e\u0301${flag}B`;
  const { nabi } = createNabiWith([], { doc: [{ w: 'p', ch: [text] }] });
  nabi.select({ anchor: { path: [0], offset: 3 }, focus: { path: [0], offset: 3 } });
  eq('grapheme selection - emoji ZWJ 내부 offset을 경계로 보정한다', nabi.getSelection().focus.offset, 1);
  nabi.select({ anchor: { path: [0], offset: 3 }, focus: { path: [0], offset: family.length } });
  eq('grapheme selection - 범위는 문자소 전체로 넓힌다', nabi.getSelection(), {
    anchor: { path: [0], offset: 1 },
    focus: { path: [0], offset: 1 + family.length },
  });
  nabi.select({
    anchor: { path: [0], offset: 1 + family.length },
    focus: { path: [0], offset: 1 + family.length },
  });
  nabi.applyCommand('deleteBackward');
  eq('grapheme delete - Backspace가 ZWJ emoji 전체를 지운다', nabi.getJson(), [{ w: 'p', ch: [`Ae\u0301${flag}B`] }]);
  nabi.select({ anchor: { path: [0], offset: 1 }, focus: { path: [0], offset: 1 } });
  nabi.applyCommand('deleteForward');
  eq('grapheme delete - Delete가 combining sequence 전체를 지운다', nabi.getJson(), [{ w: 'p', ch: [`A${flag}B`] }]);
  nabi.applyCommand('deleteForward');
  eq('grapheme delete - Delete가 regional indicator 쌍 전체를 지운다', nabi.getJson(), [{ w: 'p', ch: ['AB'] }]);
}

{
  const patterns = [/^x$/g, /^y$/y];
  const wing: Wing = {
    w: 'exRuleProbe',
    place: 'tool',
    inputRules: patterns.map((pattern) => ({
      trigger: 'enter' as const,
      pattern,
      run: () => ({ name: 'insertText', args: { text: 'Z' } }),
    })),
  };
  const { nabi, registry } = createNabiWith([wing], { doc: [{ w: 'p', ch: ['x'] }] });
  for (const value of ['x', 'x', 'y', 'y']) {
    nabi.setJson([{ w: 'p', ch: [value] }]);
    nabi.select({ anchor: { path: [0], offset: 1 }, focus: { path: [0], offset: 1 } });
    ok(`input rule ${value} - 상태형 regexp를 반복 실행해도 매번 맞는다`, tryInputRule(nabi, registry, 'enter'));
    eq('input rule - 변환 결과', nabi.getJson(), [{ w: 'p', ch: ['Z'] }]);
  }
  ok(
    'input rule - /g와 /y lastIndex를 밖으로 누출하지 않는다',
    patterns.every((pattern) => pattern.lastIndex === 0),
  );
}

{
  const { nabi, registry } = createNabiWith(defaultWings, {
    doc: [{ w: 'p', ch: [{ w: 'quote', ch: [{ w: 'p', ch: ['x'] }] }] }],
  });
  let now = 20_000;
  const actions = makeSurfaceActions({ nabi, registry, now: () => now });
  nabi.select({ anchor: { path: [0, 0, 0], offset: 1 }, focus: { path: [0, 0, 0], offset: 1 } });
  actions.enter();
  actions.arrow('left');
  now += 100;
  actions.enter();
  ok(
    'double Enter - 사이의 다른 편집 동작이 빠른 Enter 상태를 끊는다',
    ((nabi.getJson()[0] as { ch?: unknown[] } | undefined)?.ch?.[0] as { w?: unknown } | undefined)?.w === 'quote' &&
      nabi.getJson().length === 1,
  );
}

{
  const { nabi } = createNabiWith([]);
  hostOf(nabi).applyRaw(
    insertFragmentOp([
      { w: 'p', ch: ['A'] },
      { w: 'p', ch: ['BC'] },
    ]),
    'pasteFragment',
  );
  eq('multi-block paste - 문서 끝에서는 마지막 붙인 holder 끝에 caret을 둔다', nabi.getSelection().focus, {
    path: [1],
    offset: 2,
  });
}

{
  const errors: unknown[] = [];
  const { nabi } = createNabiWith([], {
    ask: {
      confirm: () => Promise.reject(new Error('confirm rejected')),
      choose: () => Promise.reject(new Error('choose rejected')),
    },
    onError: (error) => errors.push(error),
  });
  eq(
    'callback isolation - async confirm 예외는 보고 후 안전한 false로 닫힌다',
    await hostOf(nabi).ask.confirm('confirm'),
    false,
  );
  eq(
    'callback isolation - async choose 예외는 보고 후 취소로 닫힌다',
    await hostOf(nabi).ask.choose?.('choose', []),
    -1,
  );
  ok('callback isolation - async callback 실패도 각각 onError로 보고된다', errors.length === 2);
}

done('regression-state');
