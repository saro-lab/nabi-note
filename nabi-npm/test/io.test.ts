// io 그물 — 붙여넣기 후보 수집의 규칙 넷, 레지스트리가 IO 필터·md 조립을 접는 자리,
// 내장 필터 셋, 그리고 **붙여넣기 한 걸음**(surface/paste — DOM 없는 정책부)이다.
// 판은 여기 없다: 고르는 판에서 잡을 것은 순환 산수 하나뿐이라 그것만 부른다.
import {
  collectCandidates,
  makeBuiltinFilters,
  readNabiFile,
  textCandidate,
  writeHtmlFile,
  saveMark,
  NABI_MARK,
  NHTML_FILE_EXTENSION,
  HTML_ICON,
  MARK_STROKE,
  MARKDOWN_ICON,
  NABI_ICON,
  TEXT_ICON,
  type IoFilter,
  type MdEnv,
  type PasteCandidate,
  type PasteData,
} from '../src/io/index.js';
import { createNabiWith, makeRegistry, simpleMark, type Registry, type Wing } from '../src/wing/index.js';
import { defaultWings } from '../src/wings/index.js';
import {
  clipMemory,
  clipText,
  dressClipHtml,
  fileClipHtml,
  forgetClip,
  fromNabi,
  loadClipboard,
  loneFileLink,
  makePasteFlow,
  normalizeClipHtml,
  rememberClip,
  sameClip,
  wrapClipHtml,
  type SaveFormat,
} from '../src/surface/index.js';
import { CHOOSE_COLS, gridStep, initialChoice } from '../src/ui/choose.js';
import { iconSvg } from '../src/wing/toolbar-html.js';
import { extensionFor, formatName } from '../src/ui/save.js';
import { silentAsk, type Nabi } from '../src/editor/index.js';
import { caretAt } from '../src/caret/index.js';
import { tinyHtml } from './tiny-html.js';
import { done, eq, ok } from './net.js';

const data = (draft: Partial<PasteData>): PasteData => ({
  html: '',
  plain: '',
  files: [],
  types: [],
  ...draft,
});

const stub = (id: string): PasteCandidate => ({ id, label: id, build: () => [] });

// 글자가 있으면 늘 답하는 필터 하나 — 순서만 보는 그물이라 속은 비어 있어도 된다.
const always = (id: string): IoFilter => ({
  id,
  label: id,
  paste: (input) => (input.plain === '' && input.html === '' ? null : stub(id)),
});

const ids = (list: readonly PasteCandidate[]): string[] => list.map((candidate) => candidate.id);

function throws(name: string, fn: () => void, wants?: string): void {
  try {
    fn();
    ok(name, false, '던지지 않았다');
  } catch (error) {
    const message = (error as Error).message;
    ok(name, wants === undefined || message.includes(wants), `받은 메시지: ${message}`);
  }
}

// --- 후보 수집 -----------------------------------------------------------------------------
{
  const file = { name: 'sheet.png', type: 'image/png', size: 12 };

  const mixed = collectCandidates(data({ html: '<table></table>', plain: 'a\tb', files: [file] }), {
    filters: [always('html')],
    textLabel: '맨 글자',
  });
  eq('글자가 있으면 파일은 안 본다 — 후보는 필터와 맨 글자뿐이다', ids(mixed), ['html', 'text']);

  const onlyFiles = collectCandidates(data({ files: [file] }), { filters: [always('html')], textLabel: '맨 글자' });
  eq('글자가 아예 없으면 후보는 0 이다 (파일은 부르는 쪽의 일)', ids(onlyFiles), []);

  const many = collectCandidates(data({ plain: 'x\ny' }), {
    filters: [always('첫째'), always('둘째')],
    textLabel: '맨 글자',
  });
  eq('필터는 등록순으로 서고 맨 글자가 언제나 마지막이다', ids(many), ['첫째', '둘째', 'text']);

  const spread: IoFilter = { id: '묶음', label: '묶음', paste: () => [stub('a'), stub('b')] };
  const flat = collectCandidates(data({ plain: 'x\ny' }), { filters: [spread], textLabel: '맨 글자' });
  eq('필터가 배열을 답하면 그 순서대로 펴진다', ids(flat), ['a', 'b', 'text']);

  const silent: IoFilter = { id: '조용', label: '조용', paste: () => null };
  const alone = collectCandidates(data({ plain: '한 줄' }), { filters: [silent], textLabel: '맨 글자' });
  eq('아무도 안 잡으면 맨 글자 하나뿐이다', ids(alone), ['text']);
  ok('후보가 하나면 판이 안 뜬다', alone.length === 1);

  const htmlOnly = collectCandidates(data({ html: '<p>x</p>' }), { filters: [always('html')], textLabel: '맨 글자' });
  eq('plain 이 빈 붙여넣기에는 빈 맨 글자 후보를 안 세운다', ids(htmlOnly), ['html']);

  ok('한 줄 평문 후보는 inline 이다', textCandidate('한 줄', 'x').inline === true);
  ok('여러 줄 평문 후보는 inline 이 아니다', textCandidate('두\n줄', 'x').inline === undefined);
  eq('맨 글자 후보는 줄마다 문단 하나다 (빈 줄은 빈 문단)', textCandidate('a\n\nb', 'x').build(), [
    { w: 'p', ch: ['a'] },
    { w: 'p', ch: [] },
    { w: 'p', ch: ['b'] },
  ]);
}

// --- 레지스트리 접기 -----------------------------------------------------------------------
{
  const wingFilter: IoFilter = { id: 'nabi', label: 'nabi' };
  const hostFilter: IoFilter = { id: '호스트', label: '호스트' };

  const bold: Wing = { ...simpleMark({ w: 'b' }), ioFilter: wingFilter, toMd: (_node, ctx) => `**${ctx.children()}**` };
  const italic: Wing = { ...simpleMark({ w: 'i' }) };

  const plain = makeRegistry([bold, italic]);
  eq('wing 의 IO 필터가 등록순으로 접힌다', plain.ioFilters.map((f) => f.id), ['nabi']);
  ok('toMd 를 든 wing 만 md 조립 맵에 든다', typeof plain.mdBuilders['b'] === 'function' && plain.mdBuilders['i'] === undefined);

  const withHost = makeRegistry([bold, italic], { ioFilters: [hostFilter] });
  eq('호스트 필터가 wing 필터보다 앞에 선다', withHost.ioFilters.map((f) => f.id), ['호스트', 'nabi']);

  throws(
    'IO 필터 id 가 겹치면 등록이 죽는다',
    () => makeRegistry([bold, { ...simpleMark({ w: 'i' }), ioFilter: { id: 'nabi', label: '둘째' } }]),
    'IO 필터 id "nabi"',
  );
  throws(
    '호스트와 wing 이 같은 id 를 들어도 죽는다',
    () => makeRegistry([bold], { ioFilters: [{ id: 'nabi', label: '호스트' }] }),
    '호스트',
  );

  // 부품의 md 조립 — partHtml 과 같은 한 줄이다.
  const list: Wing = {
    w: 'ul',
    place: 'container',
    holds: 'blocks',
    parts: { li: { holds: 'blocks' } },
    toHtml: () => '<ul></ul>',
    partHtml: { li: () => '<li></li>' },
    partMd: { li: (_node, ctx) => `- ${ctx.children()}` },
  };
  ok('partMd 도 타입 이름으로 md 조립 맵에 든다', typeof makeRegistry([list]).mdBuilders['li'] === 'function');
}

// --- 내장 필터 셋 -----------------------------------------------------------------------------
{
  const { registry } = createNabiWith(defaultWings, {});
  const mdOf = (reg: Registry): MdEnv => ({ has: (w) => reg.wingOf(w) !== null || reg.ownerOf(w) !== null });
  const builtin = (md: MdEnv = mdOf(registry)): readonly IoFilter[] =>
    makeBuiltinFilters({ env: registry.env, parse: tinyHtml, md, ...(registry.claim ? { claim: registry.claim } : {}) });

  // 저장하는 셋(nabi·html·md)에 **읽기만 하는 짝** 하나가 뒤따른다 — 밖에서 온 `.html` 을
  // 여는 길이다(저장 이름이 `.nhtml` 로 바뀌면서 생긴 자리). 저장 판에는 안 선다.
  eq('내장 셋은 nabi·html·md 순이고 읽기짝이 뒤에 선다', builtin().map((f) => f.id),
    ['nabi', 'html', 'markdown', 'html-open']);
  eq('저장 형식은 여전히 셋이다', builtin().filter((f) => f.save !== undefined).length, 3);
  eq(
    '저장 확장자는 형식마다 하나다',
    builtin().filter((f) => f.save).map((f) => `${f.save?.extension}:${f.save?.mime}`),
    ['.nabi:application/json', '.nhtml:text/html', '.md:text/markdown'],
  );
  ok('md 저장만 되돌아오지 못한다', builtin().filter((f) => f.save).map((f) => f.save?.lossy === true).join() === 'false,false,true');
  // 읽기짝은 제 이름 판정을 든다 — `.html` 만 받고 그 밖은 조용히 넘긴다(다음 필터의 몫이다).
  eq('읽기짝은 .html 을 읽는다', builtin()[3]?.read?.('밖.html', '<p>글</p>'), [{ w: 'p', ch: ['글'] }]);
  eq('읽기짝은 남의 확장자를 안 받는다', builtin()[3]?.read?.('밖.txt', '<p>글</p>'), null);
  ok('읽기짝은 저장도 붙여넣기도 안 한다', builtin()[3]?.save === undefined && builtin()[3]?.paste === undefined);
  ok('nabi 필터는 붙여넣기에 안 선다', builtin()[0]?.paste === undefined);

  // 저장·열기의 왕복 — 판을 안 띄우고 필터 자신에게 묻는다.
  const source = { json: () => [{ w: 'p', ch: ['글'] }], html: () => '<p>글</p>', md: () => '글' };
  const written = builtin()[0]?.save?.write(source) ?? '';
  eq('nabi 필터가 쓴 것을 nabi 필터가 되읽는다', readNabiFile(written), [{ w: 'p', ch: ['글'] }]);
  eq('md 필터는 문서의 md() 를 그대로 쓴다', builtin()[2]?.save?.write(source), '글');
  eq('html 필터가 읽은 것은 문서 JSON 이다', builtin()[1]?.read?.('a.html', '<p>글</p>'), [{ w: 'p', ch: ['글'] }]);

  const paste = (draft: Partial<PasteData>, filters: readonly IoFilter[]): string[] =>
    ids(collectCandidates(data(draft), { filters, textLabel: 'io.text' }));

  eq('md 냄새가 나는 평문에는 md 후보가 선다', paste({ plain: '# 제목' }, builtin()), ['markdown', 'text']);
  eq('평범한 산문에는 md 후보가 없다', paste({ plain: '그냥 두 줄\n짜리 글' }, builtin()), ['text']);
  eq(
    '받아 줄 wing 이 하나도 없으면 md 는 잠잔다',
    paste({ plain: '# 제목' }, builtin({ has: () => false })),
    ['text'],
  );
  eq(
    'md 결과가 맨 글자와 같으면 후보를 안 낸다',
    paste({ plain: '- 목록' }, builtin({ has: (w) => w === 'h' })),
    ['text'],
  );
  eq('html 이 있으면 html 후보가 맨 글자 앞에 선다', paste({ html: '<p>글</p>', plain: '글' }, builtin()), ['html', 'text']);
}

// --- 붙여넣기 한 걸음 (surface/paste — DOM 이 없다) ---------------------------------------------
{
  interface Rig {
    readonly nabi: Nabi;
    readonly take: (draft: Partial<PasteData>, files?: readonly unknown[]) => void;
    // 판이 받은 자리들 — 판을 안 띄우고 가짜 ask 로 답한다.
    readonly asked: string[][];
    // 그 자리마다 그림을 들었나 — 내장 셋은 들고, 호스트 필터는 안 든다.
    readonly icons: boolean[][];
    // 마지막 처리기가 불린 횟수.
    readonly dropped: () => number;
  }

  const rig = (answer: number, doc?: unknown, extra: readonly IoFilter[] = []): Rig => {
    const { nabi, registry } = createNabiWith(defaultWings, doc === undefined ? {} : { doc });
    const filters: readonly IoFilter[] = [
      ...extra,
      ...registry.ioFilters,
      ...makeBuiltinFilters({
        env: registry.env,
        parse: tinyHtml,
        md: { has: (w) => registry.wingOf(w) !== null || registry.ownerOf(w) !== null },
        ...(registry.claim ? { claim: registry.claim } : {}),
      }),
    ];
    const asked: string[][] = [];
    const icons: boolean[][] = [];
    let dropped = 0;
    nabi.$bindChoose((_question, choices) => {
      asked.push(choices.map((choice) => choice.label));
      // 내장 셋은 이름과 함께 그림도 든다 — 판이 이름만 받던 때와 갈리는 자리다.
      icons.push(choices.map((choice) => choice.icon !== undefined));
      return answer;
    });
    const flow = makePasteFlow({
      nabi,
      filters,
      locale: () => 'ko',
      fileSink: () => {
        dropped += 1;
      },
    });
    return {
      nabi,
      asked,
      icons,
      dropped: () => dropped,
      take: (draft, files = []) =>
        flow({ html: '', plain: '', files: [], types: [], ...draft }, files as readonly File[]),
    };
  };

  // 판의 답은 나중에 온다 — 마이크로태스크 하나를 비운다.
  const settled = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 0));

  ok('한 줄은 셋까지다', CHOOSE_COLS === 3);
  ok('물을 사람이 없으면 답은 첫째다', silentAsk.choose?.('무엇을', [{ label: '하나' }, { label: '둘' }]) === 0);

  // 열릴 때의 첫 겨눔 — 셋 이상이면 첫 줄 가운데(자리 1), 아니면 맨 앞. 화면 없는 답과는 다른
  // 산수다: silentAsk 는 여전히 0 이다(바로 위 줄이 그것을 잡는다).
  eq('셋 미만이면 첫 겨눔은 맨 앞이다', [0, 1, 2].map(initialChoice), [0, 0, 0]);
  eq('셋 이상이면 첫 겨눔은 첫 줄 가운데다', [3, 4, 5, 6].map(initialChoice), [1, 1, 1, 1]);

  // 격자 걸음 — 셋씩 두 줄(0..2 / 3..5)에 여섯을 세워 놓고 잡는다.
  {
    const six = (at: number, key: string, rtl = false): number => gridStep(at, 6, key, CHOOSE_COLS, rtl);
    ok('좌우는 한 칸씩 간다', six(1, 'ArrowRight') === 2 && six(1, 'ArrowLeft') === 0);
    ok('좌우는 줄 끝에서 다음 줄 머리로 감긴다', six(2, 'ArrowRight') === 3 && six(3, 'ArrowLeft') === 2);
    ok('좌우는 판 끝에서 처음으로 돈다', six(5, 'ArrowRight') === 0 && six(0, 'ArrowLeft') === 5);
    ok('상하는 줄 사이를 같은 열로 오간다', six(0, 'ArrowDown') === 3 && six(5, 'ArrowUp') === 2);
    ok('상하는 세로로도 순환한다', six(3, 'ArrowDown') === 0 && six(0, 'ArrowUp') === 3);
    // rtl(ar·ur)에서는 좌우만 뒤집힌다 — 상하는 그대로 격자를 오른다.
    ok('rtl 은 좌우가 뒤집힌다', six(1, 'ArrowRight', true) === 0 && six(1, 'ArrowLeft', true) === 2);
    ok('rtl 이라도 상하는 그대로다', six(0, 'ArrowDown', true) === 3 && six(3, 'ArrowUp', true) === 0);
  }
  // 마지막 줄이 모자란 열(다섯이면 0..2 / 3,4 의 열 2)에서는 그 줄의 가장 가까운 칸에 붙는다.
  {
    const five = (at: number, key: string): number => gridStep(at, 5, key, CHOOSE_COLS);
    ok('모자란 열로 내려가면 끝 칸에 붙는다', five(2, 'ArrowDown') === 4);
    ok('모자란 열로 올라가도 같은 자리다', five(2, 'ArrowUp') === 4);
  }
  // 줄이 하나뿐이면(후보 셋 이하) 위아래도 그 줄을 걷는다 — 안 움직이는 화살표보다 낫다.
  ok('한 줄짜리 판은 셋이 다 걷는다', gridStep(2, 3, 'ArrowDown') === 0 && gridStep(0, 3, 'ArrowUp') === 2);
  eq('화살표가 아닌 키는 겨눔을 안 건드린다', ['Enter', ' ', 'Escape', 'a'].map((key) => gridStep(0, 3, key)), [-1, -1, -1, -1]);
  ok('줄이 없으면 겨눌 것도 없다', gridStep(0, 0, 'ArrowRight') === -1);

  // --- 판에 서는 그림 넷 -------------------------------------------------------------------------
  // path 를 글자 그대로 잡지 않는다 — 모양은 다듬는 것이고, 지켜야 할 것은 **넷이 한 벌로 보이는
  // 성질**이다: 같은 껍데기(viewBox 16), 제 굵기를 안 드는 속, 그리고 종이·상자 없는 선뿐.
  {
    const marks: readonly (readonly [string, string])[] = [
      ['HTML', HTML_ICON], ['MARKDOWN', MARKDOWN_ICON], ['TEXT', TEXT_ICON], ['NABI', NABI_ICON],
    ];
    ok('그림 넷이 다 서 있다', marks.every(([, body]) => body.length > 0));
    // 굵기는 밖에서 하나로 온다 — 속이 제 굵기를 들면 그 그림만 굵거나 가늘어진다.
    eq('어느 그림도 제 굵기를 안 든다', marks.filter(([, body]) => body.includes('stroke-width')).map(([name]) => name), []);
    // 선으로만 그린다 — rect·circle 이 섞이면 같은 붓으로 그린 것처럼 안 보인다.
    eq('넷 다 path 로만 그린다', marks.filter(([, body]) => !/^(?:<path d="[^"]*"\/>)+$/.test(body)).map(([name]) => name), []);
    // 판이 칠하는 굵기가 껍데기의 기본과 같다 — 한 값이 두 곳에서 갈리지 않는다.
    ok('굵기 한 값이 껍데기의 기본과 같다', iconSvg('<path d="M0 0"/>').includes(`stroke-width="${MARK_STROKE}"`));
    ok('껍데기는 16×16 하나다', marks.every(([, body]) => iconSvg(body, MARK_STROKE).includes('viewBox="0 0 16 16"')));

    // MARKDOWN 은 `MD` 두 글자다 — 획 둘, 테두리 상자 없음.
    ok('MARKDOWN 은 글자 둘이다', MARKDOWN_ICON.split('<path').length - 1 === 2);
    // TEXT 는 글줄만이다 — 종이 테두리 없이 가로 선 몇, 길이는 서로 다르다.
    const runs = [...TEXT_ICON.matchAll(/h(\d+(?:\.\d+)?)/g)].map((hit) => Number(hit[1]));
    ok('TEXT 는 가로 줄만 긋는다', runs.length === TEXT_ICON.split('<path').length - 1 && runs.length >= 3);
    ok('그 줄들은 길이가 다르다', new Set(runs).size >= 3);
  }

  // --- 저장 판의 그림 — **붙여넣기 판의 것을 그대로 쓴다** ---------------------------------------
  // 한 라운드 앞의 "종이에 확장자를 적은" 그림 셋은 주인이 물렀다(2026-08-23). 지켜야 할 것은
  // 셋이 **한 벌로 보이는 성질**이다: 같은 껍데기(viewBox 16), 제 굵기를 안 드는 속(나비만
  // 제 것을 드는데 그것은 칠 기반이라 그렇다), 그리고 html·md 는 **글자 그대로 같은 그림**.
  {
    eq('html 은 붙여넣기 판의 그 그림이다', saveMark(NHTML_FILE_EXTENSION), HTML_ICON);
    eq('밖에서 온 .html 도 같은 얼굴이다', saveMark('.html'), HTML_ICON);
    eq('md 도 붙여넣기 판의 그 그림이다', saveMark('.md'), MARKDOWN_ICON);
    eq('nabi 는 OG 의 나비 마크다', saveMark('.nabi'), NABI_MARK);
    eq('대문자 확장자도 같은 답이다', saveMark('.NABI'), NABI_MARK);
    // 호스트가 끼운 형식은 그림이 없다 — 판이 그 칸의 그림 자리를 아예 안 만든다.
    eq('모르는 확장자는 그림이 없다', saveMark('.docx'), '');
    // 나비 마크는 `assets/nabi-butterfly.svg` 그대로다 — 색은 하나, 톤은 불투명도로만.
    ok('나비 마크는 한 색뿐이다', !/(fill|stroke)="(?!currentColor")[^"]+"/.test(NABI_MARK));
    ok('나비 마크의 날개는 넷이다', NABI_MARK.split('<path').length - 1 === 4);
    // 톤은 넷 다 다르다 — 겹친 날개의 층이 그것으로만 보인다(색은 하나뿐이다).
    // 값은 마스터(1/.78/.55/.40)보다 한 단계 올린 아이콘 사본의 것이다: 24px 에서 옅은 날개
    // 둘이 사라지지 않을 만큼. 원본 파일은 안 건드렸다.
    const tones = [...NABI_MARK.matchAll(/opacity="([\d.]+)"/g)].map((hit) => Number(hit[1]));
    ok('나비 마크의 톤은 불투명도로만 난다', tones.length === 4 && new Set(tones).size === 4, String(tones));
    ok('옅은 날개도 아이콘 크기에서 보인다', Math.min(...tones) >= 0.5, String(Math.min(...tones)));
    // 칠 기반이라 선 둘 옆에서 무거워진다 — 줄여 앉힌 그 값이 여기 박혀 있다(눈으로 맞춘 값).
    ok('나비 마크는 16 상자에 맞춰 줄여 앉힌다', /scale\(\.\d+\)/.test(NABI_MARK) && NABI_MARK.includes('translate('));
    ok('셋 다 같은 16×16 껍데기를 쓴다', ['.nabi', NHTML_FILE_EXTENSION, '.md']
      .every((ext) => iconSvg(saveMark(ext), MARK_STROKE).includes('viewBox="0 0 16 16"')));
    // 선 굵기는 밖에서 오는 한 값이다 — 선 둘은 제 굵기를 안 든다.
    ok('선으로 그린 둘은 제 굵기를 안 든다', !HTML_ICON.includes('stroke-width') && !MARKDOWN_ICON.includes('stroke-width'));
  }

  // --- 저장 판의 순수 판정 ----------------------------------------------------------------------
  //
  // 판을 안 띄우고 잡는다 — 확장자 표식이 겨눈 칸을 따라가는 산수와, 칸에 서는 이름이다.
  // **열릴 때의 겨눔은 여기 없다**: 붙여넣기 판과 같은 `initialChoice` 하나를 쓰기로 했다
  // (주인 지시 2026-08-23 — 옛 "기본은 원본(.nabi)" 을 뒤집은 자리다. 형식 셋이면 HTML 이다).
  {
    const fmt = (id: string, extension: string, lossy = false): SaveFormat => ({ id, label: id, extension, lossy });
    const three = [fmt('nabi', '.nabi'), fmt('html', NHTML_FILE_EXTENSION), fmt('markdown', '.md', true)];
    eq('표식은 겨눈 칸의 확장자다', three.map((_, at) => extensionFor(three, at)), ['.nabi', '.nhtml', '.md']);
    eq('자리 밖이면 원본의 확장자로 답한다', extensionFor(three, -1), '.nabi');
    eq('형식이 하나도 없어도 답은 있다', extensionFor([], 0), '.nabi');
    eq('열릴 때 겨눔은 첫 줄 가운데다 (붙여넣기 판과 같은 산수)', initialChoice(three.length), 1);
    eq('그 겨눔의 표식은 .nhtml 이다', extensionFor(three, initialChoice(three.length)), '.nhtml');
    // 칸의 이름은 **점 없는 소문자 확장자**다(주인 지시 2026-08-23) — 사전에 안 산다.
    eq('칸의 이름은 점 없는 소문자 확장자다', three.map(formatName), ['nabi', 'nhtml', 'md']);
    eq('확장자가 없는 형식은 제 id 로 답한다', formatName(fmt('docx', '')), 'docx');
  }

  // --- `.html` 한 장 — 자립형인가 --------------------------------------------------------------
  {
    const page = writeHtmlFile({ title: '내 <글> & 그것', sheets: ['.a { color: red; }'], body: '<h1>글</h1>' });
    ok('한 장은 doctype 으로 시작한다', page.startsWith('<!doctype html>'));
    ok('한 장은 charset 을 든다', page.includes('<meta charset="utf-8">'));
    ok('제목의 태그 글자는 태그가 안 된다', page.includes('<title>내 &lt;글&gt; &amp; 그것</title>'));
    ok('시트는 인라인으로 실린다', page.includes('<style>\n.a { color: red; }\n</style>'));
    ok('본문은 `.nabi-content` 안에 든다', page.includes('<div class="nabi-content">\n<h1>글</h1>\n</div>'));
    ok(
      '시트 속의 `</style` 은 그 자리에서 태그를 못 닫는다',
      writeHtmlFile({ title: 'x', sheets: ['a::after { content: "</style>"; }'], body: '' }).includes('<\\/style>'),
    );
    ok('말을 주면 `lang` 이 적힌다', writeHtmlFile({ title: 'x', sheets: [], body: '', lang: 'ko' }).includes('<html lang="ko">'));
  }

  // 엑셀에서 온 붙여넣기 — 표(html) + 탭 글자(plain) + 그림(png) 이 한 번에 온다.
  // **그림은 후보가 아니다**: 글자가 하나라도 있으면 파일 처리기는 안 불린다.
  {
    const r = rig(0, [{ w: 'p', ch: [] }]);
    r.take(
      { html: '<table><tr><td>a</td><td>b</td></tr></table>', plain: 'a\tb', types: ['text/html', 'text/plain', 'Files'] },
      [{ name: 'sheet.png', type: 'image/png', size: 12 }],
    );
    await settled();
    eq('엑셀 붙여넣기의 후보는 글자 계열뿐이다 (파일 없음)', r.asked, [['HTML', 'TEXT']]);
    eq('내장 후보는 저마다 그림을 든다', r.icons, [[true, true]]);
    ok('엑셀 붙여넣기에서는 파일 처리기가 안 불린다', r.dropped() === 0);
    ok('첫째를 고르면 표가 선다', JSON.stringify(r.nabi.getJson()).includes('"table"'));
  }

  // 취소 — Esc 가 답한 -1 이다. 문서는 손대지 않는다.
  {
    const r = rig(-1, [{ w: 'p', ch: ['그대로'] }]);
    r.take({ html: '<p>새 글</p>', plain: '새 글\n둘째 줄' });
    await settled();
    eq('취소(-1)면 문서가 안 바뀐다', r.nabi.getJson(), [{ w: 'p', ch: ['그대로'] }]);
  }

  // 자리 번호가 곧 답이다 — 셋째 후보(맨 글자)가 붙는다.
  {
    const mine: IoFilter = {
      id: '내 형식',
      label: { ko: '내 형식', en: 'Mine' },
      paste: () => ({ id: '내 형식', label: '내 형식', build: () => [{ w: 'p', ch: ['내 것'] }] }),
    };
    const r = rig(2, [{ w: 'p', ch: [] }], [mine]);
    r.take({ html: '<p>글</p>', plain: '첫 줄\n둘째 줄' });
    await settled();
    eq('판이 든 자리는 등록순 + 맨 글자다', r.asked, [['내 형식', 'HTML', 'TEXT']]);
    // 호스트 필터의 후보는 그림이 없다 — 판은 그 자리를 이름만으로 세운다(빈 칸을 안 남긴다).
    eq('그림 없는 후보도 그대로 선다', r.icons, [[false, true, true]]);
    eq('2 를 고르면 셋째 후보가 붙는다', r.nabi.getJson(), [{ w: 'p', ch: ['첫 줄'] }, { w: 'p', ch: ['둘째 줄'] }]);
  }

  // 파일만 온 붙여넣기 — 후보가 0 이라 마지막 처리기가 받는다.
  {
    const r = rig(0, [{ w: 'p', ch: ['글'] }]);
    r.take({ types: ['Files'] }, [{ name: 'a.png', type: 'image/png', size: 3 }]);
    await settled();
    ok('글자가 없으면 파일 처리기가 한 번 불린다', r.dropped() === 1);
    eq('그때 판은 안 뜬다', r.asked, []);
    eq('문서도 안 바뀐다', r.nabi.getJson(), [{ w: 'p', ch: ['글'] }]);
  }

  // 한 줄 평문 — 후보가 하나뿐이라 판이 안 뜨고, 문단을 안 쪼갠다.
  {
    const r = rig(0, [{ w: 'p', ch: ['앞'] }]);
    r.nabi.select(caretAt({ path: [0], offset: 1 }));
    r.take({ plain: '이어 쓴다' });
    await settled();
    eq('한 줄 평문은 판 없이 캐럿에 이어 쓴다', r.nabi.getJson(), [{ w: 'p', ch: ['앞이어 쓴다'] }]);
    eq('그 길에는 판이 안 뜬다', r.asked, []);
  }

  // --- 나비 → 나비 붙여넣기 (260823_007) -------------------------------------------------------
  //
  // 복사·잘라내기 때 떠 둔 조각이 그대로 돌아오면 판을 안 띄운다. 기억은 전역 하나이고
  // 소비되지 않는다 — 한 번 잘라 여러 번 붙이는 걸음이 그것으로 산다.
  {
    // 우리가 DOM 에서 뜨는 조각의 모양 — 편집기 HTML 이라 `data-key` 를 든다.
    const mine = '<p data-key="k1">나비 글</p>';
    // 크롬이 되돌려 주는 모양 — charset 과 조각 주석을 두른다.
    const chrome = `<meta charset='utf-8'><!--StartFragment-->${mine}<!--EndFragment-->`;
    // 사파리가 되돌려 주는 모양 — 한 장을 통째로 씌우고 조각에 없던 스타일을 덧입힌다.
    const safari =
      '<html><head><meta charset="utf-8"></head><body>' +
      '<!--StartFragment--><p data-key="k1" style="color: rgb(0, 0, 0);">나비 글</p><!--EndFragment-->' +
      '</body></html>';

    // 포장 걷기 — 값이 아닌 것은 다 떨어진다.
    eq('포장을 걷으면 조각만 남는다', normalizeClipHtml(chrome), mine);
    eq('한 장으로 씌운 것도 조각만 남는다', normalizeClipHtml('<html><body> ' + mine + ' </body></html>'), mine);
    eq('맨 글자는 태그를 다 걷는다', clipText(chrome), '나비 글');
    ok('나비 표식은 `data-key` 다', fromNabi(mine) && !fromNabi('<p>남의 글</p>'));

    ok('①  포장만 다르면 같은 것이다', sameClip(mine, chrome));
    ok('②  브라우저가 조상 태그를 얹어도 품으면 같다', sameClip('나비 글', `<meta charset='utf-8'><ul><li>나비 글</li></ul>`));
    ok('③  스타일이 덧입혀져도 맨 글자와 표식으로 잡는다', sameClip(mine, safari));
    ok('밖에서 온 같은 글자는 표식이 없어 안 걸린다', !sameClip(mine, '<p>나비 글</p><p>덤</p>'));
    ok('내용이 다르면 안 걸린다', !sameClip(mine, '<p data-key="k9">남의 글</p>'));
    ok('기억이 비었으면 안 걸린다', !sameClip('', chrome));
    ok('받침뿐인 껍데기끼리는 안 걸린다', !sameClip('<br/>', '<meta charset="utf-8"><br/>'));

    // 붙여넣기 흐름 — 판이 뜨나 안 뜨나.
    forgetClip();
    {
      const r = rig(1, [{ w: 'p', ch: [] }]);
      r.take({ html: chrome, plain: '나비 글' });
      await settled();
      eq('기억이 비어 있으면 지금까지처럼 판이 뜬다', r.asked, [['HTML', 'TEXT']]);
    }

    rememberClip(mine);
    eq('기억은 마지막 조각 하나다', clipMemory(), mine);
    {
      const r = rig(1, [{ w: 'p', ch: [] }]);
      r.take({ html: chrome, plain: '나비 글' });
      await settled();
      eq('나비에서 복사한 것은 판 없이 붙는다', r.asked, []);
      eq('그때 붙는 것은 html 후보다', r.nabi.getJson(), [{ w: 'p', ch: ['나비 글'] }]);
    }
    {
      // 잘라내기 한 번, 붙여넣기 여러 번 — 기억은 소비되지 않는다.
      const r = rig(1, [{ w: 'p', ch: [] }]);
      r.take({ html: chrome, plain: '나비 글' });
      r.take({ html: safari, plain: '나비 글' });
      await settled();
      eq('한 번 기억하면 여러 번 붙여도 판이 안 뜬다', r.asked, []);
      ok('기억은 붙여넣기로 안 지워진다', clipMemory() === mine);
    }
    {
      // 밖에서 새로 복사한 것 — 기억은 그대로인데 내용이 갈려 일반 흐름이다.
      const r = rig(1, [{ w: 'p', ch: [] }]);
      r.take({ html: '<p>남의 편집기 글</p>', plain: '남의 편집기 글' });
      await settled();
      eq('기억과 다른 html 은 지금까지처럼 판이 뜬다', r.asked, [['HTML', 'TEXT']]);
    }
    forgetClip();
  }

  // --- 덧입힌 style 은 포장이다 (260823_008 ㉠) -------------------------------------------------
  //
  // 우리 조립은 인라인 `style` 을 한 글자도 안 낸다 — 되돌아온 html 의 `style=` 은 100%
  // 브라우저가 덧입힌 것이다. 이것이 포장에 안 들었을 때, 마크가 하나라도 걸린 부분 선택
  // (파일링크·형광펜)은 ①②를 다 어긋나고 ③ 은 `data-key` 를 요구하는데 마크에는 그 표식이
  // 구조적으로 없어서 — 판이 떴다.
  {
    const link = '<a href="https://x/f.txt" data-nabi-file="txt" download="">첨부파일</a>';
    const dressed = `<meta charset='utf-8'><a href="https://x/f.txt" data-nabi-file="txt" download="" style="color: rgb(0, 0, 0); font-size: 16px">첨부파일</a>`;
    ok('덧입힌 style 은 포장이라 같은 것으로 본다', sameClip(link, dressed));
    ok('홑따옴표 style 도 걷힌다', sameClip(link, link.replace('download=""', `download="" style='color: red'`)));
    eq('포장 걷기는 style 만 걷고 다른 속성은 안 건드린다', normalizeClipHtml(dressed), link);
    ok('style 을 걷어도 알맹이가 다르면 안 걸린다', !sameClip(link, '<a href="https://x/f.txt" style="color: red">첨부파일</a>'));
  }

  // --- 클립보드에 직접 싣기 (260823_008 ㉡) ----------------------------------------------------
  //
  // 봉해진 첨부는 `user-select: none` 이라 크롬이 클립보드에 아예 안 실었다(실측). 그래서
  // 실을 글자를 우리가 짓는다. 조각 다듬기는 글자 함수라 DOM 없이 여기서 잡히고, 조상 훑기
  // (`clipContextOf`)만 실기의 몫이다.
  {
    const raw =
      '<a href="https://x/f.txt" data-nabi-file="txt" download="" contenteditable="false"' +
      ' draggable="false" data-nabi-picked="">첨부파일</a>';
    const dressed = dressClipHtml(raw);
    ok('편집기 전용 봉인은 걷힌다', !dressed.includes('contenteditable') && !dressed.includes('draggable'));
    ok('고른 표시도 걷힌다', !dressed.includes('data-nabi-picked'));
    eq(
      '파일링크의 값은 그대로 산다',
      dressed,
      '<a href="https://x/f.txt" data-nabi-file="txt" download="">첨부파일</a>',
    );

    // 받침 br 은 **노드째** 걷는다 — 속성만 걷으면 진짜 라인이 되어 없던 줄이 생긴다.
    eq('받침 br 은 노드째 걷힌다', dressClipHtml('<p data-key="k1">글<br data-nabi-filler=""></p>'), '<p data-key="k1">글</p>');
    eq('진짜 라인은 그대로 산다', dressClipHtml('<p data-key="k1">앞<br>뒤</p>'), '<p data-key="k1">앞<br>뒤</p>');
    ok('data-key 는 남긴다 — ③ 겹의 잣대다', fromNabi(dressClipHtml('<p data-key="k1">글</p>')));

    // 블록 맥락 되씌우기 — 조상은 안쪽부터 온다.
    eq('조상을 안쪽부터 두른다', wrapClipHtml('글', ['<b>', '<h1 data-key="k1">']), '<h1 data-key="k1"><b>글</b></h1>');
    eq('조상이 없으면 조각 그대로다', wrapClipHtml('글', []), '글');

    // 싣기 — 실은 글자와 기억이 **같은 글자**여야 `sameClip` 의 ① 이 언제나 선다.
    forgetClip();
    const loaded: Record<string, string> = {};
    loadClipboard({ setData: (type, value) => { loaded[type] = value; } }, dressed, '첨부파일');
    eq('html 을 우리가 싣는다', loaded['text/html'], dressed);
    eq('맨 글자도 함께 싣는다', loaded['text/plain'], '첨부파일');
    eq('기억과 실은 글자가 같다', clipMemory(), dressed);
    ok('그래서 되돌아오면 ① 겹이 선다', sameClip(clipMemory(), `<meta charset='utf-8'>${dressed}`));
    forgetClip();
  }

  // --- 첨부는 문단으로 감싸고 빈 문단을 잇는다 (260823_010) ------------------------------------
  //
  // 주인의 확정: "파일링크는 링크와 달리 object 객체로 인식하는 게 맞기 때문에 예외적으로 빈 줄을
  // 하나 더 넣어줘. 안 그러면 파일링크끼리 엉켜서 길어지는 이상한 현상이 일어나."
  {
    const link = '<a href="https://x/f.txt" data-nabi-file="txt" download="">첨부파일</a>';

    ok('첨부 하나뿐인 조각을 알아본다', loneFileLink(link));
    ok('앞뒤 공백은 셈에 안 든다', loneFileLink(`  ${link}\n`));
    ok('글자가 섞이면 아니다 — 문장을 복사한 것이다', !loneFileLink(`앞 ${link} 뒤`));
    ok('첨부 둘도 아니다', !loneFileLink(link + link));
    ok('표식 없는 그냥 링크는 아니다', !loneFileLink('<a href="https://x/">링크</a>'));
    ok('표식이 빈 첨부도 아니다 — attach 가 그것을 첨부로 안 센다', !loneFileLink(link.replace('"txt"', '""')));

    eq('문단으로 감싸고 빈 문단을 **뒤에** 잇는다', fileClipHtml(link), `<p>${link}</p><p><br/></p>`);

    // 실은 글자와 기억이 같은 함수에서 나오므로 판정이 어긋날 자리가 없다.
    forgetClip();
    const loaded: Record<string, string> = {};
    const html = fileClipHtml(link);
    loadClipboard({ setData: (type, value) => { loaded[type] = value; } }, html, '첨부파일');
    eq('감싼 글자를 그대로 싣는다', loaded['text/html'], html);
    ok('되돌아와도 판이 안 뜬다', sameClip(clipMemory(), `<meta charset='utf-8'>${html}`));
    // 브라우저는 빈 태그의 닫는 빗금을 안 적는다 — 그 하나로 갈리면 안 된다.
    ok('br 의 닫는 빗금이 걷혀도 같다', sameClip(clipMemory(), `<meta charset='utf-8'>${html.replace('<br/>', '<br>')}`));
    forgetClip();

    eq('빈 태그의 빗금은 포장으로 센다', normalizeClipHtml('<p><br/></p>'), '<p><br></p>');
    eq('빗금 앞의 공백도 함께 걷힌다', normalizeClipHtml('<img src="u" />'), '<img src="u">');
  }
}

done('io');
