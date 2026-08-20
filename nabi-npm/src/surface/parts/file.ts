// 열기·저장의 표면 절반 — 내려받기와 파일 대화상자. wing 은 커맨드 이름과 가속키만 선언했고
// (wings/file), 실제로 나가고 들어오는 길은 여기서 인스턴스에 매인다.
//
// 배선은 `$registerCommand` 다 — 저장소도 편집기 손잡이도 인스턴스의 것이라, 모듈이 그것을
// 기억하면 편집기 둘이 한 저장소를 나눠 쓰게 된다.
import { translate } from '../../locale/index.js';
import type { Nabi } from '../../editor/index.js';
import {
  NABI_FILE_EXTENSION,
  defaultFileName,
  isNabiFile,
  readNabiFile,
  writeNabiFile,
  type FileStore,
} from '../../wings/file/file.js';

// 기본 저장소 — 저장은 내려받기, 열기는 파일 대화상자. 브라우저가 주는 것 그대로다
// (File System Access API 는 아직 모든 브라우저에 있지 않아 안 쓴다).
export function browserFileStore(owner: Document): FileStore {
  return {
    save({ name, text }) {
      const view = owner.defaultView;
      const blob = new Blob([text], { type: 'application/json' });
      const url = view ? view.URL.createObjectURL(blob) : '';
      const link = owner.createElement('a');
      link.href = url;
      link.download = name;
      link.style.display = 'none';
      owner.body.append(link);
      link.click();
      link.remove();
      // 다음 틱에 걷는다 — 클릭이 먼저 그 주소를 읽어야 한다.
      if (view) view.setTimeout(() => view.URL.revokeObjectURL(url), 0);
    },
    open() {
      return new Promise((resolve) => {
        const input = owner.createElement('input');
        input.type = 'file';
        input.accept = NABI_FILE_EXTENSION;
        input.style.display = 'none';
        // 취소는 이벤트를 안 낸다 — 파일이 없으면 null 로 답하고 끝낸다.
        input.addEventListener(
          'change',
          () => {
            const file = input.files?.[0];
            input.remove();
            if (!file) {
              resolve(null);
              return;
            }
            file.text().then(resolve, () => resolve(null));
          },
          { once: true },
        );
        owner.body.append(input);
        input.click();
      });
    },
  };
}

export interface FileMountOptions {
  readonly nabi: Nabi;
  readonly store: FileStore;
  // 확장자 없는 저장 이름 — 저장하는 순간에 부르므로 호스트가 자기 제목을 따라갈 수 있다.
  readonly name?: () => string;
  // 쓰던 글을 잃기 전에 묻는 말. 기본 문구는 **사전의 것**이다 (12 — 11 이 남긴 한국어 하드코딩을
  // locale 로 옮겼다). 호스트가 자기 말을 주면 그것이 이긴다. 묻는 길 자체는 인스턴스의
  // 것이다(`$ask` — 머리 없는 환경은 침묵).
  readonly discardMessage?: string;
  readonly locale?: string;
  readonly onError?: (error: unknown) => void;
}

// 드롭·붙여넣기로 온 파일의 최소 모양 — DOM 의 File 이 그대로 맞는다.
export interface DroppedFile {
  readonly name: string;
  text(): Promise<string>;
}

export interface FileMount {
  save(name?: string): void;
  open(): Promise<boolean>;
  // 떨어뜨리거나 붙여넣은 파일 중 `.nabi` 하나를 연다. 우리 파일이 아니면 false
  // 부르는 쪽(surface 의 fileSink)이 그때 업로드로 흘려보낸다.
  takeFiles(files: readonly DroppedFile[]): Promise<boolean>;
  unmount(): void;
}

export function mountFile(options: FileMountOptions): FileMount {
  const { nabi, store } = options;
  const fail = options.onError ?? ((): void => undefined);

  const save = (name?: string): void => {
    const chosen = name !== undefined && name.trim() !== ''
      ? `${name.trim()}${name.trim().endsWith(NABI_FILE_EXTENSION) ? '' : NABI_FILE_EXTENSION}`
      : defaultFileName(options.name?.() ?? 'document');
    // **저장하던 그 순간의 트리**를 쥔다 — 저장이 오래 걸리는 동안 친 글자는 여전히 "바뀐 것"
    // 으로 남아야 하므로, 기준선은 지금 트리가 아니라 이것이다.
    const saved = nabi.$doc();
    try {
      const answer = store.save({ name: chosen, text: writeNabiFile(nabi.getJson()) });
      if (answer instanceof Promise) answer.then(() => nabi.$markSaved(saved)).catch(fail);
      else nabi.$markSaved(saved);
    } catch (error) {
      fail(error);
    }
  };

  // 연다는 것의 뜻은 한 곳이다 — 버튼·가속키로 오든 드롭·붙여넣기로 오든 같은 문을 지난다.
  // **쓰던 글이 있으면 먼저 묻는다** — 묻는 길은 인스턴스의 것이고(`$ask`), 머리 없는 환경은
  // 침묵으로 지나간다(silentAsk = 예).
  const install = async (text: string): Promise<boolean> => {
    const body = readNabiFile(text);
    if (body === null) return false; // 우리 형식이 아니다 — 쓰던 글은 그대로 둔다
    if (nabi.isChanged()) {
      const go = await nabi.$ask.confirm(
        options.discardMessage ?? translate('openWhileChanged', options.locale ?? 'en'),
      );
      if (!go) return false;
    }
    return nabi.setJson(body);
  };

  // 여는 것은 문서를 통째로 갈아 끼우는 일이라 편집기만 할 수 있다 — 답이 나중에 오므로
  // 커맨드가 아니라 여기서 기다렸다가 `setJson` 한다.
  const open = async (): Promise<boolean> => {
    try {
      const text = await store.open();
      if (text === null) return false; // 취소는 오류가 아니다
      return await install(text);
    } catch (error) {
      fail(error);
      return false;
    }
  };

  const takeFiles = async (files: readonly DroppedFile[]): Promise<boolean> => {
    const file = files.find((item) => isNabiFile(item));
    if (!file) return false;
    try {
      return await install(await file.text());
    } catch (error) {
      fail(error);
      return false;
    }
  };

  // 커맨드는 문(door)을 지나 오는 이름이다 — 툴바·가속키가 부르는 그 이름 그대로 덮는다.
  nabi.$registerCommand('saveFile', (_doc, _sel, args) => {
    save(typeof args['name'] === 'string' ? (args['name'] as string) : undefined);
    return null; // 저장은 문서를 안 바꾼다 — 되돌리기 지점도 안 남는다
  });
  nabi.$registerCommand('openFile', () => {
    void open();
    return null; // 문서는 나중에 온다 — 이 커맨드가 그것을 앉히는 자리가 아니다
  });

  return {
    save,
    open,
    takeFiles,
    unmount() {
      // 인스턴스가 살아 있는 한 이름은 되돌릴 것이 없다 — 다시 아무 일도 안 하는 기본으로.
      nabi.$registerCommand('saveFile', () => null);
      nabi.$registerCommand('openFile', () => null);
    },
  };
}
