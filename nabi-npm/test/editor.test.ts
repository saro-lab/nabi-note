// editor 그물 — 커맨드의 유일한 문(매 커맨드 cocoon)·undo 표(뭉침·group·redo)· 침묵
// 단일 신호(바뀐 문단 목록)·$ 와 사용자 API 의 `_` 벗김 차이·예약 상태 배선·isChanged.
import { makeEnv, runsOf, type ElementNode, type NabiDoc, type NabiNode } from '../src/schema/index.js';
import { insertText as docInsertText, type EditEnv, type Position } from '../src/doc/index.js';
import { caretAt, type Selection } from '../src/caret/index.js';
import { createNabi, type Nabi, type NabiChange } from '../src/editor/index.js';
import { translate } from '../src/locale/index.js';
import { tinyHtml } from './tiny-html.js';
import { done, eq, ok } from './net.js';

const ENV: EditEnv = {
...makeEnv({
    voids: ['hr', 'img', 'youtube'],
    lumps: ['hr', 'img', 'youtube', 'table', 'ul', 'ol', 'tl', 'quote', 'details', 'code'],
    blockHolders: ['table', 'tr', 'td', 'ul', 'li', 'ol', 'oli', 'tl', 'tli', 'quote', 'details'],
    inlineHolders: ['summary', 'code'],
    boolAttrs: ['dc', 'o', 'ck'],
  }),
  singleParagraph: new Set(['td']),
};

const p = (ch: readonly NabiNode[], a?: Record<string, string | number>): ElementNode =>
  a ? { w: 'p', a, ch } : { w: 'p', ch };
const b = (ch: readonly NabiNode[]): ElementNode => ({ w: 'b', ch });
const at = (path: readonly number[], offset: number): Position => ({ path, offset });
const sel = (a: Position, f: Position): Selection => ({ anchor: a, focus: f });

// 신호를 받아 적는 도우미 — 그물마다 새로 단다.
function watch(nabi: Nabi): NabiChange[] {
  const seen: NabiChange[] = [];
  nabi.onChange((c) => seen.push(c));
  return seen;
}

// --- 생성·기본 --------------------------------------------------------------------------------
{
  const nabi = createNabi({ env: ENV });
  eq('빈 문서 — 빈 문단 하나', nabi.getJson(), [{ w: 'p', ch: [] }]);
  ok('sessionId 모양 — 시각-난수', /^\d+-[0-9a-z]+$/.test(nabi.sessionId), nabi.sessionId);
  eq('초기 캐럿 — 문서 처음', nabi.getSelection(), caretAt(at([0], 0)));
  ok('초기 isChanged — 아니다', !nabi.isChanged());
  ok('getJson 에 _id 없음', !JSON.stringify(nabi.getJson()).includes('_id'));
  ok('$doc 에는 _id 있음', nabi.$doc().every((node) => typeof node._id === 'string'));
}

// --- insertText 와 신호 -----------------------------------------------------------------------
{
  const nabi = createNabi({ env: ENV });
  const seen = watch(nabi);
  ok('삽입 — true', nabi.applyCommand('insertText', { text: 'ab' }));
  eq('삽입 — 문서', nabi.getJson(), [{ w: 'p', ch: ['ab'] }]);
  eq('삽입 — 캐럿', nabi.getSelection(), caretAt(at([0], 2)));
  eq('삽입 — 신호 한 번', seen.length, 1);
  const first = seen[0] as NabiChange;
  ok('신호 — doc·selection 참', first.doc && first.selection);
  eq('신호 — 바뀐 문단 목록', first.paragraphs, [nabi.$doc()[0]?._id]);
  eq('신호 — removed 없음', first.removed, []);

  ok('빈 글자 삽입 — 거절', !nabi.applyCommand('insertText', { text: '' }));
  ok('없는 커맨드 — 거절', !nabi.applyCommand('없는것'));
  eq('거절은 신호 없음', seen.length, 1);
}

{
  // 범위 선택 위의 타이핑 = 교체.
  const nabi = createNabi({ env: ENV, doc: [p(['abcd'])] });
  nabi.select(sel(at([0], 1), at([0], 3)));
  nabi.applyCommand('insertText', { text: 'X' });
  eq('범위 교체', nabi.getJson(), [{ w: 'p', ch: ['aXd'] }]);
  eq('범위 교체 — 캐럿', nabi.getSelection(), caretAt(at([0], 2)));
}

// -- 침묵 — 트리가 안 바뀐 커맨드는 흔적이 없다 -------------------------------------------
{
  const nabi = createNabi({ env: ENV });
  const seen = watch(nabi);
  ok('문서 처음의 백스페이스 — false', !nabi.applyCommand('deleteBackward'));
  eq('무변화 — 신호 없음', seen.length, 0);
  ok('무변화 — undo 지점 없음', !nabi.undo());
}

// --- 마크 경계 정규화의 배선 ------------------------------------------------------------------
{
  // 마크 끝 경계의 타이핑은 마크 안 (끝점 내부 유지).
  const nabi = createNabi({ env: ENV, doc: [p(['a', b(['cd'])])] });
  nabi.select(caretAt(at([0], 3)));
  nabi.applyCommand('insertText', { text: 'X' });
  eq('경계 — 마크 끝은 안', nabi.getJson(), [{ w: 'p', ch: ['a', { w: 'b', ch: ['cdX'] }] }]);
}
{
  // 문단 처음의 타이핑은 무마크 (시작점 외부 배치).
  const nabi = createNabi({ env: ENV, doc: [p([b(['cd'])])] });
  nabi.select(caretAt(at([0], 0)));
  nabi.applyCommand('insertText', { text: 'X' });
  eq('경계 — 문단 처음은 밖', nabi.getJson(), [{ w: 'p', ch: ['X', { w: 'b', ch: ['cd'] }] }]);
}

// --- 예약 상태 --------------------------------------------------------------------
{
  const nabi = createNabi({ env: ENV, doc: [p(['ab'])] });
  nabi.select(caretAt(at([0], 2)));
  const seen = watch(nabi);

  ok('접힌 캐럿 toggleMark — 예약', nabi.applyCommand('toggleMark', { mark: { w: 'b', ch: [] } }));
  ok('예약 상태 — isArmed', nabi.$armed.isArmed('b'));
  eq('예약 신호 — armed 만', seen.length, 1);
  ok('예약 신호 — doc 아님', !(seen[0] as NabiChange).doc && (seen[0] as NabiChange).armed);

  nabi.applyCommand('insertText', { text: 'X' });
  eq('예약 소비 — 마크 입힘', nabi.getJson(), [{ w: 'p', ch: ['ab', { w: 'b', ch: ['X'] }] }]);
  ok('예약 소비 — 비었음', nabi.$armed.isEmpty());
  const insertSignal = seen[1] as NabiChange;
  ok('예약 소비 신호 — doc 과 armed 한 번에', insertSignal.doc && insertSignal.armed);
  eq('예약 소비 — 신호 두 번뿐', seen.length, 2);
}
{
  // 같은 마크 재예약 = 해제. 몸짓(select)도 해제.
  const nabi = createNabi({ env: ENV, doc: [p(['ab'])] });
  nabi.select(caretAt(at([0], 1)));
  nabi.applyCommand('toggleMark', { mark: { w: 'b', ch: [] } });
  nabi.applyCommand('toggleMark', { mark: { w: 'b', ch: [] } });
  ok('재예약 토글 — 해제', nabi.$armed.isEmpty());
  nabi.applyCommand('toggleMark', { mark: { w: 'b', ch: [] } });
  nabi.select(caretAt(at([0], 2)));
  ok('몸짓 — 예약 해제', nabi.$armed.isEmpty());
}
{
  // 음수 예약(escape) — 마크 끝에서 다음 글자가 마크 밖에 선다.
  const nabi = createNabi({ env: ENV, doc: [p([b(['ab'])])] });
  nabi.select(caretAt(at([0], 2)));
  nabi.applyCommand('setMark', { w: 'b', a: null });
  nabi.applyCommand('insertText', { text: 'X' });
  eq('escape — 마크 밖', nabi.getJson(), [{ w: 'p', ch: [{ w: 'b', ch: ['ab'] }, 'X'] }]);
}
{
  // 부른 손 (084 ⑨) — 예약은 키보드의 것이다. 세 몸짓을 문 앞에서 못박는다.
  const said: string[] = [];
  const nabi = createNabi({
    env: ENV,
    doc: [p(['ab'])],
    locale: 'ko',
    toast: (level, message) => said.push(`${level}:${message}`),
  });
  nabi.select(caretAt(at([0], 2)));
  const seen = watch(nabi);

  // ① 키보드 · 접힘 = 지금 그대로 예약이다 (`by` 를 안 밝히면 키보드다 — 위 그물들이 그 증거다).
  ok('키보드 접힘 toggleMark — 예약', nabi.applyCommand('toggleMark', { mark: { w: 'b', ch: [] } }, 'keyboard'));
  ok('키보드 접힘 — 예약이 섰다', nabi.$armed.isArmed('b'));
  nabi.applyCommand('toggleMark', { mark: { w: 'b', ch: [] } }); // 재예약 토글로 걷는다

  // ② 포인터 · 접힘 = 예약 없음 · 아무 효과 없음 · toast 로 "적용할 대상이 없다".
  const before = seen.length;
  ok('포인터 접힘 toggleMark — 거절', nabi.applyCommand('toggleMark', { mark: { w: 'b', ch: [] } }, 'pointer') === false);
  ok('포인터 접힘 — 예약 없음', nabi.$armed.isEmpty());
  eq('포인터 접힘 — 신호도 없다', seen.length, before);
  eq('포인터 접힘 — toast 가 로케일로 말한다', said, [`info:${translate('noTarget', 'ko')}`]);

  // 로케일을 **화면이 건다** — 옵션에 안 적어도 ui 가 제 값을 걸면 코어가 그 말로 말한다.
  // 이 자리가 어긋났던 적이 있다: 호스트가 mount 에만 로케일을 주고 코어에는 안 줘서, 화면은
  // 한국어인데 문만 영어로 말했다(주인 신고). 건 값이 옵션을 이기고, 떼면 옵션으로 돌아온다.
  {
    const plain = createNabi({ env: ENV, doc: [p(['글'])] });
    eq('로케일: 아무도 안 걸면 en', plain.$locale(), 'en');
    const unbind = plain.$bindLocale('ja');
    eq('로케일: 화면이 건 값이 곧 코어의 말이다', plain.$locale(), 'ja');
    unbind();
    eq('로케일: 떼면 원래 값으로 돌아온다', plain.$locale(), 'en');
    const withOption = createNabi({ env: ENV, doc: [p(['글'])], locale: 'ko' });
    withOption.$bindLocale('ja');
    eq('로케일: 건 값이 옵션을 이긴다', withOption.$locale(), 'ja');
  }
  ok('포인터 접힘 setMark — 예약(escape 포함)도 거절', nabi.applyCommand('setMark', { w: 'b', a: null }, 'pointer') === false);
  ok('포인터 접힘 setMark — 예약 없음', nabi.$armed.isEmpty());
  eq('포인터 접힘 setMark — toast 한 번 더', said.length, 2);

  // ③ 포인터 · 범위 = 키보드 범위와 동일 동작 — 손은 예약 갈래에서만 갈린다.
  nabi.select(sel(at([0], 0), at([0], 2)));
  ok('포인터 범위 toggleMark — 문서에 닿는다', nabi.applyCommand('toggleMark', { mark: { w: 'b', ch: [] } }, 'pointer'));
  eq('포인터 범위 — 키보드 범위와 같은 답', nabi.getJson(), [{ w: 'p', ch: [{ w: 'b', ch: ['ab'] }] }]);
  eq('범위 몸짓 — toast 없음', said.length, 2);
}
{
  // 값 마크 예약 + 기본 마크 합류.
  const nabi = createNabi({ env: ENV, doc: [p([b(['ab'])])] });
  nabi.select(caretAt(at([0], 2)));
  nabi.applyCommand('setMark', { w: 'hl', a: { c: 'yellow' } });
  nabi.applyCommand('insertText', { text: 'X' });
  const paragraph = nabi.$doc()[0] as ElementNode;
  const runs = runsOf(paragraph);
  const last = runs[runs.length - 1];
  ok('값 마크 예약 — 기본 마크(b)와 합류', last !== undefined && last.kind === 'text'
    && last.text === 'X'
    && last.marks.some((m) => m.w === 'b')
    && last.marks.some((m) => m.w === 'hl' && m.a?.['c'] === 'yellow'),
    JSON.stringify(runs));
}

// --- undo 표 ----------------------------------------------------------------------------------
{
  // 이어 친 글자는 한 걸음.
  const nabi = createNabi({ env: ENV });
  nabi.applyCommand('insertText', { text: 'a' });
  nabi.applyCommand('insertText', { text: 'b' });
  nabi.applyCommand('insertText', { text: 'c' });
  eq('뭉침 — 문서', nabi.getJson(), [{ w: 'p', ch: ['abc'] }]);
  ok('뭉침 — undo 한 번', nabi.undo());
  eq('뭉침 — 전부 걷힘', nabi.getJson(), [{ w: 'p', ch: [] }]);
  ok('뭉침 — 더 걷을 것 없음', !nabi.undo());
  ok('뭉침 — redo', nabi.redo());
  eq('뭉침 — redo 복귀', nabi.getJson(), [{ w: 'p', ch: ['abc'] }]);
}
{
  // 캐럿을 옮기면 뭉침이 갈라진다.
  const nabi = createNabi({ env: ENV, doc: [p(['ab'])] });
  nabi.select(caretAt(at([0], 2)));
  nabi.applyCommand('insertText', { text: 'c' });
  nabi.select(caretAt(at([0], 1)));
  nabi.applyCommand('insertText', { text: 'X' });
  eq('갈림 — 문서', nabi.getJson(), [{ w: 'p', ch: ['aXbc'] }]);
  nabi.undo();
  eq('갈림 — 한 걸음만 걷힘', nabi.getJson(), [{ w: 'p', ch: ['abc'] }]);
  eq('갈림 — 캐럿 복원(삽입 전 자리)', nabi.getSelection(), caretAt(at([0], 1)));
  nabi.undo();
  eq('갈림 — 두 걸음째', nabi.getJson(), [{ w: 'p', ch: ['ab'] }]);
}
{
  // group — 여러 커맨드가 undo 한 걸음, 캐럿은 묶음 시작 자리.
  const nabi = createNabi({ env: ENV, doc: [p(['ab'])] });
  const start = caretAt(at([0], 2));
  nabi.select(start);
  nabi.group(() => {
    nabi.applyCommand('insertText', { text: 'X' });
    nabi.applyCommand('splitParagraph');
  });
  eq('group — 문서', nabi.getJson(), [{ w: 'p', ch: ['abX'] }, { w: 'p', ch: [] }]);
  ok('group — undo 한 번', nabi.undo());
  eq('group — 원상', nabi.getJson(), [{ w: 'p', ch: ['ab'] }]);
  eq('group — 캐럿 = 묶음 시작', nabi.getSelection(), start);
  ok('group — 더 없음', !nabi.undo());
}
{
  // 중첩 group 도 한 걸음.
  const nabi = createNabi({ env: ENV, doc: [p(['ab'])] });
  nabi.select(caretAt(at([0], 2)));
  nabi.group(() => {
    nabi.group(() => nabi.applyCommand('insertText', { text: 'X' }));
    nabi.applyCommand('splitParagraph');
  });
  nabi.undo();
  eq('중첩 group — undo 한 걸음', nabi.getJson(), [{ w: 'p', ch: ['ab'] }]);
}
{
  // 캐럿 이동은 redo 를 안 지운다.
  const nabi = createNabi({ env: ENV, doc: [p(['ab'])] });
  nabi.select(caretAt(at([0], 2)));
  nabi.applyCommand('insertText', { text: 'X' });
  nabi.undo();
  nabi.select(caretAt(at([0], 1)));
  ok('redo 보존 — 이동 뒤에도', nabi.redo());
  eq('redo 보존 — 문서', nabi.getJson(), [{ w: 'p', ch: ['abX'] }]);
}
{
  // undo 뒤의 새 입력은 redo 를 지운다.
  const nabi = createNabi({ env: ENV });
  nabi.applyCommand('insertText', { text: 'a' });
  nabi.undo();
  nabi.applyCommand('insertText', { text: 'b' });
  ok('redo 소멸', !nabi.redo());
  eq('redo 소멸 — 문서', nabi.getJson(), [{ w: 'p', ch: ['b'] }]);
}

// --- 매 커맨드 cocoon ----------------------------------------------------------------
{
  // 맨몸 물건을 남긴 커맨드 — 문이 cocoon 으로 래퍼문단을 입힌다.
  const nabi = createNabi({ env: ENV, doc: [p(['ab'])] });
  ok('$applyRaw — true', nabi.$applyRaw((doc, s) => ({
    doc: [...doc, { w: 'img', a: { src: '/x.png' }, ch: [] }] as unknown as NabiDoc,
    selection: s,
  })));
  eq('cocoon 문 — 래퍼문단', nabi.getJson(), [
    { w: 'p', ch: ['ab'] },
    { w: 'p', ch: [{ w: 'img', a: { src: '/x.png' }, ch: [] }] },
  ]);
}
{
  // cocoon 이 고친 문서에서 안 서는 캐럿은 문서 처음으로.
  const nabi = createNabi({ env: ENV, doc: [p(['ab'])] });
  nabi.$applyRaw((doc) => ({
    doc: [...doc, { w: 'img', a: { src: '/x.png' }, ch: [] }] as unknown as NabiDoc,
    selection: sel(at([99], 0), at([99], 0)),
  }));
  eq('cocoon 문 — 캐럿 낙하는 문서 처음', nabi.getSelection(), caretAt(at([0], 0)));
}
{
  // $applyRaw 무변화 =.
  const nabi = createNabi({ env: ENV });
  const seen = watch(nabi);
  ok('$applyRaw 무변화 — false', !nabi.$applyRaw((doc, s) => ({ doc, selection: s })));
  eq('$applyRaw 무변화 — 신호 없음', seen.length, 0);
}
{
  // $registerCommand — 등록한 커맨드가 같은 문을 탄다.
  const nabi = createNabi({ env: ENV });
  nabi.$registerCommand('shout', (doc, s, _args, env) => {
    const r = docInsertText(doc, s.focus, '!', env);
    return { doc: r.doc, selection: caretAt(r.caret) };
  });
  ok('등록 커맨드 실행', nabi.applyCommand('shout'));
  eq('등록 커맨드 결과', nabi.getJson(), [{ w: 'p', ch: ['!'] }]);
  ok('등록 커맨드 — undo 도 같은 문', nabi.undo());
}

// --- setJson· setHtml· isChanged ------------------------------------------------------------
{
  const nabi = createNabi({ env: ENV, doc: [p(['ab'])] });
  ok('setJson — true', nabi.setJson([{ w: 'p', ch: ['새 문서'] }]));
  eq('setJson — 문서', nabi.getJson(), [{ w: 'p', ch: ['새 문서'] }]);
  ok('setJson — isChanged 기준선', !nabi.isChanged());
  eq('setJson — 캐럿 문서 처음', nabi.getSelection(), caretAt(at([0], 0)));
  ok('setJson — undo 로 이전 문서', nabi.undo());
  eq('setJson undo — 문서', nabi.getJson(), [{ w: 'p', ch: ['ab'] }]);

  ok('setJson 무효 — false', !nabi.setJson('나비트리 아님'));
  eq('setJson 무효 — 문서 그대로', nabi.getJson(), [{ w: 'p', ch: ['ab'] }]);
}
{
  // 빈 값은 형식 오류가 아니라 빈 문서다 — 비우려는 손은 늘 성공한다.
  const empty = [{ w: 'p', ch: [] }];
  for (const value of [null, undefined, '', '   ', []]) {
    const nabi = createNabi({ env: ENV, doc: [p(['ab'])] });
    ok(`setJson 빈 값(${JSON.stringify(value)}) — true`, nabi.setJson(value));
    eq(`setJson 빈 값(${JSON.stringify(value)}) — 빈 문서`, nabi.getJson(), empty);
    eq('빈 문서의 캐럿은 그 첫머리', nabi.getSelection(), caretAt(at([0], 0)));
    ok('빈 문서도 기준선이다 — 방금 실은 것이 저장된 것', !nabi.isChanged());
    ok('되돌리면 쓰던 글이 돌아온다', nabi.undo());
    eq('undo — 쓰던 글', nabi.getJson(), [{ w: 'p', ch: ['ab'] }]);
  }
  // 빈 것과 틀린 것은 다르다 — 모양이 틀린 값은 여전히 거절이다.
  const strict = createNabi({ env: ENV, doc: [p(['ab'])] });
  ok('setJson {} — 여전히 false', !strict.setJson({}));
  ok('setJson 0 — 여전히 false', !strict.setJson(0));
  eq('거절은 문서를 안 건드린다', strict.getJson(), [{ w: 'p', ch: ['ab'] }]);
}
{
  // 검사를 지나고도 조립 중에 **던지는** 값 — 예외가 문 밖으로 못 나간다 ($guarded).
  // 거절(false·빈 문서)로 바뀌고 console.error 로 알린다. 그물은 그 알림을 받아 세므로
  // 실패 출력과 안 섞인다.
  const caught: unknown[] = [];
  const real = console.error;
  console.error = (...args: unknown[]) => {
    caught.push(args[0]);
  };
  try {
    const poison = [
      {
        get w(): string {
          throw new Error('독이 든 getter');
        },
      },
    ];
    const nabi = createNabi({ env: ENV, doc: [p(['ab'])] });
    ok('던지는 값 — setJson 은 false 로 거절', !nabi.setJson(poison));
    eq('던지는 값 — 문서는 그대로', nabi.getJson(), [{ w: 'p', ch: ['ab'] }]);
    ok('에디터는 계속 산다', nabi.setJson([{ w: 'p', ch: ['다음'] }]));

    const thrower = createNabi({
      env: ENV,
      parseHtml: () => {
        throw new Error('던지는 파서');
      },
    });
    ok('던지는 파서 — setHtml 은 false', !thrower.setHtml('<p>x</p>'));
    ok('그 에디터도 계속 산다', thrower.setJson([p(['살았다'])]));

    // doc 옵션이 던지면 인스턴스가 못 서는 것이 최악이다 — 빈 문서로 선다.
    const seeded = createNabi({ env: ENV, doc: poison });
    eq('doc 옵션이 던지면 — 빈 문서로 선다', seeded.getJson(), [{ w: 'p', ch: [] }]);

    eq('세 문 다 console.error 로 알렸다', caught.length, 3);
    ok('알림에 문 이름이 실린다', String(caught[0]).includes('[nabi-note] setJson'));
  } finally {
    console.error = real;
  }
}
{
  const nabi = createNabi({ env: ENV, doc: [p(['ab'])] });
  ok('처음은 안 바뀜', !nabi.isChanged());
  nabi.applyCommand('insertText', { text: 'X' });
  ok('입력 뒤 바뀜', nabi.isChanged());
  nabi.undo();
  ok('undo 로 기준선 복귀 — 안 바뀜(참조 동일)', !nabi.isChanged());
}
{
  // setHtml — 주입한 파서(그물용 토크나이저)로.
  const nabi = createNabi({ env: ENV, parseHtml: tinyHtml });
  ok('setHtml — true', nabi.setHtml('<p>hi</p><img src="/x.png">'));
  const doc = nabi.$doc();
  eq('setHtml — 문단 둘', doc.length, 2);
  const second = doc[1] as ElementNode;
  ok('setHtml — 물건은 래퍼문단', second.w === 'p' && (second.ch[0] as ElementNode).w === 'img');
  ok('setHtml — 기준선', !nabi.isChanged());

  ok('setHtml 빈 글자열 — true', nabi.setHtml(''));
  eq('setHtml 빈 글자열 — 빈 문서', nabi.getJson(), [{ w: 'p', ch: [] }]);

  const bare = createNabi({ env: ENV });
  ok('setHtml — 파서 없으면 false', !bare.setHtml('<p>hi</p>'));
  // 빈 값에는 읽을 것이 없다 — 파서를 안 꽂은 호스트도 비우기는 된다.
  ok('setHtml 빈 값 — 파서 없이도 true', bare.setHtml(''));
  eq('setHtml 빈 값 — 빈 문서', bare.getJson(), [{ w: 'p', ch: [] }]);
}

// --- 신호 정밀 --------------------------------------------------------------------------------
{
  // 두 문단 중 하나만 바뀌면 그 문단만 목록에 선다.
  const nabi = createNabi({ env: ENV, doc: [p(['ab']), p(['cd'])] });
  const ids = nabi.$doc().map((n) => n._id);
  nabi.select(caretAt(at([1], 2)));
  const seen = watch(nabi);
  nabi.applyCommand('insertText', { text: 'X' });
  eq('신호 — 바뀐 문단만', (seen[0] as NabiChange).paragraphs, [ids[1]]);
  eq('신호 — removed 없음', (seen[0] as NabiChange).removed, []);
}
{
  // 분할 — 바뀐 문단(머리)과 새 문단(꼬리) 둘.
  const nabi = createNabi({ env: ENV, doc: [p(['ab'])] });
  nabi.select(caretAt(at([0], 1)));
  const seen = watch(nabi);
  nabi.applyCommand('splitParagraph');
  const change = seen[0] as NabiChange;
  eq('분할 신호 — 문단 둘', change.paragraphs.length, 2);
  eq('분할 신호 — 지금 문서의 두 문단', change.paragraphs, nabi.$doc().map((n) => n._id));
}
{
  // 병합 — 사라진 문단이 removed 에 선다.
  const nabi = createNabi({ env: ENV, doc: [p(['ab']), p(['cd'])] });
  const ids = nabi.$doc().map((n) => n._id);
  nabi.select(caretAt(at([1], 0)));
  const seen = watch(nabi);
  nabi.applyCommand('deleteBackward');
  eq('병합 — 문서', nabi.getJson(), [{ w: 'p', ch: ['abcd'] }]);
  const change = seen[0] as NabiChange;
  eq('병합 신호 — 바뀐 문단', change.paragraphs, [ids[0]]);
  eq('병합 신호 — removed', change.removed, [ids[1]]);
}
{
  // 선택만 바뀌면 doc:false, 목록 비움.
  const nabi = createNabi({ env: ENV, doc: [p(['ab'])] });
  const seen = watch(nabi);
  nabi.select(caretAt(at([0], 1)));
  const change = seen[0] as NabiChange;
  ok('선택 신호 — selection 만', !change.doc && change.selection);
  eq('선택 신호 — 문단 목록 비움', change.paragraphs, []);
}

// --- select 검증 ------------------------------------------------------------------------------
{
  const nabi = createNabi({ env: ENV, doc: [p(['ab'])] });
  ok('없는 자리 select — false', !nabi.select(caretAt(at([9], 0))));
  ok('같은 선택 select — false', !nabi.select(nabi.getSelection()));
  ok('있는 자리 select — true', nabi.select(caretAt(at([0], 1))));
}

// --- 범위 삭제·마크·문단 속성 배선 ------------------------------------------------------------
{
  const nabi = createNabi({ env: ENV, doc: [p(['abcd'])] });
  nabi.select(sel(at([0], 1), at([0], 3)));
  nabi.applyCommand('deleteBackward');
  eq('범위 백스페이스 = 범위 삭제', nabi.getJson(), [{ w: 'p', ch: ['ad'] }]);
}
{
  const nabi = createNabi({ env: ENV, doc: [p(['abcd'])] });
  nabi.select(sel(at([0], 1), at([0], 3)));
  ok('범위 toggleMark — true', nabi.applyCommand('toggleMark', { mark: { w: 'b', ch: [] } }));
  eq('범위 toggleMark — 문서', nabi.getJson(), [{ w: 'p', ch: ['a', { w: 'b', ch: ['bc'] }, 'd'] }]);
}
{
  const nabi = createNabi({ env: ENV, doc: [p(['ab'])] });
  ok('문단 속성 — true', nabi.applyCommand('setParagraphAttr', { key: 'a', value: 'c' }));
  eq('문단 속성 — 문서', nabi.getJson(), [{ w: 'p', a: { a: 'c' }, ch: ['ab'] }]);
  ok('문단 속성 무효 값 — false', !nabi.applyCommand('setParagraphAttr', { key: 'a', value: 'x' }));
}

// --- getHtml 계열 -----------------------------------------------------------------------------
{
  const nabi = createNabi({ env: ENV, doc: [p(['안녕'])] });
  ok('getHtml — 문단', nabi.getHtml().includes('<p'));
  ok('getEditorHtml — data-key', nabi.getEditorHtml().includes('data-key'));
  ok('getHtml — data-key 없음', !nabi.getHtml().includes('data-key'));
}

done('editor');
