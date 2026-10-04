# Icon themes and view-tool visibility (1.1.0)

## CSS file URLs

Load `nabi-note/nabi.css`, then set `--nabi-icon-<key>: url("...")` on a page theme root, one `.nabi`, or a published `.nabi-content`. SVG, WebP, and PNG use the same API. No JavaScript icon map is required. Images retain their colors, alpha, and aspect ratio; they are not monochrome masks. The fixed icon box uses `contain` sizing.

```css
.paper-note {
  --nabi-icon-toolbar-b: url("/icons/bold.svg");
  --nabi-icon-view-preview: url("/icons/preview.webp");
  --nabi-icon-view-fullscreen-enter: url("/icons/expand.svg");
  --nabi-icon-view-fullscreen-exit: url("/icons/shrink.webp");
  --nabi-icon-panel-preview-close: url("/icons/close.svg");
}
.paper-note[data-nabi-theme="dark"] {
  --nabi-icon-view-preview: url("/icons/preview-dark.webp");
}
```

Use root-relative URLs or full HTTPS URLs. Relative URLs in custom properties are resolved where the value is used, which can be an inline icon style or a body-mounted panel; do not assume they resolve beside the theme stylesheet. An HTML `base` also affects relative resolution. Host absolute URLs are the most portable choice with `base`, nested routes, or multiple origins.

An omitted variable uses the packaged icon. An explicitly assigned but broken URL does not automatically fall back; the fixed box, label, tooltip, keyboard behavior, and action remain available. Remove the override to restore the default. `none` only removes the image; it does not hide the button.

## Public keys

The icon element exposes its semantic key as `data-nabi-icon`. Prefix that key with `--nabi-icon-`. Preserve case. Characters outside ASCII letters, digits, and hyphen are encoded as `_hex_` using each UTF-16 code unit; for example `toolbar-custom:star` becomes `--nabi-icon-toolbar-custom_3a_star`. Standard built-in keys below need no encoding.

| Surface | Key |
| --- | --- |
| Wing toolbar | `toolbar-<slot.name>`; e.g. `toolbar-b`, `toolbar-i`, `toolbar-table` |
| Context command | `context-<wing.w>-<control.name>` |
| Context choice | `context-<wing.w>-<control.name>-<choice.value>` |
| Toolbar menu choice | `menu-<slot.name>-<choice.value>` |
| Preview / fullscreen states | `view-preview`, `view-fullscreen-enter`, `view-fullscreen-exit` |
| Preview close | `panel-preview-close` |
| History controls | `panel-history-clear`, `panel-history-close`, `panel-history-preview`, `panel-history-delete` |
| Save formats | `panel-save-format-html`, `panel-save-format-markdown`, `panel-save-format-text`, `panel-save-format-nabi` |
| Paste formats | `panel-choose-format-html`, `panel-choose-format-markdown`, `panel-choose-format-text`, `panel-choose-format-nabi` |
| Upload | `upload-attachment`, `upload-cancel` |
| Diff controls | `diff-prev`, `diff-next`, `diff-fold`, `diff-close` |
| Viewer sorting states | `viewer-sort-original`, `viewer-sort-ascending`, `viewer-sort-descending` |

Names and values come from the registered declarations, not translated labels or DOM position. A text-only choice or color swatch stays text or a swatch. Custom IO choices with legacy icons use `panel-choose-choice-<index>` or `panel-save-choice-<index>` because the existing IO contract has no stable icon identifier. Those indexes depend on the host's candidate order; do not treat them as built-in theme keys.

`WingButton`, `WingChoice`, and icon-capable context controls accept `icon?: string`, a packaged default asset identifier, not a URL. For example `icon: 'marks-b'` selects that default file. The CSS key still comes from the slot/control above. Use CSS URLs for your own files. Existing `svg` declarations and exported SVG constants remain supported; CSS replacement takes precedence. Legacy SVG keeps inline `currentColor` behavior when not replaced. Treat legacy SVG declarations as trusted extension code, as before.

## Theme and interaction behavior

Changing the theme class or a CSS variable updates existing icons without rebuilding buttons, moving focus, or changing stored documents. Default icons have light/dark files and follow the existing `data-nabi-theme` and page `.dark`/`.light` rules. External images do not inherit `currentColor`; supply your own dark variants in CSS if needed. Hover, selection, disabled state, and keyboard focus also use button styling independent of the image color.

Panels mounted under `body` copy icon variables and the color scheme from their source surface. Class/style/theme changes on the source or its ancestors, stylesheet DOM updates/loading, and window resizing refresh open panels. Each panel follows its own editor; closing disconnects observers and listeners. Direct CSSOM `insertRule()` calls without a DOM change do not trigger panel synchronization. Keep editor icon variables on the editor or a shared ancestor, not only a toolbar child. For standalone viewer/diff, place the theme on their container or its ancestor.

The default toolbar's expanded desktop and compact mobile placement does not change existing wing, context, or view icon keys. The mobile full Tools palette displays the original wing-group icons together without category tabs or group borders. Connected preview/fullscreen controls stay visible in the main toolbar; theme them with the same `view-*` keys. Toolbar, palette, and property controls use `.875rem` icons and `2rem` regular buttons on desktop and mobile (14px and 32px at the default root font size).

## Hide preview or fullscreen

```ts
const visibility = { showPreview: false, showFullscreen: true };
const html = renderViewToolsHtml({ locale: 'en', ...visibility });
const tools = mountViewTools({
  nabi, surface, root, container, locale: 'en', ...visibility,
});
// When the host removes this UI:
tools.unmount();
```

Both options default to `true`. `false` removes the button, focus target, associated handler, and icon request. Both `false` produces no tools wrapper and returns an empty `buttons` array. Reconfigure by unmounting and mounting with new options. These options do not disable direct `openPreview()` or `setFullscreen()` calls.

Omitting `mountViewTools()` and the SSR view-tools markup already omits both controls; that remains supported. Use the same visibility and locale during SSR and mounting. Matching markup is reused, while a mismatched tools region is redrawn. Theme URL changes alone do not invalidate SSR button identity. Fullscreen updates the enter/exit icon key and `aria-pressed`; Escape keeps its existing ownership rules.

## Ship assets with the package

Default SVG files live in `dist/icons/` (light and `-dark.svg` variants), exported through `nabi-note/icons/*`. Published `dist/nabi.css` uses adjacent `./icons/` URLs. Copy the directory with the CSS when hosting manually. Keep JS, CSS, and icons from the same package version. The local CDN demo includes an `icons/` directory as well.

Bundlers must preserve or emit the icon URLs from imported CSS and static `new URL(..., import.meta.url)` references. Runtime `CORE_CSS`/`collectSheets()`/`injectSheets()` resolves default assets relative to the browser ESM bundle; the packaged IIFE uses its script location (`dist/browser/` to `dist/icons/`). Keep the package layout if moving the IIFE. It does not request an unrelated CDN or `latest` version. Do not inject server-side `CORE_CSS` containing `file:` URLs into client HTML; use the published stylesheet for SSR.

The `?no-inline` query keeps assets external in Vite builds. Package files remain ordinary SVG images and work when served with that query. A host bundler may require equivalent asset configuration. Verify deployed requests, particularly when using a base path or a custom bundler.
