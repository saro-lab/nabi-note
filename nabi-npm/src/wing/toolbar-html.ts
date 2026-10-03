import type { LocaleInput } from '../locale/index.js';
// 툴바의 글자 — 단추 줄을 DOM 없이 그린다. 캐럿도 문서도 안 보는 순수한 값이라 나오는 글자가 상수다.
// `ui`가 아니라 `wing` 층에 사는 까닭은 서버(`nabi-note/ssr`)가 이 글자를 불러야 하는데 ssr 엔트리는
// `ui`를 안 딛기 때문이고, `html` 층에 안 두는 까닭은 여기 들어오는 값이 사용자 문서가 아니라
// 개발자가 적은 날개 선언·사전의 말이라 신뢰 경계가 다르기 때문이다.
// The toolbar's markup, rendered with no DOM — a pure function of (registry, locale, group order) with no knowledge of caret or document, so its output is constant. Lives in the `wing` layer rather than `ui` because the server (`nabi-note/ssr`) must call it and the ssr entry never touches `ui`; lives outside `html` because the values here are developer-written wing declarations and dict strings, not user documents, so they cross a different trust boundary.
import type { Registry, Wing, WingButton } from './index.js';
import { makeTranslator, type Translator } from '../locale/index.js';
import { iconHtml } from '../style/icon.js';

// 기본 그룹 순서 — 글에 가까운 것부터 문서 전체의 일까지, 워드·구글 문서의 관례를 따른다.
// The default group order, from text-level formatting to whole-document actions, following Word/Google Docs convention.
export const TOOLBAR_GROUPS: readonly string[] = [
  'font',
  'heading',
  'emphasis',
  'script',
  'color',
  'link',
  'align',
  'list',
  'structure',
  'media',
  'container',
  'clear',
  'file',
];

// 아이콘 한 장 — path 몇 개를 감싸는 껍데기다. 글자를 돌려줄 뿐 DOM을 안 만진다.
// One icon — a shell wrapping a few paths; returns a string only, never touches the DOM.
export function iconSvg(body: string, strokeWidth = 1.4): string {
  return (
    `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="${strokeWidth}"` +
    ` stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`
  );
}

// 단추 한 자리 — 그리는 쪽(여기)과 배선하는 쪽(ui/toolbar)이 같은 목록을 본다.
// One button slot; the renderer here and the wiring in ui/toolbar both read the same list.
export interface ToolbarSlot {
  readonly wing: Wing;
  readonly decl: WingButton;
  // data-name — 힌트·그물·배선이 단추를 찾는 손잡이. 한 wing이 단추를 여럿 내면 이름도 여럿이다.
  // data-name, the handle hints/hit-testing/wiring use to find a button; a wing with multiple buttons gets multiple names.
  readonly name: string;
  readonly group: string;
  readonly label: string;
  // 눈에 보이는 이름표 — 가속키가 있으면 그것까지 붙은 말이다.
  // The visible tooltip; includes the accelerator when one exists.
  readonly tip: string;
}

// 연타 키의 보이는 이름 — `KeyboardEvent.key` 를 날로 적으면 'Escape' 가 뜬다. 자판 글자로 옮긴다.
// The double-tap key's display name; a raw `KeyboardEvent.key` would show 'Escape', so this maps it to the label on the physical key.
const KEY_LABELS: Readonly<Record<string, string>> = { Escape: 'Esc' };

// 이 단추를 부르는 연타 키가 있나 — 같은 커맨드를 가리키는 `doubleKeys` 의 키를 찾는다.
// Whether a double-tap key fires this button; looks up `doubleKeys` for a key pointing at the same command.
function doubleKeyOf(wing: Wing, decl: WingButton): string | undefined {
  const action = decl.action;
  if (!action || action.kind !== 'command') return undefined;
  const found = Object.entries(wing.doubleKeys ?? {}).find(([, name]) => name === action.command);
  return found ? (KEY_LABELS[found[0]] ?? found[0]) : undefined;
}

// 등록된 날개 → 단추 자리 목록. 순서가 곧 줄의 순서다.
// Registered wings to a list of button slots; array order is row order.
export function toolbarSlots(
  registry: Registry,
  t: Translator,
  order: readonly string[] = TOOLBAR_GROUPS,
): readonly ToolbarSlot[] {
  const wings = [...registry.wings].filter((wing) => wing.button || wing.buttons);
  const rank = (wing: Wing): number => {
    const at = order.indexOf(wing.buttons?.[0]?.group ?? wing.button?.group ?? '');
    return at < 0 ? order.length : at;
  };
  wings.sort((a, b) => rank(a) - rank(b));

  const slots: ToolbarSlot[] = [];
  for (const wing of wings) {
    const decls = wing.buttons ?? (wing.button ? [wing.button] : []);
    for (const decl of decls) {
      const label = t.pick(decl.label, `wing.${wing.w}.${decl.name ?? ''}`);
      const twice = doubleKeyOf(wing, decl);
      const tip = decl.accelerator ? `${label} (Ctrl/Cmd+${decl.accelerator.slice(4).toUpperCase()})` : label;
      slots.push({
        wing,
        decl,
        name: decl.name === undefined ? wing.w : `${wing.w}:${decl.name}`,
        group: decl.group,
        label,
        tip: twice ? t.t('twiceTail', { label: tip, key: twice }) : tip,
      });
    }
  }
  return slots;
}

// 이 모듈이 HTML로 만드는 값은 날개 선언과 사전의 말뿐이지만, 그래도 이스케이프는 한다 — 꺾쇠
// 하나가 줄을 깨뜨리는 것은 사고이지 공격이 아니되, 깨지는 것 자체는 막아야 한다.
// The only values this module turns into HTML are wing declarations and dict strings, yet it still escapes them — a stray bracket breaking the markup would be an accident, not an attack, but it still shouldn't happen.
const esc = (value: string): string =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function buttonHtml(slot: ToolbarSlot, quick = false): string {
  const { wing, decl } = slot;
  const classes = decl.icon || decl.svg ? 'nabi-btn' : 'nabi-btn nabi-word';
  const inner =
    decl.icon || decl.svg
      ? iconHtml(`toolbar-${slot.name}`, decl.icon, decl.svg, wing.place === 'mark' ? 1.6 : 1.4)
      : esc(slot.label);
  return (
    `<button class="${classes}" type="button" data-name="${esc(slot.name)}"` +
    (quick ? ' data-nabi-quick="true"' : '') +
    ` aria-label="${esc(slot.label)}" data-nabi-tip="${esc(slot.tip)}" data-wing="${esc(wing.w)}"` +
    `>${inner}</button>`
  );
}

export interface ToolbarHtmlOptions {
  readonly layout?: 'compact' | 'wrap';
  readonly quick?: readonly string[];
  readonly registry: Registry;
  readonly locale?: LocaleInput;
  readonly translator?: Translator;
  // 그룹 순서 — 안 주면 `TOOLBAR_GROUPS` 를 따른다.
  // Group order; falls back to `TOOLBAR_GROUPS` if omitted.
  readonly groups?: readonly string[];
}

// 툴바 그릇의 속 글자. 호스트는 이것을 제 `.nabi-toolbar` 안에 그대로 붙인다. 빈 그룹도 함께 낸다 —
// 캐럿에 따라 그룹이 통째로 숨는 일은 mount 뒤 `hidden` 이 맡는다.
// The toolbar container's inner markup; hosts drop it directly into their own `.nabi-toolbar`. Empty groups are emitted too — hiding a group entirely based on the caret is handled by `hidden` after mount.
export function renderToolbarHtml(options: ToolbarHtmlOptions): string {
  const t = options.translator ?? makeTranslator(options.locale);
  const order = options.groups ?? TOOLBAR_GROUPS;
  const slots = toolbarSlots(options.registry, t, order);
  const compact = options.layout !== 'wrap';
  const quick = options.quick ?? ['b', 'i', 'tc', 'fs'];
  const byGroup = new Map<string, string[]>();
  for (const name of order) byGroup.set(name, []);
  for (const slot of slots) {
    const list = byGroup.get(slot.group);
    if (list) list.push(buttonHtml(slot, compact && quick.includes(slot.name)));
    else byGroup.set(slot.group, [buttonHtml(slot, compact && quick.includes(slot.name))]);
  }
  let html = compact
    ? `<button type="button" class="nabi-btn nabi-compact-tools" data-name="tools" data-nabi-compact="true" aria-label="${esc(t.t('tools'))}" data-nabi-tip="${esc(t.t('twiceTail', { label: t.t('tools'), key: 'Shift' }))}" aria-expanded="false">☷</button>`
    : '';
  for (const [name, list] of byGroup) {
    html += `<div class="nabi-group" data-group="${esc(name)}">${list.join('')}</div>`;
  }
  return html;
}

// 미리보기·전체화면은 날개가 아니다 — 덮개의 부품이라 registry 훑기에 안 잡힌다. 같은 값이
// 상수이므로 같은 길(HTML 문자열)로 낸다.
// Preview and fullscreen aren't wings — they're chrome, so they don't show up in a registry scan. Emitted the same way (a constant HTML string) since the value is just as constant.
export const PREVIEW_ICON =
  '<path d="M1.5 8s2.5-4 6.5-4 6.5 4 6.5 4-2.5 4-6.5 4-6.5-4-6.5-4Z"/><circle cx="8" cy="8" r="1.75"/>';
export const FULLSCREEN_ENTER_ICON = '<path d="M6 2.75H2.75V6M10 2.75h3.25V6M6 13.25H2.75V10M10 13.25h3.25V10"/>';
export const FULLSCREEN_EXIT_ICON = '<path d="M2.75 6H6V2.75M13.25 6H10V2.75M2.75 10H6v3.25M13.25 10H10v3.25"/>';

// 미리 그리는 것은 처음 상태다 — 전체화면은 늘 꺼진 채로 뜬다(들어가기 아이콘). mount 뒤 `paint()`
// 가 실제 상태로 다시 칠하므로 어긋날 자리가 없다.
// What's pre-rendered is always the initial state — fullscreen always starts drawn as off (the "enter" icon); `paint()` repaints to the real state after mount, so there's no window for it to be wrong.
export interface ViewToolsVisibility {
  readonly showPreview?: boolean;
  readonly showFullscreen?: boolean;
}

export interface ViewToolsHtmlOptions extends ViewToolsVisibility {
  readonly locale?: LocaleInput;
  readonly translator?: Translator;
}

export function renderViewToolsHtml(options: ViewToolsHtmlOptions = {}): string {
  const showPreview = options.showPreview !== false;
  const showFullscreen = options.showFullscreen !== false;
  if (!showPreview && !showFullscreen) return '';
  const t = options.translator ?? makeTranslator(options.locale);
  const one = (name: string, label: string, icon: string): string =>
    `<button class="nabi-btn" type="button" data-name="${esc(name)}"` +
    ` aria-label="${esc(label)}" data-nabi-tip="${esc(label)}">${iconHtml(`view-${icon}`, icon)}</button>`;
  return (
    '<span class="nabi-tools">' +
    (showPreview ? one('preview', t.t('preview'), 'preview') : '') +
    (showFullscreen ? one('fullscreen', t.t('fullscreenEnter'), 'fullscreen-enter') : '') +
    '</span>'
  );
}
