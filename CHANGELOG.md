# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).
Dates use Korea Standard Time (KST).

## [Unreleased]

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

[Unreleased]: https://github.com/saro-lab/nabi-note
[1.2.0]: https://www.npmjs.com/package/nabi-note/v/1.2.0
[1.1.2]: https://www.npmjs.com/package/nabi-note/v/1.1.2
[1.1.1]: https://www.npmjs.com/package/nabi-note/v/1.1.1
[1.1.0]: https://www.npmjs.com/package/nabi-note/v/1.1.0
[1.0.0]: https://www.npmjs.com/package/nabi-note/v/1.0.0
