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

// `.nabi` 원형은 **io 층으로 내려갔다** — 내장 필터 셋(nabi·html·md)이 한 자리에 모여야
// 저장 형식의 순서가 한 곳에서 정해지기 때문이다. 부르던 이름은 여기서 그대로 다시 나간다:
// 공개 경로(`wings/file/file.ts`)는 안 바뀐다.
export * from '../../io/file.js';

// DOM 없는 자리의 기본 — 저장할 곳도 열 곳도 없다. mountFile 이 인스턴스 소유 구현으로 덮는다.
const inert: Command = () => null;

export const saveFileWing: Wing = {
  w: 'save',
  place: 'tool',
  commands: { saveFile: inert },
  button: {
    group: 'file',
    // Ctrl+S, 맥에서는 ⌘S. **이 wing 을 등록한 편집기에만 있는 키다** — 안 든 편집기에서는
    // 단추가 없고, 단추가 없으면 툴바가 그 키를 듣지도 삼키지도 않는다(브라우저의 "이 페이지
    // 저장" 이 그대로 뜬다). 저장 기능 자체는 코어(`mountFile`)에 살지만 그것을 부르는 문은
    // 호스트의 손잡이(`FileMount.save()`)이지 키가 아니다 (260823_013).
    accelerator: 'mod+s',
    svg: SAVE_ICON,
    label: SAVE_NAME,
    // **두 손이 같은 판을 연다.** 옛 판은 갈랐다 — 단추는 이름을 묻고 ⌘S 는 그대로 저장했다.
    // 형식이 여럿이 된 뒤로 그 갈래가 뜻을 잃는다: "지금 그대로" 라는 답이 무엇으로 저장할지를
    // 안 말하기 때문이다. 그래서 `accelerated` 를 걷었다 — 가속키는 이제 단추를 그냥 누른다
    // (`toolbar.ts` 의 `accelerate()` 가 선언이 없으면 `fire()` 로 떨어진다). **키를 삼키는
    // 것은 판이 실제로 열릴 때뿐이다** — 저장 판(`mountToolbar({ file })`)도 호스트의 손
    // (`onHost`)도 안 끼운 편집기에서는 ⌘S 가 브라우저의 것으로 그냥 흘러간다.
    //
    // 이름 칸도 여기서 사라졌다: 형식을 고르는 자리와 이름을 적는 자리가 한 판이라, 칸의 선언은
    // 판(`ui/save.ts`)이 든다. wing 이 말하는 것은 "이 단추는 호스트의 판을 연다" 하나다.
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
