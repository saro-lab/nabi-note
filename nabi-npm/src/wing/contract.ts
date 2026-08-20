// Wing 계약 v2 — 확장점의 표면이다. 계약은 말이 아니라 기계(registry)가 지킨다.
// 노드의 `w` = 그 노드를 소유한 wing 의 `w` — 개념 하나에 이름 하나.
import type { LocaleText } from '../locale/index.js';
import type { AttrValue, ElementNode, NabiDoc, NabiNode } from '../schema/index.js';
import type { EditEnv } from '../doc/index.js';
import type { Selection } from '../caret/index.js';
import type { HtmlBuilder, ParseElement } from '../html/index.js';
import type { Command, CommandOutcome, Nabi } from '../editor/index.js';

// 갈래 — §2.1 의 다섯 정의와 맞물린다: 문단·라인은 코어 예약어이고, wing 은 이 다섯 중 하나다.
//   mark      인라인 마크 (b·i·hl·tc·fs·tf·a …) — 글자 범위에 걸린다
//   void      블록 단말 = 속이 전혀 없는 물건 (hr·img·youtube) — 래퍼문단이 감싼다
//   container 속이 있는 물건 (table·ul·quote·details·code) — 래퍼문단이 감싼다
//   attr      문단 속성 wing (제목 h·정렬 a·드롭캡 dc) — 노드를 안 세우고 attrs 만 얹는다
//   tool      노드 없는 도구 (clearFormat·upload·save …) — 커맨드·버튼만 있다
export type WingPlace = 'mark' | 'void' | 'container' | 'attr' | 'tool';

// 컨테이너가 데려오는 구조 타입(표의 행·칸, 리스트의 항목)의 속 선언.
export interface StructureDecl {
  // blocks = 속이 블록(문단·물건·컨테이너) / inline = 속이 글·라인(문단처럼 직접 든다).
  readonly holds: 'blocks' | 'inline';
  // 문단 하나로 고정 — 그 속의 엔터는 분할이 아니라 라인이다 (표의 칸).
  readonly singleParagraph?: boolean;
  // 값이 1/0 뿐인 불리언 attr 이름 (체크 ck, 펼침 o …).
  readonly boolAttrs?: readonly string[];
}

// --- 키 소유 -------------------------------------------------------------------------

export type KeyName = 'enter' | 'tab' | 'shiftTab' | 'backspace' | 'delete' | 'arrow';
export type ArrowDir = 'left' | 'right' | 'up' | 'down';

export interface KeyIntent {
  readonly key: KeyName;
  // arrow 일 때만 온다.
  readonly dir?: ArrowDir;
}

// 캐럿 자리를 품는, 이 wing 소유의 가장 안쪽 노드.
export interface OwnerAt {
  readonly path: readonly number[];
  readonly node: ElementNode;
}

// null = pass — "내 일이 아니다"를 명시적으로 답한다. 트리 동일성으로 짐작하지 않는다 (④).
export type OnKey = (
  intent: KeyIntent,
  doc: NabiDoc,
  sel: Selection,
  env: EditEnv,
  owner: OwnerAt,
) => CommandOutcome | null;

// --- 선언형 부속 (계약 밖 리스너 금지의 다른 반쪽) ---------------------------------------
// wing 이 표면(DOM)에 손을 대야 할 때(표의 칸 드래그 칠 등)는 리스너를 직접 달지 않고
// 이 훅을 선언한다 — mount(surface)가 붙이고, 반환한 해제 함수를 unmount 가 부른다.

export interface AttachHost {
  readonly root: HTMLElement;
  readonly nabi: Nabi;
  // 편집기 DOM 의 data-key → 문서 경로 (없으면 null) — 표면의 사상을 wing 이 재구현하지 않게.
  pathOfKey(id: string): readonly number[] | null;
}

export type Attach = (host: AttachHost) => () => void;

// --- 오토포맷 선언 (디스패처는 surface 09) ---------------------------------------------------

export interface InputRule {
  readonly trigger: 'space' | 'enter';
  // block(기본) = 블록 시작~캐럿 / word = 캐럿 앞 공백 없는 한 토큰.
  readonly scope?: 'block' | 'word';
  readonly pattern: RegExp;
  // 맞으면 돌릴 커맨드 — 커맨드 이름은 registry 의 명명 규칙 검사를 지난 것이어야 한다.
  readonly run: (match: RegExpMatchArray) => { readonly name: string; readonly args?: Readonly<Record<string, unknown>> };
}

// --- 툴바 선언 (그림은 ui 12 가 그린다 — 여기는 충돌 검사와 "무엇을 하는가"까지만) -----------
//
// 12 가 채운 것: `label`(다국어 레코드 — 말은 wing 옆에 산다)과 `action`(누르면 하는 일).
// **action 은 선언이지 그림이 아니다** — 격자·주소 상자·파일 상자를 어떻게 그릴지는 ui 의 몫이고
// wing 은 "표는 행·열을 받는다"·"링크는 주소를 받는다"까지만 말한다.

// 고를 수 있는 값 하나 — 값 마크의 색, 제목의 레벨, 그림의 폭.
export interface WingChoice {
  readonly value: string | number;
  readonly label?: LocaleText;
  // 보이는 글자가 줄임말일 때의 원말 (`H1` → '제목 1'). 낭독·이름표가 이것을 읽는다.
  readonly tip?: LocaleText;
  readonly svg?: string;
  // 색 견본 — 있으면 ui 가 이 색으로 칠한 네모를 그린다(글자·아이콘 대신).
  readonly swatch?: string;
}

// 사람이 채워야 하는 칸 하나 — 링크의 주소, 유튜브의 영상 주소.
export interface WingField {
  // 커맨드 인자 이름 그대로다 — ui 가 `{ [name]: 값 }` 으로 넘긴다.
  readonly name: string;
  readonly label?: LocaleText;
  readonly kind?: 'text' | 'url';
  // 비어 있어도 되는 칸인가 — 필수 칸이 비면 확인이 안 눌린다.
  readonly optional?: boolean;
  // 지금 값으로 미리 채울 attr 이름 — 고칠 때(상황 줄) 쓰인다.
  readonly attr?: string;
  // 미리 채울 글자 — **읽을 노드가 없는 자리**의 답이다(저장 이름처럼 문서에 없는 값).
  // `attr` 이 값을 찾으면 그쪽이 이긴다. 부를 때마다 새로 짓는다(오늘 날짜가 그 이유다).
  readonly initial?: () => string;
  // 이 칸의 값이 쓸 만한가 — 거짓이면 확인이 안 눌린다 (084 ⑧).
  //
  // **커맨드가 거절할 값이면 여기서도 거절이어야 한다.** 두 곳의 답이 갈리면 눌리는 확인이
  // 아무 일도 안 하고 판만 닫는 자리가 생긴다 — 사람은 무엇이 틀렸는지 못 듣는다. 그래서 새
  // 규칙을 짓지 말고 **커맨드가 이미 쓰는 검사 그대로**를 얹는다(`safeUrl`·`youtubeId` 류).
  // 검사가 없는 칸의 답은 "빈 것만 막는다"이고, 그것이 곧 커맨드의 답인 자리도 있다(저장 이름).
  //
  // 빈 칸에는 안 물어본다 — 빈 것은 `optional` 이 가른다. 값이 들어온 뒤에만 형식을 본다.
  readonly validate?: (value: string) => boolean;
}

export type WingAction =
  // 인자 없는(또는 붙박이 인자만 있는) 커맨드 하나.
  | { readonly kind: 'command'; readonly command: string; readonly args?: Readonly<Record<string, unknown>> }
  // 마크 토글 — 코어의 `toggleMark` 로 간다. 접힌 캐럿이면 문이 **부른 손**을 본다 (084 ⑨):
  // 키보드 손(힌트·가속키·프로그램 호출)은 예약이 되고, 포인터 손(직접 클릭·탭)은 예약 없이
  // 거절 + toast("적용할 대상이 없다")다. `result.arm` 을 답하는 값 마크 커맨드도 같은 규칙을 받는다.
  | { readonly kind: 'mark' }
  // 값 고르기 — 목록에서 하나. 지금 값은 `currentValue` 가 답한다.
  | {
      readonly kind: 'menu';
      readonly command: string;
      readonly argKey: string;
      readonly values: readonly WingChoice[];
    }
  // 격자 — 행·열 두 수를 한 몸짓으로 고른다(표 삽입).
  | {
      readonly kind: 'grid';
      readonly command: string;
      readonly rowsKey: string;
      readonly colsKey: string;
      readonly max?: number;
    }
  // 물어보기 — 칸을 채워 커맨드를 돌린다(링크 주소·유튜브 주소).
  | { readonly kind: 'prompt'; readonly command: string; readonly fields: readonly WingField[] }
  // 파일 고르기 — 고른 파일은 호스트의 배선(mountUpload 류)으로 흘러간다.
  | { readonly kind: 'file'; readonly accept?: string; readonly multiple?: boolean }
  // 호스트가 받는다 — 패널이 필요한 것들(로컬 히스토리 목록).
  | { readonly kind: 'host' };

export interface WingButton {
  readonly group: string;
  // **이 필드는 코드이지 데이터가 아니다.** ui 가 `innerHTML` 로 꽂으므로(아이콘은 태그 뭉치다)
  // 여기 오는 글자는 wing 을 **쓴 사람**의 것이어야 한다. 호스트가 사용자 입력으로 wing 을 짓게
  // 하면 그 자리가 곧 구멍이다 — 사용자에게서 온 글자는 절대 여기 오면 안 된다.
  readonly svg?: string;
  // 다국어 이름 — aria-label 과 툴팁이 된다. 없으면 ui 가 사전의 `wing.<w>` 를 본다.
  readonly label?: LocaleText;
  // 힌트 모드(Shift 연타)의 한 글자 — 라틴 대문자·숫자 하나, 겹치면 등록이 죽는다.
  readonly shortcut?: string;
  // 가속키 — `mod+<소문자>` 하나, 겹치면 등록이 죽는다.
  readonly accelerator?: string;
  // 누르면 하는 일. 없으면 ui 가 `toggle<Wing>` 류를 짐작하지 않는다 — 그냥 안 그린다.
  readonly action?: WingAction;
  // 이 단추가 대표하는 값 — 있으면 눌림이 "이 wing 이 걸렸나"가 아니라 "이 값이 걸렸나"로 갈린다.
  // 정렬 셋(왼쪽·가운데·오른쪽)이 한 wing 의 단추 셋으로 서는 자리다.
  readonly value?: string | number;
  // 이 단추만의 이름 — 없으면 wing 의 이름을 쓴다. 한 wing 이 단추를 여럿 낼 때 필요하다.
  readonly name?: string;
  // **가속키가 누를 때만 다른 답.** 없으면 가속키도 `action` 을 그대로 누른다.
  //
  // 저장이 그 자리다: 단추를 누르는 손은 "이름을 정해서 내보내겠다" 이고 ⌘S 를 누르는 손은
  // "지금 그대로 저장" 이다. 같은 일을 시키면 ⌘S 마다 이름 칸이 떠서 손이 멈춘다.
  readonly accelerated?: WingAction;
}

// --- 상황 줄 선언 (컨트롤 종류별로 렌더러가 갈린다 — 옛 230줄 refresh 를 안 짓기 위한 모양) ---
//
// 지금 값을 읽는 길은 **하나**다: `attr` 이 선언돼 있으면 노드의 그 attr, 아니면 wing 의
// `currentValue`. currentValue 는 **상태 토큰**이다(공백으로 이은 여러 낱말 — 표의 'merged th')
// 그래서 눌림은 "같다"가 아니라 "토큰을 품는다"로 읽는다 (10 판단).

interface ContextBase {
  // 이 wing 안에서 유일한 이름 — data 표식과 힌트 탐색의 손잡이다.
  readonly name: string;
  readonly label?: LocaleText;
  // 아이콘 조각 — `WingButton.svg` 와 같다. **코드이지 데이터가 아니다.**
  readonly svg?: string;
  // 보이는 글자가 줄임말일 때의 원말 (`~70%` → '가로 70%'). 있으면 이름표·낭독이 이것을 쓴다.
  readonly tip?: LocaleText;
  // 이 노드에서만 서는 컨트롤 — 없으면 늘 선다. (표의 '병합 풀기'가 병합된 칸에서만 뜨는 자리)
  readonly visible?: (node: ElementNode) => boolean;
}

export type ContextControl =
  // 누르면 커맨드 하나 — 눌림 표시가 없다(행 추가·열 삭제 류의 "하는 일").
  | (ContextBase & {
      readonly kind: 'button';
      readonly command: string;
      readonly args?: Readonly<Record<string, unknown>>;
    })
  // 켜짐/꺼짐 — `token` 이 지금 상태 토큰에 있으면 눌린 것이다.
  | (ContextBase & {
      readonly kind: 'toggle';
      readonly command: string;
      readonly args?: Readonly<Record<string, unknown>>;
      readonly token: string;
    })
  // 값 고르기 — 지금 값과 같은 칸이 눌린다.
  | (ContextBase & {
      readonly kind: 'select';
      readonly command: string;
      readonly argKey: string;
      readonly values: readonly WingChoice[];
      readonly attr?: string;
    })
  // 눈금 위 슬라이더 — 단계가 순서대로 서고 손잡이가 지금 단계에 앉는다. 값이 **순서를 갖는**
  // 것만 이 꼴이다(글자 크기·서체·폭). 고르는 칸이 여섯이면 줄이 여섯 칸을 먹지만 슬라이더는
  // 하나다 — 상황 줄이 한 줄로 끝나는 까닭이 이것이다.
  //
  // 끄는 동안은 옆의 글자만 움직이고 **손을 뗄 때 한 번만** 커맨드가 돈다 (ui 가 지킨다):
  // 매 단계 돌리면 끌기 하나가 통째로 되돌리기에 쌓여, Ctrl+Z 한 번이 몸짓의 한 걸음만 되돌린다.
  | (ContextBase & {
      readonly kind: 'range';
      readonly command: string;
      readonly argKey: string;
      // 배열 순서가 곧 눈금 순서다. 값이 `''` 인 칸은 **쉬는 자리**(값 없음)이고 눌린 적이 없다.
      readonly values: readonly WingChoice[];
      readonly attr?: string;
      // 아무 값도 안 걸렸을 때 손잡이가 앉는 값 — 없으면 `''` 칸, 그것도 없으면 첫 칸이다.
      readonly rest?: string;
      // 손잡이 옆에 지금 단계의 이름을 글자로 세운다.
      readonly readout?: boolean;
    })
  // 글 한 줄 — 지금 값으로 채워 두고, 확정하면 커맨드로 간다.
  | (ContextBase & {
      readonly kind: 'text';
      readonly command: string;
      readonly argKey: string;
      readonly attr?: string;
      // 칸을 채울 지금 값 — `attr` 보다 먼저 본다. attr 하나로 못 읽는 값(링크의 **표시 이름**은
      // 속성이 아니라 그 마크가 덮은 글이다)이 이 문으로 온다.
      readonly initial?: (node: ElementNode) => string | undefined;
      readonly placeholder?: LocaleText;
      // 값이 쓸 만한가 — 거짓이면 확정이 안 된다(문서를 안 건드린다).
      readonly validate?: (value: string) => boolean;
    })
  // 판을 띄워 칸을 채운다 — 상황 줄에 인라인으로 두기엔 칸이 여럿인 것(주소 + 이름표).
  // 넣을 때(`WingAction.prompt`)와 고칠 때가 **같은 판**이다. 다른 것은 칸이 미리 차 있다는 것뿐.
  | (ContextBase & {
      readonly kind: 'prompt';
      readonly command: string;
      readonly fields: readonly WingField[];
    })
  // 크게 보기 — 커맨드를 안 돌린다(본다고 문서가 바뀌지 않는다). 값은 노드의 attr 에서 읽는다.
  | (ContextBase & {
      readonly kind: 'lightbox';
      // 그림 주소가 든 attr 이름. 그 attr 이 비면 컨트롤이 안 선다.
      readonly src: string;
      readonly alt?: string;
    });

export interface WingContext {
  // 그룹 이름표 — 상황 줄이 여럿일 때 어느 것이 무엇인지 말한다.
  readonly title?: LocaleText;
  readonly controls: readonly ContextControl[];
}

// --- Wing -----------------------------------------------------------------------------------

export interface Wing {
  // 이름 — 노드의 `w` 값이자 wing 의 정체. 예약어(p·br)는 못 쓴다.
  readonly w: string;
  readonly place: WingPlace;

  // container 전용 — 자기 속의 갈래. void 는 속이 없고 mark·attr·tool 은 해당 없다.
  readonly holds?: 'blocks' | 'inline';
  readonly singleParagraph?: boolean;
  readonly boolAttrs?: readonly string[];
  // 데려오는 구조 타입들 (표의 tr·td, 리스트의 li) — 키가 그 타입의 `w` 다. 옛 owns 의 자리.
  readonly parts?: Readonly<Record<string, StructureDecl>>;
  // 컨테이너가 품는 자식 타입 제한 — 벗어난 자식은 repair 앞에서 걷힌다(껍데기 벗기기).
  readonly allows?: readonly string[];
  // 이 중 하나는 함께 등록돼야 한다 (upload → a·img 류).
  readonly requiresAnyOf?: readonly string[];

  // attr 전용 — 문단 속성 키(h·a·dc)와 허용 값. cocoon 의 화이트리스트와 같은 목록이어야 한다.
  readonly attrKey?: string;
  readonly attrValues?: readonly AttrValue[];

  // 키 소유 — 캐럿이 이 wing 소유 노드 안일 때 먼저 물어본다. null = pass.
  readonly onKey?: OnKey;
  // 커맨드 조각 — 코어 내장 위에 얹힌다. 이름은 동사+목적어 카멜(등록 검사).
  readonly commands?: Readonly<Record<string, Command>>;

  // 조립 — 노드를 세우는 wing(mark·void·container)은 필수, parts 도 각자 필수 (등록 검사).
  readonly toHtml?: HtmlBuilder;
  readonly partHtml?: Readonly<Record<string, HtmlBuilder>>;
  // 들여오기의 역방향 주장 — 먼저 물어보고 null 이면 기본 대응으로 떨어진다.
  //
  // **여기서 받은 값은 검사해야 한다.** `el.attrs` 는 밖에서 온 HTML 그대로다(남의 사이트에서
  // 복사한 것일 수 있다). 주장한 attr 을 그냥 통과시키면 그 값이 트리에 박힌다 — 출력은 render 가
  // 막지만 **저장값이 오염되고**, 그 JSON 을 읽는 다른 렌더러에서 터진다. 주소는 `safeUrl`
  // 값은 제 목록으로 거른다. `repair` 를 함께 선언하면 JSON 입구에서도 같은 검사가 걸린다.
  readonly claim?: (el: ParseElement, inner: (block: boolean) => NabiNode[]) => NabiNode[] | null;

  // 자기 속 구조의 복구 (표 격자 직사각형화 류) — cocoon 이 위임 호출한다.
  // 밖에서 온 노드 하나를 제 규칙으로 고친다 — JSON 입구(cocoon)가 부르는 자리다.
  //
  // **`null` 은 "이 껍데기는 벗겨라" 다.** 값이 화이트리스트 밖이면 고칠 것이 아니라 없던 것으로
  // 쳐야 한다: 껍데기가 벗겨지고 속이 그 자리로 올라온다(HTML 입구가 하는 것과 같다
  // `a href="javascript:"` 가 평문이 되는 그 걸음). 마크 자리에서 뜻이 있고, 블록 자리에서는
  // 껍데기만 벗겨도 문서 구조가 무너질 수 있어 지금은 안 벗긴 것으로 친다.
  readonly repair?: (node: ElementNode) => ElementNode | null;
  readonly partRepair?: Readonly<Record<string, (node: ElementNode) => ElementNode>>;

  // 눌림 표시의 한 길 — 노드에서 지금 값을 읽는다 (ui 12 가 쓴다).
  readonly currentValue?: (node: ElementNode) => string | undefined;
  // 마크 전용 — 이 키가 눌리면 예약의 음수 방향(마크 벗고 쓰기)이 선다 (④).
  readonly escapeKeys?: readonly string[];

  // 표면 부속 — 선언형이다. mount 가 붙이고 떼며, wing 은 계약 밖 리스너를 달지 않는다.
  readonly attach?: Attach;

  readonly inputRules?: readonly InputRule[];
  readonly button?: WingButton;
  // 단추가 **여럿**인 wing — 값마다 자리를 갖는 것들이다(정렬 왼쪽·가운데·오른쪽).
  // 차림표로 접으면 지금 어느 쪽으로 정렬돼 있는지 줄에서 안 보인다: 접는 것은 자리를 아끼는
  // 대신 상태를 감춘다. 자주 쓰고 상태가 곧 답인 것은 펼쳐 둔다.
  readonly buttons?: readonly WingButton[];
  // 상황 줄 선언 — 캐럿이 이 wing 소유 노드 안일 때 상황 줄이 이 선언을 읽어 그린다 (12).
  readonly context?: WingContext;
  // 이 wing 의 시트 — 문자열로 굳혀 오면 코어가 주입한다(13).
  readonly styles?: string;
}

// 노드를 세우는 갈래인가 — toHtml 필수 검사의 기준.
export function erectsNode(place: WingPlace): boolean {
  return place === 'mark' || place === 'void' || place === 'container';
}
