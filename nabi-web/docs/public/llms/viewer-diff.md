# Viewer and diff

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

The mount creates a read-only two-pane view, previous/next navigation, change count, unchanged-region folding, scroll mapping, and connector graphics. Folding keeps one context block around each change. The mount injects `DIFF_CSS` with exact-string reference counting per document, so it can stand alone; load `nabi.css` too when rendered document content uses wing styles.

`unmount()` removes generated content and the `.nabi-diff` class. The final reference also removes the package-owned injected diff style; a matching style supplied by the host is never removed.

### Diff tool wing integration

The `diff` wing has a host action. Wire it with:

```ts
const mounted = mountDiffWing({
  nabi,
  registry,
  surface: content,
  locale: 'en',
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

Unmount both the toolbar and diff integration.

## Reader and diff icon themes

Viewer sorting exposes `viewer-sort-original`, `viewer-sort-ascending`, and `viewer-sort-descending`. Diff uses `diff-prev`, `diff-next`, `diff-fold`, and `diff-close`. Set `--nabi-icon-<key>: url("/icons/name.webp")` on the corresponding container or its ancestor. SVG and PNG work too. The standalone viewer still does not import editor UI; load `nabi.css` with its icons directory. Diff provides its own required styles and default image URLs. Editor-mounted diff screens follow the source editor icon theme. See `icons.md`.
