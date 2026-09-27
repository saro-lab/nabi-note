// 내장 필터 셋(nabi·html·md)이 저장 순서를 한 곳에서 정하려고 io 층에 산다 — DOM·편집기는 안 문다.
// `wings/file/file.ts`가 이 파일을 그대로 다시 내보내 공개 경로는 그대로다.
// Lives in the io layer so the builtin filter set (nabi/html/md) can fix the save order in one place, with no DOM/editor dependency. Re-exported as-is from `wings/file/file.ts` to keep the public path stable.

export const NABI_FILE_EXTENSION = '.nabi';

// `body`는 getJson이 주는 값 그대로라 파일과 API가 같은 모양을 나른다.
// `body` is exactly what getJson returns, so the file and the API share one shape.
export interface NabiFileBody {
  readonly version: string;
  readonly body: unknown;
}

// package.json 버전의 앞 둘만 쓴다(1.2.3 -> 1.2, 패치 자리는 파일 모양과 무관) — 읽을 때는 검사하지 않는다(2026-08-17),
// 판이 갈리기 전까지는 모양만 맞으면 읽는다. package.json을 코어가 직접 못 읽어 손으로 맞춘다(scripts/sync-version.mjs).
// Only the first two segments of the package version (1.2.3 -> 1.2, patch doesn't affect file shape); unchecked on read as of 2026-08-17, any file whose shape matches loads until versions actually diverge. Hand-kept because the core can't read package.json itself (scripts/sync-version.mjs keeps it in sync).
export const NABI_VERSION = '1.1.1';
export const NABI_FILE_VERSION = NABI_VERSION.split('.').slice(0, 2).join('.');

export function writeNabiFile(body: unknown): string {
  const file: NabiFileBody = { version: NABI_FILE_VERSION, body };
  return JSON.stringify(file);
}

// 모양이 아니면 null — 던지지 않는다(밖에서 온 글자다). body가 없으면 통째로 나비트리로 본다.
// Returns null on a shape mismatch instead of throwing (this text came from outside); no `body` means the whole thing is the tree.
export function readNabiFile(text: string): unknown | null {
  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch {
    return null;
  }
  if (Array.isArray(value)) return value;
  if (typeof value !== 'object' || value === null) return null;
  const holder = value as Partial<NabiFileBody>;
  const body = 'body' in holder ? holder.body : value;
  return body === undefined || body === null ? null : body;
}

// 이름으로만 판정한다 — 브라우저가 `.nabi`에 자기 mime 타입을 안 준다.
// Judged by name alone; browsers don't assign `.nabi` a mime type of their own.
export function isNabiFile(file: { readonly name?: string }): boolean {
  return (file.name ?? '').toLowerCase().endsWith(NABI_FILE_EXTENSION);
}

// 로컬 날짜다, UTC가 아니라 — 파일 이름의 날짜는 저장한 사람의 달력이지 서버의 것이 아니다.
// Local date, not UTC — the file name's date belongs to whoever saved it, not the server.
export function today(now = new Date()): string {
  const pad = (value: number): string => String(value).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

export function defaultFileName(name = 'document', now = new Date()): string {
  return `${today(now)} ${name}${NABI_FILE_EXTENSION}`;
}

// 바깥으로 나가는 유일한 문 — open은 사람이 물러서면 null을 답한다(취소는 오류가 아니다).
// The only door out; open resolves to null when the person backs out (a cancel isn't an error).
export interface NabiFileText {
  readonly name: string;
  readonly text: string;
  // 필터가 정하는 형식 — `.nabi`는 application/json, `.md`는 text/markdown.
  // Format is the filter's call — `.nabi` is application/json, `.md` is text/markdown.
  readonly mime?: string;
}

export interface FileStore {
  save(file: NabiFileText): void | PromiseLike<void>;
  // 이름까지 답한다 — 확장자로 읽을 필터를 고른다. 모르는 확장자는 plain text로 읽는다.
  // Resolves with the name too, since the extension picks the reading filter; an unknown one falls back to plain text.
  open(signal?: AbortSignal): PromiseLike<NabiFileText | null>;
}
