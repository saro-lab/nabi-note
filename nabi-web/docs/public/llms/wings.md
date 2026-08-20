# Wings

A **wing** is a plain object added to the array passed to `createNabiWith`. There is no
inheritance, no separate registration step - being in that array is the registration. The core's
only built-in markup is the paragraph slot and `<br>`; every other feature, including the ones
listed below, is implemented the same way a custom wing would be (see `llms/custom-wing.md`).

`defaultWings` (equivalently, `wings().all()`) is the full catalog of 29 official wings below.
Most are ready-made constants; a few take an options factory. Order in the array is scan order -
when incoming HTML could belong to more than one wing, the first one in the array to claim it
wins.

## Marks (`place: 'mark'`) - apply to a span of text

| `w` | Export | Note |
|---|---|---|
| `b` | `boldWing` | |
| `i` | `italicWing` | |
| `u` | `underlineWing` | |
| `s` | `strikeWing` | |
| `sup` | `superscriptWing` | |
| `sub` | `subscriptWing` | |
| `a` | `linkWing` | Carries an `href`; an existing link raises no context row - change the address by deleting and remaking it |
| `hl` | `highlightWing` | Value mark, 6 colors. Factory: `makeHighlightWing({ values })` |
| `tc` | `textColorWing` | Value mark, 5 colors. Factory: `makeTextColorWing({ values })` |
| `tf` | `typefaceWing` | Value mark: sans/serif/mono/cursive. Factory: `makeTypefaceWing({ values, base? })` |
| `fs` | `fontSizeWing` | Value mark, 5 sizes (xs/sm/default/lg/xl). Factory: `makeFontSizeWing({ values })` |

## Paragraph attributes (`place: 'attr'`) - change how a paragraph reads, not its content

| `w` | Export | Note |
|---|---|---|
| `h` | `headingWing` | Levels 1-6 live as `a.h` on a paragraph - there is no separate `heading1Wing`..`heading6Wing` |
| `align` | `alignWing` | Left / center / right, one wing with three toolbar buttons |
| `dc` | `dropCapWing` | Drop cap; the value is the string `"1"`, not a line count - actual lines covered follow the paragraph's line-height |

## Containers (`place: 'container'`) - hold block content or structured parts

| `w` | Export | Note |
|---|---|---|
| `ul` | `bulletListWing` | |
| `ol` | `orderedListWing` | |
| `tl` | `taskListWing` | Checklist; check state is `data-nabi-checked` |
| `quote` | `quoteWing` | Only character marks apply inside a quote - no nested image/code/table buttons |
| `details` | `detailsWing` | `parts` carries the summary line |
| `code` | `codeWing` | Single text block (`singleParagraph`). Coloring is opt-in: `{ ...codeWing, attach: makeCodeAttach({ highlight }) }` - the built-in tokenizer needs no dependency |
| `table` | `tableWings` (plural - the wing plus its row/cell parts) | Cells are `singleParagraph`; `parts` carries rows and cells; drag-resize and cell navigation are wired through `attach` |

## Void objects (`place: 'void'`) - no editable content of their own

| `w` | Export | Note |
|---|---|---|
| `hr` | `dividerWing` | |
| `img` | `imageWing` | Constant, or `makeImageWing({ allowLocalUrls })` |
| `youtube` | `youtubeWing` | |

## Tools (`place: 'tool'`) - leave no trace in the document

| `w` | Export | Note |
|---|---|---|
| `upload` | `uploadWing` | Needs `mountUpload`/`mountUploadView` wired in; requires an `img` or `a` wing also registered (`requiresAnyOf`), since uploads land as one of those. Constant, or `makeUploadWing({ allowLocalUrls })` |
| `save` | `saveFileWing` | Needs `mountFile({ nabi, store })`; writes/reads a `.nabi` file |
| `open` | `openFileWing` | Same `mountFile` |
| `localHistory` | `localHistoryWing` | Needs `mountLocalHistory({ nabi, storage })`; periodic snapshot in the browser. Mount it even when `storage` is `null` (e.g. blocked on `file://`) so the button can explain why it is disabled |
| `clearFormat` | `clearFormatWing` | The eraser - strips character-level marks only, blocks are untouched |

## Getting the list at runtime

```ts
import { wingNames } from 'nabi-note'
wingNames()  // readonly string[] of every official `w` id, in catalog order
```

Under a CDN script tag: `N.wingNames()`, or the builder throws a "did you mean...?" suggestion on
a typo (`N.wings().use('bod')`).

## See also

- `llms/custom-wing.md` - the contract for building a wing that is not in this list
- `llms/api-reference.md` - `boxObject`/`listFamily`/`simpleMark`/`valueMark` helper signatures
- `llms/quickstart-cdn.md` - the `wings().all().drop().use()` picker builder
