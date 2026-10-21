# Built-in wings

The official catalog lists wings in a stable order. `defaultWings` and `wings().all()` contain all of them.

## Marks

| `w` | Export | Stored value or behavior |
| --- | --- | --- |
| `b` | `boldWing` | Bold mark |
| `i` | `italicWing` | Italic mark |
| `u` | `underlineWing` | Underline mark |
| `s` | `strikeWing` | Strike mark |
| `sup` | `superscriptWing` | Superscript mark |
| `sub` | `subscriptWing` | Subscript mark |
| `tf` | `typefaceWing` | `a.v`: `sans|serif|mono|cursive` |
| `fs` | `fontSizeWing` | `a.v`: `xs|sm|lg|xl`; absence means default |
| `tc` | `textColorWing` | `a.c`: `green|coral|violet|amber|blue` |
| `hl` | `highlightWing` | `a.c`: named highlight colors |
| `a` | `linkWing` | Strict `href`; attachment links also carry `file` |

Value factories are `makeTypefaceWing`, `makeFontSizeWing`, `makeTextColorWing`, and `makeHighlightWing`, each with `{ values }`.

With a collapsed caret, font size and typeface target the paragraph's current text. Color/highlight target the current mark span or arm future text. A selected range always remains the target.
The main toolbar color and highlight buttons remove an existing effect regardless of its current value; otherwise, they keep their existing default-value action. Context swatches still replace a different value and remove the same value.
Like other mark buttons, a pointer click with a collapsed caret and no current mark reports that no text is selected instead of arming future text.
With `mountHints()`, tapping Shift twice opens the compact Tools palette. Tab changes groups and arrow keys navigate icons; Enter or Space activates the focused tool through its keyboard action. Letters such as C or H and the up/down arrows no longer directly invoke color, highlight, superscript, or subscript after double-Shift. The legacy `shortcut` field remains validated compatibility metadata; see `custom-wing.md`.

## Footnotes

| `w` | Export | Stored value or behavior |
| --- | --- | --- |
| `fn` | `footnoteWing` | Inline terminal; `a.t` is the footnote text; no children |

A footnote is a childless inline node between characters, for example `{ "w": "fn", "a": { "t": "Source text" }, "ch": [] }`. It occupies exactly one caret unit, like `br`, so the caret never enters it and a number is never partially edited. Numbers are not stored. They follow document tree order, including footnotes inside table cells, lists, quotes, floats, and details.

- Content is one line of plain text. HTML is never interpreted: typing `<b>` keeps those characters as text. Line breaks and tabs become single spaces, control characters are removed, and surrounding whitespace is trimmed. A footnote whose text becomes empty is removed during normalization.
- `insertFootnote({ t })` inserts at the caret, or at the end of a selected range without changing the selected text. Inside link text it inserts after the link. It is rejected inside a code box and on an object wrapper. The new footnote is outside every mark.
- `setFootnote({ t })` and `removeFootnote()` act only when the selection covers exactly one footnote (a one-unit range).
- Toolbar: one button in the `link` group opens a toolbar-width textarea prompt below the whole toolbar. Property row: Edit footnote (the same prompt, prefilled) and Delete footnote. The textarea wraps visually across four lines on desktop and six on mobile, shrinking to fit the visible space above the keyboard; typed or pasted line breaks become spaces. There is no confirmation button: clicking outside applies valid content and closes the prompt. Enter also applies unless an IME composition is active. Escape cancels, and blank input leaves the original footnote unchanged.
- Editing surface: clicking a number selects that footnote and opens the edit prompt from the property row. This requires `mountContextToolbar()`; without it the footnote is still selectable and deletable. Backspace or Delete directly beside a footnote first selects it; the next press deletes it. Applying the prompt is one undo step.
- The footnote list appears in a read-only area placed directly after the surface root, outside `contenteditable`. It exists only while the document has footnotes and disappears with its separator and spacing when the last one is removed. Its numbers are plain labels: clicking them does not select or scroll the body. Preview also disables navigation between footnote markers and list items, while keeping read-only content bubbles.
- Published HTML contains `<sup data-nabi-fn="text">[n]</sup>` in the body and a `<section data-nabi-footnotes>` list at the end of the whole document. Both are readable without JavaScript. `nabi-note/viewer` adds hover, click, and tap bubbles; see `viewer-diff.md`.
- Formatting is fixed. Footnote text in the list and in bubbles uses the base sans stack (`--nabi-font`) at 0.875 of the body font size, the `fs` wing's `sm` step below the default. The body number is superscript at 0.75 of the surrounding text and ignores typeface, bold, and italic. See `styling.md`.
- Sharing one footnote between several positions, nested footnotes, other number styles, and per-section numbering are not supported. The inline-terminal capability is package-internal; custom wings cannot declare one.

## Paragraph attributes

| `w` | Export | Paragraph attribute |
| --- | --- | --- |
| `h` | `headingWing` | `a.h`, integer 1..6 |
| `align` | `alignWing` | `a.a`, `l|c|r` |
| `dc` | `dropCapWing` | `a.dc`, numeric 1 |

H1 displays sequential numbers through CSS; H2 remains unnumbered. Optional `mountOutline()` from `nabi-note/viewer` builds the draggable H1/H2 outline from the body. Numbers are not stored in heading text or JSON.

A heading remains a `p` tree node. Heading, alignment, and drop cap are not separate block node types.

H1-H6 reject alignment in commands and toolbar availability, including headings inside table cells. Applying a heading removes an existing alignment value. JSON/HTML normalization also removes alignment from headings. Mixed selections skip headings while aligning eligible paragraphs and objects. The main demo's NABI NOTE title uses an ordinary paragraph with `fs` value `xl` and `b`, so it remains alignable and does not appear in the heading outline.

Inside a table cell, alignment targets the current inner paragraph or selected image wrapper. A rectangular cell selection aligns every eligible paragraph and object wrapper in the selected cells, skipping objects that declare `noAlign`, such as code. The main toolbar aligns the table's outer wrapper when the whole table object is selected with its wrapper range `0..1` or when a collapsed caret is at either wrapper boundary (`0` or `1`). Boundary carets show the dashed table outline and remain collapsed after alignment. A range crossing between a cell and content outside that table cannot change paragraph attributes.

Headings and drop caps target inner text paragraphs. Header cells (`td.a.th === 1`) do not accept headings; mixed cell selections skip header paragraphs when applying headings. Toolbar visibility, pressed values, and heading property controls use the same paragraph targets as these commands. Mixed values do not report a single active value. Table and float insertion controls remain hidden anywhere inside a cell, including nested lists and objects; block insertion controls also hide when the selection crosses cell boundaries.

## Containers

| `w` | Export | Notes |
| --- | --- | --- |
| `ul` | `bulletListWing` | Parts include `li` |
| `ol` | `orderedListWing` | Parts include `oli` |
| `tl` | `taskListWing` | Parts include `tli`; check state is boolean |
| `quote` | `quoteWing` | Block container |
| `float` | `floatWing` | Editable block container; `side: left|right`, `w: 20|30|40|50` |
| `details` | `detailsWing` | Part `summary`; open state is boolean |
| `code` | `codeWing` | Inline holder, one paragraph, no alignment |
| `table` | `tableWings` | Parts `tr`, `td`; cell grid repair and cell-range attachment |

`tableWings` is an array containing the assembled table wing. Code coloring can be replaced with `{ ...codeWing, attach: makeCodeAttach({ highlight, version }) }`. The token DOM is transient and composition-aware.

Leaving a container with double-Enter uses a 180 ms window by default. Double-Escape and double-Shift retain their 350 ms defaults. An explicit `mountSurface({ doubleEnterMs })` also sets the double-Escape window.

Details never contain H1-H6 headings, whether open or closed. Heading commands and toolbar availability exclude every paragraph below details, including nested containers and table cells. JSON/HTML/paste repair strips heading attributes recursively while preserving text, inline formatting, and other paragraph attributes. Wrapping headings in details removes heading formatting; undo restores the prior headings.

Nested details blocks, including details inside table cells, toggle only the clicked block. Closing a block moves the selection to its wrapper only when either selection endpoint reaches into the body being closed. A selection in its summary or elsewhere remains in place; the open state is stored in `a.o` as numeric `1` when open.

Below the viewport's `--nabi-mobile-breakpoint`, the table button closes the Tools palette and opens a centered size picker over a translucent backdrop. It follows the visual viewport and shows a 5x5 grid with touch-sized cells, including in fullscreen and `layout: 'wrap'`. Selecting a size inserts one table at the current editing selection and closes the picker. Escape or an outside interaction cancels without inserting. Arrow keys stay within the visible grid; Enter or Space confirms. Desktop keeps its existing nonmodal picker.

Dragging across table cells shows a crosshair cursor inside the editor until mouse release, Escape, or window blur. A text selection within a single cell keeps its normal cursor.

Copying a cell range uses its highlighted rectangle, including merged-cell expansion, in every clipboard format. Internal data and HTML preserve the cropped table structure and formatting; plain text contains only the selected cell contents. Cutting the range clears only those cells and supports one-step undo. A text selection inside a single cell keeps ordinary text-copy behavior. See `io-security.md`.

### Table cell editing

Cells contain multiple paragraphs and built-in blocks, including images, lists, quotes, code, details, dividers, and video. Nested tables and floats are not allowed. JSON, HTML, and paste normalization unwrap those prohibited descendants while preserving their content in order. Ordinary cells permit headings; header cells remove heading attributes recursively while preserving text and other formatting.

- Block insertion and conversion stay within the current cell. Commands crossing cell boundaries are rejected.
- Enter creates a paragraph; Shift+Enter inserts a line break. In a list, Shift+Enter keeps the same list item. List and code handlers process indentation before cell navigation; Shift+Tab in code stays there even when no further outdent is possible. Tab/Shift+Tab in ordinary cell content moves between cells, using their actual editable holders; Tab in the final cell adds a row. Deletion does not merge neighboring cells or pull cell contents into an outside paragraph.
- Heading and drop cap target eligible inner paragraphs. Heading is unavailable in header cells.
- Horizontal alignment targets the current inner paragraph or object wrapper. A rectangular cell selection applies alignment to every eligible inner paragraph and object in the selected cells, including images. Code remains unaligned.
- `selectTable()` selects the table's wrapper range 0..1. The table property row provides this action. Table alignment is available for that exact object selection and for a collapsed caret at either table wrapper boundary, never for a caret inside a cell or a selection spanning the table and other blocks.
- Cell merge preserves child blocks in row order. Split retains those blocks in the origin cell and creates empty paragraphs in the other cells.
- Simple uncolored single-paragraph cells can use pipe-table Markdown. Multi-block, structured, or colored cells use HTML fallback to preserve their content.

### Table full width

`toggleTableFullWidth()` toggles the table property row's Full width control. New tables default to off. When enabled, `table.a.full` is numeric `1`; disabling removes the attribute. Other values are discarded during normalization.

- The table and its scroll wrapper have a minimum inline size of 100% of the containing block. Wider content retains horizontal scrolling. Disabling restores content-based sizing.
- The command accepts a caret or range within one table, a whole-table wrapper selection, or a collapsed caret at either wrapper boundary. Selections crossing the table boundary or spanning different tables are rejected. Selection, cell content, sorting, and wrapper alignment are preserved, and the change supports undo/redo.
- Table alignment remains available. While the table fills its container, left, center, and right alignment have no visible effect; the chosen alignment is still stored and applies when full width is disabled.
- JSON stores `a.full: 1`. Editor, stored, and server-rendered HTML use `data-nabi-table-full` on the table. HTML import restores the flag. Full-width tables use HTML fallback in Markdown to preserve it. Published pages need the table wing CSS, as usual.

### Table cell backgrounds

`setCellColor({ bg })` accepts `yellow|green|cyan|pink|purple|orange`; pass `bg: ''` to clear the background. Missing and other values are rejected. The table property row exposes named pale swatches and a Default control. Repeating the current value is a no-op.

- Store the name in `td.a.bg`. Unknown stored values are removed during normalization. Header cells still use `td` with `a.th: 1`.
- A caret or text selection inside one cell targets that whole cell. A selection spanning cells targets the same merged-cell-expanded rectangle as cell copy/merge. The selection remains intact and the operation is one undo step.
- Whole-table object selections, selections crossing a table boundary, and selections spanning different tables cannot change cell colors; the property controls are hidden for those selections.
- A uniform selection shows its common value, including Default. A mixed selection shows no single selected swatch.
- A custom background overrides the header background. Clearing it restores the header background on header cells and the uncolored background on other cells.
- Merge keeps the top-left cell's background. Split copies the merged background to the newly created cells. New rows, columns, and repair-generated cells start without a background; an expanded merged cell retains its color.
- Clearing/cutting content and `clearFormat` preserve cell backgrounds. The dedicated Default control removes the background.
- HTML preserves the name as `data-nabi-cell-color` on `td` or `th`. Arbitrary external background styles are not imported. Colored tables use the HTML fallback for Markdown export, preserving the color metadata.
- Clipboard JSON/HTML, SSR, preview, viewer, and diff preserve the same cell attributes. A background-only change counts as a document change in diff. See `styling.md` for theme tokens.

### Table example: rich cells and separate alignment targets

This self-contained document keeps a title row, multiple paragraphs, and an image inside the table. Mount the context toolbar from `quickstart-npm.md` to expose cell background swatches, merge/split, and Select table controls.

```ts
import { createNabiWith, wings } from 'nabi-note';

const { nabi } = createNabiWith(wings().allBasic(), {
  doc: [{
    w: 'p',
    ch: [{
      w: 'table',
      ch: [
        { w: 'tr', ch: [
          { w: 'td', a: { th: 1 }, ch: [{ w: 'p', ch: ['Plan'] }] },
          { w: 'td', a: { th: 1 }, ch: [{ w: 'p', ch: ['Reference'] }] },
        ] },
        { w: 'tr', ch: [
          { w: 'td', ch: [
            { w: 'p', ch: ['Review the draft.'] },
            { w: 'p', ch: ['Keep each decision in its own paragraph.'] },
          ] },
          { w: 'td', ch: [
            { w: 'p', ch: ['Design reference'] },
            { w: 'p', ch: [{ w: 'img', a: { src: '/images/reference.png', w: 60 }, ch: [] }] },
          ] },
        ] },
      ],
    }],
  }],
});

const first = { path: [0, 0, 1, 0, 0], offset: 0 };
const last = { path: [0, 0, 1, 1, 0], offset: 0 };
nabi.select({ anchor: first, focus: last });
nabi.applyCommand('setCellColor', { bg: 'cyan' });
nabi.applyCommand('setAlign', { value: 'c' });

nabi.applyCommand('selectTable');
nabi.applyCommand('setAlign', { value: 'r' });

const json = nabi.getJson();
const html = nabi.getHtml();
```

The rectangle colors both body cells and centers their eligible inner paragraphs and image. `selectTable` then changes the target so right alignment applies to the whole table. The paths above refer to this exact sample tree; host controls normally operate on the editor's current selection. With a cell selection restored, `setCellColor({ bg: '' })` clears its background. `getHtml()` preserves rich cells and their color metadata; the Markdown exporter uses HTML for this table.

### Float regions

`floatWing` is included in `defaultWings`, `all()`, and `allBasic()`. Use `wings().use('float')` or a direct array containing `floatWing` to opt in explicitly. `FLOAT_WIDTHS` exports the allowed numeric widths.

Stored shape:

```json
[{"w":"p","ch":[{"w":"float","a":{"side":"right","w":40},"ch":[{"w":"p","ch":["Inside the float"]}]}]},{"w":"p","ch":["Following text flows beside the float."]}]
```

- `insertFloat({ side?, w? })` defaults to physical right and maximum width 40 percent. At a collapsed root selection it inserts a blank region after the current paragraph, reusing an empty paragraph. A non-collapsed root selection wraps the touched whole paragraphs. Nested insertion and wrapping an existing float are rejected.
- `setFloatSide({ side })` accepts `left|right`. `setFloatWidth({ w })` accepts 20, 30, 40, or 50 (numbers or numeric strings). Invalid command values are rejected. Repeating the current value does not change the document.
- `unwrapFloat()` replaces the wrapper with its child blocks, preserving content. Each command is undoable.
- Normalization repairs missing/invalid stored attributes to right/40, provides an empty paragraph when necessary, and unwraps nested float descendants without losing their content.
- Internal image/video/table/divider insertion, upload commits, and list/quote/details/code conversion operate within the float using `Wing.scopedCommands`. A selection crossing that scope boundary is rejected for these commands. Pasting text, rich fragments, or a single table/image into an inner paragraph also stays inside the float and supports undo. Existing operations outside floats retain their behavior.
- The context toolbar shows left/right controls, a four-step maximum-width range, and a float-with-X unwrap icon directly beside the width readout. The icon retains the localized unwrap label for tooltips and accessibility; its theme key is `context-float-unwrap`. A range gesture commits on change, not every intermediate input event.
- HTML uses `div[data-nabi-float="left|right"][data-nabi-float-width]` inside the standard object paragraph wrapper. The importer recognizes only this marker, not arbitrary external float styles. Markdown uses the HTML fallback.
- Load the same registry and wing CSS for editor, stored rendering, SSR, preview, and diff. Older/missing-wing importers can unwrap the unknown region and discard its attributes; update readers before storing the new word.

Maximum width is relative to the containing document's content width, not the viewport. Short contents may be narrower, with a minimum usable width of 8rem capped by the chosen maximum. The wrapper, including inner padding, stays within that cap; its text-side gap is additional. Float layout applies to root objects, including the root objects inside diff rows. An imported float inside a different container remains a content block without root float layout.

Editor regions have a dotted outline only in `.nabi-editing`. Published HTML and preview preserve the content and layout without that outline. Following paragraphs flow beside the region and return to full width below it. A new root float, heading, divider, table, or code block clears earlier floats. The document root contains the final float's height.

Below a document container width of 36rem, editor and reader regions stack at full width while keeping stored attributes. Print also stacks regions and removes editor outlines. Diff does not use the reader's narrow-container override: it preserves left/right and relative maximum width within each pane, contains each float in its comparison row, and starts the next block below it. Diff continues to compare top-level blocks; side/width-only changes count as changes without requiring character highlights.

### Float example: a note beside an article

```ts
import { createNabiWith, wings } from 'nabi-note';

const { nabi } = createNabiWith(wings().allBasic(), {
  doc: [
    { w: 'p', ch: ['Key idea: keep the supporting note close to the article.'] },
    { w: 'p', ch: ['The article continues beside the note and returns to full width below it.'] },
  ],
});

nabi.select({
  anchor: { path: [0], offset: 0 },
  focus: { path: [0], offset: 8 },
});
nabi.applyCommand('insertFloat', { side: 'right', w: 40 });
nabi.applyCommand('setFloatSide', { side: 'left' });
nabi.applyCommand('setFloatWidth', { w: 30 });
nabi.applyCommand('insertImage', { src: '/images/reference.png', w: 100 });

const html = nabi.getHtml();
```

The partial text selection wraps the whole touched paragraph. The caret moves into the new region, so the image is inserted there and its width is relative to that region. Render `html` inside `.nabi-content` with the same wing CSS. While the selection remains inside the region, `unwrapFloat` returns its text and image to ordinary document blocks; undo restores the region. A table can also be inserted there with `insertTable({ rows: 2, cols: 2 })` when the current selection is an inner paragraph, but a table cell cannot contain a float or another table.

## Void objects

| `w` | Export | Notes |
| --- | --- | --- |
| `hr` | `dividerWing` | Divider |
| `img` | `imageWing` | `src`, optional `alt`, width 30..100; factory can allow local URLs |
| `youtube` | `youtubeWing` | Stores an 11-character video ID and width 50..100 |

New images default to width 60 and centered wrapper alignment. New YouTube objects default to width 70 and centered wrapper alignment. Object alignment belongs to the wrapper paragraph, not the object.

The image button's default URL prompt can be replaced with host UI through `mountToolbar({ panels: { img: { mode: 'inline', render: renderer } } })`. This is a toolbar mount option, not an image-wing option. Choose `modal` for a window on a full-page translucent backdrop, or `inline` for an anchored desktop panel that fills the screen on mobile. Both provide an empty root for host UI. Function-only entries keep their previous behavior. Use `close()` for a custom close button and the renderer context's `insertImage(url)` to insert the selected URL at the opening selection. URL policy remains unchanged, and the hook does not upload files. See `quickstart-npm.md` and `api-reference.md`.

## Tools

| `w` | Export | Host wiring |
| --- | --- | --- |
| `upload` | `uploadWing` | `mountUpload` and usually `mountUploadView`; requires `img` or `a` |
| `save` | `saveFileWing` | `mountFile`; toolbar save panel or `onHost` |
| `open` | `openFileWing` | `mountFile` |
| `localHistory` | `localHistoryWing` | `mountLocalHistory`; built-in panel can be opened by host |
| `diff` | `diffWing` | `mountDiffWing` and toolbar `onHost` |
| `clearFormat` | `clearFormatWing` | None |

`clearFormat` removes built-in marks and the `h`, `a`, and `dc` paragraph attributes. It preserves object-wrapper alignment, attachment link shells, and table cell backgrounds. Pressing Escape twice within the surface double-key window invokes it.

## Picker behavior

```ts
const selected = wings()
  .allBasic()
  .use('upload', { allowLocalUrls: true })
  .drop('clearFormat')
  .build();
```

- `all()`: all official wings.
- `allBasic()`: wings that run without host wiring. It excludes `upload`, `save`, `open`, and `diff`.
- `use(name, options?)`: add or replace one official wing.
- `use(wing)`: add an official factory result or a custom wing.
- `drop(nameOrWing)`: remove without cascading.
- `build()`: return the ordered array. `createNabiWith()` also accepts the builder directly.
- Calling `all()` after a customized `use()` fills missing official wings without overwriting the customization.
- Official order is stable regardless of call order. Custom wings follow official wings in insertion order.
- `use('upload')` auto-adds the first declared official dependency, `img`, only when neither `img` nor `a` is present.
- `drop()` throws if a remaining wing would lose every required dependency.
- Name typos, option typos, wrong option shapes, unknown values, and invalid custom names throw at the builder/registry boundary.

Builder options exist only for `tf`, `fs`, `tc`, `hl` with `{ values }`, and `img`, `upload` with `{ allowLocalUrls }`.

For a small tree-shakable npm build, use a direct array such as `[boldWing, italicWing]`; importing the name-based builder pulls the catalog.

## Input rules

The default catalog recognizes:

- `#` through `######` plus space for headings;
- `-` plus space for bullet list;
- `1.` style plus space for ordered list;
- `[ ]` or `[x]` plus space for task list;
- `>` plus space for quote;
- triple backticks plus space or Enter for code;
- three or more hyphens plus Enter for divider;
- an `http://` or `https://` word plus space or Enter for link.

Only rules from registered wings exist.

## Command names

The registry exposes core commands plus registered wing commands. The default wing commands include:

`setTypeface`, `setFontSize`, `setTextColor`, `setHighlight`, `setLink`, `renameLink`, `insertFootnote`, `setFootnote`, `removeFootnote`, `setHeading`, `setAlign`, `toggleDropCap`, list toggles, `toggleQuote`, `toggleDetails`, `setDetailsOpen`, `toggleCode`, `setCodeLanguage`, `insertDivider`, table edit commands, `insertImage`, `setImageWidth`, `insertYoutube`, `setYoutubeWidth`, `commitUpload`, `saveFile`, `openFile`, `restoreHistory`, and `clearFormat`.

Float commands are `insertFloat`, `unwrapFloat`, `setFloatSide`, and `setFloatWidth`.

Cell background and table-selection commands are `setCellColor` and `selectTable`. Invoke wing commands through `nabi.applyCommand(name, args)`; names followed by argument objects in this document are shorthand for that call, not instance methods on `nabi`.

Use wing button/context declarations rather than hard-coding command arguments when building a generic UI.
