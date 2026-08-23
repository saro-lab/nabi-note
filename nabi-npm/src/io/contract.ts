// IO 필터 계약 — 글이 문서로 들어오고(붙여넣기·열기) 문서가 글로 나가는(저장) 길이
// 지나는 하나의 문이다. 필터는 wing 이 아니다: 노드를 안 세우고 키도 안 가지며, 아는 것은
// "이 글자를 내가 읽을 수 있나"뿐이다.
//
// 이 층은 editor 를 모른다 — 여기 오는 값은 전부 schema·html·locale 의 것이다.
import type { LocaleText } from '../locale/index.js';
import type { ElementNode, SchemaEnv } from '../schema/index.js';

// 붙여넣은 파일 하나의 최소 모양 — 이 층은 DOM 타입(File)을 안 든다.
export interface ClipFile {
  readonly name: string;
  readonly type: string;
  readonly size: number;
}

// 이벤트가 아니라 그 순간 떠 둔 값이다 — clipboardData 는 동기 구간 밖에서 죽는다.
export interface PasteData {
  readonly html: string;
  readonly plain: string;
  readonly files: readonly ClipFile[];
  readonly types: readonly string[];
}

// 붙여넣기 후보 하나 — 판에 뜨는 줄 하나가 이것이다.
export interface PasteCandidate {
  readonly id: string;
  readonly label: LocaleText | string;
  // **늦게 판다** — 후보 넷을 다 파 놓고 하나만 쓰는 것은 낭비다.
  build(): readonly ElementNode[];
  // 판에 뜨는 그림 — 16×16 svg 의 **속**(path 몇 개)이다. 껍데기는 그리는 쪽이 씌운다.
  // 없어도 된다: 호스트 필터의 후보는 이름만으로 가운데 선다(빈 자리를 안 남긴다).
  readonly icon?: string;
  // 한 줄짜리 맨 글자 — 문단을 안 쪼개고 캐럿에 이어 쓴다.
  readonly inline?: boolean;
}

// 저장이 읽는 문서 — 전부 늦게 판다. 부르는 쪽이 nabi·registry 로 채운다.
export interface DocSource {
  json(): unknown;
  html(): string;
  md(): string;
}

export interface IoFilter {
  readonly id: string;
  readonly label: LocaleText | string;
  // 제 것이 아니면 null. 여럿을 답하면 그 순서대로 판에 선다.
  readonly paste?: (data: PasteData) => PasteCandidate | readonly PasteCandidate[] | null;
  readonly save?: {
    readonly extension: string;
    readonly write: (doc: DocSource) => string;
    // 되돌아오지 못할 수 있다 — 저장 판이 "(손실저장)" 을 붙이는 근거다.
    readonly lossy?: boolean;
    readonly mime?: string;
  };
  // 확장자가 맞는 필터가 읽는다. **제 것이 아니면 null** — 부르는 쪽이 다음 필터로 넘어간다.
  readonly read?: (name: string, text: string) => unknown;
}

// --- md 조립 계약 -----------------------------------------------------------------------------

export interface MdContext {
  // 자식 조립. md 는 **줄이 곧 문법**이라 자식을 잇는 방법을 조립 함수가 정한다:
  //   separator — 블록 자식 사이에 끼우는 글자. 빈 줄 하나(`\n\n`)가 기본이고, 리스트는 항목이
  //     붙어 서야 하므로 `\n` 을, 표의 줄은 칸을 ` | ` 로 잇는다. 인라인 자식에는 안 쓴다.
  //   indent — 자식이 낸 **모든 줄**의 줄머리에 붙는 글자(리스트의 두 칸, 인용의 `> `).
  //     빈 줄에는 오른쪽 공백을 턴 것이 붙는다 — 인용의 빈 줄이 `>` 하나가 되는 자리다.
  children(separator?: string, indent?: string): string;
  escape(raw: string): string;
  // **이 노드를 html 로** — md 로 못 적는 것의 탈출구다.
  html(): string;
  // 지금 들여쓰기 (리스트·인용 속) — 이 걸음의 결과가 나중에 입을 줄머리다.
  readonly indent: string;
  readonly env: SchemaEnv;
}

export type MdBuilder = (node: ElementNode, ctx: MdContext) => string;
export type MdBuilders = Readonly<Record<string, MdBuilder>>;
