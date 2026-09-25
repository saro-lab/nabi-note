# Changelog

This file is formatted in accordance with [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).


## [Unreleased]

### Added

- Added `createLocale()` for live language changes shared by the editor and UI, preserving content, undo/redo, selection, saved state, and uploads. Demo language selectors now use the same mechanism.

- Added the `--nabi-mobile-breakpoint` CSS variable to configure the mobile-mode threshold.

- CSS variables can replace wing, preview, fullscreen, panel, diff, and table-sort icons with SVG, WebP, or PNG files. Packaged default icons include light and dark variants.
- Added individual `showPreview` and `showFullscreen` options for view-tool buttons, shared by SSR and browser mounting.
- Added an icon theme web guide and updated public AI documentation.

### Changed

- Changed the default mobile threshold from at most `40rem` to strictly below `36rem`, shared by toolbars, panels, and the table picker.

v1.0.0
- Stable release
