import type { LocaleInput } from '../locale/index.js';
import { Translations } from './parts/translation.js';
// 값은 attr가 선언돼 있으면 겨눔 노드의 그 attr, 없으면 조상 줄기가 합쳐 답한 상태 토큰(stackValue)에서 읽는다 — 토큰은 "같다"가 아니라 "품는가"로 판정한다.
// A control's value comes from the target node's attr when declared, otherwise from the ancestor chain's merged state token (stackValue) — matched by "contains", not "equals".
import type { ElementNode } from '../schema/index.js';
import { hostOf, type Nabi } from '../editor/index.js';
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
import { watchNarrow } from './narrow.js';
import { compactKeepsFocus, refreshCompactContext, registerCompactContext } from './compact.js';
import { dockViewportRect } from './dock.js';
import { claimMountRoot, DisposerStack, HostElementBaseline, HostElementLease } from '../lifecycle.js';

export interface ContextToolbarOptions {
  readonly nabi: Nabi;
  readonly registry: Registry;
  readonly root: HTMLElement;
  readonly surface?: HTMLElement;
  readonly locale?: LocaleInput;
  readonly translator?: Translator;
  readonly settle?: Settle;
}

export interface ContextToolbar {
  readonly root: HTMLElement;
  // 공식 API — 힌트가 이 줄을 훑을 때 DOM 구조를 하드코딩하지 않게 한다.
  // Public API, so hints scanning this row don't need to hardcode its DOM structure.
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
  // The node this group targets; a panel reads it to prefill the current value.
  readonly node: ElementNode;
}

interface Draw {
  readonly owner: Document;
  readonly wing: Wing;
  readonly node: ElementNode;
  // 겨눔 하나가 아니라 소유 조상 줄기가 합쳐 답한 값 — 그룹마다 한 번만 읽어 컨트롤 전부가 나눠 쓴다.
  // The merged value from the ancestor chain, not just the target — read once per group and shared by every control in it.
  readonly value: string | undefined;
  readonly t: Translator;
  readonly copy: Translations;
  // 그룹이 이미 자기 이름을 세웠는가 — 세웠으면 컨트롤은 이름표를 또 세우지 않는다.
  // Whether the group already showed its own name — if so, controls skip their own label.
  readonly named: boolean;
  run(command: string, args?: Readonly<Record<string, unknown>>): void;
  // 판을 띄운다 — 열려 있던 판은 먼저 닫힌다(한 번에 하나).
  // Opens a panel; any panel already open closes first (only one at a time).
  ask(anchor: HTMLElement, control: Extract<ContextControl, { kind: 'prompt' }>): void;
  // 그림 하나를 크게 — 커맨드가 아니다(본다고 문서가 안 바뀐다).
  // Enlarges an image; not a command, since viewing doesn't change the document.
  view(src: string, alt?: string): void;
}

export function mountContextToolbar(options: ContextToolbarOptions): ContextToolbar {
  const { nabi, registry, root } = options;
  const baseline = new HostElementBaseline(root);
  const lifecycle = new DisposerStack();
  lifecycle.add(claimMountRoot(root));
  let unmounted = false;
  try {
    const owner = root.ownerDocument;
    const t = options.translator ?? makeTranslator(options.locale);
    const copy = new Translations(t);
    const controlsCopy = new Translations(t);
    lifecycle.add(() => copy.dispose());
    lifecycle.add(() => controlsCopy.dispose());
    const attributes = new HostElementLease(root);
    lifecycle.add(() => attributes.dispose());
    // 말이 곧 방향이다 — 툴바와 같은 규칙이다.
    // The language dictates direction — same rule as the toolbar.
    if (options.locale !== undefined || options.translator !== undefined)
      copy.add(() => attributes.attribute('dir', localeDirection(t.locale)));
    const suppliedSettle = options.settle;
    const settle = suppliedSettle ?? watchSettle(owner, options.surface ? { surface: options.surface } : {});
    const ownSettle = suppliedSettle === undefined;
    if (ownSettle) lifecycle.add(() => settle.unmount());

    let views: ContextGroupView[] = [];
    let pending = false;
    // 뜬 것 둘 — 판과 라이트박스. 줄이 다시 지어지면 함께 걷힌다(가리키던 노드가 사라졌을 수 있다).
    // Two things can be open — a panel and a lightbox. Both close when the row rebuilds, since their target node may be gone.
    let panel: Panel | null = null;
    let lightbox: Overlay | null = null;
    let generation = 0;
    lifecycle.add(() => {
      for (const view of views) view.el.remove();
      views = [];
    });
    lifecycle.add(registerCompactContext(nabi, { root, groups: () => views }));

    attributes.className('nabi-context', true);
    // 한 줄 모드 — 줄 자체가 flex 그릇이라 툴바처럼 감쌀 것 없이 제가 구른다.
    // Single-row mode — the row is its own flex container, so it scrolls itself without a wrapper like the toolbar needs.
    const stopNarrow = watchNarrow(root);
    lifecycle.add(stopNarrow);

    const closeFloating = (): void => {
      panel?.close();
      panel = null;
    };
    lifecycle.add(() => {
      closeFloating();
      lightbox?.close();
      lightbox = null;
    });

    // 서식 변경 뒤 선택이 툴바나 키보드에 가리지 않게 한다.
    // Keep the selection clear of toolbar chrome and the keyboard after formatting.
    const targetBox = (): Rect | null => {
      const selection = owner.getSelection?.() ?? owner.defaultView?.getSelection() ?? null;
      if (selection && selection.rangeCount > 0) {
        const box = selection.getRangeAt(0).getBoundingClientRect();
        if (box.height > 0) return { top: box.top, bottom: box.bottom };
      }
      const top = nabi.getSelection().focus.path[0];
      const node = typeof top === 'number' ? hostOf(nabi).doc()[top] : undefined;
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
      const chrome = root.closest('.nabi-toolbar');
      const chromeBox = chrome?.getBoundingClientRect();
      const docked = chrome?.getAttribute('data-nabi-docked') === 'true';
      const visual = view.visualViewport;
      const viewport: Rect = docked
        ? dockViewportRect(owner)
        : { top: 0, bottom: visual ? visual.height : view.innerHeight };
      const band =
        docked && chromeBox
          ? { top: viewport.top, bottom: Math.max(viewport.top, Math.min(viewport.bottom, chromeBox.top)) }
          : bandOf(chromeBox?.bottom ?? null, viewport);
      const delta = bandFix(box, band, viewport.bottom - viewport.top);
      if (delta !== 0) view.scrollBy({ top: delta, behavior: 'auto' });
    };

    const run = (command: string, args?: Readonly<Record<string, unknown>>): void => {
      if (unmounted) return;
      // 도구판이 열린 동안은 본문 포커스를 되찾아 키보드를 다시 열지 않는다.
      // Keep focus in an open tool panel so the surface does not reopen the keyboard.
      const keepsFocus = compactKeepsFocus(nabi);
      if (!keepsFocus) focusQuiet(options.surface);
      nabi.applyCommand(command, args ?? {});
      if (!keepsFocus) reveal();
    };

    const ask = (anchor: HTMLElement, control: Extract<ContextControl, { kind: 'prompt' }>): void => {
      if (unmounted) return;
      // 같은 단추를 다시 누르면 닫힌다 — 툴바의 피커와 같은 규칙이다.
      // Pressing the same button again closes it — same rule as the toolbar's pickers.
      const wasOpen = anchor.getAttribute('aria-expanded') === 'true';
      closeFloating();
      if (wasOpen) return;
      const group = views.find((view) => view.el.contains(anchor));
      const wing = group ? registry.wingOf(group.w) : null;
      const node = group?.node;
      panel = openPrompt(owner, {
        anchor,
        restore: options.surface ?? null,
        translator: t,
        get okLabel() {
          return t.t('ok');
        },
        fields: control.fields.map((field) => ({
          name: field.name,
          get label() {
            return t.pick(field.label, `field.${wing?.w ?? ''}.${field.name}`);
          },
          // 고치러 온 자리다 — 지금 값이 미리 차 있어야 한다(넣을 때와 다른 점은 이것뿐).
          // This is an edit, so the current value must be prefilled — the only difference from inserting.
          ...(field.attr && node ? { value: String(node.a?.[field.attr] ?? '') } : {}),
          ...(field.optional ? { optional: true } : {}),
          // 고치러 여는 판도 같은 문이다 — 넣을 때 못 지나던 값이 고칠 때 지나가면 안 된다.
          // The edit panel shares the same gate — a value insert would reject must not pass on edit either.
          ...(field.validate ? { validate: field.validate } : {}),
        })),
        onClose: () => {
          panel = null;
        },
        onSubmit: (values) => run(control.command, values),
      });
    };

    const view = (src: string, alt?: string): void => {
      if (unmounted) return;
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

    const invalidate = (): void => {
      generation += 1;
      closeFloating();
      lightbox?.close();
      lightbox = null;
    };

    const build = (): void => {
      if (unmounted) return;
      invalidate();
      controlsCopy.clear();
      for (const view of views) view.el.remove();
      views = [];
      const doc = hostOf(nabi).doc();
      const sel = nabi.getSelection();
      const current = generation;
      const alive = (): boolean => !unmounted && current === generation;
      for (const group of contextGroupsAt(doc, sel, registry, hostOf(nabi).env)) {
        const drawn = drawGroup(owner, group, t, controlsCopy, {
          run: (command, args) => {
            if (alive()) run(command, args);
          },
          ask: (anchor, control) => {
            if (alive()) ask(anchor, control);
          },
          view: (src, alt) => {
            if (alive()) view(src, alt);
          },
        });
        if (drawn.buttons.length === 0 && drawn.el.childElementCount === 0) continue;
        root.append(drawn.el);
        views.push(drawn);
      }
      attributes.attribute('hidden', views.length === 0 ? '' : null);
      refreshCompactContext(nabi);
    };

    const refresh = (): void => {
      if (unmounted) return;
      // 이 줄은 통째로 떴다 사라진다 — 높이가 바뀌므로 몸짓 중에는 미룬다.
      // This row appears and disappears as a whole, changing height, so a rebuild is deferred during an in-flight gesture.
      if (settle.busy()) {
        invalidate();
        pending = true;
        return;
      }
      pending = false;
      build();
    };

    const stopChange = nabi.onChange(refresh);
    lifecycle.add(stopChange);
    const stopSettle = settle.onSettle(() => {
      if (unmounted) return;
      if (!pending) return;
      pending = false;
      build();
    });
    lifecycle.add(stopSettle);

    refresh();

    return {
      root,
      groups: () => (unmounted ? [] : views),
      buttons: () => (unmounted ? [] : views.flatMap((view) => view.buttons)),
      refresh,
      unmount() {
        if (unmounted) return;
        unmounted = true;
        lifecycle.dispose();
      },
    };
  } catch (error) {
    unmounted = true;
    lifecycle.dispose();
    baseline.restore();
    throw error;
  }
}

// --- 그룹 하나 --------------------------------------------------------------------------------

type Doors = Pick<Draw, 'run' | 'ask' | 'view'>;

// 글자를 안 가진 컨트롤(색 견본·슬라이더)만 있는 그룹인가 — 그런 줄은 모양이지 문장이 아니라서 자기 이름을 먼저 말해야 한다.
// Whether a group holds only wordless controls (swatches, sliders) — those read as shapes, not sentences, so the group must name itself first.
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
  copy: Translations,
  doors: Doors,
): ContextGroupView {
  const { wing, node } = group;
  const el = make(owner, 'div', 'nabi-ctx-group', { 'data-wing': wing.w });
  const buttons: HTMLButtonElement[] = [];
  // `visible` 이 아니라고 답한 컨트롤은 아예 없는 것으로 친다 — 이름표 판정도 남은 것만 본다.
  // Controls that report `visible: false` are treated as absent, so the label decision only sees what's left.
  const controls = (wing.context?.controls ?? []).filter((control) => control.visible?.(node) !== false);
  const title = wing.context?.title;
  const named = title !== undefined && wordless(controls);
  if (named && title) {
    const tag = make(owner, 'span', 'nabi-ctx-tag');
    copy.text(tag, () => t.pick(title, `wing.${wing.w}`));
    el.append(tag);
  }

  const draw: Draw = { owner, wing, node, value: stackValue(group.nodes, wing), t, copy, named, ...doors };
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

const nameOf = (draw: Draw, control: ContextControl): string =>
  draw.t.pick(control.label, `ctx.${draw.wing.w}.${control.name}`);

// `tip`이 있으면 낭독·이름표는 그것을 읽는다 — 보이는 글자가 줄임말(`~70%`)일 때 문장으로 풀어 주는 쪽이다.
// When `tip` exists, screen readers and labels use it — the visible text may be an abbreviation (`~70%`) that tip spells out.
const tipOf = (draw: Draw, control: ContextControl): string =>
  control.tip ? draw.t.pick(control.tip, `ctx.${draw.wing.w}.${control.name}`) : nameOf(draw, control);

function tagFor(draw: Draw, text: () => string): readonly Node[] {
  if (draw.named || text() === '') return [];
  const tag = make(draw.owner, 'span', 'nabi-ctx-tag');
  draw.copy.text(tag, text);
  return [tag];
}

// --- 렌더러 넷 (종류마다 하나 — 이 표가 곧 "종류별 분리"다) ---------------------------------

type Renderer<K extends ContextControl['kind']> = (draw: Draw, control: Extract<ContextControl, { kind: K }>) => Made;

// 하는 일 — 눌림이 없다 (행 추가·열 삭제).
// A one-shot action — no pressed state (e.g. add row, delete column).
const drawButton: Renderer<'button'> = (draw, control) => {
  const button = iconButton(draw.owner, {
    name: control.name,
    label: tipOf(draw, control),
    iconKey: `context-${draw.wing.w}-${control.name}`,
    ...(control.icon ? { icon: control.icon } : control.svg ? { svg: control.svg } : { text: nameOf(draw, control) }),
    press: () => draw.run(control.command, control.args),
  });
  draw.copy.button(
    button,
    () => tipOf(draw, control),
    control.icon || control.svg ? undefined : () => nameOf(draw, control),
  );
  return { nodes: [button], buttons: [button] };
};

// 켜짐/꺼짐 — 상태 토큰을 품으면 눌린 것이다.
// On/off — pressed when the state token contains it.
const drawToggle: Renderer<'toggle'> = (draw, control) => {
  const button = iconButton(draw.owner, {
    name: control.name,
    label: tipOf(draw, control),
    iconKey: `context-${draw.wing.w}-${control.name}`,
    ...(control.icon ? { icon: control.icon } : control.svg ? { svg: control.svg } : { text: nameOf(draw, control) }),
    press: () => draw.run(control.command, control.args),
  });
  setPressed(button, hasToken(draw.value, control.token));
  draw.copy.button(
    button,
    () => tipOf(draw, control),
    control.icon || control.svg ? undefined : () => nameOf(draw, control),
  );
  return { nodes: [button], buttons: [button] };
};

// 값 고르기 — 지금 값과 같은 칸이 눌린다.
// A value picker — the cell matching the current value is pressed.
const drawSelect: Renderer<'select'> = (draw, control) => {
  const now = controlValueOf(draw.node, draw.value, control.attr);
  const buttons: HTMLButtonElement[] = [];
  const nodes: Node[] = control.values.length > 1 ? [...tagFor(draw, () => nameOf(draw, control))] : [];
  for (const choice of control.values) {
    const text = draw.t.pick(choice.label, `value.${draw.wing.w}.${choice.value}`);
    // 보이는 글자가 줄임말이면 이름표·낭독은 원말을 읽는다 — `H1`이 아니라 '제목 1'.
    // When the visible text is an abbreviation, labels and screen readers use the spelled-out form — "Heading 1", not "H1".
    const spoken = choice.tip ? draw.t.pick(choice.tip, `value.${draw.wing.w}.${choice.value}`) : text;
    const button = iconButton(draw.owner, {
      name: `${control.name}:${choice.value}`,
      label: spoken,
      iconKey: `context-${draw.wing.w}-${control.name}-${choice.value}`,
      ...(choice.swatch
        ? { swatch: choice.swatch }
        : choice.icon
          ? { icon: choice.icon }
          : choice.svg
            ? { svg: choice.svg }
            : { text }),
      press: () => draw.run(control.command, { [control.argKey]: choice.value }),
    });
    const label = (): string => draw.t.pick(choice.label, `value.${draw.wing.w}.${choice.value}`);
    draw.copy.button(
      button,
      () => (choice.tip ? draw.t.pick(choice.tip, `value.${draw.wing.w}.${choice.value}`) : label()),
      choice.swatch || choice.icon || choice.svg ? undefined : label,
    );
    button.setAttribute('data-value', String(choice.value));
    setPressed(button, hasToken(now, String(choice.value)));
    buttons.push(button);
    nodes.push(button);
  }
  return { nodes, buttons };
};

const drawText: Renderer<'text'> = (draw, control) => {
  // 선언한 `initial`이 먼저다 — 속성 하나로 못 읽는 값이 그 문으로 온다.
  // `initial` takes priority when declared — it's the door for values that aren't a single attr read.
  const now =
    (control.initial ? control.initial(draw.node) : controlValueOf(draw.node, draw.value, control.attr)) ?? '';
  const label = nameOf(draw, control);
  const row = make(draw.owner, 'label', 'nabi-field');
  const tag = make(draw.owner, 'span');
  tag.textContent = label;
  const input = make(draw.owner, 'input', 'nabi-input', {
    type: 'text',
    'data-name': control.name,
    'aria-label': label,
    placeholder: control.placeholder
      ? draw.t.pick(control.placeholder, `ctx.${draw.wing.w}.${control.name}`)
      : undefined,
  }) as HTMLInputElement;
  input.value = now;
  draw.copy.text(tag, () => nameOf(draw, control));
  draw.copy.attribute(input, 'aria-label', () => nameOf(draw, control));
  if (control.placeholder)
    draw.copy.attribute(input, 'placeholder', () =>
      draw.t.pick(control.placeholder, `ctx.${draw.wing.w}.${control.name}`),
    );

  // 확정은 한 번만 돈다 — 엔터로 커밋한 뒤 포커스가 빠지며 change가 한 번 더 오는데, 그때 now는 아직 옛 값이라 "안 바뀌었다" 검사만으론 안 걸러진다.
  // Commit fires only once — after Enter commits, losing focus fires change again, and since `now` is still stale then, the unchanged-value check alone won't catch the repeat.
  let sent: string | null = null;
  const commit = (): void => {
    const value = input.value.trim();
    // 안 바뀐 값은 되돌리기 지점을 만들지 않고, 검증에 걸리는 값은 문서를 건드리지 않는다.
    // An unchanged value skips the undo checkpoint, and a value that fails validation never touches the document.
    if (value === now || value === sent) return;
    if (control.validate && !control.validate(value)) return;
    sent = value;
    draw.run(control.command, { [control.argKey]: value });
  };
  // 키는 편집기로 새면 안 된다 — 여기 있는 동안은 글을 여기에 쓰는 것이다.
  // Keys must not leak to the editor — while focus is here, typing belongs to this field.
  input.addEventListener('keydown', (event) => {
    event.stopPropagation();
    if (event.key === 'Enter') {
      event.preventDefault();
      // 조합 중 엔터는 글자를 맺는 키일 뿐이다 — 그걸로 확정하면 반쯤 맺힌 글자가 값이 된다(한글·일본어·중국어 IME에서 실제로 일어난다).
      // Enter during IME composition just commits the character, not the field — treating it as submit would save a half-composed character (happens with Korean/Japanese/Chinese IMEs).
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

// 눈금 슬라이더 — input은 끄는 동안 표시만 갱신하고, change(뗄 때 한 번)만 커맨드를 돈다 — 매 input마다 돌리면 끌기 한 번이 되돌리기 여러 칸으로 쌓인다.
// A stepped slider — input only updates the readout while dragging; only change (on release) runs the command, or one drag would pile up many undo steps.
const drawRange: Renderer<'range'> = (draw, control) => {
  const steps = control.values;
  if (steps.length === 0) return { nodes: [], buttons: [] };

  const nodes: Node[] = [...tagFor(draw, () => nameOf(draw, control))];

  const now = controlValueOf(draw.node, draw.value, control.attr);
  // 쉬는 자리 — 선언한 값, 없으면 `''` 칸, 그것도 없으면 첫 칸.
  // The rest position — the declared value, else the `''` step, else the first step.
  const declared = control.rest === undefined ? -1 : steps.findIndex((step) => String(step.value) === control.rest);
  const resting =
    declared >= 0
      ? declared
      : Math.max(
          steps.findIndex((step) => step.value === ''),
          0,
        );
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
  draw.copy.attribute(slider, 'aria-label', () => tipOf(draw, control));
  draw.copy.add(() => describe(Number(slider.value)));

  slider.addEventListener('input', () => describe(Number(slider.value)));
  slider.addEventListener('change', () => {
    const step = steps[Number(slider.value)];
    if (!step) return;
    // 쉬는 자리로 옮긴 것은 "벗긴다"는 뜻이다 — 값 커맨드는 같은 값이 다시 오면 벗기므로, 지금 값을 그대로 되돌려 보내는 것이 곧 벗기기다.
    // Moving to the rest position means "clear" — since the value command toggles off on a repeat, resending the current value is how this clears without a new command.
    if (step.value === '') {
      if (now !== undefined && now !== '') draw.run(control.command, { [control.argKey]: now });
      return;
    }
    draw.run(control.command, { [control.argKey]: step.value });
  });
  // 키가 편집기로 새면 안 된다 — 화살표는 여기서 손잡이를 옮기는 것이다.
  // Keys must not leak to the editor — arrows here move the slider handle.
  slider.addEventListener('keydown', (event) => event.stopPropagation());

  nodes.push(slider);
  if (readout) nodes.push(readout);
  return { nodes, buttons: [] };
};

// 판을 띄워 고친다 — 넣을 때와 같은 판이고, 다른 것은 칸이 미리 차 있다는 것뿐이다.
// Opens the same panel used for insert; the only difference is the fields come prefilled.
const drawPrompt: Renderer<'prompt'> = (draw, control) => {
  const label = tipOf(draw, control);
  const button = iconButton(draw.owner, {
    name: control.name,
    label,
    iconKey: `context-${draw.wing.w}-${control.name}`,
    ...(control.icon ? { icon: control.icon } : control.svg ? { svg: control.svg } : { text: nameOf(draw, control) }),
    press: () => draw.ask(button, control),
  });
  draw.copy.button(
    button,
    () => tipOf(draw, control),
    control.icon || control.svg ? undefined : () => nameOf(draw, control),
  );
  return { nodes: [button], buttons: [button] };
};

// 크게 보기 — 커맨드를 안 돌린다. 주소가 없으면 컨트롤 자체가 안 선다.
// Enlarge only — never runs a command. With no src, the control doesn't render at all.
const drawLightbox: Renderer<'lightbox'> = (draw, control) => {
  const src = draw.node.a?.[control.src];
  if (typeof src !== 'string' || src === '') return { nodes: [], buttons: [] };
  const alt = control.alt === undefined ? undefined : draw.node.a?.[control.alt];
  const button = iconButton(draw.owner, {
    name: control.name,
    label: tipOf(draw, control),
    iconKey: `context-${draw.wing.w}-${control.name}`,
    ...(control.icon ? { icon: control.icon } : control.svg ? { svg: control.svg } : { text: nameOf(draw, control) }),
    press: () => draw.view(src, typeof alt === 'string' ? alt : undefined),
  });
  draw.copy.button(
    button,
    () => tipOf(draw, control),
    control.icon || control.svg ? undefined : () => nameOf(draw, control),
  );
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
