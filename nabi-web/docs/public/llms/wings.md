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
| `details` | `detailsWing` | Part `summary`; open state is boolean |
| `code` | `codeWing` | Inline holder, one paragraph, no alignment |
| `table` | `tableWings` | Parts `tr`, `td`; cell grid repair and cell-range attachment |

`tableWings` is an array containing the assembled table wing. Code coloring can be replaced with `{ ...codeWing, attach: makeCodeAttach({ highlight, version }) }`. The token DOM is transient and composition-aware.

## Void objects

| `w` | Export | Notes |
| --- | --- | --- |
| `hr` | `dividerWing` | Divider |
| `img` | `imageWing` | `src`, optional `alt`, width 30..100; factory can allow local URLs |
| `youtube` | `youtubeWing` | Stores an 11-character video ID and width 50..100 |

New images default to width 60 and centered wrapper alignment. New YouTube objects default to width 70 and centered wrapper alignment. Object alignment belongs to the wrapper paragraph, not the object.

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

- `all()`: all 30.
- `allBasic()`: 26. It excludes `upload`, `save`, `open`, and `diff`.
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

Use wing button/context declarations rather than hard-coding command arguments when building a generic UI.
