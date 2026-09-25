const escape = (value: string): string =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function iconToken(key: string): string {
  return key.replace(/[^a-zA-Z0-9-]/g, (char) => `_${char.codePointAt(0)!.toString(16)}_`);
}

export function iconHtml(key: string, icon?: string, svg?: string, strokeWidth = 1.4): string {
  if (!icon && svg) {
    return `<span class="nabi-icon nabi-icon-legacy" data-nabi-icon="${escape(key)}" aria-hidden="true" style="content:var(--nabi-icon-${iconToken(key)},normal)"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round">${svg}</svg></span>`;
  }
  const fallback = icon ? `var(--nabi-default-icon-${iconToken(icon)}, none)` : 'none';
  return `<span class="nabi-icon" data-nabi-icon="${escape(key)}" aria-hidden="true" style="--nabi-icon-image:${escape(`var(--nabi-icon-${iconToken(key)}, ${fallback})`)}"></span>`;
}
