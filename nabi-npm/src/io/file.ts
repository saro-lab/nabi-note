// `.nabi` 파일의 원형 — 무엇이 담기고, 어떤 글자가 우리 파일이며, 저장소가 어떤 모양인가.
//
// **왜 io 층인가**: 내장 필터 셋(nabi·html·md)이 한 자리에 모여야 저장 형식의 순서가
// 한 곳에서 정해진다. 이 파일이 wings 에 남으면 io 가 위층(wings)을 무는 꼴이라 nabi 필터만
// 홀로 wing 을 타고 와야 했다. 담는 값은 전부 글자와 JSON 이라 여기 살 자격이 있다 —
// DOM 도 편집기도 안 문다.
//
// 공개 경로는 안 바뀐다: `wings/file/file.ts` 가 이 파일을 그대로 다시 내보낸다.

export const NABI_FILE_EXTENSION = '.nabi';

// `.nabi` 파일이 담는 것. `body` 는 getJson 이 주는 그 값이라, 파일과 API 가 같은 모양을 나른다.
export interface NabiFileBody {
  readonly version: string;
  readonly body: unknown;
}

// 판 이름 — **나비 자신의 판이다.** `package.json` 의 버전에서 앞의 둘만 쓴다: `1.2.3` 이면 `1.2`.
//
// 왜 셋이 아니라 둘인가: 셋째 자리는 고친 것을 세는 자리라 파일 모양과 아무 상관이 없다. 그것까지
// 찍으면 같은 모양의 파일이 판 이름만 수백 가지가 되어, 나중에 물어볼 것이 없어진다. 앞의 둘은
// 모양이 바뀔 때만 움직인다.
//
// **쓰기만 하고 읽을 때는 안 본다** (2026-08-17). 지금 이 값은 "나중에 볼 수도 있다"
// 수준의 표식이고, 거를 판이 아직 하나도 없다 — 판이 여럿 생기고 모양이 실제로 갈릴 때 그때
// 규칙을 정한다. 그전에 문을 세우면 **읽을 수 있는 파일을 우리가 막는다**(손으로 만든 파일
// 판을 안 적은 파일, 앞선 판으로 저장했다 되돌아온 파일). 지금 규칙은 하나다 — 모양이 맞으면
// 읽는다.
//
// 여기 손으로 적는 까닭: 코어는 `package.json` 을 안 읽는다(번들러마다 읽는 법이 다르고, 서버에서
// 도 돌아야 한다). 판을 올릴 때 이 줄도 함께 올린다(`scripts/sync-version.mjs` 가 맞춘다).
export const NABI_VERSION = '0.8.4';
export const NABI_FILE_VERSION = NABI_VERSION.split('.').slice(0, 2).join('.');

export function writeNabiFile(body: unknown): string {
  const file: NabiFileBody = { version: NABI_FILE_VERSION, body };
  return JSON.stringify(file);
}

// 파일 글자 → 그 안의 문서 JSON. 모양이 아니면 null 이다 — 던지지 않는다(밖에서 온 글자다).
// `body` 가 없으면 나비트리를 통째로 담은 파일로 본다(손으로 만든 파일이 그렇다).
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

// 우리 파일인가 — 이름으로 본다. 브라우저는 `.nabi` 에 자기 mime 타입을 안 준다.
export function isNabiFile(file: { readonly name?: string }): boolean {
  return (file.name ?? '').toLowerCase().endsWith(NABI_FILE_EXTENSION);
}

// `yyyy-MM-dd` — 저장 이름 앞에 붙는다. UTC 가 아니라 **로컬 날짜**다: 파일 이름의 날짜는
// 그것을 저장한 사람의 달력이지 서버의 것이 아니다.
export function today(now = new Date()): string {
  const pad = (value: number): string => String(value).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

// 이름 기본값 훅 — 호스트가 자기 제목을 따라가게 저장하는 순간에 부른다.
export function defaultFileName(name = 'document', now = new Date()): string {
  return `${today(now)} ${name}${NABI_FILE_EXTENSION}`;
}

// 저장소 — 바깥으로 나가는 유일한 문. 둘 다 비동기여도 되고, `open` 은 사람이 물러섰을 때
// null 로 답한다 (취소는 오류가 아니고 오류처럼 보여서도 안 된다).
export interface NabiFileText {
  readonly name: string;
  readonly text: string;
  // 이 글자가 어떤 형식인가 — 필터가 말한다(`.nabi` 는 application/json, `.md` 는 text/markdown).
  // 안 오면 `.nabi` 로 본다: 옛 저장소는 이 칸을 모르고 우리 파일만 받았다.
  readonly mime?: string;
}

export interface FileStore {
  save(file: NabiFileText): void | Promise<void>;
  // **이름까지 답한다** — 확장자가 어느 필터로 읽을지를 정하므로, 이름 없이는 `.html`·`.md` 를
  // 못 연다. 옛 모양(글자만)도 계속 받는다: 그때는 `.nabi` 로 본다.
  open(): Promise<string | NabiFileText | null>;
}
