// 열기·저장 — 문서 하나를 통째로 `.nabi` 파일과 주고받는 도구 wing 둘.
//
// **여기 있는 것은 파일의 모양과 커맨드 선언뿐이다.** 내려받기·파일 대화상자는 DOM 이 필요하고
// wings 는 DOM 을 모른다 (경계 시험) — 그 절반은 surface 의 `mountFile` 이 든다. 두 커맨드의
// 기본 구현은 **아무 일도 안 한다**: mountFile 이 인스턴스 소유 구현으로 덮어쓴다
// (`$registerCommand` — 저장소도 편집기 손잡이도 인스턴스의 것이지 모듈의 것이 아니다).
//
// 저장소가 인터페이스인 것이 요점이다 — 브라우저 내려받기는 그 구현 하나일 뿐이고
// 플러그인·데스크톱 호스트는 저마다 자기 것을 들고 온다.
import type { Command } from '../../editor/index.js';
import type { Wing } from '../../wing/index.js';
import type { LocaleText } from '../../locale/index.js';

// 이름 둘 — old 사전 이식(14 로케일).
const SAVE_NAME: LocaleText = { ko: '저장', en: 'Save', ja: '保存', zh: '保存', de: 'Speichern', fr: 'Enregistrer', es: 'Guardar', pt: 'Salvar', ru: 'Сохранить', ar: 'حفظ', hi: 'सहेजें', bn: 'সংরক্ষণ করুন', ur: 'محفوظ کریں', id: 'Simpan' };
const OPEN_NAME: LocaleText = { ko: '열기', en: 'Open', ja: '開く', zh: '打开', de: 'Öffnen', fr: 'Ouvrir', es: 'Abrir', pt: 'Abrir', ru: 'Открыть', ar: 'فتح', hi: 'खोलें', bn: 'খুলুন', ur: 'کھولیں', id: 'Buka' };

const SAVE_ICON =
  '<g transform="translate(8 8) scale(0.9565) translate(-8 -8.5)" stroke-width="1.464">' +
  '<path d="M2.75 2.75h8.1L13.25 5.15v8.1a1 1 0 0 1-1 1h-8.5a1 1 0 0 1-1-1v-9.5a1 1 0 0 1 1-1Z"/>' +
  '<path d="M5 2.75v3.5h5v-3.5M5 14.25v-4.5h6v4.5"/></g>';
const OPEN_ICON =
  '<g transform="translate(8 8) scale(1.0385) translate(-8.25 -8.15)" stroke-width="1.348">' +
  '<path d="M1.75 12.5v-8.4a.9.9 0 0 1 .9-.9h3.6l1.5 1.8h4.7a.9.9 0 0 1 .9.9v1.1"/>' +
  '<path d="m1.75 12.5 2-5.1h11l-2 5.1a.9.9 0 0 1-.85.6H2.6a.85.85 0 0 1-.85-.6Z"/></g>';

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
// 도 돌아야 한다). 판을 올릴 때 이 줄도 함께 올린다.
export const NABI_VERSION = '0.7.4';
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
}

export interface FileStore {
  save(file: NabiFileText): void | Promise<void>;
  open(): Promise<string | null>;
}

// DOM 없는 자리의 기본 — 저장할 곳도 열 곳도 없다. mountFile 이 인스턴스 소유 구현으로 덮는다.
const inert: Command = () => null;

// 저장 이름을 묻는 칸의 이름 — 사전에 있다(`field.save.name`).
const FILE_NAME: LocaleText = { ko: '파일 이름', en: 'File name', ja: 'ファイル名', zh: '文件名', de: 'Dateiname', fr: 'Nom du fichier', es: 'Nombre del archivo', pt: 'Nome do arquivo', ru: 'Имя файла', ar: 'اسم الملف', hi: 'फ़ाइल नाम', bn: 'ফাইলের নাম', ur: 'فائل کا نام', id: 'Nama berkas' };

export const saveFileWing: Wing = {
  w: 'save',
  place: 'tool',
  commands: { saveFile: inert },
  button: {
    group: 'file',
    // Ctrl+S, 맥에서는 ⌘S — 코어가 키를 삼키므로 브라우저의 "이 페이지 저장" 은 안 뜬다.
    accelerator: 'mod+s',
    svg: SAVE_ICON,
    label: SAVE_NAME,
    // **단추는 이름을 묻고, ⌘S 는 안 묻는다.** 두 손이 뜻하는 것이 다르다 — 단추를 누르는 손은
    // "이름을 정해서 내보내겠다" 이고 ⌘S 는 "지금 그대로 저장" 이다. 같은 일을 시키면 ⌘S 마다
    // 칸이 떠서 손이 멈춘다.
    //
    // 칸은 **날짜만** 들고 열린다. 이름까지 지어 주면 사람이 그것을 먼저 지우고 써야 한다
    // 날짜 뒤에 빈칸 하나만 두면 열리자마자 이어서 치면 된다.
    //
    // **이 칸에는 형식 검사가 없다 — 그것이 커맨드의 답과 같기 때문이다** (084 ⑧). 주소 칸들은
    // 커맨드가 거절할 값이면 확인도 안 눌리게 검사를 얹었는데, 저장 이름은 `mountFile` 의 save
    // 가 비지 않은 글자면 무엇이든 받아 확장자만 붙인다. 여기에 "쓸 수 있는 파일 이름" 규칙을
    // 새로 지으면 커맨드는 받는 이름을 확인이 막게 되고, 그 규칙은 운영체제마다 다르다
    // (금지 글자도 길이도 다르다). 그러니 답은 "빈 것만 막는다" 하나이고, 그것은 필수 칸이
    // 이미 하고 있다 — 검사를 안 다는 것이 여기서는 두 곳을 맞추는 길이다.
    action: {
      kind: 'prompt',
      command: 'saveFile',
      fields: [{ name: 'name', label: FILE_NAME, initial: () => `${today()} ` }],
    },
    accelerated: { kind: 'command', command: 'saveFile' },
  },
};

export const openFileWing: Wing = {
  w: 'open',
  place: 'tool',
  commands: { openFile: inert },
  button: {
    group: 'file',
    accelerator: 'mod+o',
    svg: OPEN_ICON,
    label: OPEN_NAME,
    action: { kind: 'command', command: 'openFile' },
  },
};

export const fileWings: readonly Wing[] = [saveFileWing, openFileWing];
