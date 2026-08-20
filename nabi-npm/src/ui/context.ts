// 상황 줄 — 캐럿이 든 것들의 손잡이. **컨트롤 종류별로 렌더러가 갈린다**: 옛 판의 230줄짜리
// refresh 하나가 여기서 "무엇을 그릴지 고르는 순수부(groups.ts)" + "종류마다 15줄짜리 렌더러
// 넷" 으로 나뉜다. 새 컨트롤 종류가 생겨도 이 파일의 다른 곳은 안 건드린다.
//
// 눌림 판정은 툴바와 **같은 한 벌**이다 (`press.ts`). 값 읽는 길도 하나다 — `attr` 이 선언돼
// 있으면 겨눔 노드의 그 attr, 아니면 그룹이 든 조상 줄기가 합쳐 답한 상태 토큰(`stackValue`).
// 그리고 상태 토큰은 "같다"가 아니라 "품는가"로 읽는다 (10 판단 — 표의 칸이 'merged th' 를
// 답하고 표가 'sort' 를 답한다. 둘은 같은 줄의 단추라 한 벌로 읽혀야 한다).
import type { ElementNode } from '../schema/index.js';
import type { Nabi } from '../editor/index.js';
import type { ContextControl, Registry, Wing } from '../wing/index.js';
import { localeDirection, makeTranslator, type Translator } from '../locale/index.js';
import { bandFix, bandOf, type Rect } from './band.js';
import { controlValueOf, hasToken, stackValue } from './press.js';
import { contextGroupsAt, type ContextGroup } from './groups.js';
import { focusQuiet, make } from './parts/dom.js';
import { iconButton, setPressed } from './parts/button.js';
import { openPrompt } from './parts/prompt.js';
import type { Panel } from './parts/panel.js';
import { watchSettle, type Settle } from './parts/settle.js';
import { openLightbox } from './overlay.js';
import type { Overlay } from './overlay.js';

export interface ContextToolbarOptions {
  readonly nabi: Nabi;
  readonly registry: Registry;
  readonly root: HTMLElement;
  readonly surface?: HTMLElement;
  readonly locale?: string;
  readonly translator?: Translator;
  readonly settle?: Settle;
}

export interface ContextToolbar {
  readonly root: HTMLElement;
  // 공식 API — 힌트가 이 줄을 훑을 때 DOM 구조를 하드코딩하지 않게 (판정 19).
  groups(): readonly ContextGroupView[];
  buttons(): readonly HTMLButtonElement[];
  refresh(): void;
  unmount(): void;
}

export interface ContextGroupView {
  readonly w: string;
  readonly el: HTMLElement;
  readonly buttons: readonly HTMLButtonElement[];
  // 이 그룹이 겨누는 노드 — 판이 지금 값을 미리 채울 때 읽는다.
  readonly node: ElementNode;
}

// 렌더러 하나가 받는 것 — 그룹의 겨눔과, 밖으로 나가는 문 셋(커맨드·판·크게 보기).
interface Draw {
  readonly owner: Document;
  readonly wing: Wing;
  readonly node: ElementNode;
  // 이 그룹의 상태 토큰 — 겨눔 하나가 아니라 소유 조상 줄기가 합쳐 답한 값이다. 그룹마다 한 번만
  // 읽어 컨트롤 전부가 나눠 쓴다(같은 줄의 단추가 서로 다른 답을 볼 자리가 없다).
  readonly value: string | undefined;
  readonly t: Translator;
  // 그룹이 이미 자기 이름을 세웠는가 — 세웠으면 컨트롤은 자기 이름표를 또 세우지 않는다
  // (슬라이더 하나짜리 그룹에서 같은 낱말이 두 번 서던 자리).
  readonly named: boolean;
  run(command: string, args?: Readonly<Record<string, unknown>>): void;
  // 판을 띄운다 — 열려 있던 판은 먼저 닫힌다(한 번에 하나).
  ask(anchor: HTMLElement, control: Extract<ContextControl, { kind: 'prompt' }>): void;
  // 그림 하나를 크게 — 커맨드가 아니다(본다고 문서가 안 바뀐다).
  view(src: string, alt?: string): void;
}

export function mountContextToolbar(options: ContextToolbarOptions): ContextToolbar {
  const { nabi, registry, root } = options;
  const owner = root.ownerDocument;
  const t = options.translator ?? makeTranslator(options.locale);
  // 말이 곧 방향이다 (098) — 툴바와 같은 규칙이다.
  if (options.locale !== undefined) options.root.setAttribute('dir', localeDirection(options.locale));
  const settle = options.settle ?? watchSettle(owner, options.surface ? { surface: options.surface } : {});
  const ownSettle = options.settle === undefined;

  let views: ContextGroupView[] = [];
  let pending = false;
  // 뜬 것 둘 — 판과 라이트박스. 줄이 다시 지어지면 함께 걷힌다(가리키던 노드가 사라졌을 수 있다).
  let panel: Panel | null = null;
  let lightbox: Overlay | null = null;

  root.classList.add('nabi-context');

  const closeFloating = (): void => {
    panel?.close();
    panel = null;
  };

  // 고친 자리를 화면에 들인다 — **상황 줄에서 고치는 자리는 화면 밖에 있을 수 있다.**
  // 손이 이 줄에 머무는 동안 화면이 굴러가 대상이 밖으로 나가면, 이름을 바꾸고 엔터를 쳐도 무엇이
  // 바뀌었는지 안 보인다 (주인 신고 2026-08-21).
  //
  // **스스로 굴러갈 사람이 없다.** 포커스는 `preventScroll` 로 돌려주고(바로 아래), 선택을 코드로
  // 쓰는 것은 브라우저를 안 굴린다 — 굴리는 것은 사람이 친 키뿐이다. 그래서 여기서 한 번 부른다.
  //
  // 셈은 **띠의 그 산수 그대로**다(`band.ts` — `mountSticky` 가 모바일 키보드에 쓰는 그 한 벌).
  // `scrollIntoView` 를 안 쓰는 까닭이 여기 있다: 그것은 붙는 크롬의 키를 모르고 시트의 어림값
  // (`.nabi-content > *` 의 `scroll-margin`, 3.5rem = 툴바 한 줄)만 아는데, **이름을 고치는 동안은
  // 상황 줄까지 떠 있어 크롬이 두 줄이다.** 그래서 어림값으로 굴리면 고친 자리가 상황 줄 **밑에**
  // 가려 선다(실제로 그렇게 섰다). 크롬의 아랫변을 그때그때 재면 그 자리가 안 생긴다.
  //
  // 띠 안이면 `bandFix` 가 0 을 답한다 — **보이는 것을 굴려서 놀래키지 않는다**(규칙의 절반이 그
  // 0 이다). 겨누는 것은 겨눔의 사각형이고, 못 재면 캐럿이 든 맨 위 블록으로 갈음한다.
  const targetBox = (): Rect | null => {
    const selection = owner.getSelection?.();
    if (selection && selection.rangeCount > 0) {
      const box = selection.getRangeAt(0).getBoundingClientRect();
      if (box.height > 0) return { top: box.top, bottom: box.bottom };
    }
    const top = nabi.getSelection().focus.path[0];
    const node = typeof top === 'number' ? nabi.$doc()[top] : undefined;
    const id = node && typeof node._id === 'string' ? node._id : null;
    const el = id === null ? null : options.surface?.querySelector(`[data-key="${id.replace(/["\\]/g, '\\$&')}"]`);
    if (!el) return null;
    const box = el.getBoundingClientRect();
    return { top: box.top, bottom: box.bottom };
  };

  const reveal = (): void => {
    const view = owner.defaultView;
    if (!view || !options.surface) return;
    const box = targetBox();
    if (!box) return;
    // 띠의 위 변 — 붙는 크롬의 아랫변이다. 그 클래스가 곧 "위에 붙는다"는 계약이라(문서의 그 말),
    // 안 붙는 호스트에서는 창의 위가 위 변이 된다.
    const chrome = root.closest('.nabi-toolbar');
    const chromeBottom = chrome ? chrome.getBoundingClientRect().bottom : null;
    const visual = view.visualViewport;
    const viewport: Rect = { top: 0, bottom: visual ? visual.height : view.innerHeight };
    const delta = bandFix(box, bandOf(chromeBottom, viewport), viewport.bottom - viewport.top);
    if (delta !== 0) view.scrollBy({ top: delta, behavior: 'auto' });
  };

  const run = (command: string, args?: Readonly<Record<string, unknown>>): void => {
    // 겨눔을 먼저 돌려주고 문을 지난다 — 커맨드는 캐럿이 든 자리를 보고 일한다.
    focusQuiet(options.surface);
    nabi.applyCommand(command, args ?? {});
    reveal();
  };

  const ask = (anchor: HTMLElement, control: Extract<ContextControl, { kind: 'prompt' }>): void => {
    // 같은 단추를 다시 누르면 닫힌다 — 툴바의 피커와 같은 규칙이다.
    const wasOpen = anchor.getAttribute('aria-expanded') === 'true';
    closeFloating();
    if (wasOpen) return;
    const group = views.find((view) => view.el.contains(anchor));
    const wing = group ? registry.wingOf(group.w) : null;
    const node = group?.node;
    panel = openPrompt(owner, {
      anchor,
      restore: options.surface ?? null,
      okLabel: t.t('ok'),
      fields: control.fields.map((field) => ({
        name: field.name,
        label: t.pick(field.label, `field.${wing?.w ?? ''}.${field.name}`),
        // 고치러 온 자리다 — 지금 값이 미리 차 있어야 한다(넣을 때와 다른 점은 이것뿐).
        ...(field.attr && node ? { value: String(node.a?.[field.attr] ?? '') } : {}),
        ...(field.optional ? { optional: true } : {}),
        // 고치러 여는 판도 **같은 문**이다 — 넣을 때 못 지나던 값이 고칠 때 지나가면 안 된다.
        ...(field.validate ? { validate: field.validate } : {}),
      })),
      onClose: () => {
        panel = null;
      },
      onSubmit: (values) => run(control.command, values),
    });
  };

  const view = (src: string, alt?: string): void => {
    lightbox?.close();
    lightbox = options.surface
      ? openLightbox({
          surface: options.surface,
          src,
          ...(alt ? { alt } : {}),
          translator: t,
        })
      : null;
  };

  const build = (): void => {
    closeFloating();
    root.replaceChildren();
    views = [];
    const doc = nabi.$doc();
    const sel = nabi.getSelection();
    for (const group of contextGroupsAt(doc, sel, registry, nabi.$env)) {
      const drawn = drawGroup(owner, group, t, { run, ask, view });
      if (drawn.buttons.length === 0 && drawn.el.childElementCount === 0) continue;
      root.append(drawn.el);
      views.push(drawn);
    }
    root.hidden = views.length === 0;
  };

  const refresh = (): void => {
    // 이 줄은 통째로 떴다 사라진다 — 높이가 바뀌므로 몸짓 중에는 미룬다.
    if (settle.busy()) {
      pending = true;
      return;
    }
    pending = false;
    build();
  };

  const stopChange = nabi.onChange(refresh);
  const stopSettle = settle.onSettle(() => {
    if (!pending) return;
    pending = false;
    build();
  });

  refresh();

  return {
    root,
    groups: () => views,
    buttons: () => views.flatMap((view) => view.buttons),
    refresh,
    unmount() {
      stopChange();
      stopSettle();
      closeFloating();
      lightbox?.close();
      lightbox = null;
      if (ownSettle) settle.unmount();
      root.classList.remove('nabi-context');
      root.replaceChildren();
      root.hidden = false;
    },
  };
}

// --- 그룹 하나 --------------------------------------------------------------------------------

type Doors = Pick<Draw, 'run' | 'ask' | 'view'>;

// 글자를 안 가진 컨트롤(색 견본·슬라이더)만 있는 그룹인가 — 그런 줄은 모양이지 문장이 아니라서
// 자기 이름을 먼저 말해야 한다. 아이콘·낱말로 된 그룹은 그대로 아무 말도 안 한다(이미 읽힌다).
function wordless(controls: readonly ContextControl[]): boolean {
  return controls.every(
    (control) =>
      control.kind === 'range' ||
      (control.kind === 'select' && control.values.every((choice) => choice.swatch !== undefined)),
  );
}

function drawGroup(
  owner: Document,
  group: ContextGroup,
  t: Translator,
  doors: Doors,
): ContextGroupView {
  const { wing, node } = group;
  const el = make(owner, 'div', 'nabi-ctx-group', { 'data-wing': wing.w });
  const buttons: HTMLButtonElement[] = [];
  // `visible` 이 아니라고 답한 컨트롤은 아예 없는 것으로 친다 — 이름표 판정도 남은 것만 본다.
  const controls = (wing.context?.controls ?? []).filter((control) => control.visible?.(node) !== false);
  const title = wing.context?.title;
  const named = title !== undefined && wordless(controls);
  if (named && title) {
    const tag = make(owner, 'span', 'nabi-ctx-tag');
    tag.textContent = t.pick(title, `wing.${wing.w}`);
    el.append(tag);
  }

  const draw: Draw = { owner, wing, node, value: stackValue(group.nodes, wing), t, named, ...doors };
  for (const control of controls) {
    const made = RENDERERS[control.kind](draw, control as never);
    el.append(...made.nodes);
    buttons.push(...made.buttons);
  }
  return { w: wing.w, el, buttons, node };
}

interface Made {
  readonly nodes: readonly Node[];
  readonly buttons: readonly HTMLButtonElement[];
}

// 컨트롤 하나의 이름 — 선언한 다국어 레코드가 먼저고, 없으면 사전의 `ctx.<wing>.<name>`.
const nameOf = (draw: Draw, control: ContextControl): string =>
  draw.t.pick(control.label, `ctx.${draw.wing.w}.${control.name}`);

// 낭독·이름표가 읽을 말 — `tip` 이 있으면 그것이다. 보이는 글자가 줄임말(`~70%`)이라는 뜻이고
// 문장으로 읽히는 쪽은 원말이다.
const tipOf = (draw: Draw, control: ContextControl): string =>
  control.tip ? draw.t.pick(control.tip, `ctx.${draw.wing.w}.${control.name}`) : nameOf(draw, control);

// 이름표 하나 — 그룹이 이미 말했으면 안 세운다.
function tagFor(draw: Draw, text: string): readonly Node[] {
  if (draw.named || text === '') return [];
  const tag = make(draw.owner, 'span', 'nabi-ctx-tag');
  tag.textContent = text;
  return [tag];
}

// --- 렌더러 넷 (종류마다 하나 — 이 표가 곧 "종류별 분리"다) ---------------------------------

type Renderer<K extends ContextControl['kind']> = (
  draw: Draw,
  control: Extract<ContextControl, { kind: K }>,
) => Made;

// 하는 일 — 눌림이 없다 (행 추가·열 삭제).
const drawButton: Renderer<'button'> = (draw, control) => {
  const button = iconButton(draw.owner, {
    name: control.name,
    label: tipOf(draw, control),
    ...(control.svg ? { svg: control.svg } : { text: nameOf(draw, control) }),
    press: () => draw.run(control.command, control.args),
  });
  return { nodes: [button], buttons: [button] };
};

// 켜짐/꺼짐 — 상태 토큰을 품으면 눌린 것이다.
const drawToggle: Renderer<'toggle'> = (draw, control) => {
  const button = iconButton(draw.owner, {
    name: control.name,
    label: tipOf(draw, control),
    ...(control.svg ? { svg: control.svg } : { text: nameOf(draw, control) }),
    press: () => draw.run(control.command, control.args),
  });
  setPressed(button, hasToken(draw.value, control.token));
  return { nodes: [button], buttons: [button] };
};

// 값 고르기 — 지금 값과 같은 칸이 눌린다.
const drawSelect: Renderer<'select'> = (draw, control) => {
  const now = controlValueOf(draw.node, draw.value, control.attr);
  const buttons: HTMLButtonElement[] = [];
  const nodes: Node[] = control.values.length > 1 ? [...tagFor(draw, nameOf(draw, control))] : [];
  for (const choice of control.values) {
    const text = draw.t.pick(choice.label, `value.${draw.wing.w}.${choice.value}`);
    // 보이는 글자가 줄임말이면 이름표·낭독은 원말을 읽는다 — `H1` 이 아니라 '제목 1'.
    const spoken = choice.tip ? draw.t.pick(choice.tip, `value.${draw.wing.w}.${choice.value}`) : text;
    const button = iconButton(draw.owner, {
      name: `${control.name}:${choice.value}`,
      label: spoken,
      ...(choice.swatch ? { swatch: choice.swatch } : choice.svg ? { svg: choice.svg } : { text }),
      press: () => draw.run(control.command, { [control.argKey]: choice.value }),
    });
    button.setAttribute('data-value', String(choice.value));
    setPressed(button, hasToken(now, String(choice.value)));
    buttons.push(button);
    nodes.push(button);
  }
  return { nodes, buttons };
};

// 글 한 줄 — 지금 값으로 채워 두고, 확정하면 커맨드로 간다.
const drawText: Renderer<'text'> = (draw, control) => {
  // 지금 값 — 선언한 `initial` 이 먼저다(속성 하나로 못 읽는 값이 그 문으로 온다).
  const now = (control.initial ? control.initial(draw.node) : controlValueOf(draw.node, draw.value, control.attr)) ?? '';
  const label = nameOf(draw, control);
  const row = make(draw.owner, 'label', 'nabi-field');
  const tag = make(draw.owner, 'span');
  tag.textContent = label;
  const input = make(draw.owner, 'input', 'nabi-input', {
    type: 'text',
    'data-name': control.name,
    'aria-label': label,
    placeholder: control.placeholder ? draw.t.pick(control.placeholder, `ctx.${draw.wing.w}.${control.name}`) : undefined,
  }) as HTMLInputElement;
  input.value = now;

  // 확정은 **한 번만** 돈다. 엔터를 치면 `keydown` 이 확정하는데, 그 뒤 칸이 포커스를 잃거나
  // 상황 줄이 다시 그려지며 떨어져 나갈 때 브라우저가 `change` 를 한 번 더 보낸다. 그때 `now` 는
  // 아직 옛 값이라 "안 바뀌었다" 검사가 못 막고 같은 커맨드가 두 번 돈다 (주인 신고 2026-08-19).
  let sent = '';
  const commit = (): void => {
    const value = input.value.trim();
    if (value === now || value === sent) return; // 안 바뀌었다 — 빈 되돌리기 지점을 안 남긴다
    if (control.validate && !control.validate(value)) return; // 못 쓸 값 — 문서를 안 건드린다
    sent = value;
    draw.run(control.command, { [control.argKey]: value });
  };
  // 키는 편집기로 새면 안 된다 — 여기 있는 동안은 글을 여기에 쓰는 것이다.
  input.addEventListener('keydown', (event) => {
    event.stopPropagation();
    if (event.key === 'Enter') {
      event.preventDefault();
      // 조합 중의 엔터는 **글자를 맺는 키**다 — 그것으로 확정하면 반쯤 맺힌 글자가 값이 된다.
      // 한글·일본어·중국어를 빠르게 치다 엔터를 누르는 자리가 정확히 이것이다.
      if (event.isComposing) return;
      commit();
      return;
    }
    if (event.key === 'Escape') {
      event.preventDefault();
      input.value = now;
      input.blur();
    }
  });
  input.addEventListener('change', commit);
  row.append(tag, input);
  return { nodes: [row], buttons: [] };
};

// 눈금 슬라이더 — 단계가 순서대로 서고 손잡이가 지금 단계에 앉는다.
//
// 이벤트 둘을 **일부러** 나눈다. `input` 은 끄는 내내 오고 손잡이 옆 글자만 움직인다.
// `change` 는 손을 뗄 때 한 번 오고, 그 한 번이 편집이다. `input` 마다 커맨드를 돌리면 손잡이가
// 지나친 단계마다 문서가 바뀌어 끌기 하나가 통째로 되돌리기에 쌓인다 — Ctrl+Z 한 번이 아무도
// 여럿으로 여기지 않는 몸짓의 한 걸음만 되돌리게 된다.
const drawRange: Renderer<'range'> = (draw, control) => {
  const steps = control.values;
  if (steps.length === 0) return { nodes: [], buttons: [] };

  const label = nameOf(draw, control);
  const nodes: Node[] = [...tagFor(draw, label)];

  const now = controlValueOf(draw.node, draw.value, control.attr);
  // 쉬는 자리 — 선언한 값, 없으면 `''` 칸, 그것도 없으면 첫 칸.
  const declared = control.rest === undefined ? -1 : steps.findIndex((step) => String(step.value) === control.rest);
  const resting = declared >= 0 ? declared : Math.max(steps.findIndex((step) => step.value === ''), 0);
  const at = steps.findIndex((step) => step.value !== '' && hasToken(now, String(step.value)));

  const slider = make(draw.owner, 'input', 'nabi-range', {
    type: 'range',
    min: '0',
    max: String(steps.length - 1),
    step: '1',
    'data-name': control.name,
    'aria-label': tipOf(draw, control),
  }) as HTMLInputElement;
  slider.value = String(at < 0 ? resting : at);

  const readout = control.readout ? make(draw.owner, 'span', 'nabi-ctx-readout') : null;

  const describe = (index: number): void => {
    const step = steps[index];
    if (!step) return;
    const text = draw.t.pick(step.label, `value.${draw.wing.w}.${step.value}`);
    slider.setAttribute('aria-valuetext', text);
    if (readout) readout.textContent = text;
  };
  describe(Number(slider.value));

  slider.addEventListener('input', () => describe(Number(slider.value)));
  slider.addEventListener('change', () => {
    const step = steps[Number(slider.value)];
    if (!step) return;
    // 쉬는 자리로 옮긴 것은 "벗긴다"는 뜻이다. 값 커맨드는 **같은 값이 다시 오면 벗기므로**
    // 지금 걸린 값을 그대로 되돌려 보내는 것이 곧 벗기기다 — 커맨드에 새 문을 안 낸다.
    if (step.value === '') {
      if (now !== undefined && now !== '') draw.run(control.command, { [control.argKey]: now });
      return;
    }
    draw.run(control.command, { [control.argKey]: step.value });
  });
  // 키가 편집기로 새면 안 된다 — 화살표는 여기서 손잡이를 옮기는 것이다.
  slider.addEventListener('keydown', (event) => event.stopPropagation());

  nodes.push(slider);
  if (readout) nodes.push(readout);
  return { nodes, buttons: [] };
};

// 판을 띄워 고친다 — 넣을 때와 같은 판이고, 다른 것은 칸이 미리 차 있다는 것뿐이다.
const drawPrompt: Renderer<'prompt'> = (draw, control) => {
  const label = tipOf(draw, control);
  const button = iconButton(draw.owner, {
    name: control.name,
    label,
    ...(control.svg ? { svg: control.svg } : { text: nameOf(draw, control) }),
    press: () => draw.ask(button, control),
  });
  return { nodes: [button], buttons: [button] };
};

// 크게 보기 — 커맨드를 안 돌린다. 주소가 없으면 컨트롤 자체가 안 선다.
const drawLightbox: Renderer<'lightbox'> = (draw, control) => {
  const src = draw.node.a?.[control.src];
  if (typeof src !== 'string' || src === '') return { nodes: [], buttons: [] };
  const alt = control.alt === undefined ? undefined : draw.node.a?.[control.alt];
  const button = iconButton(draw.owner, {
    name: control.name,
    label: tipOf(draw, control),
    ...(control.svg ? { svg: control.svg } : { text: nameOf(draw, control) }),
    press: () => draw.view(src, typeof alt === 'string' ? alt : undefined),
  });
  return { nodes: [button], buttons: [button] };
};

const RENDERERS: { [K in ContextControl['kind']]: Renderer<K> } = {
  button: drawButton,
  toggle: drawToggle,
  select: drawSelect,
  range: drawRange,
  text: drawText,
  prompt: drawPrompt,
  lightbox: drawLightbox,
};
