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
`toastMax?`, `allowLocalUrls?`, `ioFilters?: readonly IoFilter[]` (host IO filters - see "IO
filters" below; `createNabiWith` peels this one off and hands it to `makeRegistry`, since a
filter is registry knowledge, not editor state).

`makeRegistry(wings, extra?)` takes the same `{ ioFilters }` as its second argument.

`Ask`: `{ message?: (text: string) => void, confirm?: (text: string) => boolean |
Promise<boolean>, choose?: (question: string, options: readonly ChooseOption[]) => number |
Promise<number> }`. Unfilled `confirm` answers `false`; unfilled `message` falls back to a core
info toast; unfilled `choose` answers `0` unless a panel is bound (`mountToolbar` binds the
core's own choose panel, so a toolbar-equipped editor asks on screen with nothing wired).
`ChooseOption`: `{ label: string, icon?: string }` - `icon` is the inside of a 16x16 SVG (a few
`path`s), not a whole tag. The answer is a **position index**; `-1` and out-of-range mean cancel.
See `llms/quickstart-npm.md`.

## Wings

- `defaultWings: readonly Wing[]` - all 29 official wings (see `llms/wings.md`)
- `wings(): WingsBuilder` - `.all()`, `.allBasic()`, `.use(name, options?)`, `.drop(name)`,
  `.build()`
- `.allBasic()` - only the wings that declare `basic: true` (26 of the 29). The three left out
  are the ones a host has to wire before they do anything: `upload` (needs an `uploader`),
  `save` and `open` (need a `FileStore` through `mountFile`). `.all()` is unchanged and still
  equals `defaultWings`
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
break), `ioFilters?: readonly IoFilter[]` (filters for this surface only - they stand ahead of
the registry's and the built-ins'), `fileSink?: (files:
readonly File[]) => void` (drag/paste files, wired up by the upload wing - a paste carrying
**any** text at all, `text/html` or `text/plain`, never reaches it), `doubleEnterMs?`,
`correctionDeferMs?`.

```ts
mountFile(options: FileMountOptions): FileMount
mountLocalHistory(options): HistoryMount
mountUpload(options: UploadOptions): UploadMount
browserFileStore(owner: Document, accept?: readonly string[]): FileStore
readExtensions(filters: readonly IoFilter[]): readonly string[]
browserHistoryStorage(view: { localStorage?: Storage } | null | undefined): HistoryStorage | null
```

`FileMountOptions`: `nabi`, `store: FileStore`, **`registry: Registry` (required** - the save
formats, the HTML builders, and the Markdown builders all come from it), `ioFilters?` (filters
for this mount only, first in line), `parse?: (html: string) => readonly ParseNode[]` (the
HTML-in door; it falls back to `parseNodes`, so a browser host can omit it and still open
`.nhtml`/`.html` - it is only required in a headless environment), `allowLocalUrls?`, `name?: ()
=> string` (extension-less save name, called at save time), `discardMessage?: string` (default
comes from the locale dictionary), `locale?`, `onError?: (error: unknown) => void`.

`FileMount` - **the canonical programmatic door for saving and opening.** The `save`/`open`
wings only carry the button and the accelerator; the feature itself lives here, so a host that
called `mountFile` can save and open even with neither wing registered:

```ts
interface FileMount {
  save(name?: string): void            // default format (.nabi); the `saveFile` command's door
  saveAs(id: string, name?: string): void   // ids come from formats()
  formats(): readonly SaveFormat[]
  open(): Promise<boolean>             // true once a document actually replaced the current one
  unmount(): void
}
type SaveFormat = { id: string, label: LocaleText | string, extension: string, lossy: boolean }
```

`nabi.applyCommand('saveFile')` also runs (`mountFile` registers that name on the instance),
but it is the inner path the button and the key take, so it has no answer - it returns `null`
because saving does not change the document. **Code calling in from outside uses the handle**:
the name argument, the format choice, and open's true/false all live only there.

`FileStore`: `save(file: NabiFileText): void | Promise<void>` and `open(): Promise<string |
NabiFileText | null>`. `NabiFileText` is `{ name, text, mime? }` - the filter says which mime
(`application/json` for `.nabi`, `text/html` for `.nhtml`, `text/markdown` for `.md`); a store
that does not read `mime` treats the value as `.nabi`. **`open()` answers a name too**, because
the extension decides which filter reads the text - `.nhtml`, `.html` and `.md` cannot be opened
without one. The old shape (a bare string) is still accepted and read as `.nabi`.

`browserFileStore(owner, accept?)` - saving is a download, opening is the file dialog. `accept`
defaults to the four the built-ins read: `.nabi`, `.nhtml`, `.html`, `.md`.

`readExtensions(filters)` counts only **declared save extensions**, so with the built-ins it
answers three (`.nabi`, `.nhtml`, `.md`). The read-only `html-open` filter has no save slot and
therefore no name to report - a host building its own store from that list adds `.html` by hand:
`[...readExtensions(filters), '.html']`.

`UploadOptions` (extends upload limits): `nabi`, `uploader: Uploader`, `root?: HTMLElement`
(disables `contenteditable` while locked), `onStart?`, `onProgress?: (id, percent) => void`,
`onSettle?: () => void | Promise<void>` (fires after transfer completes, before commit - lets the
UI finish animating to 100%), `onDone?: (result: { committed: number, cancelled: boolean }) =>
void` (fires after commit), `onReject?: (problem: UploadReject) => void` (filling this wins over
the default toast), `locale?`, `translator?: Translator`.

Types: `EditSurfacePort`, `Surface`, `SurfaceActions`, `SurfaceOptions`,
`FileMount`, `FileMountOptions`, `SaveFormat`, `FileStore`, `NabiFileText`, `NabiFileBody`,
`HistoryMount`, `HistoryMountOptions`, `UploadMount`, `UploadOptions`, `UploadTask`, `Uploader`.

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
click - **and this is the ground the accelerators are heard on**: only a key raised inside the
surface or the toolbar rows belongs to this editor. Omit it and the toolbar falls back to
listening on the whole document, so **two editors on one page must both be given `surface`** or
they eat each other's Cmd+S), `locale?`, `translator?`, `groups?: readonly string[]` (default:
`TOOLBAR_GROUPS`), `settle?: Settle`, `onFiles?: (files: readonly File[]) => void`, `onHost?: (w:
string, anchor: HTMLElement) => void` (a tool that needs a panel, e.g. local history, hands
control back to the host here), `file?: FileMount` (plug the handle in and the save panel stands
with no further wiring - the save button and Cmd+S both open it. Without it the save button
falls back to `onHost('save')`), `accelerators?: boolean` (set `false` to disable keyboard
shortcuts like mod+S).

**Accelerators exist only for registered wings.** Cmd+S and Cmd+O are declared by the `save` and
`open` wings, so an editor assembled from `wings().allBasic()` alone has no such key at all and
the browser's own "Save Page" appears as usual. Registering them back is
`.allBasic().use('save').use('open')`. And when the save button reaches nowhere (`file` not
plugged in and no `onHost` either), Cmd+S **does not swallow the key** - the editor does not
take a shortcut away from the browser for something it will not do.

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
the window top), `settle?: Settle`, `nabi?: Nabi` (give it and the mount **aims by itself after
an edit**, pushing the caret out from under the toolbar by exactly as much as it was covered;
omit it and nothing changes - aiming happens only when the host calls `aim()`), `iosBranch?:
boolean`.

**Mobile keyboard behavior** (no public type grew for this - it is behavior, not API). When a
soft keyboard rises, `mountSticky` brings the caret into the strip between the toolbar and the
keyboard. Four rules a host should know: it runs **only while the surface holds focus**; it
moves **nothing** while a finger is scrolling (a 250ms lock after a scroll); it reacts only to a
**keyboard-sized** viewport change (`max(120px, 15% of window height)`), so an address bar
collapsing by a few dozen pixels does not trigger it; and it lines up once more after the
viewport has settled. Typing is nudged by **only as much as is missing**, while the moment the
keyboard appears it lines the toolbar up against the top of the window. The measured chrome
height is published as `--nabi-bar-height` (see `llms/styling.md`).

`PickedMarkOptions`: `nabi`, `surface: HTMLElement`.

`UploadViewOptions`: `nabi`, `surface: HTMLElement`, `upload?: Pick<UploadMount, 'cancel'>` (no
cancel button drawn if omitted), `locale?`, `translator?`, `bandwidth?: number`.

```ts
openPanel(owner: Document, options: PanelOptions): Panel
openPrompt(owner: Document, options: PromptOptions): Panel
openPreview(options: PreviewOptions): Overlay
openLightbox(options: LightboxOptions): Overlay
openHistoryPanel(options: HistoryPanelOptions): Overlay | null
openChoosePanel(options: ChoosePanelOptions): Promise<number>
openSavePanel(options: SavePanelOptions): Overlay
watchSettle(owner: Document, options?: SettleOptions): Settle
isFullscreen(root: HTMLElement): boolean
setFullscreen(root: HTMLElement, on: boolean): void
```

`ChoosePanelOptions`: `question: string`, `options: readonly ChooseOption[]`, `surface:
HTMLElement` (focus returns here; the panel's document comes from it), `locale?`, `translator?`.
This is the paste-candidate panel; `mountToolbar` binds it to the editor on its own, so a host
does not have to call it.

`SavePanelOptions`: `file: FileMount`, `surface: HTMLElement`, `locale?`, `translator?`. The
format list and the door that actually writes both come from the `FileMount`. The panel is the
paste panel in a second dress - centered title, up to three cells per row, icon above and name
below, aim shown as a `--nabi-accent` border with no fill - plus a name field and, beside it, an
extension marker that follows the aimed format. Four things a host or an agent should not get
wrong:

- **There is no confirm button.** A format cell *is* the save; Enter in the name field saves
  with whichever format is currently aimed.
- **Tab / Shift+Tab move between formats**, not the arrow keys. The name field is standing right
  there, so left/right are already caret keys and up/down are text keys; the paste panel, which
  has no text field, keeps arrows as its canonical aim keys.
- **The first aim is not `.nabi`.** It follows the same `initialChoice` rule as the paste panel:
  with three formats it lands on the middle of the first row, so the marker reads `.nhtml` when
  the panel opens. Anything that says "press Enter right away to save the original" is wrong.
- The cell names are the **lowercase extension without the dot** - `nabi`, `nhtml`, `md` - and a
  lossy format carries a tiny "lossy save" note under its name.

`CHOOSE_COLS` (`3`), `gridStep(at, len, key, cols?, rtl?)`, `initialChoice(len)` - the grid math
the two panels share, exported as pure functions (no DOM). `initialChoice` answers `1` for three
or more cells (the middle of the first row) and `0` otherwise.

`FULLSCREEN_CLASS`, `TOOLBAR_GROUPS` - the constants those two functions and `mountToolbar`'s
`groups?` option are built around.

Types: `ContextGroupView`, `ContextToolbar`, `ContextToolbarOptions`, `ChoosePanelOptions`,
`HintOptions`, `HistoryPanelOptions`, `Hints`, `LightboxOptions`, `Overlay`, `PickedMark`,
`PickedMarkOptions`, `PreviewOptions`, `SavePanelOptions`, `Sticky`, `StickyOptions`, `Toolbar`,
`ToolbarButton`, `ToolbarOptions`, `UploadView`, `UploadViewOptions`, `ViewTools`,
`ViewToolsOptions`, `Panel`, `PanelOptions`, `PromptField`, `PromptOptions`, `Settle`,
`SettleOptions`.

## IO filters

An **IO filter** is the one door text takes coming into a document (paste, open) and going out
of it (save). A filter is not a wing: it erects no node and owns no key - all it knows is "can I
read this text". Registration has three doors, and their order is the scan order:

1. the host's - `createNabiWith(wings, { ioFilters })` / `makeRegistry(wings, { ioFilters })`,
   and per-mount `mountSurface({ ioFilters })` / `mountFile({ ioFilters })`, which stand ahead
   of the registry's
2. a wing's own - `Wing.ioFilter` (the table wing's TSV is the model)
3. the four built-ins, always last

A duplicate `ioFilter.id` fails registration.

`io` is its own internal layer, sitting between `html` and `editor` - it handles only
`schema`/`html`/`locale` values and bites neither the editor nor the surface, which is why the
wing contract is allowed to reference `ioFilter` and `toMd`. The internal stack is **fourteen**
layers deep, and a boundary test (`test/boundaries.test.ts`, the `ORDER` constant) keeps the
direction honest: `style, locale, code, schema, doc, caret, html, io, editor, wing, wings,
surface, ui, viewer`. Hosts never import these paths - the entry points in `llms/overview.md`
are the public surface - but knowing where `io` and `style` sit explains why a filter cannot
reach the editor and why a stylesheet can be collected without one.

```ts
interface IoFilter {
  readonly id: string
  readonly label: LocaleText | string
  paste?: (data: PasteData) => PasteCandidate | readonly PasteCandidate[] | null
  save?: {
    extension: string
    write: (doc: DocSource) => string
    lossy?: boolean      // the save panel writes a "lossy save" note under this format
    mime?: string
  }
  read?: (name: string, text: string) => unknown   // null = not mine, try the next filter
}

interface PasteData { html: string, plain: string, files: readonly ClipFile[], types: readonly string[] }
interface PasteCandidate {
  id: string
  label: LocaleText | string
  build(): readonly ElementNode[]   // dug LATE - the panel lists a row without building a document
  icon?: string                     // inside of a 16x16 SVG; without it the name stands alone
  inline?: boolean                  // one-line text: written into the caret without splitting the paragraph
}
interface DocSource { json(): unknown, html(): string, md(): string }  // all lazy
```

**The four built-ins**, in scan order: `nabi` (`.nabi`, `application/json`, save + read; never a
paste candidate, because what lands on the clipboard is a file, not text), `html`
(`text/html` paste candidate, saves as **`.nhtml`** with mime `text/html`, reads), `markdown`
(`.md`, `text/markdown`, **`lossy: true`**; it offers a paste candidate only when the plain text
actually smells of Markdown *and* some registered wing could receive it), and `html-open` - a
**read-only twin** with no save slot that exists so an ordinary `.html` file from elsewhere can
still be opened. So the save panel shows **three** formats and the open dialog accepts **four**.

Building a document from `text/html` needs a parser: the io layer knows no DOM, so `parseNodes`
is injected (the browser default). Without one the html filter simply sleeps.

`writeHtmlFile(options: HtmlFileOptions): string` - the standalone page an `.nhtml` save
produces: doctype, `<html lang>`, `<meta charset>`, `<meta name="viewport">`, `<title>`, the
sheets inlined in one `<style>`, and the fragment wrapped in `<div class="nabi-content">`.
`HtmlFileOptions`: `title`, `sheets` (from `collectSheets(registry)`), `body` (from
`nabi.getHtml()`), `lang?`, `dir?`.

`NABI_VERSION`, `NABI_FILE_EXTENSION`, `NABI_FILE_VERSION`, `writeNabiFile`, `readNabiFile`,
`isNabiFile`, `defaultFileName`, `today` now live in `io/file.ts`; the old path
(`wings/file/file.ts`) re-exports them, so nothing an importer wrote has to change.

Contract types: `IoFilter`, `PasteData`, `PasteCandidate`, `ClipFile`, `DocSource`, `MdContext`,
`MdBuilder`, `MdBuilders`.

### The nabi clipboard shortcut

Copying or cutting inside a nabi editor and pasting it back **skips the candidate panel
entirely** and goes straight to the html candidate - there is no format to choose when a
document's own fragment comes home. Nabi loads the clipboard itself on copy/cut, so attachments
and headings survive the trip, and editor-only markers are stripped on the way out.

The memory is **one global** (the clipboard is global too: cutting in editor A and pasting into
editor B is one gesture), and pasting does **not** consume it - only the next copy or cut
clears it, and copying something from outside makes the returning text differ, which drops the
paste back into the ordinary flow.

Two more clipboard rules worth knowing: copying a selected object (image, box) carries **its
wrapper paragraph's alignment** along with it, and copying exactly one attachment (a file link)
wraps it in its own paragraph followed by one blank line, so attachments never tangle onto a
single line.

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
to what a host gets by not filling `ask` at all. **`choose` is the one that differs: it always
answers `0`, the first option.** `confirm`'s "no" protects unsaved work, but answering "cancel"
to a choose would make a paste vanish altogether - and the first candidate is always the most
likely reading, so with nobody to ask that is the right answer.

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
| `$markSaved(savedDoc)` | `(savedDoc: NabiDoc): void` - **only a `.nabi` save moves the baseline**; `.nhtml` and `.md` are copies, so the save wing does not call this for them |
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
