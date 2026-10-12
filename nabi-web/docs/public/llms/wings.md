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
| `hl` | `highlightWing` | `a.c`: six named highlight colors |
| `a` | `linkWing` | Strict `href`; attachment links also carry `file` |

Value factories are `makeTypefaceWing`, `makeFontSizeWing`, `makeTextColorWing`, and `makeHighlightWing`, each with `{ values }`.

With a collapsed caret, font size and typeface target the paragraph's current text. Color/highlight target the current mark span or arm future text. A selected range always remains the target.
The main toolbar color and highlight buttons remove an existing effect regardless of its current value; otherwise, they keep their existing default-value action. Context swatches still replace a different value and remove the same value.
Like other mark buttons, a pointer click with a collapsed caret and no current mark reports that no text is selected instead of arming future text.
With `mountHints()`, tapping Shift twice opens the compact Tools palette. Tab changes groups and arrow keys navigate icons; Enter or Space activates the focused tool through its keyboard action. Letters such as C or H and the up/down arrows no longer directly invoke color, highlight, superscript, or subscript after double-Shift. The legacy `shortcut` field remains validated compatibility metadata; see `custom-wing.md`.

## Paragraph attributes

| `w` | Export | Paragraph attribute |
| --- | --- | --- |
| `h` | `headingWing` | `a.h`, integer 1..6 |
| `align` | `alignWing` | `a.a`, `l|c|r` |
| `dc` | `dropCapWing` | `a.dc`, numeric 1 |

A heading remains a `p` tree node. Heading, alignment, and drop cap are not separate block node types.

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

Below the viewport's `--nabi-mobile-breakpoint`, the table button closes the Tools palette and opens a centered size picker over a translucent backdrop. It follows the visual viewport and shows a 5x5 grid with touch-sized cells, including in fullscreen and `layout: 'wrap'`. Selecting a size inserts one table at the current editing selection and closes the picker. Escape or an outside interaction cancels without inserting. Arrow keys stay within the visible grid; Enter or Space confirms. Desktop keeps its existing nonmodal picker.

Copying a cell range uses its highlighted rectangle, including merged-cell expansion, in every clipboard format. Internal data and HTML preserve the cropped table structure and formatting; plain text contains only the selected cell contents. Cutting the range clears only those cells and supports one-step undo. A text selection inside a single cell keeps ordinary text-copy behavior. See `io-security.md`.

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
- Internal image/video/table/divider insertion, upload commits, and list/quote/details/code conversion operate within the float using `Wing.scopedCommands`. A selection crossing that scope boundary is rejected for these commands. Existing operations outside floats retain their behavior.
- The context toolbar shows left/right controls, a four-step maximum-width range, and a float-with-X unwrap icon directly beside the width readout. The icon retains the localized unwrap label for tooltips and accessibility; its theme key is `context-float-unwrap`. A range gesture commits on change, not every intermediate input event.
- HTML uses `div[data-nabi-float="left|right"][data-nabi-float-width]` inside the standard object paragraph wrapper. The importer recognizes only this marker, not arbitrary external float styles. Markdown uses the HTML fallback.
- Load the same registry and wing CSS for editor, stored rendering, SSR, preview, and diff. Older/missing-wing importers can unwrap the unknown region and discard its attributes; update readers before storing the new word.

Maximum width is relative to the containing document's content width, not the viewport. Short contents may be narrower, with a minimum usable width of 8rem capped by the chosen maximum. The wrapper, including inner padding, stays within that cap; its text-side gap is additional. Float layout applies to root objects, including the root objects inside diff rows. An imported float inside a different container remains a content block without root float layout.

Editor regions have a dotted outline only in `.nabi-editing`. Published HTML and preview preserve the content and layout without that outline. Following paragraphs flow beside the region and return to full width below it. A new root float, heading, divider, table, or code block clears earlier floats. The document root contains the final float's height.

Below a document container width of 36rem, editor and reader regions stack at full width while keeping stored attributes. Print also stacks regions and removes editor outlines. Diff does not use the reader's narrow-container override: it preserves left/right and relative maximum width within each pane, contains each float in its comparison row, and starts the next block below it. Diff continues to compare top-level blocks; side/width-only changes count as changes without requiring character highlights.

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

`clearFormat` removes all 11 built-in marks and the `h`, `a`, and `dc` paragraph attributes. It preserves object-wrapper alignment and attachment link shells. Pressing Escape twice within the surface double-key window invokes it.

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

`setTypeface`, `setFontSize`, `setTextColor`, `setHighlight`, `setLink`, `renameLink`, `setHeading`, `setAlign`, `toggleDropCap`, list toggles, `toggleQuote`, `toggleDetails`, `setDetailsOpen`, `toggleCode`, `setCodeLanguage`, `insertDivider`, table edit commands, `insertImage`, `setImageWidth`, `insertYoutube`, `setYoutubeWidth`, `commitUpload`, `saveFile`, `openFile`, `restoreHistory`, and `clearFormat`.

Float commands are `insertFloat`, `unwrapFloat`, `setFloatSide`, and `setFloatWidth`.

Use wing button/context declarations rather than hard-coding command arguments when building a generic UI.
