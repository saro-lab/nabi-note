// 열기·저장의 표면 절반 — 내려받기와 파일 대화상자. wing 은 커맨드 이름과 가속키만 선언했고
// (wings/file), 실제로 나가고 들어오는 길은 여기서 인스턴스에 매인다.
//
// 배선은 `$registerCommand` 다 — 저장소도 편집기 손잡이도 인스턴스의 것이라, 모듈이 그것을
// 기억하면 편집기 둘이 한 저장소를 나눠 쓰게 된다.
//
// **형식은 필터가 든다.** 저장할 수 있는 형식도 열 수 있는 형식도 여기서 지어지지 않는다:
// `ioFiltersOf` 가 낸 한 목록(호스트 → wing → 내장 nabi·html·md)에서 `save` 를 든 것이 저장
// 형식이고 `read` 를 든 것이 여는 형식이다. 붙여넣기가 보는 목록과 **같은 목록**이라, 판에 뜬
// 형식과 실제로 저장되는 형식이 갈릴 자리가 없다.
import { translate, type LocaleText } from '../../locale/index.js';
import { hostOf, type Nabi } from '../../editor/index.js';
import type { ParseNode } from '../../html/index.js';
import { AsyncMountScope, DisposerStack, openFilePicker } from '../../lifecycle.js';
import { collectSheets } from '../../style/index.js';
import type { Registry } from '../../wing/index.js';
import {
  NABI_FILE_EXTENSION,
  renderMarkdown,
  textCandidate,
  today,
  writeHtmlFile,
  type DocSource,
  type FileStore,
  type IoFilter,
} from '../../io/index.js';
import { ioFiltersOf } from '../filters.js';

// 기본 저장소 — 저장은 내려받기, 열기는 파일 대화상자. 브라우저가 주는 것 그대로다
// (File System Access API 는 아직 모든 브라우저에 있지 않아 안 쓴다).
//
// 여는 확장자는 선택 인자다. 기본은 accept를 비워 모든 파일을 고를 수 있게 한다 — 모르는
// 확장자와 확장자 없는 이름도 plain text로 여는 계약이 대화상자에서 막히면 안 된다. 파일 종류를
// 제한하려는 호스트만 `readExtensions(...)` 등으로 제 목록을 만들어 넘긴다.
export function browserFileStore(owner: Document, accept: readonly string[] = []): FileStore {
  return {
    save({ name, text, mime }) {
      const view = owner.defaultView;
      // 형식은 필터가 말한다 — 옛 저장소가 `.nabi` 하나만 알던 시절의 고정값이 여기서 걷혔다.
      const blob = new Blob([text], { type: mime ?? 'application/json' });
      const url = view ? view.URL.createObjectURL(blob) : '';
      const link = owner.createElement('a');
      link.href = url;
      link.download = name;
      link.style.display = 'none';
      try {
        owner.body.append(link);
        link.click();
      } finally {
        link.remove();
        // 다음 틱에 걷는다 — 클릭이 먼저 그 주소를 읽어야 한다.
        if (view) {
          const revoke = (): void => view.URL.revokeObjectURL(url);
          try {
            view.setTimeout(revoke, 0);
          } catch {
            revoke();
          }
        }
      }
    },
    open(signal) {
      return new Promise((resolve, reject) => {
        openFilePicker(owner, {
          ...(accept.length > 0 ? { accept: accept.join(',') } : {}),
          ...(signal ? { signal } : {}),
          onCancel: () => resolve(null),
          onError: reject,
          onFiles: (files) => {
            const file = files[0];
            if (!file || signal?.aborted) {
              resolve(null);
              return;
            }
            const onAbort = (): void => resolve(null);
            signal?.addEventListener('abort', onAbort, { once: true });
            file.text().then(
              (text) => {
                signal?.removeEventListener('abort', onAbort);
                resolve(signal?.aborted ? null : { name: file.name, text });
              },
              (error) => {
                signal?.removeEventListener('abort', onAbort);
                reject(error);
              },
            );
          },
        });
      });
    },
  };
}

// 열기 대화상자가 받는 확장자 — read 계약의 명시 목록을 등록순으로 합친다.
export function readExtensions(filters: readonly IoFilter[]): readonly string[] {
  const out: string[] = [];
  for (const filter of filters) {
    for (const ext of filter.read?.extensions ?? []) {
      const normalized = ext.toLowerCase();
      if (normalized !== '' && !out.includes(normalized)) out.push(normalized);
    }
  }
  return out;
}

// 이름의 확장자 — 소문자로 견준다(운영체제가 `.NABI` 를 준다).
const endsWith = (name: string, ext: string): boolean => name.toLowerCase().endsWith(ext.toLowerCase());

export interface FileMountOptions {
  readonly nabi: Nabi;
  readonly store: FileStore;
  // 형식 목록의 출처 — md 조립(`mdBuilders`)도 html 조립(`builders`)도 여기서 온다.
  readonly registry: Registry;
  // 이 편집기에만 끼우는 필터 — 목록의 맨 앞에 선다.
  readonly ioFilters?: readonly IoFilter[];
  readonly parse?: (html: string) => readonly ParseNode[];
  readonly allowLocalUrls?: boolean;
  // 확장자 없는 저장 이름 — 저장하는 순간에 부르므로 호스트가 자기 제목을 따라갈 수 있다.
  readonly name?: () => string;
  // 쓰던 글을 잃기 전에 묻는 말. 기본 문구는 **사전의 것**이다 (12 — 11 이 남긴 한국어 하드코딩을
  // locale 로 옮겼다). 호스트가 자기 말을 주면 그것이 이긴다. 묻는 길 자체는 인스턴스의
  // 것이다(`$ask` — 머리 없는 환경은 침묵).
  readonly discardMessage?: string;
  readonly locale?: string;
  readonly onError?: (error: unknown) => void;
}

// 저장 판이 단추를 세울 재료 — 판은 이것만 보고 그린다(필터를 직접 안 만진다).
export interface SaveFormat {
  readonly id: string;
  readonly label: LocaleText | string;
  readonly extension: string;
  // 되돌아오지 못할 수 있다 — 판이 "(손실저장)" 을 붙이는 근거다.
  readonly lossy: boolean;
}

// 호스트가 손으로 저장·열기를 부르는 **정본 문**이다 (260823_013).
//
// wing 은 단추와 가속키만 든다 — 그것을 안 등록한 편집기(예: `wings().allBasic()`)에는 ⌘S·⌘O
// 도 저장 단추도 없지만, `mountFile` 을 부른 호스트는 이 손잡이로 언제든 저장하고 연다:
//
//   const file = mountFile({ nabi, registry, store });
//   file.save();                 // 기본 형식(.nabi)으로 바로
//   file.saveAs('markdown');     // 형식을 골라서 — id 는 file.formats() 가 준다
//   await file.open();           // 저장소의 대화상자를 열고, 문서가 갈렸으면 true
//   openSavePanel({ file, surface });   // 판까지 우리 것으로 (ui 의 부품)
//
// `nabi.applyCommand('saveFile')` 도 돈다(mountFile 이 그 이름을 인스턴스에 심는다) — 다만
// 그것은 **단추·키가 지나는 안쪽 길**이라 답이 없다(문서를 안 바꾸므로 늘 null). 프로그램이
// 부르는 자리에는 이 손잡이를 쓴다: 이름 인자도, 형식 고르기도, 열기의 참·거짓도 여기 있다.
export interface FileMount {
  // 기본 형식(`.nabi`)으로 저장한다 — 커맨드(`saveFile`)가 오는 문이 이것이다.
  save(name?: string): void;
  // 형식을 골라 저장한다 — 저장 판의 단추가 오는 문.
  saveAs(id: string, name?: string): void;
  formats(): readonly SaveFormat[];
  open(): Promise<boolean>;
  unmount(): void;
}

export function mountFile(options: FileMountOptions): FileMount {
  const { nabi, store, registry } = options;
  const fail = (error: unknown): void => {
    try {
      options.onError?.(error);
    } catch {
      // Error reporting must not become another file operation failure.
    }
  };
  const releases = new DisposerStack();
  const openLifetime = new AsyncMountScope();
  const saveLifetime = new AsyncMountScope();
  let openController: AbortController | null = null;

  // 목록 하나 — 붙여넣기가 보는 것과 같은 순서다(호스트 → wing → nabi → html → md).
  const filters = ioFiltersOf({
    registry,
    ...(options.ioFilters ? { extra: options.ioFilters } : {}),
    ...(options.parse ? { parse: options.parse } : {}),
    ...(options.allowLocalUrls ? { allowLocalUrls: true } : {}),
  });
  const savers = filters.filter((filter) => filter.save !== undefined);

  const formats = (): readonly SaveFormat[] =>
    savers.map((filter) => ({
      id: filter.id,
      label: filter.label,
      extension: filter.save?.extension ?? '',
      lossy: filter.save?.lossy === true,
    }));

  // 저장이 읽는 문서 — 전부 늦게 판다. 부르는 형식 하나만 실제로 파인다.
  const docSource = (title: string): DocSource => ({
    json: () => nabi.getJson(),
    // **자립형 한 장이다** — 조각에 문서 껍데기와 시트를 얹는다(io 의 순수 함수가 그 일을 한다).
    html: () =>
      writeHtmlFile({
        title,
        sheets: collectSheets(registry),
        body: nabi.getHtml(),
        ...(options.locale !== undefined ? { lang: options.locale } : {}),
      }),
    // md 는 등록된 어휘만 적는다 — 못 적는 노드는 그것만 html 로 떨어진다(renderMarkdown 의 폴백).
    md: () =>
      `${renderMarkdown(hostOf(nabi).doc(), {
        env: hostOf(nabi).env,
        builders: registry.mdBuilders,
        html: {
          env: hostOf(nabi).env,
          builders: registry.builders,
          ...(options.allowLocalUrls ? { allowLocalUrls: true } : {}),
        },
      })}\n`,
  });

  // 이름 짓기 — 준 이름이 없으면 `날짜 + 호스트의 제목`. 확장자는 형식이 붙인다(이미 그 확장자로
  // 끝나면 두 번 안 붙인다).
  const nameFor = (extension: string, name?: string): string => {
    const base =
      name !== undefined && name.trim() !== '' ? name.trim() : `${today()} ${options.name?.() ?? 'document'}`;
    return endsWith(base, extension) ? base : `${base}${extension}`;
  };

  const saveAs = (id: string, name?: string): void => {
    if (saveLifetime.disposed) return;
    const filter = savers.find((item) => item.id === id);
    const spec = filter?.save;
    if (!spec) return; // 없는 형식은 조용히 아무 일도 안 한다 — 판이 낸 id 만 여기 온다
    const chosen = nameFor(spec.extension, name);
    // **저장하던 그 순간의 트리**를 쥔다 — 저장이 오래 걸리는 동안 친 글자는 여전히 "바뀐 것"
    // 으로 남아야 하므로, 기준선은 지금 트리가 아니라 이것이다.
    const saved = hostOf(nabi).doc();
    const canonical = spec.canonical;
    const generation = canonical ? saveLifetime.next() : 0;
    const alive = (): boolean => !saveLifetime.disposed && (!canonical || saveLifetime.active(generation));
    try {
      const text = spec.write(docSource(chosen.slice(0, chosen.length - spec.extension.length) || chosen));
      const answer = store.save({
        name: chosen,
        text,
        ...(spec.mime !== undefined ? { mime: spec.mime } : {}),
      });
      let pending = false;
      if ((typeof answer === 'object' && answer !== null) || typeof answer === 'function') {
        pending = typeof (answer as { readonly then?: unknown }).then === 'function';
      }
      if (pending) {
        void Promise.resolve(answer).then(
          () => {
            if (canonical && alive()) hostOf(nabi).markSaved(saved);
          },
          (error) => {
            if (alive()) fail(error);
          },
        );
      } else if (canonical && alive()) {
        hostOf(nabi).markSaved(saved);
      }
    } catch (error) {
      if (alive()) fail(error);
    }
  };

  // 기본 형식 — `.nabi` 다. 목록에 없으면(호스트가 내장 셋을 걷어냈다면) 첫 형식이 기본이다.
  const defaultId = (): string =>
    (savers.find((filter) => filter.save?.extension === NABI_FILE_EXTENSION) ?? savers[0])?.id ?? '';

  const save = (name?: string): void => saveAs(defaultId(), name);

  // 연다는 것의 뜻은 한 곳이다 — 어느 형식으로 오든 같은 문을 지난다.
  // **쓰던 글이 있으면 먼저 묻는다** — 묻는 길은 인스턴스의 것이고(`$ask`), 머리 없는 환경은
  // 침묵으로 지나간다(silentAsk = 예). 묻는 것은 **한 번뿐**이다: 어느 필터가 읽었든 문서를
  // 갈아 끼우는 순간은 하나다.
  const install = async (name: string, text: string, alive: () => boolean): Promise<boolean> => {
    if (!alive()) return false;
    const readers = filters.filter(
      (filter) => filter.read?.extensions.some((extension) => endsWith(name, extension)) === true,
    );
    let body: unknown = readers.length === 0 ? textCandidate(text, '').build() : null;
    for (const filter of readers) {
      const answer = filter.read?.run(name, text);
      if (answer !== null && answer !== undefined) {
        body = answer;
        break;
      }
    }
    if (body === null) throw new TypeError(`No reader accepted ${name}`);
    if (!alive()) return false;
    if (nabi.isChanged()) {
      const go = await hostOf(nabi).ask.confirm(
        options.discardMessage ?? translate('openWhileChanged', options.locale ?? 'en'),
      );
      if (!go || !alive()) return false;
    }
    if (!alive()) return false;
    if (!nabi.setJson(body)) throw new TypeError(`Reader returned an invalid document for ${name || 'unnamed file'}`);
    return true;
  };

  // 여는 것은 문서를 통째로 갈아 끼우는 일이라 편집기만 할 수 있다 — 답이 나중에 오므로
  // 커맨드가 아니라 여기서 기다렸다가 `setJson` 한다.
  const open = async (): Promise<boolean> => {
    if (openLifetime.disposed) return false;
    openController?.abort();
    const controller = new AbortController();
    openController = controller;
    const generation = openLifetime.next();
    const alive = (): boolean => openLifetime.active(generation) && !controller.signal.aborted;
    try {
      const answer = await store.open(controller.signal);
      if (!alive() || answer === null || answer === undefined) return false; // 취소는 오류가 아니다
      return await install(answer.name, answer.text, alive);
    } catch (error) {
      if (alive()) fail(error);
      return false;
    } finally {
      if (openController === controller) openController = null;
    }
  };

  // 커맨드는 문(door)을 지나 오는 이름이다 — 툴바·가속키가 부르는 그 이름 그대로 덮는다.
  releases.add(
    hostOf(nabi).registerCommand('saveFile', (_doc, _sel, args) => {
      save(typeof args['name'] === 'string' ? (args['name'] as string) : undefined);
      return null; // 저장은 문서를 안 바꾼다 — 되돌리기 지점도 안 남는다
    }),
  );
  releases.add(
    hostOf(nabi).registerCommand('openFile', () => {
      void open();
      return null; // 문서는 나중에 온다 — 이 커맨드가 그것을 앉히는 자리가 아니다
    }),
  );

  return {
    save,
    saveAs,
    formats,
    open,
    unmount() {
      openLifetime.dispose();
      saveLifetime.dispose();
      openController?.abort();
      openController = null;
      releases.dispose();
    },
  };
}
