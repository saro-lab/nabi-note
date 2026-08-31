// 필터는 wing이 아니다 — 노드도 키도 안 갖고 "이 글자를 읽을 수 있나"만 안다. editor는 모른다.
// A filter isn't a wing — no nodes, no keys, it only knows "can I read this text." Unaware of editor.
import type { LocaleText } from '../locale/index.js';
import type { ElementNode, SchemaEnv } from '../schema/index.js';

// DOM 타입(File)을 안 든다 — 이 층이 드는 것은 이름·타입·크기뿐이다.
// No DOM type (File) — just name/type/size.
export interface ClipFile {
  readonly name: string;
  readonly type: string;
  readonly size: number;
}

// 이벤트가 아니라 그 순간의 값이다 — clipboardData는 동기 구간 밖에서 죽는다.
// A snapshot, not the event — clipboardData dies outside the synchronous window.
export interface PasteData {
  readonly custom: string;
  readonly html: string;
  readonly plain: string;
  readonly files: readonly ClipFile[];
  readonly types: readonly string[];
}

export interface PasteCandidate {
  readonly id: string;
  readonly label: LocaleText | string;
  // 늦게 판다 — 후보를 다 지어 놓고 하나만 쓰는 것은 낭비다.
  // Built lazily — building every candidate just to use one would be wasted work.
  build(): readonly ElementNode[];
  // 16×16 svg의 속(path)만 — 없으면 호스트 후보처럼 이름만으로 가운데 선다.
  // Just the inner paths of a 16x16 svg; without one it centers on the label alone.
  readonly icon?: string;
  // 한 줄짜리 맨 글자 — 문단을 안 쪼개고 캐럿에 이어 쓴다.
  // A one-line plain-text candidate appends at the caret instead of splitting a paragraph.
  readonly inline?: boolean;
}

export interface DocSource {
  json(): unknown;
  html(): string;
  md(): string;
}

export interface IoFilter {
  readonly id: string;
  readonly label: LocaleText | string;
  // 제 것이 아니면 null — 여럿을 답하면 그 순서대로 판에 선다.
  // Null if it's not this filter's data; an array lands in that order.
  readonly paste?: (data: PasteData) => PasteCandidate | readonly PasteCandidate[] | null;
  readonly save?: {
    readonly extension: string;
    readonly write: (doc: DocSource) => string;
    // 성공한 저장을 편집기의 clean baseline으로 삼을 정본 형식인가.
    // Whether a successful save becomes the editor's clean baseline.
    readonly canonical: boolean;
    // 되돌아오지 못할 수 있다 — 저장 판의 "(손실저장)" 표시 근거.
    // May not round-trip — the basis for the save panel's "(lossy)" label.
    readonly lossy?: boolean;
    readonly mime?: string;
  };
  readonly read?: {
    // 점을 포함한 확장자 — 대소문자 구분 없이 비교한다.
    // Dot-prefixed extensions, compared case-insensitively.
    readonly extensions: readonly string[];
    readonly run: (name: string, text: string) => unknown;
  };
}

export function $assertIoFilter(value: IoFilter): void {
  const fail = (detail: string): never => {
    throw new TypeError(`Invalid IO filter: ${detail}`);
  };
  if (typeof value !== 'object' || value === null || Array.isArray(value)) fail('filter must be an object');
  const filter = value as unknown as Record<string, unknown>;
  if (typeof filter['id'] !== 'string' || filter['id'].trim() === '') fail('id must be a non-empty string');
  if (filter['paste'] !== undefined && typeof filter['paste'] !== 'function')
    fail(`"${filter['id']}" paste must be a function`);

  const save = filter['save'];
  if (save !== undefined) {
    if (typeof save !== 'object' || save === null || Array.isArray(save))
      fail(`"${filter['id']}" save must be an object`);
    const spec = save as Record<string, unknown>;
    if (typeof spec['extension'] !== 'string' || spec['extension'].length < 2 || !spec['extension'].startsWith('.')) {
      fail(`"${filter['id']}" save extension must be a non-empty dot-prefixed string`);
    }
    if (typeof spec['write'] !== 'function') fail(`"${filter['id']}" save.write must be a function`);
    if (typeof spec['canonical'] !== 'boolean') fail(`"${filter['id']}" save.canonical must be a boolean`);
    if (spec['lossy'] !== undefined && typeof spec['lossy'] !== 'boolean')
      fail(`"${filter['id']}" save.lossy must be a boolean`);
    if (spec['mime'] !== undefined && (typeof spec['mime'] !== 'string' || spec['mime'] === '')) {
      fail(`"${filter['id']}" save.mime must be a non-empty string`);
    }
  }

  const read = filter['read'];
  if (read !== undefined) {
    if (typeof read !== 'object' || read === null || Array.isArray(read))
      fail(`"${filter['id']}" read must be an object`);
    const spec = read as Record<string, unknown>;
    const extensions = spec['extensions'];
    if (!Array.isArray(extensions) || extensions.length === 0)
      fail(`"${filter['id']}" read.extensions must be a non-empty array`);
    const seen = new Set<string>();
    for (const extension of extensions as unknown[]) {
      if (typeof extension !== 'string' || extension.length < 2 || !extension.startsWith('.')) {
        fail(`"${filter['id']}" read extension must be a non-empty dot-prefixed string`);
      }
      const normalized = (extension as string).toLowerCase();
      if (seen.has(normalized)) fail(`"${filter['id']}" read extensions must be unique case-insensitively`);
      seen.add(normalized);
    }
    if (typeof spec['run'] !== 'function') fail(`"${filter['id']}" read.run must be a function`);
  }
}

// --- md 조립 계약 -----------------------------------------------------------------------------

export interface MdContext {
  // md는 줄이 곧 문법이다 — separator는 자식 사이에 끼우는 글자(기본 빈 줄, 리스트는 개행, 표는 `|`),
  // indent는 자식의 모든 줄 줄머리에 붙는 글자(리스트 두 칸, 인용 `> `).
  // md is line-as-syntax: separator joins children (blank line by default, newline for lists, `|` for tables); indent prefixes every child line (two spaces for lists, `> ` for quotes).
  children(separator?: string, indent?: string): string;
  escape(raw: string): string;
  // md로 못 적는 것의 탈출구 — 이 노드를 통째로 html로 낸다.
  // The escape hatch for what md can't express: render this node as html instead.
  html(): string;
  // 지금 들여쓰기(리스트·인용 속) — 이 걸음의 결과가 다음 줄머리가 된다.
  // Current indent inside a list/quote; this step's result becomes the next line prefix.
  readonly indent: string;
  readonly env: SchemaEnv;
}

export type MdBuilder = (node: ElementNode, ctx: MdContext) => string;
export type MdBuilders = Readonly<Record<string, MdBuilder>>;
