import { ICON_ASSETS } from './icon-assets.js';

const defaults = (dark: boolean): string =>
  Object.entries(ICON_ASSETS)
    .map(([key, urls]) => `--nabi-default-icon-${key}:url("${urls[dark ? 1 : 0]}");`)
    .join('\n');

const scopes =
  ':is(.nabi,.nabi-scrim,.nabi-diff-screen,.nabi-content:where(:not(.nabi *):not(.nabi-scrim *):not(.nabi-diff *):not(.nabi-diff-screen *)),.nabi-diff:where(:not(.nabi *):not(.nabi-diff-screen *)))';

export const ICON_CSS = `
${scopes} { ${defaults(false)} }
:where(html,body).dark ${scopes}:not([data-nabi-theme="light"]),
:where([data-nabi-theme="dark"]) ${scopes}:not([data-nabi-theme="light"]),
${scopes}[data-nabi-theme="dark"] { ${defaults(true)} }
:where(html,body).light ${scopes}:not([data-nabi-theme="dark"]),
:where([data-nabi-theme="light"]) ${scopes}:not([data-nabi-theme="dark"]),
${scopes}[data-nabi-theme="light"] { ${defaults(false)} }
.nabi-icon {
  display:inline-block; flex:none; inline-size:1rem; block-size:1rem;
  background-image:var(--nabi-icon-image,none);
  background-position:center; background-size:contain; background-repeat:no-repeat;
  vertical-align:middle; pointer-events:none; object-fit:contain;
}
.nabi-icon-legacy > svg { inline-size:100%; block-size:100%; }
.nabi-choose-icon .nabi-icon,.nabi-save-icon .nabi-icon { inline-size:24px;block-size:24px; }
.nabi-btn:hover,.nabi-btn.nabi-kbd { background-color:var(--nabi-soft); }
.nabi-btn:focus-visible { outline:2px solid var(--nabi-accent);outline-offset:1px; }
`;
