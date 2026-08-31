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

## HTML import

The browser assembly factory wires an internal `DOMParser` adapter automatically. Parser adapters and the low-level parse tree are package-private.

The importer understands registered wing claims plus common structural HTML. It unwraps browser-only wrappers such as `tbody`, `thead`, `tfoot`, and `div.nabi-scroll` without `data-nabi-p`.

These tags and their entire subtrees are dropped:

`script`, `style`, `noscript`, `template`, `head`, `title`, `meta`, `link`, `base`, `object`, `embed`, `applet`, `form`, `input`, `button`, `select`, `option`, `textarea`, `svg`, `canvas`, `audio`, `video`, `source`, `track`, `param`, `frame`, `frameset`, `map`, and `area`.

Dropping the subtree prevents script/style text from reappearing as document text.

## Paste

`mountSurface()` builds one filter list in this priority order:

1. filters passed to that surface;
2. registry filters, with host registry filters before wing filters;
3. built-in NABI, HTML, Markdown, and HTML-open filters;
4. plain text fallback.

Clipboard custom data uses `application/vnd.nabi.tree+json` with the exact envelope `{ version: 1, body: [...] }`. Copy and cut attempt custom MIME, `text/html`, and `text/plain` independently. Paste priority is valid supported custom data, safe built-in HTML, then plain text. Every candidate is normalized and validated. A host filter cannot shadow the reserved built-in IDs `nabi`, `html`, `markdown`, or `text`.

For ordinary non-HTML input where multiple custom candidates apply, `ask.choose` or the bound choose UI selects a positional index. An invalid index cancels. Markdown is offered only when the text looks like Markdown and registered wings can represent at least one detected construct.

A paste containing any text HTML/plain data is treated as content paste. Its files do not go to `fileSink`. File-only paste and drop may go to `fileSink`.

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

During a batch the editor is locked. If `root` is supplied, it also becomes `contenteditable="false"`. All successful results commit once, as one undo step, after `onSettle`. Cancel releases the lock and restores `contenteditable` immediately even when the uploader ignores abort. Late progress and resolution are discarded. Cancel reports one cancelled `onDone`; `unmount()` cancels without invoking mount callbacks.

An uploader receives `onProgress` and `AbortSignal`. It returns `{ uri }` or `null`. Progress is clamped to 0..100. Default upload warnings remain visible for 5000 ms.

## Local history

Default storage key is `nabi-note.history`; default record limit is 20; default automatic interval is 3000 ms. Records are newest first. A separate 60000 ms threshold controls whether UI shows a distinct created time.

Storage is best effort. `browserHistoryStorage()` returns `null` when local storage is blocked, including common `file://` cases. Mounting with `null` keeps the integration alive enough to explain that state.

Unmount flushes a throttled trailing document change. Restoring another session writes the new current-session record successfully before deleting the source record.

## Resource limits

Version 1.0 does not impose a document-wide node count, text length, nesting depth, or processing-time budget on JSON, HTML, Markdown, diff, or custom commands. This is separate from the upload limits above. A host that accepts untrusted large documents should enforce its own request and storage limits before calling the package. Future hard limits may be added at the shared input boundary, but 1.0 exposes no document-budget option.
