// 아이콘 버튼 팩토리 — **하나**다. 옛 판의 "버튼 생성 4벌"(부검 §1-7)이 이 파일 하나가 됐다.
// 툴바 버튼·상황 줄 버튼·피커 칸·색 견본이 전부 여기서 나온다.
//
// 네 가지가 늘 함께 붙는다. 하나라도 빠지면 그것이 곧 버그였다:
//   type="button"  — 폼 속에서 제출 버튼이 되지 않는다
//   aria-label     — 아이콘뿐인 버튼의 이름
//   data-nabi-tip  — 눈에 보이는 이름표(시트가 그린다)
//   mousedown 막기 — 눌러도 캐럿이 안 옮겨진다. 이것이 없으면 누르는 순간 겨눔이 사라진다
import type { CommandHand } from '../../editor/index.js';
import { iconSvg, make } from './dom.js';

export interface IconButtonSpec {
  // data-name — 힌트·시험이 버튼을 찾는 손잡이.
  readonly name: string;
  // 아이콘 속(path 들). 없으면 `text` 를 글자로 그린다.
  readonly svg?: string;
  readonly text?: string;
  // 이미 번역된 말 — 이 층은 사전을 다시 안 뒤진다.
  readonly label: string;
  readonly className?: string;
  readonly strokeWidth?: number;
  // 색 견본 — 주면 배경으로 칠한다(글자·아이콘 대신).
  readonly swatch?: string;
  // 부른 손이 함께 온다 (084 ⑨) — 진짜 클릭·탭이면 'pointer', 겨눈 버튼의 Enter/Space 나
  // `el.click()` 이면 'keyboard' 다. 손이 필요 없는 버튼은 인자를 그냥 안 받으면 된다.
  readonly press: (by: CommandHand) => void;
}

export function iconButton(owner: Document, spec: IconButtonSpec): HTMLButtonElement {
  const classes = ['nabi-btn'];
  if (spec.swatch) classes.push('nabi-swatch');
  else if (!spec.svg && spec.text) classes.push('nabi-word');
  if (spec.className) classes.push(spec.className);

  const button = make(owner, 'button', classes.join(' '), {
    type: 'button',
    'data-name': spec.name,
    'aria-label': spec.label,
    'data-nabi-tip': spec.label,
  }) as HTMLButtonElement;

  if (spec.swatch) button.style.background = spec.swatch;
  else if (spec.svg) button.innerHTML = iconSvg(spec.svg, spec.strokeWidth);
  else button.textContent = spec.text ?? spec.label;

  wireIconButton(button, spec.press);
  return button;
}

// 이미 서 있는 단추에 **배선만** 건다 — 미리 그려 보낸 툴바를 이어받는 자리가 이것이다
// (096). 만드는 쪽과 이어받는 쪽이 같은 한 줄을 쓰므로 둘의 동작이 갈릴 수 없다.
export function wireIconButton(button: HTMLElement, press: (by: CommandHand) => void): void {
  // 겨눔을 지키는 한 줄 — 툴바를 눌러도 캐럿은 글 안에 그대로 있다.
  //
  // 그 한 줄의 값: `mousedown` 을 삼키면 브라우저의 `:active` 도 안 걸린다. 그래서 **누른 티가
  // 아무 데도 안 난다** — 마크처럼 눌림이 남는 단추는 그것으로 알겠지만, 그 자리에서 아무 일도
  // 안 하는 단추(침묵)는 화면이 통째로 조용해서 "이 단추 안 눌리나?" 가 된다.
  // 그래서 눌린 티를 우리가 낸다: 짧게 물들었다 스스로 돌아오는 표식 하나.
  button.addEventListener('mousedown', (event) => {
    event.preventDefault();
    tap(button);
  });
  button.addEventListener('click', (event) => {
    event.preventDefault();
    // 손 판정은 `detail` 하나다 — 키보드가 만든 클릭(겨눈 버튼의 Enter/Space·`el.click()`)은
    // 0 이고 진짜 포인터는 1 이상이다. 견본판이 이미 쓰는 그 판정과 같다(`byKey`).
    press(event.detail === 0 ? 'keyboard' : 'pointer');
  });
}

// 눌렀다 뗀 티 — 시트가 그리는 짧은 물듦(`.nabi-tap`). 애니메이션이 끝나면 스스로 걷힌다.
// 연타에도 매번 다시 시작해야 하므로 표식을 한 번 걷고 강제로 리플로를 태운 뒤 다시 단다.
const TAP_CLASS = 'nabi-tap';
const TAP_MS = 260; // 시트의 220ms + 여유
function tap(button: HTMLElement): void {
  button.classList.remove(TAP_CLASS);
  void button.offsetWidth; // 리플로 — 이것이 없으면 같은 애니메이션이 다시 안 돈다
  button.classList.add(TAP_CLASS);
  // 시계로도 걷는다 — `animationend` 는 애니메이션이 아예 안 도는 자리(화면 밖, 움직임 끄기
  // 시트를 안 건 호스트)에서는 오지 않는다. 표식이 남아 있으면 다음 누름의 티가 안 난다.
  const owner = button.ownerDocument.defaultView;
  const done = (): void => button.classList.remove(TAP_CLASS);
  button.addEventListener('animationend', done, { once: true });
  owner?.setTimeout(done, TAP_MS);
}

// 눌림 표시 한 벌 — 클래스와 `aria-pressed` 가 늘 같이 간다(하나만 바꾸면 화면과 낭독이 갈린다).
export function setPressed(button: HTMLElement, on: boolean): void {
  button.classList.toggle('on', on);
  button.setAttribute('aria-pressed', on ? 'true' : 'false');
}
