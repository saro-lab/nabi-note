# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).
Dates use Korea Standard Time (KST).

## [1.5.0] - 2026-10-20

### Added

- Added a draggable outline generated from body H1/H2 headings, with body H1 numbering, state callbacks including empty outlines, pointer scrubbing, edge scrolling, keyboard navigation, and CSS placement. Attach it with `mountOutline()` or the `outline` option of `attachViewer()` from `nabi-note/viewer`; the home demo includes a floating trigger. H1-H6 headings are disallowed inside details during editing, paste, and loading while preserving text and other formatting.
- Added a Full width toggle to table properties. It gives the table a minimum width of 100% while retaining horizontal scrolling for wider content. Table alignment remains available, and undo/redo, JSON and HTML storage, and Markdown HTML fallback preserve the setting.
- Added previous-to-current click merge to the standalone comparison view. Callbacks receive paragraph/line-group proposals, and hosts can update the view after checking its revision. Pending callbacks prevent duplicate clicks and stale proposal acceptance; pure functions expose change groups and applied results. Standalone comparisons and the web comparison demo hide apply controls by default, while editor comparisons through `mountDiffWing()` enable them by default. Set `merge: false` to disable them; applied changes are undoable and preserve the baseline.
- Added independent three-way merging through `nabi-note/merge` for the editing-start base, local edit, and newly saved incoming version. Non-overlapping changes merge automatically first. Remaining conflicts can use the base or incoming version, or accept the editable middle result. Normal editing features remain available, and undo/redo restores document content and resolution status together. Confirmation callbacks run only when no unresolved conflicts remain.
- Added comparison and merge guides in every documentation language with working API examples for click merge, complete automatic merging, and partial automatic merging with manual conflict resolution. Demo messages and sample documents follow the page language. Updated the public AI documentation with the new APIs and persistence/version-check contracts.
- Added pale table cell backgrounds with light and dark theme values. Apply a color to one cell or a selected rectangle, restore the default background, and undo the change. Colors survive merge, split, clipboard, JSON, and HTML; colored tables use HTML in Markdown exports to preserve their backgrounds.
- Table cells now support multiple paragraphs and built-in blocks such as images, lists, quotes, code, details, and video. Nested tables and floats are unwrapped while preserving content; header cells remove heading formatting only. Cell alignment targets inner paragraphs and images, including selected cell rectangles. Align the table itself from the main toolbar after using the new Select table control or placing the caret at either boundary of its wrapper paragraph. Boundary carets also show the dashed table outline; copy and cut include the entire paragraph and table in that state.
- Added float regions (`floatWing`) whose text, images, and tables can be edited directly in the same editor. Regions support left/right placement and maximum widths of 20, 30, 40, or 50 percent, defaulting to right at 40 percent.
- Added left/right controls, a maximum-width slider, and a float-with-X unwrap icon to the float context toolbar. The unwrap icon sits directly beside the width readout. Selected paragraphs can be wrapped in a region or unwrapped while preserving their contents in the document. Changes support undo and redo.
- Added dotted region outlines that appear only while editing. In reader and preview views, following paragraphs flow beside the region. Diff preserves each region's left/right placement and maximum width while starting the next block below it. Narrow document containers and print use a single column.
- Added `Wing.scopedCommands` to run selected block-container commands against their child document. Block insertion, uploads, and conversions stay inside floats. JSON and HTML save/load preserve region contents, placement, and width.
- Added `setCellColor({ bg })` and `--nabi-cell-*` CSS variables. Cell backgrounds support `yellow`, `green`, `cyan`, `pink`, `purple`, and `orange`; an empty string restores the default background. Mixed cell colors show no single selected swatch.
- Added unit and browser regression coverage for table block editing, colors, paragraph formatting, cell boundaries, copy/cut, paste, uploads, storage formats, and toolbar layout.
- Added the footnote wing (`footnoteWing`, `fn`). Numbers such as `[1]` appear at the insertion point, and the numbers and content appear again at the end of the document. Numbers are not stored; they follow document order. Footnote content accepts one line of plain text only, and HTML tags stay literal text. Content is shown in a fixed sans-serif face one step smaller than the body text.
- The editing view shows the footnote list read-only directly below the body, outside the editable area, and shows no area when there are no footnotes. Clicking a number in the body opens the property-row input prompt prefilled with the current content. Backspace or Delete beside a footnote first selects it, and the next press deletes it.
- Added footnote bubbles to `nabi-note/viewer`. In preview and published views, hovering, clicking, or tapping a number opens its content, and clicking a number in the list moves to its position in the body. There is no close button; disable the behavior with `ViewerOptions.footnotes: false`.
- Markdown save and open support GFM footnote syntax (`[^1]`, `[^1]: text`). Reloading HTML restores each footnote once and never stores the generated list as body content. Comparison and merge compare footnote content, so blocks whose numbers only shifted are not reported as changed.

### Changed

- Synchronized every language's main demo descriptions, formatting, and example structure with the Korean source, and enabled full width for the cell background color sample table. Updated heading alignment instructions and comparison guides to match current behavior.
- Headings now reject alignment and discard existing alignment when loaded or applied. The main demo's NABI NOTE title is an ordinary paragraph with extra-large text and bold formatting.
- Footnote prompts now align below the whole toolbar in a toolbar-width textarea with four visible lines on desktop and six on mobile, shrinking to fit the visible space above the keyboard, converting actual line breaks to spaces. Clicking outside applies the content and closes the prompt without a confirmation button; Escape cancels. A numbered button at the start of each footnote bubble jumps to the matching endnote.
- Outline edge arrows move one item from the current selection on press and repeat one step at a time only while held. Hovering does nothing, and navigation does not skip intermediate items at the list edges or document bottom. While the outline is open, body scrolling keeps the current heading visible inside the outline.
- The merge view now highlights changed lines and text, with gutter arrows that apply only the corresponding base or incoming content. The middle result stays editable, and individual line applications support undo/redo. Automatically merged changes can also be revised individually.
- Document comparison now shows only changes and surrounding context by default. With no changes, folding is disabled and both complete documents remain visible.
- Reduced the default double-Enter window for leaving a container from 350 ms to 180 ms. Esc and Shift double-tap defaults remain unchanged.
- Grouped the default toolbar into headings, text formatting, alignment, lists, insertion, and document tools, with vertical separators between groups. Custom group order and quick-tool settings remain supported, as do the mobile single-row toolbar and complete Tools palette.
- In ordinary cell paragraphs, Enter creates a paragraph and Shift+Enter inserts a line break. Tab keeps list/code indentation and moves between cells in ordinary paragraphs. Paste, block insertion, and uploads stay within the original cell scope; asynchronous insertion is cancelled with feedback if the document changes first. Multi-block tables use HTML in Markdown exports.
- Block-holding structural parts can declare `scopedCommands`; `isolating` protects editing boundaries while allowing multiple paragraphs.
- Cell merge preserves child blocks in row order and uses the top-left background. Split keeps content in the origin cell and applies its background to the new cells. Content deletion, cut, and format clearing preserve cell backgrounds. Selected cell rectangles now use inset outlines instead of a background overlay.
- Unified heading, drop-cap, and alignment commands with toolbar visibility and pressed states around the same inner paragraph targets. Header cells skip headings, and mixed selections show no single active value. Nested table and float insertion controls are hidden inside cells; cross-cell selections reject block insertion and paste.
- `KeyIntent.shift` distinguishes Shift+Enter, and unhandled keys inside an isolated editing scope pass to ancestor wings up to that scope. Shift+Enter inserts a line break without splitting a list item, and Shift+Tab in code does not move to another cell when no further outdent is possible.
- Updated the public AI documentation for table cell editing, backgrounds, storage formats, command scopes, uploads and paste, toolbar groups, and the double-Enter default. Refreshed SSR toolbars in every web documentation locale, the web demo's `nabi-note-1.5.0.tgz`, and its npm lockfile.
- Removed the unnecessary pnpm lockfile and workspace configuration so web deployments no longer misidentify the npm project as a pnpm project.
- Updated the public AI documentation with the footnote wing's storage format, commands, editing behavior, formatting, viewer, and Markdown contracts. Refreshed the SSR toolbars and wing chips for every web documentation locale, the web demo `nabi-note-1.5.0.tgz`, and the npm lockfile.

### Fixed

- Fixed UI text, including tooltips and panel inputs, and default table text to use sans-serif independently of the body typeface. Explicit user-selected typefaces inside cells remain supported.
- Removed unnecessary spacing between the instruction row and the top controls in the web comparison example.
- Fixed editor fullscreen being constrained by ancestor sizing, transforms, and containment. Fullscreen fills the browser viewport and restores the original position and styles on exit. The merge view also expands all three document panes to the available height.
- Fixed float content remaining visible inside folded comparison regions.
- Fixed pasting a single table or image inside a float placing it outside the region. Empty inner paragraphs are replaced by the pasted block while preserving table alignment, cell formatting, and outside paragraphs.
- Fixed Backspace, Delete, and range deletion crossing cell boundaries to join contents or remove neighboring tables. Deletion keeps the caret inside its cell, and navigation through multi-block cells uses their first and last actual editable positions.
- Fixed table deletion inside a float to remove only that table rather than its outer region. Native copy/cut shortcuts work at table wrapper boundaries, and plain-text copies of multi-block cells preserve block line breaks and image/video URLs.
- Fixed image panels, URL prompts, file pickers, and uploads to preserve their starting selection. Selection-only moves still insert at the original target; document edits or replacement cancel insertion with localized feedback, even after undo restores equal content. Upload placeholders stay inside the original cell, and completion callbacks report actual insertion results.
- Fixed toggling nested details blocks, including those inside cells, to update only the intended block. Closing moves the selection outside only when it reaches into the closing body; selections elsewhere are preserved.

## [1.3.2] - 2026-10-10

### Changed

- On mobile, the table wing opens its size picker in the center of the screen over a translucent backdrop. Selecting a size inserts the table and closes the picker; tapping outside or pressing Escape cancels it.

### Fixed

- Fixed the mobile table size picker remaining open after a size was selected.
- Fixed partial table copies including unselected cells and omitting the final selected cell. Internal data, HTML, and plain text now follow the highlighted rectangle. Internal data and HTML preserve empty cells, merges, header cells, and formatting; plain text separates the selected cell contents with tabs and newlines.
- Fixed cutting a table cell range to clear only the selected cell contents while preserving the table structure and other cells. One undo step restores the contents, and failed clipboard writes leave the source intact.

## [1.3.1] - 2026-10-07

### Added

- Added `{ mode, render }` configuration and the `ToolbarPanelOptions` type to `mountToolbar()` panels. `modal` opens a window over a full-page translucent backdrop; `inline` opens near the tool button on desktop and fills the screen on mobile. Both modes provide an empty content root for callback-rendered HTML or framework UI. Existing function renderers retain their behavior. Updated the public AI documentation and the image guide in every web documentation locale with both modes and callback examples.
- Added `insertImage(src, by?)` to the panel callback context. Connect custom close buttons to `close()` and image selection to `insertImage()`. Insertion closes the panel and restores its opening selection; closed panels and changed documents reject insertion. Modal focus containment, inert backgrounds, mobile viewport sizing, and teardown are handled by the package.

## [1.3.0] - 2026-10-04

### Added

- Added the `panels` option to `mountToolbar()` and the `ToolbarPanelContext` and `ToolbarPanelRenderer` types. Map toolbar slot names, such as `panels.img`, to replace default prompts with your service's image picker or another custom UI. The package manages panel placement, closing, and teardown; the host receives a dedicated `root`, an abort signal, cleanup registration, and a one-shot `run()` that restores the opening selection before applying a command. If the document changes while the panel is open, the old selection is not reused. Added usage guidance to the public API documentation and the image guide in every web documentation locale.

### Changed

- Restored the mobile toolbar to a sticky position at the top of the editor. Selection/menu panels open from the toolbar, while text-input prompts continue to replace the toolbar row.
- Removed the Object properties entry button, back-to-tools button, and their localized labels. On desktop and mobile, available properties appear automatically below the main toolbar. Property controls wrap to fit the screen, take up layout space without covering the document, and move with the toolbar. Mobile quick actions and preview/fullscreen buttons remain in the main toolbar.
- The default toolbar now shows all commands on desktop outside fullscreen too, while mobile retains the compact row. The switch uses viewport width and `--nabi-mobile-breakpoint`, rather than editor width. Fullscreen shows all tools above object properties at every viewport width. Both areas stay pinned together and wrap as needed. Exiting fullscreen keeps the expanded desktop layout and restores the compact mobile row.
- Unified desktop and mobile toolbar, palette, and property controls at smaller sizes. At the default root font size, regular buttons are 32px, icons are 14px, and the mobile compact toolbar is 36px high. Connected property swatches, inputs, and sliders are 28px; mobile input text stays at 16px.
- Unified selected toolbar, palette, and property controls and selected choice/save rows with a subtle accent-tinted background instead of an underline or blue border. The background mixes 12% accent with the light or dark theme background. Color swatches preserve their 20px painted area and show selection on the surrounding 28px button. Keyboard focus on buttons and sliders uses a distinct 20% background; focused inputs use the 12% background and retain their neutral border.
- Updated package and web-documentation development and build dependencies: ESLint, TypeScript ESLint, jsdom, Vite, Shiki, Node.js types, and Wrangler. Moved the documentation site's Vue from the 3.6 prerelease to stable 3.5.43. Kept TypeScript and the VitePress line that supports the current Vite 8 configuration.

- Separated image, YouTube, link, and object-property prompts such as code language from full-page modals. They now open as plain tool panels like the table picker, without background blur, a page scrim, or blocking the rest of the editor. Removed the full-page shadow from narrow tool panels as well. Preview, lightbox, save, and other full-page dialogs retain their separate modal layer.

### Fixed

- Confined each sticky toolbar to its own editor when multiple editors share a page. Scrolling past an editor moves its toolbar out of view with it.
- Fixed mobile Tools panels staying hidden when tapped with the keyboard open. Panels open immediately in the available space around the toolbar and property row, and focus moves into the panel.
- Fixed mobile tool panels closing on the first tap after scrolling the toolbar into its sticky position. Moving focus from the editor to a panel preserves toolbar placement until the keyboard actually closes.
- Fixed page jumps when the mobile keyboard opens after tapping a long document and an already visible caret was pulled toward the toolbar. Caret correction now records the initial viewport, respects fixed-header spacing, and does not restart from viewport position changes alone after a user scroll.
- Fixed opening a tool panel or navigating its tools with arrow keys scrolling the outer page. Necessary scrolling stays within the tool area.
- Fixed changing a property input or slider returning focus to the document, which could reopen the mobile keyboard or move the page. An already focused property control retains focus when its controls refresh.
- Fixed object property buttons unnecessarily scrolling the page to reveal an already visible caret when the mobile keyboard had shifted the visible viewport. Caret correction now uses the viewport's actual position.
- iOS tool buttons now activate when a short single-touch tap ends, accommodating Safari text-selection menus that consume the first click. The following compatibility click is canceled to prevent duplicate activation. The added touchend handler does not turn scrolling, multitouch, or long presses into command taps, and the document retains its native selection menu. Toolbar layout measurements also avoid unnecessary button moves so a click is not lost during a press.

## [1.2.0] - 2026-10-04

### Added

- Added `layout` and `quick` options to `mountToolbar()` and `renderToolbarHtml()`. Quick actions use toolbar slot names and default to bold, italic, text color, and text size.
- Added a full Tools palette that shows registered tools available for the current selection together as icons in their original wing groups. The palette contains registered wing buttons only.

### Changed

- Changed the default toolbar to a single row. Quick actions that do not fit remain in the full Tools palette, while context controls stay in the basic row. A highlighted Object properties down-chevron appears immediately after Tools only when those controls do not all fit. The existing `toolsContext` dictionary key is retained, with the display name updated to the same meaning in every supported locale. Connected preview/fullscreen buttons also remain visible there; the full palette does not duplicate these controls or add an Object properties entry. Use `layout: 'wrap'` for the previous wrapping layout.
- Removed the title/close header and group borders from all palettes. The full wing palette has no padding or icon gaps; the Object properties panel has 8px inner padding, 4px control gaps, and 8px between groups. Only the context panel removes its outer border and shadow and blends 95% background with 5% text color to distinguish it in both light and dark themes. Desktop palettes fill the editor toolbar width with 32px buttons and 14px icons at the default root font size. Desktop main-toolbar icons also shrink to 14px while keeping 44px buttons and a 48px row. Mobile icons and regular 44px buttons retain their size. Only text-color and highlight swatch buttons shrink to 28px on desktop and 32px on mobile, in both the basic row and Object properties; their painted area and selected border remain 20px. Text inputs and range controls there are vertically centered at 28px on desktop and 32px on mobile; mobile inline prompts also use 32px inputs. Labels and readouts retain their natural height. Input tools keep their fields and submit button; Escape or an outside click closes them.
- Mobile editing docks the toolbar above the keyboard and uses the keyboard area for selection/menu panels. Panel height fits its content, capped by the measured keyboard height or a bounded fallback. Text-input prompts replace the toolbar row. Narrow desktop editors retain a single row at the top.
- Double-Shift opens the full Tools palette instead of letter badges. Tab/Shift+Tab change groups, arrow keys move between icons, Enter/Space activate, and Escape closes. Navigation wraps at the ends; vertical movement follows rendered rows and the nearest column. Registered keyboard accelerators remain available.
- Every compact toolbar and palette item, including color swatches, now has a tooltip floating under `body` to avoid clipping. Tooltips show actual Ctrl/Cmd accelerators and double-key labels such as Esc Esc. Tools shows Shift Shift; the former letter hints remain removed. Color swatches do not enlarge on hover: unselected hover shows only a `--nabi-muted` border, while the selected 20px painted area keeps its accent border.
- Added `1.5rem` top and bottom margins (24px at the default root font size) and subtle shadows to the fullscreen edit surface only when workspace background is visible beside the paper. A paper that fills the available width has zero margins and no shadow. This uses actual paper and container widths rather than mobile mode, so even a small viewport retains margins when the paper is narrower. Document width is preserved; short documents fill the remaining height after margins, and scrolling to the end of long documents reveals any bottom margin. Preview layout is unchanged.

## [1.1.2] - 2026-10-03

### Added

- Fullscreen editing preserves the previous content width and separates the outer background from the paper-like content background. Customize each color with `--nabi-fullscreen-bg` and `--nabi-fullscreen-content-bg`.

### Fixed

- Fixed leading paragraph spaces being collapsed in saved or loaded HTML and in the editor, including headings, nested formatting, paragraphs inside blockquotes, and spaces before drop caps.
- Fixed spaces disappearing during HTML paste when copying a selection starting within a space run or containing only spaces. Copy/cut fragments preserve leading and trailing spaces through storage reloads and preview.

## [1.1.1] - 2026-09-28

### Changed

- Reworded editor and web UI guidance and error messages for a polite tone, including storage restrictions, upload-in-progress notices, and input prompts across all supported locales.
- Reworded Korean validation errors for wing registration, builder options, and value lists to make them more polite and clear.

## [1.1.0] - 2026-09-26

### Added

- Added `createLocale()` for live language changes shared by the editor and UI, preserving content, undo/redo, selection, saved state, and uploads. Demo language selectors now use the same mechanism.
- Added the `--nabi-mobile-breakpoint` CSS variable to configure the mobile-mode threshold.
- CSS variables can replace wing, preview, fullscreen, panel, diff, and table-sort icons with SVG, WebP, or PNG files. Packaged default icons include light and dark variants.
- Added individual `showPreview` and `showFullscreen` options for view-tool buttons, shared by SSR and browser mounting.
- Added an icon theme web guide and updated public AI documentation.

### Changed

- Changed the default mobile threshold from at most `40rem` to strictly below `36rem`, shared by toolbars, panels, and the table picker.

## [1.0.0] - 2026-08-31

### Added

- First stable release.

[1.5.0]: https://www.npmjs.com/package/nabi-note/v/1.5.0
[1.3.2]: https://www.npmjs.com/package/nabi-note/v/1.3.2
[1.3.1]: https://www.npmjs.com/package/nabi-note/v/1.3.1
[1.3.0]: https://www.npmjs.com/package/nabi-note/v/1.3.0
[1.2.0]: https://www.npmjs.com/package/nabi-note/v/1.2.0
[1.1.2]: https://www.npmjs.com/package/nabi-note/v/1.1.2
[1.1.1]: https://www.npmjs.com/package/nabi-note/v/1.1.1
[1.1.0]: https://www.npmjs.com/package/nabi-note/v/1.1.0
[1.0.0]: https://www.npmjs.com/package/nabi-note/v/1.0.0
