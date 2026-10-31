# IO and security contract

## Trust model

Data entering through JSON, HTML, paste, files, Markdown, upload responses, and command args is untrusted. NABI NOTE validates shape and routes HTML through registered builders and import claims. Custom wings, filters, stores, uploaders, and builders become trusted code inside that boundary.

The canonical node vocabulary is closed to `p`, `br`, and node or part types in the active registry. Normalization unwraps an unregistered node into its children, discards all attributes on that wrapper, and removes an empty wrapper. Registered custom nodes and their declared attributes remain intact. This rule also applies to `.nabi` input and custom clipboard data.

The package catches malformed-document failures at public load/render doors, reports to `console.error` when available, and returns the door's normal failure value.

## URL policy

`safeUrl(raw, allowLocal = false)` returns a normalized string or `null`.

Accepted by default:

- absolute `http:` and `https:`;
- same-site-looking relative paths beginning with `.` or `/`, provided they contain no colon.

Rejected:

- empty values;
- protocol-relative `//host/path`;
- `javascript:` and every unlisted scheme;
- relative strings not beginning with `.` or `/`;
- local URLs unless explicitly enabled.

With `allowLocal === true`, `blob:` and non-SVG `data:image/...` are also accepted. `data:image/svg+xml` is rejected because SVG can carry active content. Local URLs are accepted only for fetched sources such as images. Link destinations remain strict even when image sources are local.

## Three separate local-URL gates

These options do not collapse into one global switch:

1. `createNabiWith(..., { allowLocalUrls: true })` permits local source URLs while importing/rendering the document.
2. `makeImageWing({ allowLocalUrls: true })` permits a local image URL to survive image-node repair.
3. `makeUploadWing({ allowLocalUrls: true })` permits an uploader result to commit as an image instead of falling back.

Enable all relevant gates for a local preview workflow. A normal server upload returning HTTPS needs none of them.

## Host image picker

`mountToolbar({ panels: { img: renderer } })` replaces the image URL prompt with host UI; it does not replace URL validation or implement file transfer. The renderer can load a media library or call the host's uploader, then use `context.insertImage(url)` (equivalent to `context.run('insertImage', { src: url })`). The `insertImage` command accepts an argument object with `src` and optional `w`; it does not take an `alt` command argument. The panel helper accepts `insertImage(src, by?)`; use `context.run('insertImage', { src: url, w: 60 })` to specify width. Image-node repair and the relevant local-URL gates still apply. Validate uploaded files on the server as described below.

Forward the panel's `signal` to asynchronous work and release host resources through the returned disposer or `onDispose()`. Closing the panel aborts the signal. A late `run()` after closure returns `false`. Image panels and the default URL prompt preserve their opening selection, including its cell. Any document edit or replacement since opening cancels insertion with a localized warning, even if the original target still exists or an undo restored equal content. Moving only the selection is allowed; insertion restores the opening selection. See `api-reference.md` for the complete panel lifecycle contract.

## HTML output

Builders do not need to concatenate tags. `HtmlContext` centralizes:

- text escaping;
- attribute escaping;
- lower-case tag/attribute name validation;
- strict link URL validation through `url()`;
- source URL validation through `src()`;
- editor-only `data-key` and filler handling.

Valid generated tag names match `[a-z][a-z0-9]*`. Attribute names match `[a-z][a-z0-9-]*`. Invalid names are not emitted. Unknown/unregistered node types are unwrapped rather than emitted as arbitrary tags.

A custom builder that returns raw unsafe markup defeats these guarantees. Use the context helpers.

Footnote text (`fn` `a.t`) is stored as plain text. It is written through the shared attribute escaping into `data-nabi-fn`. Lists and viewer bubbles recognize explicit HTTP(S) URLs with the shared `safeUrl()` validator and render them as links without changing the source text. Other schemes and malformed URLs remain plain text. Text and link attributes use `textContent` or escaped builder output, never raw input HTML, so `<`, `>`, quotes, and `&` cannot inject markup.

## HTML import

The browser assembly factory wires an internal `DOMParser` adapter automatically. Parser adapters and the low-level parse tree are package-private.

The importer understands registered wing claims plus common structural HTML. It unwraps browser-only wrappers such as `tbody`, `thead`, `tfoot`, and `div.nabi-scroll` without `data-nabi-p`.

Inter-tag indentation containing only HTML whitespace (ASCII space, tab, LF, FF, CR) is ignored at block level. Protected spaces such as NBSP remain content, including HTML clipboard fragments consisting only of those spaces. Copy/cut protects leading and trailing spaces at fragment boundaries before writing `text/html`.

These tags and their entire subtrees are dropped:

`script`, `style`, `noscript`, `template`, `head`, `title`, `meta`, `link`, `base`, `object`, `embed`, `applet`, `form`, `input`, `button`, `select`, `option`, `textarea`, `svg`, `canvas`, `audio`, `video`, `source`, `track`, `param`, `frame`, `frameset`, `map`, and `area`.

Dropping the subtree prevents script/style text from reappearing as document text.

The footnote claim reads only the `data-nabi-fn` attribute of a `sup` or `span`, applies the plain-text rules, and ignores the element's children, including the generated `[n]` number. A `section[data-nabi-footnotes]` list is generated output and is dropped, so reloading published HTML restores each footnote once. A plain `<sup>` without that attribute stays an ordinary superscript mark.

## Paste

`mountSurface()` builds one filter list in this priority order:

1. filters passed to that surface;
2. registry filters, with host registry filters before wing filters;
3. built-in NABI, HTML, Markdown, and HTML-open filters;
4. plain text fallback.

Clipboard custom data uses `application/vnd.nabi.tree+json` with the exact envelope `{ version: 1, body: [...] }`. Copy and cut attempt custom MIME, `text/html`, and `text/plain` independently. Paste priority is valid supported custom data, a complete plain HTTP(S) URL, safe built-in HTML, then the remaining text formats. Every candidate is normalized and validated. A host filter cannot shadow the reserved built-in IDs `nabi`, `html`, `markdown`, or `text`.

An exact object-wrapper selection copies only that object and its wrapper attributes, even inside a table cell, float, or another container. Copy and cut do not add its enclosing containers. Whole-container selections and multi-cell table rectangles still include their selected contents.

When both selection endpoints are inside the same code box, paste uses `text/plain` first and inserts it at the caret or replaces the selected text within that box. Line breaks, blank lines, and indentation remain intact; CRLF and CR become LF. Internal fragments, HTML formatting, Markdown, and URLs do not create blocks, marks, or links. Without plain text, valid internal data or safe built-in HTML is flattened to recoverable text and line breaks. The code box, language, and surrounding content remain intact, and the caret lands immediately after the inserted text. A paste is one undo step. File-only paste inside code does not upload or insert objects.

When a selection spans different cells in the same table, copy and cut use the same rectangle as the highlighted cell selection, including any merged cells that expand that rectangle. They do not copy intervening cells outside the rectangle or omit the final cell. Custom data and HTML preserve the selected rows, empty cells, header cells, spans, cell background names, and inline formatting. Plain text separates the selected cells with tabs and rows with newlines. Cut clears only selected cell contents, preserves table structure and other cells, and restores the contents in one undo step. Failed clipboard writes do not clear the source. Partial text selections within one cell retain ordinary text-selection behavior. When exactly one table wrapper is selected, or a collapsed caret is at either wrapper boundary with the dashed table outline, copy and cut include the entire table and its wrapper paragraph. Cut removes both together after a successful clipboard write; one undo restores them. This also works for tables inside floats.

Within each copied cell, plain text preserves block line breaks and includes image/video URLs. A table's placement inside a float does not change these clipboard rules. Deleting a table from inside its cells removes that table's wrapper only and preserves the surrounding float.

For ordinary non-HTML input where multiple custom candidates apply, `ask.choose` or the bound choose UI selects a positional index. An invalid index cancels. Markdown is offered only when the text looks like Markdown and registered wings can represent at least one detected construct.

A paste containing any text HTML/plain data is treated as content paste. Its files do not go to `fileSink`. File-only paste and drop may go to `fileSink`.

Pasting or dropping content inside a table cell inserts into that cell, preserving its paragraphs, images, lists, and other allowed blocks. Normalization unwraps nested table and float wrappers in order and removes heading attributes inside header cells. A selection crossing cell boundaries is rejected before deleting content. An explicit drop target takes precedence over the current selection. Pasting into the default empty paragraph replaces that placeholder while preserving the cell, its background, header status, and spans. User-entered spaces and line breaks remain content.

Paragraphs and object wrappers inside floats, quotes, or list items preserve pasted blocks within their parent, including a single table or image. Empty inner paragraphs are replaced by the pasted fragment; text, formatting, and outer content are preserved. Inline-only holders such as code and details summaries instead flatten recoverable text with line breaks, following their existing content rules.

### Pasted URL links

When the entire `text/plain` value after trimming surrounding whitespace is one valid explicit `http://` or `https://` URL, `mountSurface()` inserts a link immediately. Recognition is case-insensitive, rejects internal whitespace and unsafe or malformed addresses through `safeUrl()`, and runs before HTML or other format selection. Valid supported internal clipboard data still wins, preserving a copied editor fragment's existing formatting. Ordinary prose, multiple URLs, and relative paths retain the existing paste behavior. Code blocks and editors without the registered `a` wing keep text and do not call `onPasteUrl`.

The link's `href` is the normalized safe URL; its default display text is the original trimmed input. `SurfaceOptions.onPasteUrl?: PasteUrlHandler` receives positional arguments:

1. `url: string`: the original complete URL with surrounding whitespace removed;
2. `isSameOrigin: boolean`: whether the parsed URL's origin matches the surface document's window origin, including protocol, host, and port;
3. `path: string`: `pathname + search + hash`, for example `/posts/1?a=2#top`; a URL with no explicit path supplies `/`.

The callback may return `string | null | void` or a promise of those values. Only a string whose `trim()` is non-empty changes the display text; that string is used verbatim as plain text, never HTML. An omitted callback, empty or whitespace-only string, other runtime value, thrown error, or rejected promise leaves the original URL as the label. Errors are isolated and reported through `NabiOptions.onError`. The callback cannot change `href`.

An asynchronous result does not delay insertion: the URL link appears at the original paste selection immediately, and later valid text replaces only its label. Concurrent pending URL callbacks are independent. Typing before or after the link, editing another paragraph, and moving the selection do not redirect that update. If the pasted range's text, formatting, or address is edited or deleted, the document is replaced, or the surface is unmounted, the late result is ignored. The update preserves the current selection, adjusting positions after the link when its text length changes. A synchronous callback and its paste form one undo step. An asynchronous label update is a separate undo step so it does not absorb intervening edits. Pasting remains scoped to the target paragraph, table cell, or float, and selections crossing isolation boundaries are rejected before deleting content.

## Media dragging

`mountSurface()` shows a move handle above the active float, table, details block, code box, or quote when the caret is inside it, and above a selected image or YouTube video. Details expose the handle from their summary or body, including the summary of a closed block. Dragging a handle uses pointer events for both mouse and touch, including mobile browsers. The upper or lower half of a destination paragraph places the object before or after that block. A horizontal line previews the insertion position. Paragraph text is not split. Nested movable containers expose their own handles. Touching a handle without dragging does not move the object; ordinary scrolling remains available away from handles.

Once a handle drag starts, a half-opacity copy of the object follows the mouse or touch at its displayed size, preserving the initial grab offset. The copy cannot receive input and disappears when the gesture ends or is canceled. Video previews use a static play symbol without starting another player. A short handle press does not create a preview.

All move handles in that editor stay hidden during the drag, including nested-container handles and while auto-scrolling. Dropping or canceling recalculates their positions before eligible handles reappear. A short press without dragging keeps the handles visible.

Moving a container preserves the entire object and its contents, including float side/width, table sizing, cell formatting, details summary/open state, code language/whitespace, quote contents, and wrapper alignment. Moves into the object's own descendants or into a container that cannot accept the object are rejected. Floats move only between root-level blocks. Tables cannot move into table cells; a container holding headings cannot move into details, where heading formatting would otherwise be removed. Details or quotes containing tables or floats cannot move into table cells, and those containing floats cannot move into another float. Images, videos, code boxes, and eligible details or quotes can move into and out of table cells, floats, quotes, list items, and details bodies that accept paragraph blocks.

Focused handles also accept Alt+ArrowUp and Alt+ArrowDown to move the object by one sibling block. During pointer dragging, approaching the viewport or scroll-container edge scrolls the document. Escape, pointer cancellation, a second touch, or window blur cancels the gesture.

The move preserves node identities and selects the moved object, committing one undo step. The original wrapper is removed, while an emptied source container keeps an editable paragraph. When the destination cell contains only one empty paragraph, that placeholder is replaced by the moved object, regardless of which half receives the drop. The cell and its attributes remain intact. Spaces, line breaks, and empty paragraphs alongside other cell content are preserved. Dropping on another code box places the moved object before or after the whole box, never inside its source text. Dropping on the object itself, its current gap, or a details summary does nothing. A document change or replacement during dragging cancels the move, including after undo restores equal content. Locked editors and active IME composition do not accept moves. Drag cancellation or dropping outside the surface leaves the source unchanged.

Native desktop dragging of the image itself and the YouTube grip remains available with the browser's drag image. The first click on an unselected video selects it; subsequent clicks inside the player can play it. Stored HTML and previews keep the ordinary player without the grip. Dropping native-dragged media into another editor follows that editor's external content-drop path and does not remove the source. Pointer handles move objects only within their own editing surface. File uploads and external HTML/text drops retain their existing behavior. Handles, translucent drag previews, and insertion markers are temporary UI and are not stored in JSON or published HTML.

## Custom IO filters

```ts
interface IoFilter {
  readonly id: string;
  readonly label: LocaleText | string;
  readonly paste?: (data: PasteData) => PasteCandidate | readonly PasteCandidate[] | null;
  readonly save?: {
    readonly extension: string;
    readonly write: (doc: DocSource) => string;
    readonly canonical: boolean;
    readonly lossy?: boolean;
    readonly mime?: string;
  };
  readonly read?: {
    readonly extensions: readonly string[];
    readonly run: (name: string, text: string) => unknown;
  };
}
```

Filter IDs must be non-empty and unique. Built-in IDs are reserved. Runtime assembly rejects malformed untyped filters. Extensions must be non-empty dot-prefixed strings, read extensions must be unique case-insensitively, callbacks must be functions, and `canonical` and `lossy` must be actual booleans. A paste candidate's `build()` returns document elements and is evaluated only when chosen, except where a filter must compare results. Read results still pass document validation. A save writer receives lazy `json()`, `html()`, and `md()` accessors. Only a successful save with `canonical: true` moves the clean baseline.

## Built-in file formats

| Format | Save | Open | Notes |
| --- | --- | --- | --- |
| `.nabi` | Yes | Yes | JSON envelope `{ version, body }`; canonical editable source |
| `.nhtml` | Yes | Yes | Complete self-contained HTML export; non-canonical |
| `.html`, `.htm`, `.xhtml`, `.shtml` | No | Yes | Ordinary external HTML |
| `.md` | Yes | Yes | Deterministic lossy export/import; unsupported registered nodes fall back to HTML |
| `.markdown` | No | Yes | Read-only Markdown extension alias |

Markdown writes footnotes in GFM syntax: `[^n]` in the body and one `[^n]: text` definition line per footnote after the last block, numbered in document order. Markdown import reads only single-line definitions and the matching `[^label]` references when the `fn` wing is registered. Definition lines inside code fences, references without a definition, and escaped `\[^1\]` text stay literal. Without the `fn` wing, footnote syntax stays literal text.

`readNabiFile()` unwraps an envelope and also accepts a bare JSON value. The later document loader still requires a valid tree array. The current `version` marker is written as package major.minor but is not used to reject files yet.

`FileStore.open(signal?)` returns `{ name, text, mime? }` or `null` for user cancellation. There is no string compatibility form. Extension dispatch is case-insensitive. Unknown or extensionless names open as plain text. A known extension whose readers all reject or fail leaves the document unchanged and reports one error. Picker-backed stores should use the optional abort signal to remove hidden inputs and listeners when a newer open starts or the file mount unmounts.

`readExtensions(filters)` derives the explicit extension lists from readable filters. `browserFileStore()` leaves the accept filter open by default so unknown and extensionless plain-text files remain selectable.

## File mount behavior

`mountFile()` registers save/open commands on one editor.

- `save()` uses the first saver, the native `.nabi` format.
- `saveAs(id, name?)` ignores an unknown format ID.
- `formats()` reports labels, extensions, and the lossy flag.
- `open()` confirms before discarding changed content and returns whether a document was loaded.
- A native save moves the clean baseline only after the store succeeds, using the exact snapshot sent.
- Native save completion waits for any valid thenable, including cross-realm promises. An older completion cannot replace the baseline established by a newer save.
- HTML/Markdown exports never mark the NABI source clean.
- A custom `onError` receives store/writer errors.

Default names use the local date as `YYYY-MM-DD`, not UTC.

## Uploads

`mountUpload()` validates and sends one batch at a time.

Defaults:

- maximum file size: 10 MiB;
- maximum accepted batch size: 10 MiB;
- extension list: unrestricted;
- size `0`: rejected;
- limits set to `0`: unlimited.

Per-file type/size failures remove that file. Total-size failure rejects the entire accepted batch. A failed uploader result or thrown error removes that file while other files continue.

During transfer the editor is locked. If `root` is supplied, it also becomes `contenteditable="false"`. The lock is released before `onSettle`; successful results then commit once as one undo step. Cancel releases the lock and restores `contenteditable` immediately even when the uploader ignores abort. Late progress and resolution are discarded. Cancel reports one cancelled `onDone`; `unmount()` cancels without invoking mount callbacks.

The file picker and upload batch preserve their starting selection, including its float region or table cell. A selection-only move does not redirect insertion. Any document edit or replacement before commit cancels insertion and reports a localized warning; this deliberately includes edits outside the original target. A cancelled batch reports `{ committed: 0, cancelled: true }`. Upload placeholders use the same `commitUpload` scope as the completed images: they remain after the original block inside its float region or table cell, choosing the cell when it is nested in a float. This applies to file drops, pasted files, and the file picker. They never fall back to the document root if that target disappears.

`onDone` reports the insertion result, not merely successful server transfers. If `commitUpload` is rejected, such as for a selection crossing cell boundaries, the completed batch reports `{ committed: 0, cancelled: false }`. A successful command reports the committed batch's item count. Keep completion UI tied to this callback rather than assuming a returned upload URL was inserted.

An uploader receives `onProgress` and `AbortSignal`. It returns `{ uri }` or `null`. Progress is clamped to 0..100. Default upload warnings remain visible for 5000 ms.

## Local history

Default storage key is `nabi-note.history`; default record limit is 20; default automatic interval is 3000 ms. Records are newest first. A separate 60000 ms threshold controls whether UI shows a distinct created time.

Storage is best effort. `browserHistoryStorage()` returns `null` when local storage is blocked, including common `file://` cases. Mounting with `null` keeps the integration alive enough to explain that state. The localized notice describes restricted storage access and, if the page was opened as a local file, asks the user to open it through a web server.

Unmount flushes a throttled trailing document change. Restoring another session writes the new current-session record successfully before deleting the source record.

## Resource limits

Version 1.0 does not impose a document-wide node count, text length, nesting depth, or processing-time budget on JSON, HTML, Markdown, diff, or custom commands. This is separate from the upload limits above. A host that accepts untrusted large documents should enforce its own request and storage limits before calling the package. Future hard limits may be added at the shared input boundary, but 1.0 exposes no document-budget option.
