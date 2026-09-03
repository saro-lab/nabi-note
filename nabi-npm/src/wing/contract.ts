// Wing 계약 v2 — 확장점의 표면. 이 계약은 말이 아니라 registry가 검사로 지킨다
// Wing contract v2, the surface of the extension point; enforced by the registry, not by convention
import type { LocaleText } from '../locale/index.js';
import type { AttrValue, ElementNode, NabiDoc, NabiNode } from '../schema/index.js';
import type { EditEnv } from '../doc/index.js';
import type { Selection } from '../caret/index.js';
import type { HtmlBuilder, ParseElement } from '../html/index.js';
import type { IoFilter, MdBuilder, MdBuilders } from '../io/index.js';
import type { Command, CommandOutcome, Nabi } from '../editor/index.js';

// wing의 다섯 갈래 — mark(인라인) · void(속 없는 블록) · container(속 있는 블록) · attr(문단 속성) · tool(노드 없음)
// The five wing kinds — mark (inline), void (contentless block), container, attr (paragraph attribute), tool (nodeless)
export type WingPlace = 'mark' | 'void' | 'container' | 'attr' | 'tool';

// 컨테이너가 데려오는 구조 타입(표의 행·칸, 리스트의 항목)의 속 선언
// Declares the shape of a structural child type a container brings in (table rows/cells, list items)
export interface StructureDecl {
  // blocks = 속이 문단/물건/컨테이너, inline = 속이 문단처럼 글·라인을 직접 든다
  // 'blocks' holds paragraphs/objects/containers; 'inline' holds text/lines directly, like a paragraph
  readonly holds: 'blocks' | 'inline';
  // 문단 하나로 고정 — 속의 엔터는 분할이 아니라 줄바꿈이다(표의 칸)
  // Fixed to one paragraph; Enter inside it is a line break, not a split (table cells)
  readonly singleParagraph?: boolean;
  readonly boolAttrs?: readonly string[];
  readonly attrs?: readonly string[];
}

export type KeyName = 'enter' | 'tab' | 'shiftTab' | 'backspace' | 'delete' | 'arrow';
export type ArrowDir = 'left' | 'right' | 'up' | 'down';

export interface KeyIntent {
  readonly key: KeyName;
  // arrow일 때만 온다.
  // Only present when key is 'arrow'.
  readonly dir?: ArrowDir;
}

// 캐럿 자리를 품는, 이 wing 소유의 가장 안쪽 노드.
// The innermost node owned by this wing that holds the caret position.
export interface OwnerAt {
  readonly path: readonly number[];
  readonly node: ElementNode;
}

// null은 트리 동일성으로 짐작하지 않고 "내 일이 아니다"를 명시적으로 답한 것이다.
// null explicitly answers "not my job" rather than being inferred from tree equality.
export type OnKey = (
  intent: KeyIntent,
  doc: NabiDoc,
  sel: Selection,
  env: EditEnv,
  owner: OwnerAt,
) => CommandOutcome | null;

// wing이 표면(DOM)에 손대야 할 때(표의 칸 드래그 칠 등)는 리스너를 직접 달지 않고 이 훅을 선언한다.
// When a wing must touch the surface DOM (e.g. table cell drag-paint), it declares this hook instead of attaching listeners directly.
export interface AttachHost {
  readonly root: HTMLElement;
  readonly nabi: Nabi;
  doc(): NabiDoc;
  readonly env: EditEnv;
  // 편집기 DOM의 data-key → 문서 경로(없으면 null) — 표면의 사상을 wing이 재구현하지 않게.
  // Maps editor DOM's data-key to a document path (null if none), so wings don't reimplement the surface's own mapping.
  pathOfKey(id: string): readonly number[] | null;
  // attach 조립 중 먼저 단 부작용은 즉시 걸어 둔다 — 그 뒤 attach가 던져도 mount transaction이 걷는다.
  // A side effect attached early during attach setup is registered immediately, so it's still cleaned up even if attach throws afterward.
  onDispose(dispose: () => void): void;
}

export type Attach = (host: AttachHost) => () => void;

export interface InputRule {
  readonly trigger: 'space' | 'enter';
  // block(기본) = 블록 시작~캐럿 / word = 캐럿 앞 공백 없는 한 토큰.
  // block (default) spans from block start to caret; word is the whitespace-free token right before the caret.
  readonly scope?: 'block' | 'word';
  readonly pattern: RegExp;
  // 맞으면 돌릴 커맨드 — 이름은 registry의 명명 규칙 검사를 지난 것이어야 한다.
  // The command to run on a match; its name must pass the registry's naming check.
  readonly run: (match: RegExpMatchArray) => {
    readonly name: string;
    readonly args?: Readonly<Record<string, unknown>>;
  };
}

// action은 선언이지 그림이 아니다 — 격자·주소 상자를 어떻게 그릴지는 ui 몫이고, wing은 "무엇을 하는가"만 말한다.
// action is a declaration, not a drawing — how to render a grid or an address box is UI's job; a wing only states what it does.

// 고를 수 있는 값 하나 — 값 마크의 색, 제목의 레벨, 그림의 폭.
// A single selectable value — a value mark's color, a heading's level, an image's width.
export interface WingChoice {
  readonly value: string | number;
  readonly label?: LocaleText;
  // 보이는 글자가 줄임말일 때의 원말(`H1` → '제목 1') — 낭독·이름표가 이것을 읽는다.
  // The full form when the visible text is an abbreviation (`H1` -> 'Heading 1'); read by screen readers and tooltips.
  readonly tip?: LocaleText;
  readonly svg?: string;
  // 색 견본 — 있으면 ui가 이 색으로 칠한 네모를 그린다(글자·아이콘 대신).
  // A color swatch; when present, the UI paints a colored square instead of text or an icon.
  readonly swatch?: string;
}

// 사람이 채워야 하는 칸 하나 — 링크의 주소, 유튜브의 영상 주소.
// One field the user must fill in — a link's address, a YouTube video's URL.
export interface WingField {
  // 커맨드 인자 이름 그대로다 — ui가 `{ [name]: 값 }` 으로 넘긴다.
  // Matches the command's argument name exactly; the UI passes it as `{ [name]: value }`.
  readonly name: string;
  readonly label?: LocaleText;
  readonly kind?: 'text' | 'url';
  // 비어 있어도 되는 칸인가 — 필수 칸이 비면 확인이 안 눌린다.
  // Whether the field may stay empty; a required field left empty disables the confirm button.
  readonly optional?: boolean;
  // 지금 값으로 미리 채울 attr 이름 — 고칠 때(상황 줄) 쓰인다.
  // The attr name to pre-fill from the current value; used when editing via the context bar.
  readonly attr?: string;
  // 읽을 노드가 없을 때만 쓰는 값이다 — attr이 값을 찾으면 그쪽이 이기고, 매번 새로 짓는다(오늘 날짜가 그 예).
  // Used only when there's no node to read from; `attr` wins if it finds a value, and this is recomputed on each call (e.g. today's date).
  readonly initial?: () => string;
  // 커맨드가 거절할 값이면 여기서도 거절해야 한다 — 새 규칙을 짓지 말고 커맨드가 쓰는 검사(safeUrl 등)를 그대로 쓴다.
  // Must reject whatever the command would reject — reuse the command's own check (e.g. safeUrl) instead of inventing a new rule.
  readonly validate?: (value: string) => boolean;
}

export type WingAction =
  // 인자 없는(또는 붙박이 인자만 있는) 커맨드 하나.
  // A command with no arguments, or only fixed ones.
  | { readonly kind: 'command'; readonly command: string; readonly args?: Readonly<Record<string, unknown>> }
  // 마크 토글 — 접힌 캐럿이면 입력 손을 본다: 키보드는 예약, 포인터는 거절+toast.
  // Mark toggle; with a collapsed caret it checks the input source — keyboard arms it, pointer rejects with a toast.
  | { readonly kind: 'mark' }
  // 값 고르기 — 목록에서 하나. 지금 값은 `currentValue` 가 답한다.
  // Pick one from a list; the current value comes from `currentValue`.
  | {
      readonly kind: 'menu';
      readonly command: string;
      readonly argKey: string;
      readonly values: readonly WingChoice[];
    }
  // 격자 — 행·열 두 수를 한 몸짓으로 고른다(표 삽입).
  // A grid; picks two numbers (rows, cols) in one gesture, used for table insertion.
  | {
      readonly kind: 'grid';
      readonly command: string;
      readonly rowsKey: string;
      readonly colsKey: string;
      readonly max?: number;
    }
  // 물어보기 — 칸을 채워 커맨드를 돌린다(링크 주소·유튜브 주소).
  // Prompt; fills in fields then runs the command (a link's address, a YouTube URL).
  | { readonly kind: 'prompt'; readonly command: string; readonly fields: readonly WingField[] }
  // 파일 고르기 — 고른 파일은 호스트의 배선(mountUpload 류)으로 흘러간다.
  // File picker; the chosen file flows into the host's wiring (mountUpload and similar).
  | { readonly kind: 'file'; readonly accept?: string; readonly multiple?: boolean }
  // 호스트가 받는다 — 패널이 필요한 것들(로컬 히스토리 목록).
  // Handled by the host — for things needing a panel (a local-history list).
  | { readonly kind: 'host' };

export interface WingButton {
  readonly group: string;
  // ui가 innerHTML로 꽂으므로 코드이지 데이터가 아니다 — 사용자 입력이 여기로 오면 XSS 구멍이 된다.
  // ui injects this via innerHTML, so it's code, not data — user input reaching here would be an XSS hole.
  readonly svg?: string;
  // 다국어 이름 — aria-label과 툴팁이 된다. 없으면 ui가 사전의 `wing.<w>` 를 본다.
  // Localized name, becomes aria-label and tooltip; falls back to the dict's `wing.<w>` if absent.
  readonly label?: LocaleText;
  // 힌트 모드(Shift 연타)의 키 — 라틴 대문자·숫자 하나 또는 위·아래 방향키, 겹치면 등록이 죽는다.
  // The hint-mode key (double-tap Shift) — one Latin letter/digit or an arrow key; a collision fails registration.
  readonly shortcut?: string;
  // 가속키 — `mod+<소문자>` 하나, 겹치면 등록이 죽는다.
  // The accelerator, `mod+<lowercase letter>`; a collision fails registration.
  readonly accelerator?: string;
  // 누르면 하는 일. 없으면 ui가 `toggle<Wing>` 류를 짐작하지 않는다 — 그냥 안 그린다.
  // What pressing it does; if absent the UI doesn't guess a `toggle<Wing>`-style default, it just isn't drawn.
  readonly action?: WingAction;
  // 이 단추가 대표하는 값 — 있으면 눌림이 "이 wing이 걸렸나"가 아니라 "이 값이 걸렸나"로 갈린다.
  // The value this button represents; when set, pressed state tracks "is this value active" rather than "is this wing active" (align left/center/right).
  readonly value?: string | number;
  // 이 단추만의 이름 — 없으면 wing의 이름을 쓴다. 한 wing이 단추를 여럿 낼 때 필요하다.
  // This button's own name; defaults to the wing's name. Needed when a wing has multiple buttons.
  readonly name?: string;
  // 가속키가 눌릴 때만의 다른 동작 — 없으면 action을 그대로 쓴다(저장 버튼 vs ⌘S).
  // A different action for when the accelerator fires, e.g. the save button prompts a name but ⌘S just saves.
  readonly accelerated?: WingAction;
}

// 지금 값을 읽는 길은 하나다 — attr이 선언돼 있으면 노드의 그 attr, 아니면 wing의 currentValue(공백으로 이은 상태 토큰).
// There's one way to read the current value: the node's `attr` if declared, otherwise the wing's currentValue (a space-joined state token).

interface ContextBase {
  // 이 wing 안에서 유일한 이름 — data 표식과 힌트 탐색의 손잡이다.
  // Unique within this wing; the handle for data markers and hint navigation.
  readonly name: string;
  readonly label?: LocaleText;
  // 아이콘 조각 — `WingButton.svg` 와 같다. 코드이지 데이터가 아니다.
  // An icon fragment, same rule as `WingButton.svg` — it's code, not data.
  readonly svg?: string;
  // 보이는 글자가 줄임말일 때의 원말(`~70%` → '가로 70%') — 있으면 이름표·낭독이 이것을 쓴다.
  // The full form when the visible text is an abbreviation (`~70%` -> 'Width 70%'); used by tooltips and screen readers.
  readonly tip?: LocaleText;
  // 이 노드에서만 서는 컨트롤 — 없으면 늘 선다(표의 '병합 풀기'가 병합된 칸에서만 뜨는 자리).
  // A control that only shows for certain nodes; e.g. a table's "unmerge" only appears on a merged cell.
  readonly visible?: (node: ElementNode) => boolean;
}

export type ContextControl =
  // 누르면 커맨드 하나 — 눌림 표시가 없다(행 추가·열 삭제 류의 "하는 일").
  // Fires a command on press with no pressed state (an action like "add row" or "delete column").
  | (ContextBase & {
      readonly kind: 'button';
      readonly command: string;
      readonly args?: Readonly<Record<string, unknown>>;
    })
  // 켜짐/꺼짐 — `token` 이 지금 상태 토큰에 있으면 눌린 것이다.
  // On/off; pressed when `token` is present in the current state token.
  | (ContextBase & {
      readonly kind: 'toggle';
      readonly command: string;
      readonly args?: Readonly<Record<string, unknown>>;
      readonly token: string;
    })
  // 값 고르기 — 지금 값과 같은 칸이 눌린다.
  // Pick a value; the option matching the current value shows pressed.
  | (ContextBase & {
      readonly kind: 'select';
      readonly command: string;
      readonly argKey: string;
      readonly values: readonly WingChoice[];
      readonly attr?: string;
    })
  // 눈금 슬라이더 — 값이 순서를 갖는 것만(글자 크기·서체·폭). 손을 뗄 때 한 번만 돈다 — 매 단계 돌리면 Ctrl+Z 한 번이 몸짓 전체를 되돌린다.
  // A stepped slider for ordered values (font size, typeface, width); the command fires once on release, not per step, or one undo would revert the whole drag.
  | (ContextBase & {
      readonly kind: 'range';
      readonly command: string;
      readonly argKey: string;
      readonly values: readonly WingChoice[];
      readonly attr?: string;
      readonly rest?: string;
      readonly readout?: boolean;
    })
  // 글 한 줄 — 지금 값으로 채워 두고, 확정하면 커맨드로 간다.
  // A single line of text, pre-filled with the current value; confirming runs the command.
  | (ContextBase & {
      readonly kind: 'text';
      readonly command: string;
      readonly argKey: string;
      readonly attr?: string;
      // attr으로 못 읽는 값(링크의 표시 이름은 속성이 아니라 마크가 덮은 글자)이 이 문으로 온다.
      // Values `attr` can't read (a link's display text is the marked-up text, not an attribute) come through this instead.
      readonly initial?: (node: ElementNode) => string | undefined;
      readonly placeholder?: LocaleText;
      readonly validate?: (value: string) => boolean;
    })
  // 넣을 때(WingAction.prompt)와 고칠 때가 같은 판이다 — 고칠 때는 칸이 미리 차 있을 뿐이다.
  // The same dialog serves both inserting (WingAction.prompt) and editing; editing just pre-fills the fields.
  | (ContextBase & {
      readonly kind: 'prompt';
      readonly command: string;
      readonly fields: readonly WingField[];
    })
  | (ContextBase & {
      readonly kind: 'lightbox';
      readonly src: string;
      readonly alt?: string;
    });

export interface WingContext {
  // 그룹 이름표 — 상황 줄이 여럿일 때 어느 것이 무엇인지 말한다.
  // A group label, distinguishing multiple context bars from each other.
  readonly title?: LocaleText;
  readonly controls: readonly ContextControl[];
}

export interface Wing {
  // 이름 — 노드의 `w` 값이자 wing의 정체. 예약어(p·br)는 못 쓴다.
  // The name — a node's `w` value and this wing's identity; reserved words (p, br) can't be used.
  readonly w: string;
  readonly place: WingPlace;

  // 호스트가 아무것도 안 끼워도 도는 wing인가 — 안 적으면 false다(upload·save처럼 서버·저장소가 필요한 것들)
  // Whether this wing works with no host wiring at all; defaults false for things needing a server or store (upload, save)
  readonly basic?: boolean;

  readonly holds?: 'blocks' | 'inline';
  readonly singleParagraph?: boolean;
  readonly boolAttrs?: readonly string[];
  readonly attrs?: readonly string[];
  readonly clearable?: boolean;
  readonly parts?: Readonly<Record<string, StructureDecl>>;
  readonly allows?: readonly string[];
  // 이 물건의 래퍼문단은 정렬을 안 받는다 — 코드 상자처럼 text-align이 내용을 흐트러뜨리는 물건이 쓴다
  // This object's wrapper paragraph gets no alignment — for objects like code boxes where text-align would garble the content
  readonly noAlign?: boolean;
  readonly requiresAnyOf?: readonly string[];

  // attr 전용 — 문단 속성 키(h·a·dc)와 허용 값. cocoon의 화이트리스트와 같은 목록이어야 한다.
  // attr kind only — the paragraph attribute key (h, a, dc) and allowed values; must match cocoon's whitelist.
  readonly attrKey?: string;
  readonly attrValues?: readonly AttrValue[];

  // 키 소유 — 캐럿이 이 wing 소유 노드 안일 때 먼저 물어본다. null = pass.
  // Key ownership; asked first when the caret is inside a node this wing owns. null means pass.
  readonly onKey?: OnKey;
  // 커맨드 조각 — 코어 내장 위에 얹힌다. 이름은 동사+목적어 카멜(등록 검사).
  // Commands layered on top of the core built-ins; names must be verb+object camelCase (checked at registration).
  readonly commands?: Readonly<Record<string, Command>>;

  // 조립 — 노드를 세우는 wing(mark·void·container)은 필수, parts도 각자 필수(등록 검사).
  // Builder; required for wings that erect a node (mark, void, container), and required per part too.
  readonly toHtml?: HtmlBuilder;
  readonly partHtml?: Readonly<Record<string, HtmlBuilder>>;
  // 안 달면 md 저장에서 html로 떨어진다 — md에 자리가 없는 것들(밑줄·유튜브·접기)은 손실보다 섞는 쪽이 낫다
  // Without this the node falls back to raw html in md output — for things md has no syntax for (underline, youtube, details), mixing beats losing them
  readonly toMd?: MdBuilder;
  readonly partMd?: MdBuilders;
  // el.attrs는 밖에서 온 HTML 그대로라 여기서 받는 값은 반드시 검사해야 한다 — 안 그러면 오염된 값이 트리에 박힌다
  // `el.attrs` is raw HTML from outside, so values claimed here must be validated or a tainted value gets baked into the tree
  readonly claim?: (el: ParseElement, inner: (block: boolean) => NabiNode[]) => NabiNode[] | null;

  readonly ioFilter?: IoFilter;

  // null은 "이 껍데기를 벗겨라"다 — 화이트리스트 밖 값은 고치지 않고 없던 것으로 쳐서 속을 끌어올린다
  // Returning null means "strip this shell" — a value outside the whitelist isn't fixed, it's treated as never having been there, promoting its contents
  readonly repair?: (node: ElementNode) => ElementNode | null;
  readonly partRepair?: Readonly<Record<string, (node: ElementNode) => ElementNode>>;

  readonly currentValue?: (node: ElementNode) => string | undefined;
  readonly escapeKeys?: readonly string[];

  // 이 키를 연타 창 안에 두 번 두드리면 그 커맨드가 돈다 — escapeKeys와 달리 마크 탈출이 아니라 한 몸짓 커맨드다
  // Double-tapping this key within the tap window fires the command; unlike `escapeKeys` this isn't about leaving a mark, it's one gesture, one command
  readonly doubleKeys?: Readonly<Record<string, string>>;

  readonly attach?: Attach;

  readonly inputRules?: readonly InputRule[];
  readonly button?: WingButton;
  // 값마다 자리를 갖는 wing의 단추들(정렬 왼쪽·가운데·오른쪽) — 차림표로 접으면 지금 상태가 안 보인다
  // Buttons for a wing where each button owns a value (align left/center/right); collapsing into a menu would hide the current state
  readonly buttons?: readonly WingButton[];
  readonly context?: WingContext;
  readonly styles?: string;
}

// 노드를 세우는 갈래인가 — toHtml 필수 검사의 기준.
// Whether this kind erects a node; the basis for the toHtml-required check.
export function erectsNode(place: WingPlace): boolean {
  return place === 'mark' || place === 'void' || place === 'container';
}
