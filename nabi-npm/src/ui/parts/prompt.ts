// 물어보는 판 — **하나**다. 링크 주소·유튜브 주소·그림 주소·대체 글·코드 언어가 전부 이 문을
// 지난다. 옛 판은 넣을 때와 고칠 때가 서로 다른 코드였다(같은 판을 두 벌로 열었다).
//
// 갓 열린 입력 칸에는 `preventScroll` 을 안 건다 — 여기서 막으면 입력 칸이 키보드 뒤로 숨는다
// (040 §6.1 이 그 예외를 짚어 뒀다).
import { make } from './dom.js';
import { openPanel, type Panel, type PanelOptions } from './panel.js';

export interface PromptField {
  readonly name: string;
  readonly label: string;
  readonly value?: string;
  readonly placeholder?: string;
  readonly optional?: boolean;
  // 이 칸의 형식 검사 — wing 이 선언한 `WingField.validate` 가 그대로 실려 온다 (084 ⑧).
  readonly validate?: (value: string) => boolean;
}

export interface PromptOptions extends PanelOptions {
  readonly fields: readonly PromptField[];
  readonly okLabel: string;
  // 값 묶음이 쓸 만한가 — 거짓이면 확인이 안 눌린다. 없으면 "필수 칸이 비지 않았나"만 본다.
  readonly validate?: (values: Readonly<Record<string, string>>) => boolean;
  readonly onSubmit: (values: Readonly<Record<string, string>>) => void;
}

// **잠금 판정 — DOM 이 없다.** 확인이 눌리는가는 칸 선언과 값 묶음만으로 답이 나오는 물음이라
// 여기 순수 함수로 서 있고, 그물이 판을 안 띄우고도 wing 넷의 잠금을 잡는다 (084 ⑧).
//
// 규칙 둘뿐이다: 필수 칸이 비면 잠기고, 값이 든 칸이 제 형식 검사를 지나지 못하면 잠긴다.
// 빈 선택 칸에는 형식을 안 묻는다 — 비어 있음은 값이 아니라 "안 준 것"이다.
export function promptValid(
  fields: readonly PromptField[],
  values: Readonly<Record<string, string>>,
): boolean {
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
  const panel = openPanel(owner, { ...options, className: 'nabi-prompt' });
  const inputs: HTMLInputElement[] = [];

  // **한 줄이다.** 칸 위에 이름표를 세우지 않는다 — 이 판은 값 하나(주소)를 받자고 뜨는 것이라
  // 이름표를 세우면 판이 두 배로 커지면서 말하는 것은 그대로다. 이름은 placeholder 가 진다.
  for (const field of options.fields) {
    const input = make(owner, 'input', 'nabi-input', {
      type: 'text',
      // 선언한 자리표시가 먼저고, 없으면 이름표를 자리표시로 쓴다.
      placeholder: field.placeholder ?? field.label,
      'aria-label': field.label,
      'data-name': field.name,
    }) as HTMLInputElement;
    input.value = field.value ?? '';
    panel.root.append(input);
    inputs.push(input);
  }

  // 확인 — **글자다** (084 ⑧, 주인 지시). 여기 서 있던 ▶ 는 재생 화살표라, 주소를 하나 적고
  // 나면 "이걸 누르면 재생되나?" 로 읽혔다. 도형은 자기가 무엇을 하는지 말하지 못한다.
  //
  // `aria-label` 은 남긴다 — 글자가 생겼다고 접근성 이름을 지우면 낭독이 잃는 것이 있고,
  // 이 자리가 가장 깨지기 쉬운 자리다. 대신 `data-nabi-tip` 은 뗀다: 이름이 이미 단추에
  // 보이는데 그 위에 같은 말을 또 띄우는 말풍선은 가림막일 뿐이다.
  const ok = make(owner, 'button', 'nabi-btn nabi-go', {
    type: 'button',
    'aria-label': options.okLabel,
  }) as HTMLButtonElement;
  ok.textContent = options.okLabel;
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
    panel.close();
    options.onSubmit(values);
  };

  for (const input of inputs) {
    input.addEventListener('input', sync);
    // 키는 편집기로 새면 안 된다 — 여기 있는 동안은 글을 여기에 쓰는 것이다.
    input.addEventListener('keydown', (event) => {
      event.stopPropagation();
      if (event.key === 'Enter') {
        event.preventDefault();
        submit();
      }
    });
  }
  ok.addEventListener('mousedown', (event) => event.preventDefault());
  ok.addEventListener('click', submit);

  sync();
  inputs[0]?.focus();
  return panel;
}
