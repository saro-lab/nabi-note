# Architecture and boundaries

NABI NOTE separates the stored document, pure editing commands, DOM input handling, host UI, and reader-side behavior. A `Wing` is the unit that adds vocabulary and behavior. `makeRegistry()` validates wings and derives all runtime tables from them.

## Public entry points

| Import | Environment | Owns |
| --- | --- | --- |
| `nabi-note` | Browser, with DOM-free assembly helpers | Editor, wings, surface, UI, IO mounts, rendering, locale, style helpers |
| `nabi-note/ssr` | Node.js or any DOM-free runtime | Registry creation, stored/editor HTML rendering, toolbar HTML, locale and tree basics |
| `nabi-note/viewer` | Browser, read-only | Table sorting and code painting on published HTML |
| `nabi-note/diff` | Browser for UI; pure JSON comparison is otherwise DOM-free | Stored-document comparison and two-pane diff UI |
| `nabi-note/nabi.css` | CSS | Core CSS plus all built-in wing styles |

`nabi-note/viewer` deliberately does not import editor, surface, UI, or schema code. `nabi-note/ssr` deliberately excludes surface and UI code.

## Runtime ownership

1. Wings declare words, structure, commands, HTML/Markdown builders, import claims, toolbar controls, and optional DOM attachments.
2. `makeRegistry(wings)` validates the declarations and derives schema knowledge, commands, builders, input rules, attachments, and IO filters.
3. `createNabiWith(wings, options)` creates one pure editor state machine plus its registry.
4. `mountSurface()` connects that editor to one `contenteditable` root. It owns input, selection, IME, clipboard, paste, drop, and registered wing attachments.
5. UI mounts observe or call the editor. They do not become document state.
6. `renderStoredHtml()` or `nabi.getHtml()` creates published HTML. `attachViewer()` may add optional reader behavior to that HTML.

The document tree, not the live DOM, is the durable source of truth. During an active IME composition the surface temporarily leaves the composing DOM range alone and commits it at the composition boundary. Hosts must not replace or rewrite active surface nodes.

## Assembly rule

The registry is part of the document contract. The same stored tree renders differently when its owning wings are missing. Use the same wing list for:

- the editor instance;
- server rendering and hydration;
- stored rendering outside an editor;
- diff rendering;
- CSS collection when using runtime injection.

Unknown or unowned node types are not a plugin preservation mechanism. Normalization/import may unwrap or remove them.

## Durable and transient representations

| Representation | Purpose | Safe to store |
| --- | --- | --- |
| `nabi.getJson()` | Normalized NABI TREE without internal `_` fields | Yes |
| `nabi.getHtml()` / `renderStoredHtml()` | Published HTML | Yes |
| `nabi.getEditorHtml()` / `renderStoredEditorHtml()` | Hydratable editing DOM with `data-key`, fillers, seals, and edit-only drop-cap markup | No |
| Live surface DOM | Browser input and selection state | No |

## Security boundary

The package uses registered builders and an allow-list importer rather than emitting arbitrary input HTML. Text and attributes are escaped centrally. Dangerous imported subtrees are dropped. URLs pass `safeUrl()`.

This is not permission to register unsafe custom builders or filters. Custom code is inside the trust boundary and must validate command args, imported elements, URLs, and returned nodes. See `io-security.md`.

## Environment and lifecycle rules

- The package has no runtime dependencies.
- Call every returned `unmount()`, `close()`, or detach function when its host goes away.
- One mount belongs to one editor and one set of roots. Do not reuse a surface mount across editors.
- `nabi.applyCommand()` is enough for headless control; toolbars are optional.
- Use the `$`-prefixed members on `Nabi` only when wiring package-level integrations. They are exported in the type but are internal integration hooks, not the stable application-level API.

## Next documents

- First editor: `quickstart-npm.md`
- Tree and state semantics: `document-model.md`
- Public symbol lookup: `api-reference.md`
