# Viewer and diff

The unreleased 1.4.0 contract includes click merge and the standalone comparison guide in every documentation locale. Its demo messages and sample documents follow the page language.

These features live in separate package entry points so a published page does not pay for the editor.

## Published-page viewer

```ts
import { attachViewer } from 'nabi-note/viewer';

const viewer = attachViewer(article, {
  locale: 'en',
  tables: 'marked',
  highlight: customHighlighter,
});

viewer.refresh();
viewer.unmount();
```

`ViewerOptions` combines table-sort and code-paint options:

```ts
interface ViewerOptions {
  readonly locale?: string;
  readonly tables?: 'marked' | 'all';
  readonly highlight?: CodeHighlighter;
}
```

One viewer may be attached to a root at a time. `refresh()` first removes its current reader projection, then attaches to the current host HTML. `unmount()` is idempotent and restores the still-current code nodes, table row order, attributes, and controls without overwriting intervening host changes.

### Table sorting

Default selector: `table[data-nabi-sortable]`. Set `tables: 'all'` to attach every table under the root. A root that is itself a matching table is included.

A table is skipped when:

- any cell has `rowspan` or `colspan` greater than 1;
- there is no body row;
- body rows do not share one parent.

Each header cell gets a button. The cycle is original, descending, ascending, original. Clicking another column starts descending. Empty cells always sort last. A column is numeric only when every nonempty cell matches the strict number grammar; otherwise `Intl.Collator(locale, { numeric: true })` orders it.

Locale defaults to the option, then `document.documentElement.lang`, then the locale fallback.

Standalone exports include `SORTABLE_ATTR`, `attachTableSort`, `hasMergedCells`, `nextSortState`, and `rankRows`.

### Code paint

Every nonempty `pre > code` under the root is painted. Language is read from the parent `data-nabi-lang`, then the code class `language-...`.

A custom `CodeHighlighter` may return tokens. If it is missing or cannot answer, the zero-dependency built-in tokenizer runs. Token spans are transient viewer DOM and are not document content.

Standalone exports include `CODE_LANG_ATTR`, `attachCodePaint`, and `codeLanguageOf`.

## Diff entry

```ts
import { diffDocs, mountDiff, mountDiffWing } from 'nabi-note/diff';
```

Diff input is either:

- NABI TREE JSON as `unknown`; or
- an HTML string.

HTML input requires global `DOMParser`. Without it, HTML input returns `null`. JSON comparison itself does not need the browser DOM. Invalid input returns `null` rather than throwing.

Use the same registry that owns the documents.

With `floatWing` and its CSS loaded, float regions keep their stored side and maximum width relative to each comparison pane. Each float row contains its full height, so the following block starts below it instead of wrapping beside it. This isolation is diff-only; stored rendering and preview retain normal text flow around the float. Side/width-only changes still count as changed blocks, even without a character highlight.

### Pure comparison model

```ts
const model = diffDocs(before, after, registry, {
  allowLocalUrls: false,
});
```

`DocDiff` contains:

- `entries`: matched block pairs with kinds `same|changed|removed|added|moved`;
- `before` and `after`: rendered blocks with text and entry index;
- `changes`: indices of all entries except `same`.

Changed blocks already contain escaped published HTML plus `.nabi-diff-del` or `.nabi-diff-ins` character ranges. These ranges cover inserted or deleted text and unchanged text whose rendered inline wrapper or inline attributes changed, such as bold, color, or link destination changes. A block-only attribute change can still have no character range. Matching does not depend on internal `_id`; stored snapshots do not share reliable internal identity.

### Mounted two-pane diff

```ts
const diff = mountDiff({
  root,
  before,
  after,
  registry,
  locale: 'en',
});

diff.update(nextBefore, nextAfter);
diff.unmount();
```

The mount creates a read-only two-pane view, previous/next navigation, change count, unchanged-region folding, scroll mapping, and connector graphics. Only-changes mode is enabled by default and keeps one context block around each change. With no changes, both complete documents remain visible and the fold toggle is disabled. Updates preserve the user's fold preference, applying it only when changes exist. Folded regions also hide float blocks. The mount injects `DIFF_CSS` with exact-string reference counting per document, so it can stand alone; load `nabi.css` too when rendered document content uses wing styles.

`unmount()` removes generated content and the `.nabi-diff` class. The final reference also removes the package-owned injected diff style; a matching style supplied by the host is never removed.

### Previous-to-current click merge

Add `onMerge` to expose `>>` controls for changed paragraph/line groups. Omitting it keeps the existing read-only behavior. Structural blocks are replaced atomically; character highlights do not define independent merge actions. Applying an added group removes the current-only addition; applying a removed group restores the previous content. A detected move groups its removal and insertion so the content is not duplicated.

```ts
const diff = mountDiff({
  root,
  before,
  after,
  registry,
  onMerge(proposal) {
    if (proposal.signal.aborted) return;
    if (!diff.update(proposal.before, proposal.result, proposal.revision)) return;
    currentDocument = proposal.result;
  },
  onError(error) {
    report(error);
  },
});
```

`DiffMergeProposal` contains serializable `before`, `after`, and `result` JSON arrays, `changeId`, the current comparison `revision`, and `signal: AbortSignal`. The callback returns `void | Promise<void>` and only receives a proposal: the mount neither persists nor accepts it automatically. Call `update(before, result, proposal.revision)` to accept it. `update()` returns a boolean; a stale expected revision rejects the update. The optional revision parameter does not change existing two-argument callers.

Merge buttons stay disabled while the callback is pending. An update or unmount aborts the old proposal signal. Exceptions and promise rejections go to `onError`; callbacks cannot overwrite a newer view through a stale revision. Hosts performing asynchronous persistence must also validate their server document version; aborting a signal does not roll back a completed server write.

Headless hosts may use the same patch grouping without a mount:

```ts
import { diffMergeChanges, applyDiffMerge } from 'nabi-note/diff';

const plan = diffMergeChanges(before, after, registry);
const change = plan?.changes[0];
const result = change ? applyDiffMerge(before, after, change.id, registry) : null;
```

`DiffMergePlan` has normalized serializable `before` and `after` documents and `changes`. Each `DiffMergeChange` has an input-sensitive `id`, `kind`, logical-unit `beforeRanges`/`afterRanges`, and document-level `beforeBlocks`/`afterBlocks`. `beforePosition` and `afterPosition` are first affected `{ block, offset }` positions, or `null` when that side has no affected content. A range is `{ start, end }` with an exclusive end; it is not a text offset into serialized HTML. `applyDiffMerge()` applies one group from previous to current and returns stored JSON, or `null` for invalid inputs or a stale/unknown change ID. These functions share the stricter merge input validation described in `merge.md`.

For automatic combination of concurrent changes against an editing-start base, use `nabi-note/merge`; see `merge.md`.

### Diff tool wing integration

The `diff` wing has a host action. Wire it with:

```ts
const mounted = mountDiffWing({
  nabi,
  registry,
  surface: content,
  locale: 'en',
  merge: true,
});

mountToolbar({
  nabi,
  registry,
  root: toolbarRoot,
  surface: content,
  onHost: (w) => {
    if (w === 'diff') mounted.open();
  },
});
```

The integration stores the last loaded document as its baseline. It updates that baseline only on a `NabiChange` with `loaded: true`; typing, paste commands, undo, and redo do not move it. `baseline()` returns the current baseline. The screen closes on Escape and restores focus to the surface.

`merge: true` enables the previous-to-current controls and applies accepted changes to the connected editor in one undoable edit. It does not call `setJson()` or move the baseline. Editor document changes refresh an open comparison and invalidate old controls. Omit `merge` for the original read-only behavior. Optional `onError` reports integration failures; use standalone `mountDiff({ onMerge })` for a custom acceptance/persistence callback.

Unmount both the toolbar and diff integration.

## Reader and diff icon themes

Viewer sorting exposes `viewer-sort-original`, `viewer-sort-ascending`, and `viewer-sort-descending`. Diff uses `diff-prev`, `diff-next`, `diff-fold`, and `diff-close`. Set `--nabi-icon-<key>: url("/icons/name.webp")` on the corresponding container or its ancestor. SVG and PNG work too. The standalone viewer still does not import editor UI; load `nabi.css` with its icons directory. Diff provides its own required styles and default image URLs. Editor-mounted diff screens follow the source editor icon theme. See `icons.md`.
