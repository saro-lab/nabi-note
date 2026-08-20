// 나비 편집기를 세우는 데 호스트가 **실제로 선언해야 하는 것** — 데모 페이지 자신의 조작부와
// 갈라 두었다. 이 파일만 보고도 "이 정도만 선언하면 되는구나" 가 한눈에 오게.
//
// 여기 사는 것은 둘뿐이다: **어떤 wing 을 등록하는가**와 **각 부품을 어디에 붙이는가**.
// 데모 자신의 UI(언어 칩·미리보기·HTML 판)는 `main.ts` 가 갖는다 — 그것은 데모의 일이지
// 호스트의 일이 아니다.
//
// 배선이 있어야 사는 wing 이 셋이다(등록만 하면 커맨드가 조용히 아무 일도 안 한다):
// upload → `mountUpload`, save·open → `mountFile`, localHistory → `mountLocalHistory`.
import {
  browserFileStore,
  browserHistoryStorage,
  collectSheets,
  createNabiWith,
  injectSheets,
  localHistoryWing,
  mountContextToolbar,
  mountFile,
  mountHints,
  mountPickedMark,
  mountLocalHistory,
  mountSticky,
  mountSurface,
  mountToolbar,
  mountUpload,
  mountUploadView,
  openHistoryPanel,
  mountViewTools,
  parseNodes,
  renderStoredHtml,
  watchSettle,
  wings,
  type FileMount,
  type HistoryMount,
  type Nabi,
  type Registry,
  type Surface,
  type Toolbar,
  type UploadMount,
  type UploadTask,
  type UploadView,
  type Wing,
} from '../src/index.js';
// 보는 쪽 런타임 — **호스트가 든다.** 미리보기는 발행된 쪽과 같은 화면이라, 읽는 사람이 거기서
// 겪는 것(표 정렬·코드 색칠)도 살아 있어야 한다. 코어가 대신 걸어 줄 수 없다: viewer 는 ui 의
// 위층이다. 문은 하나뿐이라(`attachViewer`) 나중에 보는 쪽 기능이 늘어도 이 줄은 그대로다.
import { attachViewer } from '../src/viewer/index.js';

// 편집기가 들어설 자리들 — 전부 호스트의 DOM 이다 (`index.html` 이 그 모양을 보여 준다).
export interface EditorHosts {
  // `.nabi` 뿌리 — 시트의 격리 자리이자 전체화면이 통째로 고정할 상자다.
  readonly root: HTMLElement;
  // 붙는 크롬 — 툴바 줄 + 상황 줄을 함께 품는다(스티키 띠의 위 변이 이 아랫변이다).
  readonly chrome: HTMLElement;
  readonly toolbar: HTMLElement;
  readonly context: HTMLElement;
  // 보기 도구(미리보기·전체화면) 둘이 서는 자리.
  readonly tools: HTMLElement;
  // 쓰는 자리 — contenteditable.
  readonly content: HTMLElement;
}

export interface StandOptions {
  readonly doc?: unknown;
  readonly locale?: string;
  // 등록할 wing 목록 — 안 주면 `demoWings` 전부다. 데모가 wing 을 껐다 켤 수 있어서 인자다.
  // 진짜 호스트는 자기 목록을 한 번 넘기고 다시는 신경 안 쓴다.
  readonly wings?: readonly Wing[];
  // 판·감시를 안 붙이는 가벼운 편집기 — 아래의 빈 편집기가 쓴다.
  readonly bare?: boolean;
  // 모바일 키보드 보정 — 데모가 스위치로 껐다 켠다. 호스트가 붙이거나 마는 코어 mount 다.
  readonly keyboardInset?: boolean;
}

export interface StoodEditor {
  readonly nabi: Nabi;
  readonly registry: Registry;
  readonly surface: Surface;
  readonly toolbar: Toolbar;
  readonly upload: UploadMount;
  readonly file: FileMount | null;
  readonly history: HistoryMount | null;
  unmount(): void;
}

// 둘에 옵션을 얹는다 — **짝이라 한쪽만 켜면 안 된다.** 커밋(`upload`)이 주소를 통과시켜도 그림
// wing(`img`)이 안 받으면 그림이 안 서고, 반대도 마찬가지다. 데모의 업로더가 `data:`·`blob:` 을
// 돌려주기 때문에 둘 다 열어야 한다 — 진짜 호스트는 전송한 주소를 돌려주므로 기본값이 맞다.
// `.all()` 뒤의 `.use(w, options)` 는 이미 든 wing 을 그 옵션으로 갈아 끼우는 뜻이다(087).
export const demoWings: readonly Wing[] = wings()
  .all()
  .use('img', { allowLocalUrls: true })
  .use('upload', { allowLocalUrls: true })
  .build();

// 데모의 전송 훅 — 서버가 없으니 파일을 `data:` 주소로 읽어 그 자리에서 돌려준다.
// 진짜 호스트는 여기서 자기 서버로 올리고 돌려받은 주소를 답한다.
//
// **진행률을 흉내 낸다** — 즉시 답해 버리면 진행률 화면을 볼 수가 없고, 그 화면이야말로 데모가
// 보여야 할 것 중 하나다. 걸음은 old 와 같다: **5%씩 스무 걸음, 45ms 간격**(약 0.9초).
//
// 이 촘촘함이 요점이다. 진짜 콜백이 촘촘히 오면 화면의 숫자는 그것을 따라가고 티커는 거의 안
// 나선다 — 티커는 **콜백이 뜸할 때를 메우는 쪽**이지 앞장서는 쪽이 아니다. 띄엄띄엄 답하면
// 티커가 혼자 99까지 달려가 버려서, 진짜 진행과 화면이 어긋난 것처럼 보인다.
const sleep = (ms: number): Promise<void> => new Promise((done) => setTimeout(done, ms));

async function demoUpload(task: UploadTask): Promise<{ uri: string } | null> {
  const file = task.file as unknown as File;
  for (let percent = 5; percent <= 100; percent += 5) {
    await sleep(45);
    if (task.signal.aborted) return null;
    task.onProgress(percent);
  }
  if (!file.type.startsWith('image/')) {
    // 그림이 아닌 파일도 올라간 것으로 친다 — 첨부 링크가 된다.
    // `blob:` 을 돌려주지 않는 까닭: 그 주소는 이 탭에서만 살아서, 눌러도 아무 일이 없는
    // 첨부가 문서에 박힌다. 진짜로 열리는 주소 하나를 답해 첨부가 첨부처럼 굴게 한다.
    return { uri: 'https://nabi.saro.me/file-link-test.txt' };
  }
  const bytes = new Uint8Array(await file.arrayBuffer());
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return { uri: `data:${file.type};base64,${btoa(binary)}` };
}

export function standEditor(hosts: EditorHosts, options: StandOptions = {}): StoodEditor {
  const owner = hosts.root.ownerDocument;
  const locale = options.locale ?? owner.documentElement.lang;

  // 1. 에디터 하나 — wing 목록이 갈래 지식·커맨드·조립기를 함께 짓는다.
  const { nabi, registry } = createNabiWith(options.wings ?? demoWings, {
    // 묻는 길 — 끼운 칸만 이긴다. `confirm` 만 끼운다: 코어는 물을 사람이 없으면 "아니오" 로
    // 답하니(머리 없는 곳에서도 돌아야 하니까) 브라우저에서 정말 물으려면 이 한 줄이 필요하다.
    // `message` 는 일부러 안 끼운다 — 그러면 core 기본 toast(info) 로 흐르고, 그것이 기본값의
    // 견본이다. 자기 대화상자·알림이 있는 페이지는 `message` 나 `toast` 옵션에 제 것을 물린다.
    ask: {
      confirm: (text) => owner.defaultView?.confirm(text) ?? false,
    },
    ...(options.doc !== undefined ? { doc: options.doc } : {}),
    // 문이 제 이름으로 하는 말("적용할 대상이 없다", 084 ⑨)도 화면의 언어를 따라간다.
    ...(locale ? { locale } : {}),
    allowLocalUrls: true,
    parseHtml: parseNodes,
  });

  // 2. 시트 — 발행 패키지를 쓰는 호스트는 `nabi-note/nabi.css` 를 걸면 되고, 여기서는 런타임에 붙인다.
  const dropSheets = injectSheets(owner, collectSheets(registry));

  // 3. 배선이 있어야 사는 wing 셋.
  // `UploadFile` 은 이름·크기·종류만 약속한다(wings 층은 DOM 타입을 안 든다) — 브라우저에서
  // 흘러온 실물은 `File` 이라 그것으로 읽는다.
  // 업로드 화면(자리표시자·진행률·나비 그림·거절 문구·취소)은 ui 의 것이고, 전송은 surface 의
  // 것이다. 둘을 잇는 선은 넷뿐이다 — 시작·진행·끝·거절.
  let uploadView: UploadView | null = null;
  const upload = mountUpload({
    nabi,
    uploader: demoUpload,
    root: hosts.content,
    // 데모의 한도 — 진짜 호스트는 자기 서버가 받는 만큼을 적는다.
    extensions: ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'pdf', 'txt', 'zip'],
    maxFileSize: 10 * 1024 * 1024,
    maxTotalSize: 20 * 1024 * 1024,
    // 첨부 링크의 글자("첨부파일")를 이 말로 고른다 — 커밋은 커맨드라 말을 모른다.
    ...(locale ? { locale } : {}),
    onStart: (tasks) => uploadView?.start(tasks),
    onProgress: (id, percent) => uploadView?.progress(id, percent),
    // 숫자를 100 까지 몰고(커밋 전) → 커밋 → 자리표시자를 걷는다(커밋 뒤). 그 차례가 요점이다.
    onSettle: () => uploadView?.settle(),
    onDone: () => uploadView?.done(),
    // `onReject` 는 안 끼운다 — 안 끼우면 부속이 toast 로 말한다(그것이 기본값의 견본이다).
    // 제 알림판을 가진 호스트만 여기에 제 것을 물린다.
  });
  uploadView = mountUploadView({ nabi, surface: hosts.content, upload, ...(locale ? { locale } : {}) });
  // 열기·저장·로컬 기록은 편집기 **하나**를 문다 — 한 페이지에 편집기가 둘이면 짝도 둘이어야
  // 하는데, 데모의 빈 편집기는 그 짝을 아예 안 든다(안 들면 나중에 문 쪽이 이기는 일도 없다).
  const file = options.bare
    ? null
    : mountFile({ nabi, store: browserFileStore(owner), name: () => 'nabi-note', ...(locale ? { locale } : {}) });
  // **저장소가 막혀도 부속은 세운다** (`file://` 에서 열면 null 이 온다). 안 세우면 wing 단추가
  // 아무 데도 안 닿아 조용히 죽고, 왜 안 열리는지 말할 자리가 사라진다 — 그 말은 판의 것이다.
  const history = options.bare ? null : mountLocalHistory({ nabi, storage: browserHistoryStorage(owner.defaultView) });

  // 4. 편집 표면 — 드롭·붙여넣기로 온 파일은 먼저 `.nabi` 인지 물어보고, 아니면 업로드로 간다.
  const surface = mountSurface({
    nabi,
    registry,
    root: hosts.content,
    allowLocalUrls: true,
    fileSink: (files) => {
      if (!file) {
        upload.take(files);
        return;
      }
      void file.takeFiles(files).then((taken) => {
        if (!taken) upload.take(files);
      });
    },
  });

  // 5. 화면 도구 — 몸짓 가라앉기 하나를 툴바·상황 줄·스티키가 나눠 쓴다.
  const settle = watchSettle(owner, { surface: hosts.content });
  const common = { nabi, registry, surface: hosts.content, settle, ...(locale ? { locale } : {}) };

  const toolbar = mountToolbar({
    ...common,
    root: hosts.toolbar,
    onFiles: (files) => upload.take(files),
    // 판이 필요한 도구(로컬 기록)는 호스트가 받는다 — 다만 **모양은 호스트가 짓지 않는다**.
    // ui 가 부품 하나(`openHistoryPanel`)로 내놓으므로 호스트는 그 문을 부르기만 한다.
    // 호스트가 직접 그리면 호스트마다 다른 모양이 나오고, 그러면 이 기능의 생김새란 것이 없어진다.
    onHost: (w) => {
      if (w !== localHistoryWing.w || !history) return;
      openHistoryPanel({
        history,
        surface: hosts.content,
        ...(locale ? { locale } : {}),
        // 미리보기 — 기록의 저장본을 서 있는 registry 로 그린다. 에디터를 새로 짓지 않는다 (090).
        render: (record) => renderStoredHtml(JSON.parse(record.body) as unknown, registry, { allowLocalUrls: true }) ?? '',
        sessionId: history.sessionId,
      });
    },
  });
  const context = mountContextToolbar({ ...common, root: hosts.context });
  const hints = mountHints({ toolbar, context, root: hosts.chrome, surface: hosts.content });
  // 골라진 물건의 표시 — 브라우저가 그림·영상 위에 선택을 안 그려 주므로 우리가 말한다.
  const picked = mountPickedMark({ nabi, surface: hosts.content });
  const view = mountViewTools({
    nabi,
    surface: hosts.content,
    root: hosts.root,
    container: hosts.tools,
...(locale ? { locale } : {}),
    // 선언 한 줄 — 보는 쪽 런타임을 미리보기 본문에 통째로 건다(표 정렬 + 코드 색칠).
    // 표식(`data-nabi-sortable`)이 달린 표만 붙는다 — 기본값 그대로다. 여기서 `'all'` 로 넓히면
    // 발행 페이지에서 안 도는 표가 미리보기에서만 돌아, 미리보기가 거짓말을 하게 된다.
    // 색칠에 `highlight` 를 안 넘긴다 — **내장 토크나이저로 색이 뜨는지**가 데모가 보일 것이다
    // (하이라이터를 꽂는 견본은 nabi-web 의 데모가 shiki 로 보인다).
    onBody: (body) => attachViewer(body, ...(locale ? [{ locale }] : [])),
  });
  // 붙는 크롬의 셋 중 **보정**만 mount 다 — 붙을지 말지는 `.nabi-toolbar` 클래스이고, 얼마나
  // 내려 붙을지는 `--nabi-sticky-top` 토큰이다. 둘은 호스트가 DOM·CSS 로 직접 만진다.
  const sticky =
    options.keyboardInset === false
      ? null
      : mountSticky({ root: hosts.root, surface: hosts.content, chrome: hosts.chrome, settle });

  return {
    nabi,
    registry,
    surface,
    toolbar,
    upload,
    file,
    history,
    unmount() {
      // 세운 역순으로 뗀다.
      sticky?.unmount();
      view.unmount();
      picked.unmount();
      hints.unmount();
      context.unmount();
      toolbar.unmount();
      settle.unmount();
      surface.unmount();
      history?.unmount();
      file?.unmount();
      upload.unmount();
      uploadView?.unmount();
      dropSheets();
    },
  };
}
