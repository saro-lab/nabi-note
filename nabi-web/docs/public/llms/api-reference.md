# Public API reference

This is an index, not a tutorial. Import paths are public package exports; internal source paths are not.

## Package subpaths

| Import | Runtime values |
| --- | --- |
| `nabi-note` | Full root API below |
| `nabi-note/ssr` | DOM-free rendering and toolbar HTML; see `ssr.md` |
| `nabi-note/viewer` | Reader behavior; see `viewer-diff.md` |
| `nabi-note/diff` | Document diff; see `viewer-diff.md` |
| `nabi-note/nabi.css` | Bundled stylesheet |
| `nabi-note/package.json` | Package metadata |

## Assembly

```ts
function makeRegistry(
  wings: readonly Wing[],
  extra?: { ioFilters?: readonly IoFilter[] },
): Registry;

function createNabiWith(
  wings: readonly Wing[] | { build(): readonly Wing[] },
  extra?: AssemblyOptions,
): { readonly nabi: Nabi; readonly registry: Registry };
```

The assembly options are the public `NabiOptions` plus optional registry `ioFilters`. Internal parser, environment, command, builder, and claim capabilities cannot be supplied through this public wrapper, including from untyped JavaScript.

`Registry` exposes:

```ts
interface Registry {
  readonly wings: readonly Wing[];
  readonly env: EditEnv;
  readonly builders: HtmlBuilders;
  readonly commands: Readonly<Record<string, Command>>;
  readonly claim: unknown; // package import capability; do not call directly
  readonly inputRules: readonly RegisteredRule[];
  readonly attaches: readonly Attach[];
  readonly escapes: ReadonlyMap<string, readonly string[]>;
  readonly doubles: ReadonlyMap<string, string>;
  readonly ioFilters: readonly IoFilter[];
  readonly mdBuilders: MdBuilders;
  ownerOf(typeW: string): Wing | null;
  wingOf(w: string): Wing | null;
}
```

## Editor

```ts
interface NabiOptions {
  readonly doc?: unknown;
  readonly allowLocalUrls?: boolean;
  readonly ask?: Partial<Ask>;
  readonly toast?: Toast;
  readonly toastMs?: number;  // default 1000
  readonly toastMax?: number; // default 3
  readonly onError?: (error: unknown) => void;
  readonly undoLimit?: number;    // default 200; positive integer
  readonly typingMergeMs?: number; // default 1000; 0 disables merging
  readonly locale?: string;   // default en
}
```

`undoLimit` must be an integer of 1 or greater. `typingMergeMs` must be a finite non-negative number. Invalid values throw during editor creation. Command, repair, and normalization failures return `false` and are reported through `onError`. Exceptions from `onError` and individual listeners are isolated from editor state and other listeners.

Application-level `Nabi` methods:

| Member | Contract |
| --- | --- |
| `sessionId` | Stable ID for this editor instance |
| `getJson()` | Serializable normalized tree without internal fields |
| `setJson(value)` | Load, normalize, return success |
| `getHtml()` | Published HTML |
| `getEditorHtml()` | Editing/hydration HTML; never store |
| `setHtml(html)` | Import HTML, return success |
| `applyCommand(name, args?, by?)` | Apply registered command; `by` is `keyboard|pointer` |
| `select(selection)` | Clone, normalize, and set a valid selection |
| `getSelection()` | Fresh deeply frozen selection snapshot |
| `undo()`, `redo()` | Return whether state changed |
| `group(fn)` | One undo group |
| `onChange(fn)` | Subscribe; returns unsubscribe |
| `isChanged()` | Compare with saved baseline |

The public `Nabi` facade contains no `$`-prefixed integration members. Package mounts use package-private capabilities. A wing attachment receives only its declared `AttachHost` capabilities: `root`, `nabi`, `doc()`, `env`, `pathOfKey()`, and transactional `onDispose()`.

```ts
interface Ask {
  message(text: string): void;
  confirm(text: string): boolean | Promise<boolean>;
  choose?(
    question: string,
    options: readonly { label: string; icon?: string }[],
  ): number | Promise<number>;
}

type ToastLevel = 'info' | 'warn' | 'error';
type Toast = (level: ToastLevel, message: string, ms?: number) => void;
```

`silentAsk` is the no-UI implementation. Missing partial ask members fall back to nonblocking defaults: messages may use the core toast, confirmation is false, and choice selects the first candidate when no choose sink is bound.

## Surface

```ts
interface SurfaceOptions {
  readonly nabi: Nabi;
  readonly registry: Registry;
  readonly root: HTMLElement;
  readonly hydrate?: boolean;
  readonly allowLocalUrls?: boolean;
  readonly locale?: string;
  readonly placeholder?: string;
  readonly ioFilters?: readonly IoFilter[];
  readonly fileSink?: (files: readonly File[]) => void;
  readonly doubleEnterMs?: number;      // default 350
  readonly correctionDeferMs?: number; // default 80
}

interface Surface {
  readonly actions: SurfaceActions;
  readonly port: EditSurfacePort;
  focus(): void;
  redrawAll(): void;
  unmount(): void;
}

function mountSurface(options: SurfaceOptions): Surface;
```

Each active surface owns one root. Active mount roots must not be the same node or overlap as ancestors and descendants. An overlapping mount throws immediately; separate, non-overlapping roots in the same document are supported. After the owning mount unmounts, a previously overlapping root can be mounted. Root attributes, classes, and style properties use compare-and-restore teardown, so a host change made while mounted is not overwritten. `unmount()` leaves the latest canonical read-only HTML body and removes editor-only DOM.

`SurfaceActions`: `enter`, `shiftEnter`, `tab`, `backspace`, `deleteForward`, `arrow`, `selectAll`, `escapeKey`, `breakDouble`, `afterSpace`, and `dropcapBelow`.

`EditSurfacePort`: `focus`, `readCaret`, `writeCaret`, `onInput`, and `caretRect`.

## File, upload, and history mounts

```ts
function browserFileStore(
  owner: Document,
  accept?: readonly string[],
): FileStore;

function mountFile(options: FileMountOptions): FileMount;
```

```ts
interface FileStore {
  save(file: NabiFileText): void | PromiseLike<void>;
  open(signal?: AbortSignal): PromiseLike<NabiFileText | null>;
}
```

`FileMountOptions`: `nabi`, `store`, `registry`, optional `ioFilters`, `parse`, `allowLocalUrls`, `name`, `discardMessage`, `locale`, and `onError`.

`FileMount`: `save(name?)`, `saveAs(id, name?)`, `formats()`, `open()`, and `unmount()`.

The optional open signal lets picker-backed stores clean up immediately when an open is superseded or the mount unmounts. Save completion accepts cross-realm thenables, not only native `Promise` instances.

```ts
type Uploader = (
  task: UploadTask,
) => { readonly uri: string } | null |
     Promise<{ readonly uri: string } | null>;

function mountUpload(options: UploadOptions): UploadMount;
```

`UploadOptions` contains `nabi`, `uploader`, optional `root`, limits `extensions|maxFileSize|maxTotalSize`, lifecycle callbacks `onStart|onProgress|onSettle|onDone|onReject`, and locale/translator. `UploadMount`: `take`, `isRunning`, `cancel`, `unmount`.

```ts
function browserHistoryStorage(
  view: { localStorage?: Storage } | null | undefined,
): HistoryStorage | null;

function mountLocalHistory(options: HistoryMountOptions): HistoryMount;
```

`HistoryMountOptions`: `nabi`, `storage`, optional `limit`, `minIntervalMs`, `now`. `HistoryMount`: `snapshot`, `alive`, `list`, `restore`, `forget`, `remove`, `clear`, `sessionId`, `ask`, `toast`, `unmount`.

File/history utility exports:

- `NABI_VERSION`, `NABI_FILE_VERSION`, `NABI_FILE_EXTENSION`;
- `writeNabiFile`, `readNabiFile`, `isNabiFile`, `defaultFileName`, `today`;
- `HISTORY_KEY`, `HISTORY_LIMIT`, `HISTORY_CREATED_GAP`;
- `readHistory`, `writeHistory`, `removeHistory`, `clearHistory`, `historyStorageAlive`, `historyView`, `showsCreated`, `summarize`, `exactTime`;
- `readExtensions`, `acceptFiles`, `extensionOf`, `formatBytes`, `isImageFile`.

## UI mounts

| Function | Required options | Result |
| --- | --- | --- |
| `mountToolbar` | `nabi, registry, root` | `Toolbar { buttons, refresh, unmount }` |
| `mountContextToolbar` | `nabi, registry, root` | groups/buttons plus refresh/unmount |
| `mountHints` | `toolbar, root` | active/hide/unmount |
| `mountPickedMark` | `nabi, surface` | refresh/unmount |
| `mountSticky` | `root, surface` | aim/unmount |
| `mountViewTools` | `nabi, surface, root, container` | buttons/unmount |
| `mountUploadView` | `nabi, surface` | start/progress/settle/done/unmount |

Important optional toolbar inputs: `surface`, `locale`, `translator`, `groups`, `settle`, `onFiles`, `onHost`, `file`, and `accelerators`.

Surface, toolbar, context-toolbar, and standalone-diff mounts require distinct dedicated roots. Do not place arbitrary host-owned child DOM inside those roots. A toolbar may instead receive matching direct groups produced by `renderToolbarHtml()`; those groups are package-owned pre-rendered UI that the mount wires, replaces when mismatched, and removes on teardown.

`AttachHost` provides `root`, `nabi`, `pathOfKey(id)`, and `onDispose(dispose)`. An attachment must call `onDispose()` immediately after each direct side effect that needs rollback if later setup throws. Its returned detach function remains supported after successful setup. Cleanup registered through `onDispose()` is rolled back when `attach()` throws; an unregistered direct side effect cannot be observed or rolled back automatically. The hook may be called only while the synchronous `attach()` call is running.

Overlay/panel functions:

- `openPreview({ nabi, surface, locale?, translator?, onBody? })`;
- `openLightbox({ surface, src, alt?, locale?, translator? })`;
- `openSavePanel({ file, surface, locale?, translator? })`;
- `openHistoryPanel({ history, surface, render, locale?, translator?, sessionId? })`;
- `openChoosePanel({ question, options, surface, locale?, translator? })`;
- `openPanel(owner, { anchor, className?, restore?, onClose? })`;
- `openPrompt(owner, { anchor, fields, okLabel, onSubmit, ... })`;
- `watchSettle(owner, { surface?, quietMs? })`.

Fullscreen exports: `FULLSCREEN_CLASS`, `isFullscreen`, and `setFullscreen`. UI constants: `TOOLBAR_GROUPS`.

## Rendering and style

```ts
function renderStoredHtml(
  json: unknown,
  registry: Registry,
  options?: { allowLocalUrls?: boolean },
): string | null;

function renderStoredEditorHtml(
  json: unknown,
  registry: Registry,
  options?: { allowLocalUrls?: boolean },
): string | null;

function safeUrl(raw: string | undefined, allowLocal?: boolean): string | null;
```

The stored renderer pair is the only public detached document rendering boundary. Browser HTML parsing and low-level canonical-document rendering are package-private.

Toolbar HTML:

- `toolbarSlots(registry, translator, order?)`;
- `renderToolbarHtml({ registry, locale?, translator?, groups? })`;
- `renderViewToolsHtml({ locale?, translator? })`.

Style:

- `CORE_CSS`;
- `collectSheets({ wings }, core?)`;
- `injectSheets(document, sheets)`;
- `sheetKey(text)`.

`injectSheets()` shares styles by `Document` and the exact CSS string. Its disposer decrements a reference count; only the final package-owned reference removes the style.

## Wings and factories

Catalog exports:

- marks: `boldWing`, `italicWing`, `underlineWing`, `strikeWing`, `superscriptWing`, `subscriptWing`, `simpleMarkWings`;
- value marks: `typefaceWing`, `fontSizeWing`, `textColorWing`, `highlightWing`, `valueMarkWings`, `makeTypefaceWing`, `makeFontSizeWing`, `makeTextColorWing`, `makeHighlightWing`, and `TYPEFACES`, `FONT_SIZES`, `TEXT_COLORS`, `HIGHLIGHT_COLORS`;
- inline/block: `linkWing`, `headingWing`, `alignWing`, `dropCapWing`, `paragraphAttrWings`, `bulletListWing`, `orderedListWing`, `taskListWing`, `listWings`, `quoteWing`, `detailsWing`, `codeWing`, `dividerWing`, `tableWings`;
- media/tools: `imageWing`, `youtubeWing`, `uploadWing`, `saveFileWing`, `openFileWing`, `localHistoryWing`, `diffWing`, `clearFormatWing`;
- groups: `defaultWings`, `fileWings`;
- picker: `wings`, `wingNames`.

Factories and helpers:

- `simpleMark(spec: SimpleMarkSpec)`;
- `valueMark(spec: ValueMarkSpec)`;
- `boxObject(spec: BoxObjectSpec)`;
- `listFamily(spec: ListFamilySpec)`;
- `makeImageWing({ allowLocalUrls? })`;
- `makeUploadWing({ allowLocalUrls? })`;
- `makeCodeAttach({ highlight?, version? })`;
- `insertLump`, `removeLump`, `toggleWrap`, `topNodeAt`.

Other wing-related runtime exports include `imageAttach`, `BROKEN_ATTR`, `IMAGE_WIDTHS`, `YOUTUBE_WIDTHS`, `CLEARED_MARKS`, and `CLEARED_ATTRS`.

## Code token helpers

- `tokenize(code, language?)`;
- `dialectOf(language)`;
- `tokensFor(source, language, highlight?)`;
- `usableTokens(answer, source)`;
- `applyTokens(element, tokens, { filler? })`;
- `codeSourceOf(element)`;
- `CODE_TOKEN_ATTR`, `CODE_TOKEN_TYPES`;
- `codeAttach`, `makeCodeAttach`.

```ts
interface CodeToken {
  readonly text: string;
  readonly type?: string;
}

type CodeHighlighter = (
  code: string,
  language: string | null,
) => readonly CodeToken[] | null | undefined;
```

## Tree, command, and HTML types

Root-exported types include:

- tree: `AttrValue`, `Attrs`, `ElementNode`, `NabiNode`, `NabiDoc`;
- selection: `Position`, `Selection`, `EditEnv`;
- command: `Command`, `CommandArgs`, `CommandHand`, `CommandOutcome`;
- editor: `Nabi`, `NabiOptions`, `NabiChange`, `Ask`, `ChooseOption`, `Toast`, `ToastLevel`;
- HTML: `HtmlAttrs`, `HtmlBuilder`, `HtmlBuilders`, `HtmlContext`;
- locale: `Dictionary`, `LocaleText`, `Translator`.

Tree values: `P`, `BR`, `isElement`, `isText`.

## Wing declaration types

Root-exported wing types include:

`Wing`, `WingPlace`, `StructureDecl`, `WingAction`, `WingButton`, `WingChoice`, `WingField`, `WingContext`, `ContextControl`, `InputRule`, `KeyIntent`, `KeyName`, `ArrowDir`, `OnKey`, `OwnerAt`, `Attach`, `AttachHost`, `Registry`, `RegisteredRule`, `WingName`, `WingUseOptions`, `WingsBuilder`, and the four factory spec types.

Additional wing-star types include `ValueWingOptions`, `ImageWingOptions`, `UploadFile`, `UploadItem`, `UploadLimits`, `UploadReject`, `CommitOptions`, `FileStore`, `NabiFileBody`, `NabiFileText`, `HistoryRecord`, `HistoryStorage`, `HistoryView`, `PaintOptions`, `ApplyOptions`, `CodeDialect`, `CodeHighlighter`, and `CodeToken`.

## IO types

Root-exported IO contracts:

`ClipFile`, `PasteData`, `PasteCandidate`, `DocSource`, `IoFilter`, `MdContext`, `MdBuilder`, and `MdBuilders`.

See `io-security.md` before implementing a custom filter.

## Locale values

- `LOCALES`: 24 supported locale codes: `en`, `zh`, `hi`, `es`, `ar`, `fr`, `bn`, `pt`, `ru`, `id`, `ur`, `de`, `ja`, `fa`, `mr`, `vi`, `te`, `ha`, `tr`, `sw`, `ta`, `ko`, `th`, `it`.
- `RTL_LOCALES`: `ar`, `ur`, `fa`.
- `DICTIONARY`.
- `localeOf(raw)`: normalize a primary language tag; invalid input becomes `en`.
- `localeDirection(code)`: `ltr|rtl`.
- `translate(key, locale, dictionary?, vars?)`.
- `makeTranslator(locale?, extraDictionary?)`.

Translation fallback is requested primary language, then English, then the key. Regional tags normalize to their base language. Arabic, Urdu, and Persian (`ar`, `ur`, `fa`) and their regional variants are RTL. Unfilled `{name}` placeholders remain visible.

## Complete root type-name index

The root entry exports these public type names. Earlier sections and the topic documents own their semantics.

- Assembly and wings: `Registry`, `RegisteredRule`, `Wing`, `WingPlace`, `StructureDecl`, `WingAction`, `WingButton`, `WingChoice`, `WingField`, `WingContext`, `ContextControl`, `InputRule`, `KeyIntent`, `KeyName`, `ArrowDir`, `OnKey`, `OwnerAt`, `Attach`, `AttachHost`, `WingName`, `WingUseOptions`, `WingsBuilder`.
- Factory and built-in options: `SimpleMarkSpec`, `ValueMarkSpec`, `BoxObjectSpec`, `ListFamilySpec`, `ValueWingOptions`, `ImageWingOptions`, `CommitOptions`, `PaintOptions`, `ApplyOptions`.
- Tree and editor: `AttrValue`, `Attrs`, `ElementNode`, `NabiNode`, `NabiDoc`, `Position`, `Selection`, `EditEnv`, `Command`, `CommandArgs`, `CommandHand`, `CommandOutcome`, `Nabi`, `NabiOptions`, `NabiChange`, `Ask`, `ChooseOption`, `Toast`, `ToastLevel`.
- HTML and IO: `HtmlAttrs`, `HtmlBuilder`, `HtmlBuilders`, `HtmlContext`, `StoredHtmlOptions`, `ClipFile`, `PasteData`, `PasteCandidate`, `DocSource`, `IoFilter`, `MdContext`, `MdBuilder`, `MdBuilders`, `FileStore`, `NabiFileBody`, `NabiFileText`.
- Surface and persistence mounts: `EditSurfacePort`, `Surface`, `SurfaceActions`, `SurfaceOptions`, `FileMount`, `FileMountOptions`, `SaveFormat`, `UploadMount`, `UploadOptions`, `UploadTask`, `Uploader`, `HistoryMount`, `HistoryMountOptions`, `HistoryRecord`, `HistoryStorage`, `HistoryView`.
- UI: `Toolbar`, `ToolbarButton`, `ToolbarOptions`, `ContextGroupView`, `ContextToolbar`, `ContextToolbarOptions`, `HintOptions`, `Hints`, `PickedMark`, `PickedMarkOptions`, `Sticky`, `StickyOptions`, `ViewTools`, `ViewToolsOptions`, `PreviewOptions`, `LightboxOptions`, `Overlay`, `UploadView`, `UploadViewOptions`, `ChoosePanelOptions`, `HistoryPanelOptions`, `SavePanelOptions`, `Panel`, `PanelOptions`, `PromptField`, `PromptOptions`, `Settle`, `SettleOptions`, `ToolbarHtmlOptions`, `ToolbarSlot`.
- Upload and code data: `UploadFile`, `UploadItem`, `UploadLimits`, `UploadReject`, `CodeDialect`, `CodeHighlighter`, `CodeToken`.
- Locale: `Dictionary`, `LocaleText`, `Translator`.

## Separate-entry type names

- `nabi-note/ssr`: `Registry`, `StoredHtmlOptions`, `ToolbarHtmlOptions`, `ToolbarSlot`, `WingName`, `WingsBuilder`, `Wing`, `AttrValue`, `Attrs`, `ElementNode`, `NabiNode`, `NabiDoc`, `Translator`.
- `nabi-note/viewer`: `ViewerAttachment`, `ViewerOptions`, `TableSortOptions`, `SortDirection`, `SortState`, `CodePaintOptions`, `CodeHighlighter`, `CodeToken`.
- `nabi-note/diff`: `CharRange`, `DiffEntry`, `DiffKind`, `DiffPaneBlock`, `DocDiff`, `DiffOptions`, `DiffMountOptions`, `DiffMount`, `DiffWingMountOptions`, `DiffWingMount`.
