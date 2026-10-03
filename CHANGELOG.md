# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).
Dates use Korea Standard Time (KST).

## [Unreleased]

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
[1.1.2]: https://www.npmjs.com/package/nabi-note/v/1.1.2
[1.1.1]: https://www.npmjs.com/package/nabi-note/v/1.1.1
[1.1.0]: https://www.npmjs.com/package/nabi-note/v/1.1.0
[1.0.0]: https://www.npmjs.com/package/nabi-note/v/1.0.0
