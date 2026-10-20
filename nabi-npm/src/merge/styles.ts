export const MERGE_CSS = `
.nabi-merge { --nabi-merge-base: #b45309; --nabi-merge-incoming: #047857; --nabi-merge-conflict: #c2410c; color: var(--nabi-fg, inherit); }
.nabi-merge-shell { border: 1px solid var(--nabi-line, #8885); border-radius: .5rem; overflow: hidden; background: var(--nabi-bg, #fff); }
.nabi-merge-bar, .nabi-merge-actions { display: flex; align-items: center; gap: .5rem; flex-wrap: wrap; padding: .6rem; }
.nabi-merge-bar { border-bottom: 1px solid var(--nabi-line, #8885); }
.nabi-merge-status { margin-inline-end: auto; font-size: .875rem; }
.nabi-merge button.nabi-merge-button { border: 1px solid var(--nabi-line, #8885); border-radius: .3rem; padding: .35rem .65rem; font: inherit; cursor: pointer; color: inherit; background: var(--nabi-bg, #fff); }
.nabi-merge button.nabi-merge-button:disabled { opacity: .4; cursor: default; }
.nabi-merge button.nabi-merge-button:hover:not(:disabled) { color: var(--nabi-accent, #2563eb); border-color: currentColor; }
.nabi-merge button.nabi-merge-button:focus-visible { outline: 2px solid var(--nabi-accent, #2563eb); outline-offset: -2px; }
.nabi-merge-grid { display: grid; grid-template-columns: minmax(0, 1fr) 1.75rem minmax(0, 1.2fr) 1.75rem minmax(0, 1fr); }
.nabi-merge-pane { min-width: 0; display: flex; flex-direction: column; }
.nabi-merge .nabi-merge-title { margin: 0; padding: .65rem .4rem; font: 600 .8rem/1.4 sans-serif; border-bottom: 1px solid var(--nabi-line, #8885); white-space: nowrap; }
.nabi-merge-base .nabi-merge-title { border-top: 3px solid var(--nabi-merge-base); }
.nabi-merge-incoming .nabi-merge-title { border-top: 3px solid var(--nabi-merge-incoming); }
.nabi-merge-result .nabi-merge-title { border-top: 3px solid var(--nabi-accent, #2563eb); }
.nabi-merge-source, .nabi-merge-scroll { overflow: auto; height: var(--nabi-merge-height, 28rem); min-height: 14rem; scrollbar-width: thin; overscroll-behavior: contain; }
.nabi-merge-source.nabi-content { padding: .75rem 0; }
.nabi-merge-source .nabi-merge-source-block { display: grid; grid-template-columns: 1.6rem minmax(0, 1fr); position: relative; min-height: 1.75rem; margin: 0; }
.nabi-merge-line-number { padding: .15rem .2rem; color: var(--nabi-muted, #777); font: .65rem/1.6 monospace; text-align: end; user-select: none; }
.nabi-merge-line-text { display: flow-root; padding: 0 .35rem; overflow-wrap: anywhere; }
.nabi-merge-line-text > * { margin: 0; }
.nabi-merge-line-text[data-line-break] br:last-child { display: none; }
.nabi-merge-line-text:empty { min-height: 1.5em; }
.nabi-merge-source-block[data-change] { background: color-mix(in srgb, var(--nabi-merge-base) 10%, transparent); }
.nabi-merge-incoming .nabi-merge-source-block[data-change] { background: color-mix(in srgb, var(--nabi-merge-incoming) 10%, transparent); }
.nabi-merge-source-block[data-merge-active] { outline: 1px solid var(--nabi-merge-conflict); outline-offset: -1px; }
.nabi-merge-base .nabi-diff-del { background: color-mix(in srgb, var(--nabi-merge-base) 23%, transparent); }
.nabi-merge-incoming .nabi-diff-del { background: color-mix(in srgb, var(--nabi-merge-incoming) 23%, transparent); }
.nabi-merge-gutter { position: relative; overflow: hidden; background: var(--nabi-soft, #8881); border-inline: 1px solid var(--nabi-line, #8883); }
.nabi-merge-gutter svg { position: absolute; width: 100%; height: 100%; inset: 0; pointer-events: none; fill: color-mix(in srgb, var(--nabi-merge-base) 13%, transparent); }
.nabi-merge-incoming-gutter svg { fill: color-mix(in srgb, var(--nabi-merge-incoming) 13%, transparent); }
.nabi-merge button.nabi-merge-line-action { position: absolute; inset-inline: 0; z-index: 1; width: 100%; height: 1.75rem; padding: 0; border-radius: .2rem; font: 600 1.25rem/1 sans-serif; }
.nabi-merge-line-action[data-merge-active] { color: var(--nabi-merge-conflict); }
.nabi-merge-scroll { position: relative; }
.nabi-merge-paper { position: relative; min-height: 100%; }
.nabi-merge-content.nabi-content { padding: .75rem .5rem; min-height: 100%; }
.nabi-merge-overlay { position: absolute; inset: 0; pointer-events: none; overflow: hidden; }
.nabi-merge-band { position: absolute; inset-inline: 0; background: color-mix(in srgb, var(--nabi-merge-base) 6%, transparent); box-sizing: border-box; }
.nabi-merge-band[data-source="incoming"] { background: color-mix(in srgb, var(--nabi-merge-incoming) 6%, transparent); }
.nabi-merge-unresolved { border-inline-start: 3px solid var(--nabi-merge-conflict); background: transparent; }
.nabi-merge-band[data-active] { border-block: 1px dashed var(--nabi-merge-conflict); }
.nabi-merge-actions { border-bottom: 1px solid var(--nabi-line, #8885); }
.nabi-merge-detail { margin: 0; font-size: .8rem; }
.nabi-merge-error { color: var(--nabi-merge-conflict); padding: .5rem .75rem; }
.nabi-merge-bar, .nabi-merge-actions, .nabi-merge-error,
.nabi-merge .nabi-merge-title, .nabi-merge-line-number,
.nabi-merge button.nabi-merge-line-action {
  font-family: var(--nabi-font, var(--nabi-font-fallback, sans-serif));
}
.nabi-merge [hidden] { display: none !important; }
.nabi-merge-shell.is-fullscreen { display: flex; flex-direction: column; border: 0; border-radius: 0; padding: 0; }
.nabi-merge-shell.is-fullscreen > .nabi-merge-grid { flex: 1; min-height: 0; }
.nabi-merge-shell.is-fullscreen .nabi-merge-pane { min-height: 0; }
.nabi-merge-shell.is-fullscreen .nabi-merge-editor { flex: 1; min-height: 0; display: flex; flex-direction: column; }
.nabi-merge-shell.is-fullscreen .nabi-merge-source, .nabi-merge-shell.is-fullscreen .nabi-merge-scroll { flex: 1; height: auto; min-height: 0; }
.nabi.nabi-merge-shell.is-fullscreen .nabi-merge-content.nabi-fullscreen-content { inline-size: 100%; max-inline-size: none; margin: 0; border: 0; box-shadow: none; }
@media (max-width: 36rem) {
  .nabi-merge-grid { grid-template-columns: minmax(0, 1fr) 1.5rem minmax(0, 1.2fr) 1.5rem minmax(0, 1fr); }
  .nabi-merge .nabi-merge-title { font-size: .625rem; padding-inline: .2rem; white-space: normal; }
  .nabi-merge-source, .nabi-merge-content { font-size: .75rem; }
  .nabi-merge-source .nabi-merge-source-block { grid-template-columns: minmax(0, 1fr); }
  .nabi-merge-line-number { display: none; }
  .nabi-merge-bar, .nabi-merge-actions { gap: .3rem; padding: .4rem; }
  .nabi-merge button.nabi-merge-button { font-size: .75rem; }
}
`;
