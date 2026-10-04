// 물어보는 판 하나 — 링크·유튜브·그림 주소·대체 글·코드 언어가 전부 이 문을 지난다. 넣을 때와 고칠 때가 같은 코드다.
// One prompt panel — link, YouTube, image src, alt text, code language all pass through this. Insert and edit share the same code path.
//
// 갓 열린 입력 칸에는 preventScroll을 안 건다 — 여기서 막으면 입력 칸이 키보드 뒤로 숨는다.
// A freshly opened input field skips preventScroll — blocking the scroll here would leave the field hidden behind the keyboard.
import { make } from './dom.js';
import { suppressMousedownTap } from './button.js';
import { openPanel, type Panel, type PanelOptions } from './panel.js';
import { localeDirection, type Translator } from '../../locale/index.js';
import { Translations } from './translation.js';

export interface PromptField {
  readonly name: string;
  readonly label: string;
  readonly value?: string;
  readonly placeholder?: string;
  readonly optional?: boolean;
  // 이 칸의 형식 검사 — wing이 선언한 WingField.validate가 그대로 실려 온다.
  // This field's validation — carried straight through from the wing's declared WingField.validate.
  readonly validate?: (value: string) => boolean;
}

export interface PromptOptions extends PanelOptions {
  readonly translator?: Translator;
  readonly fields: readonly PromptField[];
  readonly okLabel: string;
  // 값 묶음이 쓸 만한가 — 거짓이면 확인이 안 눌린다. 없으면 "필수 칸이 비지 않았나"만 본다.
  // Whether the whole set of values is usable — false locks the OK button. Absent, only "no required field is blank" is checked.
  readonly validate?: (values: Readonly<Record<string, string>>) => boolean;
  readonly onSubmit: (values: Readonly<Record<string, string>>) => void;
}

// 확인이 눌리는가는 칸 선언과 값 묶음만으로 답이 나오는 물음이라 DOM 없는 순수 함수로 서 있다. 규칙은 둘: 필수 칸이 비면 잠기고, 값이 든 칸이 형식 검사를 못 지나면 잠긴다. 빈 선택 칸은 형식을 안 묻는다.
// Whether the OK button unlocks depends only on the field declarations and current values, so this is a pure, DOM-free function. Two rules: a blank required field locks it, and a filled field failing its own validation locks it too. An empty optional field is never validated — absence isn't a value.
export function promptValid(fields: readonly PromptField[], values: Readonly<Record<string, string>>): boolean {
  for (const field of fields) {
    const value = (values[field.name] ?? '').trim();
    if (value === '') {
      if (!field.optional) return false;
      continue;
    }
    if (field.validate && !field.validate(value)) return false;
  }
  return true;
}

export function openPrompt(owner: Document, options: PromptOptions): Panel {
  const copy = options.translator ? new Translations(options.translator) : null;
  let cleanup = (): void => {};
  const panel = openPanel(owner, {
    ...options,
    className: 'nabi-prompt',
    modal: false,
    restore: options.restore ?? options.anchor,
    onClose: () => {
      copy?.dispose();
      cleanup();
      options.onClose?.();
    },
  });
  panel.root.setAttribute('role', 'dialog');
  const inputs: HTMLInputElement[] = [];
  const close = (): void => panel.close();

  try {
    // 한 줄이다. 칸 위에 이름표를 세우지 않는다 — 값 하나(주소)를 받자고 뜨는 판이라, 이름표를 세우면 판만 두 배로 커지고 말하는 것은 그대로다. 이름은 placeholder가 진다.
    // A single line — no label above the field. This panel exists to collect one value (an address); a label would only double the panel's height without saying anything new. The placeholder carries the name instead.
    for (const field of options.fields) {
      const input = make(owner, 'input', 'nabi-input', {
        type: 'text',
        // 선언한 자리표시가 먼저고, 없으면 이름표를 자리표시로 쓴다.
        // The declared placeholder wins; without one, the field's label is used as the placeholder.
        placeholder: field.placeholder ?? field.label,
        'aria-label': field.label,
        'data-name': field.name,
      }) as HTMLInputElement;
      input.value = field.value ?? '';
      copy?.attribute(input, 'placeholder', () => field.placeholder ?? field.label);
      copy?.attribute(input, 'aria-label', () => field.label);
      panel.root.append(input);
      inputs.push(input);
    }

    // 확인은 글자다 — 재생 화살표(▶)였을 때는 주소를 적고 나면 "이걸 누르면 재생되나?"로 읽혔다. aria-label은 남기고 data-nabi-tip은 뗀다(이름이 이미 보이는데 같은 말풍선을 또 띄우면 가림막일 뿐이다).
    // The confirm button is text, not an icon — a play arrow (▶) here used to read as "does this play the address I just typed?" The aria-label stays (accessible naming is fragile here), but data-nabi-tip is dropped — a tooltip repeating a name already visible is just clutter.
    const ok = make(owner, 'button', 'nabi-btn nabi-go', {
      type: 'button',
      'aria-label': options.okLabel,
    }) as HTMLButtonElement;
    ok.textContent = options.okLabel;
    copy?.text(ok, () => options.okLabel);
    copy?.attribute(ok, 'aria-label', () => options.okLabel);
    if (copy && options.translator) {
      const t = options.translator;
      copy.attribute(panel.root, 'dir', () => localeDirection(t.locale));
      copy.attribute(
        panel.root,
        'aria-label',
        () =>
          options.fields
            .map((field) => field.label.trim())
            .filter(Boolean)
            .join(', ') || options.okLabel,
      );
    }
    panel.root.append(ok);

    const read = (): Record<string, string> => {
      const values: Record<string, string> = {};
      options.fields.forEach((field, i) => {
        values[field.name] = inputs[i]?.value.trim() ?? '';
      });
      return values;
    };

    // 칸마다의 답이 먼저고(순수부), 묶음 전체를 보는 검사가 있으면 그 뒤다.
    const good = (values: Readonly<Record<string, string>>): boolean =>
      promptValid(options.fields, values) && (options.validate?.(values) ?? true);

    const sync = (): void => {
      const values = read();
      const valid = good(values);
      ok.disabled = !valid;
    };

    const submit = (): void => {
      const values = read();
      if (!good(values)) return;
      close();
      options.onSubmit(values);
    };

    const keydown =
      (control: HTMLElement) =>
      (event: KeyboardEvent): void => {
        event.stopPropagation();
        if (event.key === 'Tab') {
          const controls = [...inputs, ...(ok.disabled ? [] : [ok])];
          if (controls.length < 2) return;
          event.preventDefault();
          const at = controls.indexOf(control as HTMLInputElement & HTMLButtonElement);
          const next = (at + (event.shiftKey ? -1 : 1) + controls.length) % controls.length;
          controls[next]?.focus();
          return;
        }
        if (event.key === 'Enter') {
          event.preventDefault();
          submit();
        }
      };
    const keys = new Map<HTMLElement, (event: KeyboardEvent) => void>();
    for (const input of inputs) {
      input.addEventListener('input', sync);
      // 키는 편집기로 새면 안 된다 — 여기 있는 동안은 글을 여기에 쓰는 것이다.
      // Keys must not leak to the editor — while focus is here, typing belongs to this field.
      const onKey = keydown(input);
      keys.set(input, onKey);
      input.addEventListener('keydown', onKey);
    }
    const releaseMouse = suppressMousedownTap(ok);
    ok.addEventListener('click', submit);
    const onOkKey = keydown(ok);
    keys.set(ok, onOkKey);
    ok.addEventListener('keydown', onOkKey);
    cleanup = () => {
      releaseMouse();
      ok.removeEventListener('click', submit);
      ok.removeEventListener('keydown', onOkKey);
      for (const input of inputs) {
        input.removeEventListener('input', sync);
        input.removeEventListener('keydown', keys.get(input) as EventListener);
      }
    };

    try {
      sync();
    } catch (error) {
      panel.close();
      throw error;
    }
    panel.reposition();
    if (!panel.root.hasAttribute('dir')) {
      const inherited =
        owner.defaultView?.getComputedStyle(options.anchor).direction ?? options.anchor.getAttribute('dir') ?? 'ltr';
      panel.root.setAttribute('dir', inherited === 'rtl' ? 'rtl' : 'ltr');
    }
    if (!panel.root.hasAttribute('aria-label') && !panel.root.hasAttribute('aria-labelledby')) {
      const name =
        options.fields
          .map((field) => field.label.trim())
          .filter(Boolean)
          .join(', ') || options.okLabel;
      panel.root.setAttribute('aria-label', name);
    }
    (inputs[0] ?? ok).focus();
    return panel;
  } catch (error) {
    try {
      close();
    } catch {}
    throw error;
  }
}
