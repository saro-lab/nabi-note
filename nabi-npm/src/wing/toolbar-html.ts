// 툴바의 **글자** — 단추 줄을 DOM 없이 그린다.
//
// 여기 사는 까닭: 툴바 마크업은 `(registry, 말, 그룹 순서)` 만 보는 **순수한 값**이다. 캐럿도
// 문서도 안 본다 — 눌림(`aria-pressed`)과 숨김은 mount 뒤에 이미 서 있는 단추의 속성만
// 토글하는 일이라 여기 안 들어온다. 그래서 나오는 글자가 **상수**다: 서버가 뜰 때 한 번 부르고
// 그 글자를 영원히 재쓴다.
//
// **`ui` 가 아니라 `wing` 층인 까닭**: 이 글자는 날개 선언의 투영이고, 서버(`nabi-note/ssr`)가
// 불러야 한다. ssr 엔트리는 `ui` 를 한 파일도 안 딛는 것이 그물의 규칙이다.
//
// **`html` 층에 안 두는 까닭**: 그쪽은 "밖에서 온 값이 HTML 이 되는 길은 render 안의 태그 문
// 하나뿐" 이라는 신뢰 경계를 지킨다(06). 여기 들어오는 값은 문서가 아니라 **날개 선언과 사전의
// 말**이다 — 개발자가 적은 것이지 사용자가 적은 것이 아니다. 그 둘을 같은 문에 섞지 않는다.
import type { Registry, Wing, WingButton } from './index.js';
import { makeTranslator, type Translator } from '../locale/index.js';

// 기본 그룹 순서 — 글에 가까운 것부터 문서 전체의 일까지.
// 줄의 차례는 워드·구글 문서의 관례를 따른다: 글꼴·크기 → 제목 → 강조 → 첨자 → 색 → 링크 →
// 정렬 → 목록 → 짜임새 → 매체 → 그릇 → 서식 지우기 → 파일.
export const TOOLBAR_GROUPS: readonly string[] = [
  'font', 'heading', 'emphasis', 'script', 'color', 'link',
  'align', 'list', 'structure', 'media', 'container', 'clear', 'file',
];

// 아이콘 한 장 — path 몇 개를 감싸는 껍데기다. **글자를 돌려줄 뿐 DOM 을 안 만진다.**
export function iconSvg(body: string, strokeWidth = 1.4): string {
  return (
    `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="${strokeWidth}"` +
    ` stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`
  );
}

// 단추 한 자리 — 그리는 쪽(여기)과 배선하는 쪽(ui/toolbar)이 **같은 목록**을 본다.
export interface ToolbarSlot {
  readonly wing: Wing;
  readonly decl: WingButton;
  // data-name — 힌트·그물·배선이 단추를 찾는 손잡이. 한 wing 이 단추를 여럿 내면 이름도 여럿이다.
  readonly name: string;
  readonly group: string;
  readonly label: string;
  // 눈에 보이는 이름표 — 가속키가 있으면 그것까지 붙은 말이다.
  readonly tip: string;
}

// 등록된 날개 → 단추 자리 목록. 순서가 곧 줄의 순서다.
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
      slots.push({
        wing,
        decl,
        name: decl.name === undefined ? wing.w : `${wing.w}:${decl.name}`,
        group: decl.group,
        label,
        tip: decl.shortcut ? t.t('hintTail', { label, key: decl.shortcut }) : label,
      });
    }
  }
  return slots;
}

// --- 글자 짓기 -------------------------------------------------------------------------------
// 이 모듈이 HTML 로 만드는 값은 **날개 선언과 사전의 말** 둘뿐이다(위 머리말). 그래도 이스케이프는
// 한다 — 사전이든 선언이든 사람이 적는 것이고, 꺾쇠 하나가 줄을 깨뜨리는 것은 사고이지 공격이 아니다.
const esc = (value: string): string =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function buttonHtml(slot: ToolbarSlot): string {
  const { wing, decl } = slot;
  const classes = decl.svg ? 'nabi-btn' : 'nabi-btn nabi-word';
  const inner = decl.svg
    ? iconSvg(decl.svg, wing.place === 'mark' ? 1.6 : 1.4)
    : esc(slot.label);
  return (
    `<button class="${classes}" type="button" data-name="${esc(slot.name)}"` +
    ` aria-label="${esc(slot.label)}" data-nabi-tip="${esc(slot.tip)}" data-wing="${esc(wing.w)}"` +
    (decl.shortcut ? ` data-hint="${esc(decl.shortcut)}"` : '') +
    `>${inner}</button>`
  );
}

export interface ToolbarHtmlOptions {
  readonly registry: Registry;
  readonly locale?: string;
  readonly translator?: Translator;
  // 그룹 순서 — 안 주면 `TOOLBAR_GROUPS` 를 따른다.
  readonly groups?: readonly string[];
}

// 툴바 그릇의 **속 글자**. 호스트는 이것을 제 `.nabi-toolbar` 안에 그대로 붙인다.
//
// 빈 그룹도 함께 낸다 — 그릇을 먼저 세우고 단추를 담는 것이 옛 조립의 순서였고, 그 순서가 곧
// 줄의 순서다. 캐럿에 따라 그룹이 통째로 숨는 일은 mount 뒤 `hidden` 이 맡는다.
export function renderToolbarHtml(options: ToolbarHtmlOptions): string {
  const t = options.translator ?? makeTranslator(options.locale);
  const order = options.groups ?? TOOLBAR_GROUPS;
  const slots = toolbarSlots(options.registry, t, order);
  const byGroup = new Map<string, string[]>();
  for (const name of order) byGroup.set(name, []);
  for (const slot of slots) {
    const list = byGroup.get(slot.group);
    if (list) list.push(buttonHtml(slot));
    else byGroup.set(slot.group, [buttonHtml(slot)]);
  }
  let html = '';
  for (const [name, list] of byGroup) {
    html += `<div class="nabi-group" data-group="${esc(name)}">${list.join('')}</div>`;
  }
  return html;
}

// --- 뷰 도구 둘 (097) --------------------------------------------------------------------------
// 미리보기·전체화면은 **날개가 아니다** — 덮개의 부품이라 registry 훑기에 안 잡힌다. 그래서
// 096 이 툴바를 미리 그려도 이 둘만 늦게 떴다. 같은 값이 상수이므로 같은 길로 낸다.
export const PREVIEW_ICON =
  '<path d="M1.5 8s2.5-4 6.5-4 6.5 4 6.5 4-2.5 4-6.5 4-6.5-4-6.5-4Z"/><circle cx="8" cy="8" r="1.75"/>';
export const FULLSCREEN_ENTER_ICON =
  '<path d="M6 2.75H2.75V6M10 2.75h3.25V6M6 13.25H2.75V10M10 13.25h3.25V10"/>';
export const FULLSCREEN_EXIT_ICON =
  '<path d="M2.75 6H6V2.75M13.25 6H10V2.75M2.75 10H6v3.25M13.25 10H10v3.25"/>';

// 미리 그리는 것은 **처음 상태**다 — 전체화면은 언제나 꺼진 채로 뜬다(들어가기 아이콘).
// mount 뒤 `paint()` 가 실제 상태로 다시 칠하므로 어긋날 자리가 없다.
export function renderViewToolsHtml(options: { readonly locale?: string; readonly translator?: Translator }): string {
  const t = options.translator ?? makeTranslator(options.locale);
  const one = (name: string, label: string, svg: string): string =>
    `<button class="nabi-btn" type="button" data-name="${esc(name)}"` +
    ` aria-label="${esc(label)}" data-nabi-tip="${esc(label)}">${iconSvg(svg)}</button>`;
  return (
    '<span class="nabi-tools">' +
    one('preview', t.t('preview'), PREVIEW_ICON) +
    one('fullscreen', t.t('fullscreenEnter'), FULLSCREEN_ENTER_ICON) +
    '</span>'
  );
}
