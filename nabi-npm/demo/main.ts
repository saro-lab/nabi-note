// 데모 **페이지** 자신의 일 — 언어 칩·테마·돋보기·wing 토글·상태 줄·HTML/JSON 판·발행 미리보기.
// 편집기를 세우는 선언은 전부 `editor.ts` 에 있다: 호스트가 베껴 갈 곳은 그 파일이다.
//
// 여기서 한 가지를 더 보인다 — **엔트리가 둘**이라는 것. 편집기는 코어(`../src/index.js`)로
// 서고, 발행 미리보기는 보는 쪽 엔트리(`../src/viewer/index.js`)만으로 산다.
import { demoWings, standEditor, type EditorHosts, type StoodEditor } from './editor.js';
// 시작 문서는 CDN 예문과 나눠 쓰는 한 벌이라 제 파일에 산다 (sample.ts 머리말).
import { SAMPLE } from './sample.js';
import { attachTableSort } from '../src/viewer/index.js';
import type { Wing } from '../src/index.js';

const el = <T extends HTMLElement>(id: string): T => {
  const found = document.getElementById(id);
  if (!found) throw new Error(`demo: #${id} is missing`);
  return found as T;
};


// --- 언어 -------------------------------------------------------------------------------------
// 패키지는 "무슨 언어를 아는가" 를 안 내보낸다 — 사전이 wing 마다 흩어져 있어서다. 그래서 쓸 말은
// 호스트가 고른다. 이 데모는 열넷을 다 보라고 있는 자리다.
const LOCALES: readonly (readonly [string, string])[] = [
  ['ko', '한국어'],
  ['en', 'English'],
  ['ja', '日本語'],
  ['zh', '中文'],
  ['de', 'Deutsch'],
  ['fr', 'Français'],
  ['es', 'Español'],
  ['pt', 'Português'],
  ['ru', 'Русский'],
  ['ar', 'العربية'],
  ['hi', 'हिन्दी'],
  ['bn', 'বাংলা'],
  ['ur', 'اردو'],
  ['id', 'Indonesia'],
];

// 화면이 뜰 때 **한 번만** 섞는다 — 다시 그릴 때마다 섞으면 고르러 가는 손 밑에서 칩이 늘어선다.
// 고정 순서는 늘 같은 둘을 맨 앞에 놓아 나머지 열둘이 안 읽힌다.
const SHUFFLED = ((list: readonly (readonly [string, string])[]) => {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const a = out[i] as readonly [string, string];
    const b = out[j] as readonly [string, string];
    out[i] = b;
    out[j] = a;
  }
  return out;
})(LOCALES);

// --- 자리 -------------------------------------------------------------------------------------

const hosts: EditorHosts = {
  root: el('app'),
  chrome: el('chrome'),
  toolbar: el('toolbar'),
  context: el('context'),
  tools: el('tools'),
  content: el('content'),
};

const sandboxHosts: EditorHosts = {
  root: el('app2'),
  chrome: el('chrome2'),
  toolbar: el('toolbar2'),
  context: el('context2'),
  tools: el('tools2'),
  content: el('content2'),
};

const output = el<HTMLTextAreaElement>('output');
const raw = el<HTMLTextAreaElement>('raw');
const htmlArea = el<HTMLTextAreaElement>('html');
const jsonArea = el<HTMLTextAreaElement>('json');
const htmlDirtyEl = el('html-dirty');
const jsonDirtyEl = el('json-dirty');
const preview = el('preview');
const chips = el('locales');
const wingList = el('wing-list');
const wingCount = el('wing-count');
const statusChars = el('status-chars');
const statusEmpty = el('status-empty');
const statusMarks = el('status-marks');
const undoButton = el<HTMLButtonElement>('undo');
const redoButton = el<HTMLButtonElement>('redo');

// 데모의 시작 언어 — 문서가 영어라 툴바도 영어로 연다. 칩으로 열넷을 다 볼 수 있다.
let locale = 'en';
// 키는 wing 이름이고, 없으면 켜짐이다 — 기본값이 곧 전체라서 목록을 여기 또 적지 않는다.
const picked = new Map<string, boolean>();
let editor: StoodEditor | null = null;
let sandbox: StoodEditor | null = null;
let detachSort: (() => void) | null = null;
let htmlDirty = false;
let jsonDirty = false;

// --- 값 판 ------------------------------------------------------------------------------------

// 글자 수·빈 문서는 나비트리에서 그대로 센다 — 코어가 세어 주기를 기다릴 것 없이 값이 곧 답이다.
function textOf(nodes: readonly unknown[]): string {
  let out = '';
  for (const node of nodes) {
    if (typeof node === 'string') out += node;
    else if (node && typeof node === 'object') out += textOf(((node as { ch?: unknown[] }).ch ?? []));
  }
  return out;
}

const refresh = (): void => {
  if (!editor) return;
  const html = editor.nabi.getHtml();
  output.value = html;
  // 아이디는 **표시에서만** 걷는다 — 정본에는 그대로 있다.
  raw.value = editor.nabi.getEditorHtml().replace(/ data-key="[^"]*"/g, '');
  if (!htmlDirty) htmlArea.value = html;
  if (!jsonDirty) jsonArea.value = JSON.stringify(editor.nabi.getJson());
  htmlDirtyEl.classList.toggle('on', htmlDirty);
  jsonDirtyEl.classList.toggle('on', jsonDirty);

  const text = textOf(editor.nabi.getJson());
  statusChars.textContent = `${text.length} chars`;
  statusEmpty.textContent = text.trim() === '' ? 'empty' : 'filled';

  // "지금 걸린 서식" 은 편집기 자신의 툴바가 이미 답하고 있다 — 그 공식 목록을 읽는다
  // (DOM 을 뒤지지 않는다: `toolbar.buttons` 가 그 자리다).
  const on = editor.toolbar.buttons
    .filter((button) => button.el.getAttribute('aria-pressed') === 'true')
    .map((button) => button.el.getAttribute('aria-label') ?? button.w);
  statusMarks.textContent = on.length > 0 ? `Here: ${on.join(', ')}` : 'No formatting here';
  statusMarks.classList.toggle('is-active', on.length > 0);

  detachSort?.();
  preview.innerHTML = html;
  detachSort = attachTableSort(preview, { tables: 'all' });
};

// --- 세우기 -----------------------------------------------------------------------------------

function pickedWings(): readonly Wing[] {
  return demoWings.filter((wing) => picked.get(wing.w) !== false);
}

// wing 구성은 생성 시점에 정해지므로 바꾸려면 편집기를 다시 만들어야 한다.
function stand(doc: unknown, html?: string): void {
  detachSort?.();
  detachSort = null;
  editor?.unmount();
  hosts.content.innerHTML = '';
  document.documentElement.lang = locale;
  editor = standEditor(hosts, {
    doc,
    locale,
    wings: pickedWings(),
    ...(stickyKeyboard.checked ? {} : { keyboardInset: false }),
  });
  // 치던 글은 **출력 HTML 로 나갔다 다시 들어온다.** 새 구성으로 다시 파싱하기 딱 좋은 모양이고
  // 그래야 꺼 버린 wing 의 껍데기가 벗겨진다 — 형광펜을 끄면 툴바에서만 사라지는 것이 아니라
  // 문서의 `<mark>` 도 평문으로 떨어진다. JSON 으로 실어 나르면 그 껍데기가 그대로 살아남는다.
  if (html !== undefined) editor.nabi.setHtml(html);
  editor.nabi.onChange(refresh);
  standSandbox();
  renderWings();
  applySticky();
  refresh();
  // 콘솔에서 만져 보라고 열어 둔다 — 데모의 일이고, 패키지는 이런 전역을 안 만든다.
  Object.assign(globalThis, { nabi: editor.nabi, registry: editor.registry, surface: editor.surface });
}

function standSandbox(): void {
  const kept = sandbox ? sandbox.nabi.getHtml() : '';
  sandbox?.unmount();
  sandboxHosts.content.innerHTML = '';
  sandbox = standEditor(sandboxHosts, { locale, wings: pickedWings(), bare: true });
  if (kept !== '') sandbox.nabi.setHtml(kept);
}

function remount(): void {
  if (!editor) return;
  stand(undefined, editor.nabi.getHtml());
}

// --- 언어 칩 ----------------------------------------------------------------------------------

function renderLocales(): void {
  chips.replaceChildren();
  for (const [value, name] of SHUFFLED) {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = value === locale ? 'chip is-on' : 'chip';
    chip.textContent = name;
    chip.lang = value;
    chip.title = value;
    chip.setAttribute('aria-pressed', String(value === locale));
    chip.addEventListener('click', () => {
      locale = value;
      renderLocales();
      remount();
    });
    chips.append(chip);
  }
}

// --- wing 칩 ----------------------------------------------------------------------------------
// 단추가 있는 wing만 목록에 선다 — 구조 wing(표의 행·칸, 목록의 항목)은 스스로 못 켜고 못 끈다.

function renderWings(): void {
  const list = demoWings.filter((wing) => wing.button);
  wingList.replaceChildren();
  wingCount.textContent = `${list.filter((wing) => picked.get(wing.w) !== false).length}/${list.length}`;

  for (const wing of list) {
    const on = picked.get(wing.w) !== false;
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = on ? 'chip is-on' : 'chip';
    chip.title = wing.w;
    chip.setAttribute('aria-pressed', String(on));

    const mark = document.createElement('span');
    mark.className = 'mark';
    mark.setAttribute('aria-hidden', 'true');
    // 이름은 편집기가 그린 툴바 단추에서 그대로 읽는다 — 사전을 데모가 또 뒤지지 않는다.
    const label = editor?.toolbar.buttons.find((button) => button.w === wing.w)?.el.getAttribute('aria-label');
    chip.append(mark, label ?? wing.w);

    chip.addEventListener('click', () => {
      picked.set(wing.w, !on);
      remount();
    });
    wingList.append(chip);
  }
}

el('wings-all').addEventListener('click', () => {
  // 비면 전부 켜짐이다 (기본값이 곧 전체).
  picked.clear();
  remount();
});
el('wings-none').addEventListener('click', () => {
  for (const wing of demoWings) if (wing.button) picked.set(wing.w, false);
  remount();
});

// --- toast ------------------------------------------------------------------------------------
// 편집기의 알리는 문($toast)을 그대로 두드린다 — 진짜 부르는 쪽은 wing·업로드·Ask.message 이고
// 이 단추 셋은 그 말이 서는 모습을 보려고 있는 데모의 것이다. 시간이 다른 셋을 이어 누르면
// 남은 시간이 많은 것이 위로 가는 차례가 보이고, 같은 단추를 넷 누르면 상한(3)이 아래부터 걷는다.

el('toast-info').addEventListener('click', () => editor?.nabi.$toast('info', 'Saved.'));
el('toast-warn').addEventListener('click', () =>
  editor?.nabi.$toast('warn', 'Line breaks survive:\nthis is the second line.', 3000),
);
el('toast-error').addEventListener('click', () => editor?.nabi.$toast('error', 'Upload failed — try again.', 5000));

// --- 테마 -------------------------------------------------------------------------------------
// 편집기 API 가 아니다 — `html` 의 `dark`/`light` 클래스로 갈린다. 편집기는 아무것도 모르고 시트가
// 반응하며, 이 페이지의 `--g-*` 도 같은 클래스를 본다.

const themeButton = el<HTMLButtonElement>('theme');
const THEME_KEY = 'nabi-demo-theme';

function setTheme(dark: boolean): void {
  document.documentElement.classList.toggle('dark', dark);
  document.documentElement.classList.toggle('light', !dark);
  themeButton.textContent = dark ? '🌙' : '☀️';
  themeButton.title = dark ? 'Theme: dark' : 'Theme: light';
  localStorage.setItem(THEME_KEY, dark ? 'dark' : 'light');
}

const saved = localStorage.getItem(THEME_KEY);
setTheme(saved !== null ? saved === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches);
themeButton.addEventListener('click', () => setTheme(!document.documentElement.classList.contains('dark')));

// --- 되돌리기 ---------------------------------------------------------------------------------
// 편집기 **밖**의 단추라, 누르는 순간 겨눔이 사라지지 않게 mousedown 을 막는다.

for (const button of [undoButton, redoButton]) {
  button.addEventListener('mousedown', (event) => event.preventDefault());
}
undoButton.addEventListener('click', () => editor?.nabi.undo());
redoButton.addEventListener('click', () => editor?.nabi.redo());

// --- 값 밀어넣기 ------------------------------------------------------------------------------

htmlArea.addEventListener('input', () => {
  htmlDirty = true;
  refresh();
});
jsonArea.addEventListener('input', () => {
  jsonDirty = true;
  refresh();
});

el('html-apply').addEventListener('click', () => {
  editor?.nabi.setHtml(htmlArea.value);
  htmlDirty = false;
  refresh();
});
el('html-reset').addEventListener('click', () => {
  htmlDirty = false;
  refresh();
});
el('json-apply').addEventListener('click', () => {
  try {
    editor?.nabi.setJson(JSON.parse(jsonArea.value));
  } catch {
    // 모양이 아닌 값 — 거절이고, 판은 고친 상태로 남는다.
    return;
  }
  jsonDirty = false;
  refresh();
});
el('json-reset').addEventListener('click', () => {
  jsonDirty = false;
  refresh();
});

// --- 붙는 크롬 --------------------------------------------------------------------------------
// 코어가 주는 것은 셋이고 셋 다 호스트가 쥔다:
//   ① `.nabi-toolbar` 클래스 — 붙을지 말지 (툴바 줄 + 상황 줄이 **한 덩어리**로 붙는다)
//   ② `--nabi-sticky-top` 토큰 — 얼마나 내려 붙을지. 단위까지 호스트의 것이라 수가 아니라 길이다
//   ③ `mountSticky` — 모바일 키보드가 먹은 만큼의 보정. 붙이거나 마는 mount 하나

const stickyOn = el<HTMLInputElement>('sticky-on');
const stickyKeyboard = el<HTMLInputElement>('sticky-keyboard');
const stickyTop = el<HTMLInputElement>('sticky-top');
const stickyUnit = el<HTMLSelectElement>('sticky-unit');

function applySticky(): void {
  hosts.chrome.classList.toggle('nabi-toolbar', stickyOn.checked);
  const top = Math.max(0, Number(stickyTop.value) || 0);
  hosts.root.style.setProperty('--nabi-sticky-top', `${top}${stickyUnit.value}`);
}

for (const control of [stickyOn, stickyTop, stickyUnit]) {
  control.addEventListener('change', applySticky);
}
stickyTop.addEventListener('input', applySticky);
// 보정은 mount 라 껐다 켜려면 편집기를 다시 세운다 — 스위치 하나가 배선 하나를 켜고 끈다.
stickyKeyboard.addEventListener('change', () => remount());

// --- 돋보기 -----------------------------------------------------------------------------------
// 루트 글자 크기를 몰아 이 화면의 `rem` 전부가 한 번에 따라오게 한다. `body` 에 걸면 아무것도
// 안 움직인다 — `rem` 은 루트만 보기 때문이다.

const ZOOM_MIN = 80;
const ZOOM_MAX = 300;
const ZOOM_STEP = 10;
const ZOOM_BASE_PX = 16;

const zoomRange = el<HTMLInputElement>('zoom');
const zoomLabel = el<HTMLButtonElement>('zoom-reset');

// 끄는 동안은 숫자만 움직인다 — 화면은 손을 뗄 때 다시 그린다. 매 걸음 바꾸면 화면이 떤다.
const showZoom = (percent: number): void => {
  zoomLabel.textContent = `${percent}%`;
};

function applyZoom(percent: number): void {
  const clamped = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, percent));
  zoomRange.value = String(clamped);
  showZoom(clamped);
  document.documentElement.style.fontSize = `${(ZOOM_BASE_PX * clamped) / 100}px`;
}

zoomRange.addEventListener('input', () => showZoom(Number(zoomRange.value)));
zoomRange.addEventListener('change', () => applyZoom(Number(zoomRange.value)));
zoomLabel.addEventListener('click', () => applyZoom(100));
el('zoom-out').addEventListener('click', () => applyZoom(Number(zoomRange.value) - ZOOM_STEP));
el('zoom-in').addEventListener('click', () => applyZoom(Number(zoomRange.value) + ZOOM_STEP));

// --- 세운다 -----------------------------------------------------------------------------------

renderLocales();
stand(SAMPLE);
