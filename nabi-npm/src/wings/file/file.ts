// 열기·저장 — `.nabi` 파일을 문서 하나와 통째로 주고받는 도구 wing 둘. 여기엔 모양과 커맨드 선언뿐이다.
// Save/open — two tool wings trading a whole document with a `.nabi` file; this file only declares shape and commands.
//
// 내려받기·대화상자는 DOM이 필요해 wings 경계 밖(surface의 `mountFile`)이 든다 — 기본 구현은 아무 일도 안 한다.
// Downloads/dialogs need the DOM, outside the wings boundary — `mountFile` (surface) overrides these no-op defaults.
import type { Command } from '../../editor/index.js';
import type { Wing } from '../../wing/index.js';
import type { LocaleText } from '../../locale/index.js';

// 이름 둘 — old 사전 이식(14 로케일).
const SAVE_NAME: LocaleText = {
  ko: '저장',
  en: 'Save',
  ja: '保存',
  zh: '保存',
  de: 'Speichern',
  fr: 'Enregistrer',
  es: 'Guardar',
  pt: 'Salvar',
  ru: 'Сохранить',
  ar: 'حفظ',
  hi: 'सहेजें',
  bn: 'সংরক্ষণ করুন',
  ur: 'محفوظ کریں',
  id: 'Simpan',
};
const OPEN_NAME: LocaleText = {
  ko: '열기',
  en: 'Open',
  ja: '開く',
  zh: '打开',
  de: 'Öffnen',
  fr: 'Ouvrir',
  es: 'Abrir',
  pt: 'Abrir',
  ru: 'Открыть',
  ar: 'فتح',
  hi: 'खोलें',
  bn: 'খুলুন',
  ur: 'کھولیں',
  id: 'Buka',
};

const SAVE_ICON =
  '<g transform="translate(8 8) scale(0.9565) translate(-8 -8.5)" stroke-width="1.464">' +
  '<path d="M2.75 2.75h8.1L13.25 5.15v8.1a1 1 0 0 1-1 1h-8.5a1 1 0 0 1-1-1v-9.5a1 1 0 0 1 1-1Z"/>' +
  '<path d="M5 2.75v3.5h5v-3.5M5 14.25v-4.5h6v4.5"/></g>';
const OPEN_ICON =
  '<g transform="translate(8 8) scale(1.0385) translate(-8.25 -8.15)" stroke-width="1.348">' +
  '<path d="M1.75 12.5v-8.4a.9.9 0 0 1 .9-.9h3.6l1.5 1.8h4.7a.9.9 0 0 1 .9.9v1.1"/>' +
  '<path d="m1.75 12.5 2-5.1h11l-2 5.1a.9.9 0 0 1-.85.6H2.6a.85.85 0 0 1-.85-.6Z"/></g>';

// `.nabi` 원형은 io 층으로 내려갔다 — 내장 필터(nabi/html/md)가 한 자리에 모여야 형식 순서가 한 곳에서 정해진다.
// The `.nabi` format itself lives in the io layer, so all built-in filters (nabi/html/md) share one ordering source.
export * from '../../io/file.js';

// DOM 없는 자리의 기본 — mountFile이 인스턴스 소유 구현으로 덮는다.
// A DOM-free default; `mountFile` overrides it with the real, instance-owned implementation.
const inert: Command = () => null;

export const saveFileWing: Wing = {
  w: 'save',
  place: 'tool',
  commands: { saveFile: inert },
  button: {
    group: 'file',
    // 이 wing을 등록한 편집기에만 있는 키다 — 안 든 편집기에서는 단추도 키도 없어 브라우저의 저장이 그대로 뜬다.
    // Only editors registering this wing get the key; without it, no button means the key falls through to the browser's own save.
    accelerator: 'mod+s',
    svg: SAVE_ICON,
    label: SAVE_NAME,
    // 가속키는 이제 단추를 그냥 누른다(형식이 여럿이 된 뒤 "지금 그대로 저장"이 뜻을 잃었다) — 판이 실제로 열릴 때만 키를 삼킨다.
    // The accelerator just clicks the button now (multiple formats made "save as-is" meaningless) — it only swallows the key when a panel is actually mounted.
    action: { kind: 'host' },
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
