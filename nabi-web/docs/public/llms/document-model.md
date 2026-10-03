# Document and editing contract

## NABI TREE

A document is an array of element nodes. There is no root object.

```ts
type AttrValue = string | number;
type Attrs = Readonly<Record<string, AttrValue>>;

interface ElementNode {
  readonly w: string;
  readonly a?: Attrs;
  readonly ch: readonly NabiNode[];
  readonly _id?: string;
}

type NabiNode = ElementNode | string;
type NabiDoc = readonly ElementNode[];
```

User JSON uses `w`, optional `a`, and optional or empty `ch`. Text is a plain string. `getJson()` removes every internal `_` field, including `_id`.

Core reserved words are:

- `p`: every root block is a paragraph node.
- `br`: an explicit line break.

All other words belong to registered wings or their declared parts.

## Normalization

Every load and every successful command passes through the same normalization layer.

- The document always contains at least one paragraph.
- Loose inline content is gathered into paragraphs.
- A block object is wrapped by one paragraph.
- A paragraph mixing text and block objects is split.
- Adjacent text nodes merge; empty strings disappear.
- Void objects lose children.
- Wing repair hooks validate wing-specific values and structures.
- Unregistered wrappers are removed, their children are normalized in place, and their attributes are discarded.
- A text paragraph keeps only `h` 1..6, `a` `l|c|r`, and `dc` 1.
- An object wrapper paragraph keeps only alignment, unless the object declares `noAlign`.
- Boolean attributes declared by a wing keep numeric `1` only.
- Non-finite numbers and `_`-prefixed attributes are removed.
- Internal IDs are unique and deterministic from document paths when no valid ID is preserved.

Do not depend on malformed tree shape surviving a round trip.

## Positions and selections

```ts
interface Position {
  readonly path: readonly number[];
  readonly offset: number;
}

interface Selection {
  readonly anchor: Position;
  readonly focus: Position;
}
```

A path descends by child indices and must end at a caret holder: a paragraph or an inline holder such as a code block or details summary. The offset is a UTF-16 text/unit offset in that holder. Text offsets are normalized to Unicode grapheme boundaries with `Intl.Segmenter` and a built-in fallback. A `br` or object terminal occupies one unit. An object wrapper paragraph has only offsets 0 and 1, before and after the object.

A selection may be backward. A collapsed selection has equal anchor and focus. Object selection is the ordinary 0..1 range over one wrapper paragraph; it is not separate state.

`nabi.select(selection)` clones its input and returns `false` for a position that does not exist. `getSelection()` returns a fresh deeply frozen snapshot. A collapsed offset inside a grapheme snaps to the nearest boundary. Range endpoints expand outward so a partial grapheme is never selected.

## Creating and loading

```ts
const { nabi, registry } = createNabiWith(wings, {
  doc,
  allowLocalUrls,
  locale,
  ask,
  toast,
  toastMs,
  toastMax,
  onError,
  undoLimit: 200,
  typingMergeMs: 1000,
});
```

- A valid `doc` becomes the initial clean state.
- Invalid or throwing initial data falls back to the valid empty document.
- `setJson(value)` accepts a root array, normalizes it, and returns a boolean.
- `setHtml(html)` uses the browser factory's internal `DOMParser` adapter.
- Blank `null`, `undefined`, whitespace, or `[]` clears to an empty document.
- Invalid nonblank input returns `false` without replacing the current document.
- Loading is refused while the editor is locked.
- A successful load is undoable and establishes the new clean baseline.
- `undoLimit` defaults to 200 and must be an integer of 1 or greater.
- `typingMergeMs` defaults to 1000 and must be finite and non-negative. Set it to 0 to disable typing coalescing.

HTML import is described in `io-security.md`.

## Published and editor HTML

- `getHtml()` creates published/storage HTML.
- `getEditorHtml()` creates editing HTML with deterministic `data-key`, content seals, fillers, and edit-only markup.
- `renderStoredHtml(json, registry)` and `renderStoredEditorHtml(json, registry)` are the detached equivalents.
- Leading paragraph spaces (including inside inline formatting), multiple spaces, and trailing spaces are protected in HTML output so browser whitespace collapse does not change visible content.
- Empty published paragraphs render as `<p></p>`. Editor HTML uses a marked filler `br`. A sole unmarked `br` is a real line, and a trailing real `br` receives a separate marked editor-only filler.

Never persist editor HTML as content. It is an implementation representation for mounting and hydration.

## Commands

```ts
type CommandArgs = Readonly<Record<string, unknown>>;
type CommandHand = 'keyboard' | 'pointer';

type Command = (
  doc: NabiDoc,
  selection: Selection,
  args: CommandArgs,
  env: EditEnv,
) => CommandOutcome | null;
```

Commands are pure. Return a new `{ doc, selection, arm? }` or `null` for no change. Custom commands receive frozen document and selection clones, a descriptor-validated frozen plain-data argument snapshot, and a read-only environment facade. Accessors, cycles, custom prototypes, functions, and symbols in custom command arguments are rejected before the command runs.

`nabi.applyCommand(name, args?, by?)` validates every result even when it reuses the current references. It returns `false` when the command is unknown, invalid, locked, throws, fails repair or normalization, or produces no change. A failed command leaves document, selection, armed state, and undo history unchanged. Command, repair, and normalization failures are reported to `NabiOptions.onError`. The error callback itself is isolated. The default hand is `keyboard`. With a collapsed caret, keyboard mark commands may arm a mark for future text; pointer commands refuse that hidden action and can notify the user.

`nabi.group(fn)` groups successful mutations into one undo entry. Consecutive typing coalesces only while the previous insertion is within `typingMergeMs`; 0 disables coalescing. The undo stack keeps at most `undoLimit` snapshots.

## Change events

```ts
interface NabiChange {
  readonly doc: boolean;
  readonly selection: boolean;
  readonly armed: boolean;
  readonly loaded?: boolean;
  readonly paragraphs: readonly string[];
  readonly removed: readonly string[];
}
```

`onChange()` returns an unsubscribe function. Each listener runs independently: one listener throwing does not stop later listeners or roll back the committed command. Such exceptions are reported through `onError`. `paragraphs` and `removed` contain internal paragraph IDs for incremental redraw. Treat them as transient rendering hints, not stored identities.

A successful document replacement emits `loaded: true`. Ordinary typing, paste commands, undo, and redo do not. The diff-wing integration uses this distinction to move its baseline only when a document is loaded.

## Saved state and locking

`isChanged()` compares the current document with the saved baseline. Initial content and a successful load are clean. A successful native `.nabi` save marks the exact saved snapshot clean; HTML and Markdown exports do not.

Upload and other package integrations can lock the editor through package-private capabilities. The public `Nabi` facade exposes no `$` members. While locked, document-changing commands, undo, redo, and loading are refused. Do not bypass the lock by changing the surface DOM.

## IME and surface ownership

The mounted surface controls composition and selection mapping.

- Composition DOM is temporarily authoritative until the composition boundary.
- The surface prefers `InputEvent.getTargetRanges()` when available.
- Empty Android composition gets a real text slot.
- Structural actions first synchronize the actual DOM selection.
- Correction input may be deferred; default `correctionDeferMs` is 80.
- Structure double-key timing defaults to 350 ms.

A host may read the root, but must not rewrite active text nodes, set `innerHTML`, remount the root, or force a redraw during composition. Use editor methods and commands.
