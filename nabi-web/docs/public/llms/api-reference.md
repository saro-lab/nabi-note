# API Reference

Source of truth: `nabi-npm/src/index.ts` (main entry, browser) and `nabi-npm/src/ssr.ts`
(DOM-free entry, see `llms/ssr.md`). Everything below is exported from `nabi-note` unless noted
otherwise. Options types show every field seen in the source; `?` marks optional fields.

## Assembly

```ts
createNabiWith(wings: Wing[] | WingsBuilder, options?: NabiOptions): { nabi: Nabi, registry: Registry }
makeRegistry(wings: Wing[]): Registry
```

`NabiOptions`: `doc?` (start from an existing NABI TREE; a broken value falls back to the empty
document with a `console.error` report instead of failing the whole assembly), `parseHtml?`
(adapter for `setHtml()`, usually `parseNodes`), `locale?`, `ask?: Ask`, `toast?`, `toastMs?`,
`toastMax?`, `allowLocalUrls?`.

`Ask`: `{ message?: (text: string) => void, confirm?: (text: string) => boolean | Promise<boolean> }`.
Unfilled `confirm` answers `false`; unfilled `message` falls back to a core info toast. See
`llms/quickstart-npm.md`.

## Wings

- `defaultWings: readonly Wing[]` - all 29 official wings (see `llms/wings.md`)
- `wings(): WingsBuilder` - `.all()`, `.use(name, options?)`, `.drop(name)`, `.build()`
- `wingNames(): readonly WingName[]`
- Every built-in wing constant/factory (`boldWing`, `makeImageWing`, etc.) - see `llms/wings.md`
  for the full catalog
- `boxObject(spec: BoxObjectSpec): Partial<Wing>` - helper for a void/container object wing
- `listFamily(spec: ListFamilySpec): Partial<Wing>` - helper for a list-shaped wing
- `simpleMark(spec: SimpleMarkSpec): Partial<Wing>` - helper for an attribute-less mark
- `valueMark(spec: ValueMarkSpec): Partial<Wing>` - helper for a value-carrying mark
- `insertLump(doc, pos, node, env)`, `removeLump(doc, pos, env)`, `toggleWrap(...)`,
  `topNodeAt(...)` - shared tree-editing primitives a command uses instead of hand-rolling tree
  surgery (see `llms/custom-wing.md`)

Contract types: `Wing`, `WingPlace`, `WingAction`, `WingButton`, `WingChoice`, `WingContext`,
`WingField`, `StructureDecl`, `Attach`, `AttachHost`, `ArrowDir`, `ContextControl`, `InputRule`,
`KeyIntent`, `KeyName`, `OnKey`, `OwnerAt`, `Registry`, `RegisteredRule`.

## Editing surface

```ts
mountSurface(options: SurfaceOptions): Surface
```

`SurfaceOptions`: `nabi`, `registry`, `root: HTMLElement`, `hydrate?: boolean` (adopt
server-rendered editor DOM instead of redrawing it; see `llms/ssr.md`), `allowLocalUrls?`,
`locale?: string` (sets text direction per `llms/quickstart-npm.md`), `placeholder?: string`
(the hint shown on the first line while the document is empty - defaults to the core
dictionary word for the locale, an empty string turns it off, and a `\n` becomes a line
break), `fileSink?: (files:
readonly File[]) => void` (drag/paste files, wired up by the upload wing), `doubleEnterMs?`,
`correctionDeferMs?`.

```ts
mountFile(options: FileMountOptions): FileMount
mountLocalHistory(options): HistoryMount
mountUpload(options: UploadOptions): UploadMount
browserFileStore(owner: Document): FileStore
browserHistoryStorage(view: { localStorage?: Storage } | null | undefined): HistoryStorage | null
```

`FileMountOptions`: `nabi`, `store: FileStore`, `name?: () => string` (extension-less save name,
called at save time), `discardMessage?: string` (default comes from the locale dictionary),
`locale?`, `onError?: (error: unknown) => void`.

`UploadOptions` (extends upload limits): `nabi`, `uploader: Uploader`, `root?: HTMLElement`
(disables `contenteditable` while locked), `onStart?`, `onProgress?: (id, percent) => void`,
`onSettle?: () => void | Promise<void>` (fires after transfer completes, before commit - lets the
UI finish animating to 100%), `onDone?: (result: { committed: number, cancelled: boolean }) =>
void` (fires after commit), `onReject?: (problem: UploadReject) => void` (filling this wins over
the default toast), `locale?`, `translator?: Translator`.

Types: `EditSurfacePort`, `Surface`, `SurfaceActions`, `SurfaceOptions`, `DroppedFile`,
`FileMount`, `FileMountOptions`, `HistoryMount`, `HistoryMountOptions`, `UploadMount`,
`UploadOptions`, `UploadTask`, `Uploader`.

## Screen tools

```ts
mountToolbar(options: ToolbarOptions): Toolbar
mountContextToolbar(options: ContextToolbarOptions): ContextToolbar
mountHints(options: HintOptions): Hints
mountViewTools(options: ViewToolsOptions): ViewTools
mountSticky(options: StickyOptions): Sticky
mountPickedMark(options: PickedMarkOptions): PickedMark
mountUploadView(options: UploadViewOptions): UploadView
```

`ToolbarOptions`: `nabi`, `registry`, `root: HTMLElement`, `surface?` (focus returns here after a
click), `locale?`, `translator?`, `groups?: readonly string[]` (default: `TOOLBAR_GROUPS`),
`settle?: Settle`, `onFiles?: (files: readonly File[]) => void`, `onHost?: (w: string, anchor:
HTMLElement) => void` (a tool that needs a panel, e.g. local history, hands control back to the
host here), `accelerators?: boolean` (set `false` to disable keyboard shortcuts like mod+S).

`ContextToolbarOptions`: `nabi`, `registry`, `root`, `surface?`, `locale?`, `translator?`,
`settle?: Settle`.

`HintOptions`: `toolbar: Toolbar`, `context?: ContextToolbar`, `root: HTMLElement` (where the
badge class attaches - the chrome wrapping both rows), `surface?`, `tapMs?: number`.

`ViewToolsOptions` (extends `PreviewOptions`): `nabi`, `surface: HTMLElement`, `locale?`,
`translator?`, `onBody?: (body: HTMLElement) => (() => void) | void` (fires once the preview body
is standing - a host attaches viewer-side JS, e.g. `attachViewer`, here; the returned function
runs when the overlay closes), `root: HTMLElement` (the `.nabi` box fullscreen pins),
`container: HTMLElement` (where the two buttons render).

`StickyOptions`: `root: HTMLElement` (the `.nabi` root CSS variables attach to), `surface:
HTMLElement` (caret rect is measured here), `chrome?: HTMLElement` (sticky top edge; defaults to
the window top), `settle?: Settle`, `iosBranch?: boolean`.

`PickedMarkOptions`: `nabi`, `surface: HTMLElement`.

`UploadViewOptions`: `nabi`, `surface: HTMLElement`, `upload?: Pick<UploadMount, 'cancel'>` (no
cancel button drawn if omitted), `locale?`, `translator?`, `bandwidth?: number`.

```ts
openPanel(owner: Document, options: PanelOptions): Panel
openPrompt(owner: Document, options: PromptOptions): Panel
openPreview(options: PreviewOptions): Overlay
openLightbox(options: LightboxOptions): Overlay
openHistoryPanel(options: HistoryPanelOptions): Overlay | null
watchSettle(owner: Document, options?: SettleOptions): Settle
isFullscreen(root: HTMLElement): boolean
setFullscreen(root: HTMLElement, on: boolean): void
```

`FULLSCREEN_CLASS`, `TOOLBAR_GROUPS` - the constants those two functions and `mountToolbar`'s
`groups?` option are built around.

Types: `ContextGroupView`, `ContextToolbar`, `ContextToolbarOptions`, `HintOptions`,
`HistoryPanelOptions`, `Hints`, `LightboxOptions`, `Overlay`, `PickedMark`, `PickedMarkOptions`,
`PreviewOptions`, `Sticky`, `StickyOptions`, `Toolbar`, `ToolbarButton`, `ToolbarOptions`,
`UploadView`, `UploadViewOptions`, `ViewTools`, `ViewToolsOptions`, `Panel`, `PanelOptions`,
`PromptField`, `PromptOptions`, `Settle`, `SettleOptions`.

## Stylesheets

```ts
collectSheets(registry: Registry): readonly string[]
injectSheets(document: Document, sheets: readonly string[]): () => void  // call to remove what this call added
CORE_CSS: string
sheetKey(sheet: string): string  // the content-hash dedup key
```

See `llms/styling.md`.

## Pre-rendering the toolbar

```ts
renderToolbarHtml(options: ToolbarHtmlOptions): string
renderViewToolsHtml(options: { locale?: string }): string
toolbarSlots(registry: Registry): readonly ToolbarSlot[]
```

Also exported from `nabi-note/ssr`. See `llms/ssr.md`.

## Assembled HTML (also runs on a server)

```ts
renderEditorHtml(doc: NabiDoc, options: HtmlOptions): string
renderHtml(doc: NabiDoc, options: HtmlOptions): string
renderStoredHtml(json: unknown, registry: Registry, options?: StoredHtmlOptions): string | null
renderStoredEditorHtml(json: unknown, registry: Registry, options?: StoredHtmlOptions): string | null
safeUrl(url: string): string | null  // null for anything but http:/https:/relative
parseNodes(...): ParseNode  // browser-only HTML-in adapter, DOMParser-backed
```

`renderStoredHtml`/`renderStoredEditorHtml` accept raw external JSON and reject anything that is
not a valid NABI TREE (`null`, not a throw; a value that throws mid-read also answers `null`
with a `console.error` report). `renderHtml`/`renderEditorHtml` sit one layer lower,
for code that already holds the internal tree. Full detail in `llms/ssr.md`.

Types: `EditSurfacePort` (surface section, above), `HtmlAttrs`, `HtmlBuilder`, `HtmlBuilders`,
`HtmlContext`, `HtmlOptions`, `ParseNode`, `StoredHtmlOptions`.

## Editor, document, and command contract types

```ts
type Nabi = { ... }               // the assembled editor instance returned by createNabiWith
type NabiChange = { ... }         // payload passed to nabi.onChange
type NabiDoc = readonly NabiNode[]  // a document - an array of blocks, no wrapping root
type NabiNode = ElementNode | string
type Command = (doc: NabiDoc, sel: Selection, args: Record<string, unknown>, env: EditEnv) =>
  { doc: NabiDoc, selection: Selection } | null
```

`silentAsk: Ask` - an `Ask` implementation that always answers `false`/does nothing; equivalent
to what a host gets by not filling `ask` at all.

`isElement(node)`, `isText(node)` - type guards on a `NabiNode`.

`BR`, `P` - the two reserved `w` values (`'br'`, `'p'`).

Types: `Nabi`, `NabiChange`, `NabiOptions`, `Toast`, `ToastLevel`, `Command`, `CommandArgs`,
`CommandHand` (`'keyboard' | 'pointer'`, third argument to `applyCommand`), `CommandOutcome`,
`Selection`, `EditEnv`, `Position`, `Attrs`, `AttrValue`, `ElementNode`, `NabiDoc`, `NabiNode`.

### `Nabi` instance methods (referenced throughout the docs, not a separate export)

| Method | Signature |
|---|---|
| `getHtml()` | `(): string` |
| `getJson()` | `(): NabiDoc` |
| `getEditorHtml()` | `(): string` - carries `data-key`, not for storage |
| `setJson(json)` | `(json: unknown): boolean` - a blank value (`null`, `undefined`, `''`, `[]`) loads the empty document instead of being rejected |
| `setHtml(html)` | `(html: string): boolean` - needs `parseHtml` in options, except for a blank value (same rule as `setJson`) |

Both setters never throw. Slightly-broken input is corrected while being read (empty table
cells, non-row table children, overflowing merges; dangerous URLs are filtered in the same
step). Input that cannot be read at all answers `false`, and input that throws mid-read also
answers `false` with a `console.error` report - the editor keeps its current document either
way.
| `applyCommand(name, args?, by?)` | `(name: string, args?: Record<string, unknown>, by?: CommandHand): boolean` |
| `onChange(fn)` | `(fn: (change: NabiChange) => void) => () => void` |
| `isChanged()` | `(): boolean` |
| `$markSaved(savedDoc)` | `(savedDoc: NabiDoc): void` |
| `sessionId` | `string` - `<unix-time>-<nonce>`, set once |
| `$toast(level, message, ms?)` | `(level: ToastLevel, message: string, ms?: number): void` |
| `$ask` | Same shape as the `ask` option - what a wing calls |

## Locale

```ts
DICTIONARY: Dictionary
LOCALES: readonly string[]        // every supported locale code
RTL_LOCALES: readonly string[]    // subset of LOCALES that read right-to-left (currently ar, ur)
localeDirection(code: string): 'ltr' | 'rtl'
localeOf(code: string): LocaleText
makeTranslator(locale: string): Translator
translate(locale: string, key: string): string
```

Types: `Dictionary`, `LocaleText`, `Translator`.

## `nabi-note/viewer` (separate entry, reader-side only)

```ts
attachViewer(root: HTMLElement, options: { locale?: string, highlight?: CodeHighlighter }): () => void
attachTableSort(root: HTMLElement, options?: { locale?: string }): () => void
```

Never mutates a document that will be saved - attach only to a read-only copy. See
`llms/styling.md` (table sort) and `llms/quickstart-npm.md` (preview `onBody`).

## `nabi-note/nabi.css`

Not a JS module - the bundled stylesheet (core plus every built-in wing). See
`llms/styling.md`.

## See also

- `llms/overview.md` - the four-layer model these functions build
- `llms/wings.md` - every built-in wing this list references by name
- `llms/custom-wing.md` - `boxObject`/`listFamily`/`simpleMark`/`valueMark` used in context
- `llms/ssr.md` - the `nabi-note/ssr` subset of this list and pre-rendering
- `llms/styling.md` - `collectSheets`/`injectSheets`/`CORE_CSS` used in context
