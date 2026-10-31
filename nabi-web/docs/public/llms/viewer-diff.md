# Viewer and diff

The 1.6.0 contract includes click merge and the standalone comparison guide in every documentation locale. Its demo messages and sample documents follow the page language.

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
  readonly locale?: LocaleInput;
  readonly tables?: 'marked' | 'all';
  readonly highlight?: CodeHighlighter;
  readonly footnotes?: boolean;
  readonly outline?: OutlineOptions | false;
}
```

`footnotes` defaults to true. Set it to false to leave stored footnote markup without reader behavior. Editor and preview contexts suppress footnote navigation automatically; preview bubbles remain available.

One viewer may be attached to a root at a time. `refresh()` first removes its current reader projection, then attaches to the current host HTML. `unmount()` is idempotent and restores the still-current code nodes, table row order, attributes, and controls without overwriting intervening host changes.

### Heading outline

`mountOutline(root, options)` from `nabi-note/viewer` works with editor or published DOM without importing editor modules. Load `nabi-note/nabi.css`. It collects nonempty visible H1/H2 elements in DOM order; H1 has sequential numbers and H2 is indented without numbering. It excludes all details descendants, hidden headings, footnote appendices, and nested document roots. Duplicate text is allowed because each item holds its actual heading element.

```ts
import { mountOutline } from 'nabi-note/viewer';

const outline = mountOutline(article, {
  trigger: contentsButton,
  locale,
  placement: 'above',
  onChange: ({ items, activeIndex, available, open }) => {
    contentsButton.hidden = !available;
    // Update host state from this snapshot, including the initial empty one.
  },
});
contentsButton.onclick = () => outline.toggle();
// On route change or host disposal:
// outline.unmount();
```

The trigger belongs to the host. `mountOutline` sets/restores its dialog ARIA attributes but does not attach a click listener or choose its icon. `onChange` receives the initial state even when it is `{ items: [], activeIndex: -1, available: false, open: false }`. Subsequent notifications describe changed items, active position, or open state. Deleting the last heading closes the panel and reports the empty state. `onAvailabilityChange` and `onOpenChange` also receive initial values. No headings means an empty-state notification, not a missing callback.

`OutlineItem` has `element: HTMLElement`, `text: string`, `level: 1 | 2`, and `number: number | null`. `OutlineState` contains readonly `items`, `activeIndex` (-1 before the first heading), `available`, and `open`. `subscribe(listener)` immediately sends a snapshot and returns an unsubscribe function. Callback exceptions are isolated and passed to optional `onError(error)`.

`OutlineAttachment` exposes `panel`, `getState()`, `getItems()`, `subscribe()`, `refresh()`, `goTo(index, behavior?)`, `setOpen(boolean)`, `toggle()`, and idempotent `unmount()`. One outline may be mounted on each root. `goTo` returns whether an attached target exists and defaults to smooth scrolling; pointer scrubbing uses immediate scrolling and reduced motion disables smooth scrolling. Scroll position changes never alter URL hashes, browser history, or saved content.

Options also include `container` (outside the article, default its parent), `anchor` (default trigger), `placement: 'above' | 'beside' | 'css'`, `scrollContainer` (Window, HTMLElement, or a function returning one; default the owning window), and `offset` (pixels or a function returning pixels; default one root rem). Use a dynamic scroll container for fullscreen editors. The host can call `refresh()` after layout changes that do not produce observed DOM/resize events. `onRequestClose(reason)` notifies before automatic close for `selection`, `outside`, `escape`, or `empty`; it is a notification, not a veto.

The supplied nonmodal panel has no backdrop, body scroll lock, heading bar, or close button. Pointer press selects immediately, dragging across items visits headings, and release closes. Long lists have top/bottom edge regions: pressing moves one heading from the current selection and holding repeats that step, revealing the selected item as needed. Mouse hover does nothing. Releasing or leaving an edge stops repetition; using an arrow alone does not close the panel. Edges disable only at the first or last selected heading, independently of list scroll position. Pointer cancellation/lost capture/window blur stops dragging. Keyboard arrows move one heading from the current selection even if keyboard focus is elsewhere; Home/End visit the first/last heading. Enter/Space on an edge moves one heading; on an item it selects and closes. Escape and outside press close. Focus returns to the trigger on selection or Escape, while outside interactions keep their destination. Touch dragging uses pointer capture, not native list scrolling.

While open, scrolling the document reveals its current heading inside the outline without moving keyboard focus. This automatic list scrolling yields to pointer dragging and edge scrolling.

The panel and its descendants disable text selection, native dragging, touch callouts, and native touch gestures, including on the scrollable list itself. This keeps mobile touch dragging under pointer navigation control; it does not restrict selection or scrolling in the document outside the panel.

Immediate navigation keeps the chosen heading selected until the document scroll position changes, including near the bottom where several headings may share the same clamped scroll position.

Changes to content, ancestor visibility, size, images, details state, scroll, and locale refresh the appropriate projection. Attachment before DOM connection is supported. Unmount removes the panel, subscriptions, observers, animation work, and transient number attributes. Runtime items, numbers, open state and coordinates are never added to NABI TREE or `getHtml()`.

To compose with the reader runtime, pass `attachViewer(article, { outline: { trigger, onChange }, locale })`, then call `viewer.outline?.toggle()`. Omitted/false `outline` leaves the feature off. `viewer.refresh()` preserves the outline attachment; `viewer.unmount()` removes it. The standalone `mountOutline()` also works on an editable surface. Do not attach both outlines to the same root.

### Table sorting

Sort controls localize their sort action, original order, ascending state, and descending state for every language in `LOCALES`. Regional locale tags use their base language. Updating a shared locale source refreshes labels without changing the current row order.

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

Each code box, including an empty one, receives an upper-right source-copy button. The selected language occupies the same upper-right position when the button is hidden. Hover or button keyboard focus replaces the label with the clipboard icon; touch devices keep the button visible. These overlays do not add a header row above the code. Copying preserves source whitespace and line breaks and excludes labels and highlighting markup. Success and failure update its localized label and visual state. Copy labels include Punjabi (`pa`), Pashto (`ps`), and Yoruba (`yo`), including regional locale tags; this does not add these languages to the complete editor locale catalog. `CodePaintOptions.locale` accepts `LocaleInput`; it defaults to the nearest `lang` ancestor and then the locale fallback. A locale controller updates labels without remounting. Refresh/unmount removes controls and listeners and restores a language attribute added from a `language-...` class.

Standalone exports include `CODE_LANG_ATTR`, `attachCodePaint`, and `codeLanguageOf`.

### Footnotes

Stored HTML already shows `sup[data-nabi-fn]` numbers and the `section[data-nabi-footnotes]` list without JavaScript. The viewer adds:

- mouse hover or keyboard focus on a number opens a read-only bubble with the footnote text; leaving both the number and the bubble closes it;
- a click or tap pins the bubble; pressing the same number again, pressing outside, or Escape closes it;
- moving the pointer into the bubble or selecting its text keeps it open; opening another number closes the previous bubble;
- on published pages, each bubble starts with a `[n]` button; activating it closes the bubble and scrolls to and focuses the matching endnote in the same document;
- on published pages, a number in the list scrolls to its marker in the same document and focuses it;
- a number inside a details summary does not toggle the details.

Footnote navigation is disabled inside `.nabi-editing`, `.nabi-footnote-area`, and `.nabi-preview-body`. Preview bubbles start with a plain `[n]` span instead of a button, and list numbers do not scroll or move focus. Tab from a marker enters the bubble's first button or link, if present; Shift+Tab from that first control returns to the marker. Controls inside the bubble keep their normal focus order. The editor's own footnote list also leaves the body selection unchanged; clicking a marker in the editing body still opens its edit prompt.

There is no close button. The bubble reads plain text from the `data-nabi-fn` attribute, never parses it as HTML, and turns valid explicit HTTP(S) URLs into native links using the shared URL validator. Displayed text remains unchanged. On published pages its numbered control is a native button; the bubble uses `role="group"`. The bubble is appended inside the nearest `.nabi-content`, inherits its tokens, and uses the base sans stack at 0.75 of the body size (`fs` `xs`, two steps below the default). Padding is `.6em` on all sides, and the bubble is excluded from content block spacing so opening it leaves the endnote list and document height unchanged. Long text scrolls inside the bubble, which stays within the viewport. Each attachment is scoped to its root, so several documents on one page do not open each other's footnotes. `refresh()` and `unmount()` remove the bubble and listeners and restore the marker attributes. `openPreview()` does not attach the viewer by itself; call `attachViewer()` from its `onBody` hook.

Inside a preview, bubble links use `target="_blank"` and `rel="noopener noreferrer"`, matching preview body and endnote links. Published-page bubble links retain native same-window behavior.

Standalone exports include `FOOTNOTE_ATTR` and `attachFootnotes`.

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

Blocks render one at a time, so footnote numbers are not part of the comparison. Footnote markers appear as `[*]` in diff and merge panes. A block whose footnote numbers shift only because a footnote was added or removed earlier stays `same`. Changing only a footnote's text marks its block `changed` and highlights the marker.

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

The fold toggle keeps its "Only changes" accessible name and exposes the mode through `aria-pressed`. The on state has a solid accent background and a bold white default icon. The off state has a neutral icon and no selected background, while the unavailable state is disabled and dimmed. The `diff-fold` icon theme key stays the same in every state; custom images retain their colors.

`unmount()` removes generated content and the `.nabi-diff` class. The final reference also removes the package-owned injected diff style; a matching style supplied by the host is never removed.

### Previous-to-current click merge

Add `onMerge` to expose `>>` controls for changed paragraph/line groups. Omitting it keeps the existing read-only behavior. Structural blocks are replaced atomically; character highlights do not define independent merge actions. Applying an added group removes the current-only addition; applying a removed group restores the previous content. A detected move groups its removal and insertion so the content is not duplicated.

Gutter apply controls use bold double-chevron icons with no resting background or border, keeping connector lines visible. Hover and keyboard focus add a background; keyboard focus also has an inset outline.

The standalone documentation demo also opens read-only by default. Its optional `merge` prop explicitly enables the apply controls and callback result preview.

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

`merge` defaults to true: previous-to-current controls apply accepted changes to the connected editor in one undoable edit. It does not call `setJson()` or move the baseline. Editor document changes refresh an open comparison and invalidate old controls. Set `merge: false` for read-only behavior. Optional `onError` reports integration failures; use standalone `mountDiff({ onMerge })` for a custom acceptance/persistence callback.

Unmount both the toolbar and diff integration.

## Reader and diff icon themes

Viewer sorting exposes `viewer-sort-original`, `viewer-sort-ascending`, and `viewer-sort-descending`. Diff uses `diff-prev`, `diff-next`, `diff-fold`, and `diff-close`. Set `--nabi-icon-<key>: url("/icons/name.webp")` on the corresponding container or its ancestor. SVG and PNG work too. The standalone viewer still does not import editor UI; load `nabi.css` with its icons directory. Diff provides its own required styles and default image URLs. Editor-mounted diff screens follow the source editor icon theme. See `icons.md`.
