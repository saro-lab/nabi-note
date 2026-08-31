// 글자 계열이 하나라도 있으면 파일은 안 보고(엑셀 표는 그림이 아니라 표다), 맨 글자 기본값은 언제나 맨 뒤에 선다.
// If any text form is present, files are ignored (an Excel table is a table, not an image); the plain-text fallback is always last.
import { P, type ElementNode } from '../schema/index.js';
import { $guarded, $ownDataArray, $ownDataObject } from '../schema/json.js';
import { canonicalTextLines } from '../schema/text.js';
import type { LocaleText } from '../locale/index.js';
import type { IoFilter, PasteCandidate, PasteData } from './contract.js';

export interface CollectOptions {
  readonly filters: readonly IoFilter[];
  // 아이콘은 부르는 쪽이 고른다 — 이 층은 그림을 안 고른다.
  // The caller supplies the icon; this layer doesn't choose artwork.
  readonly textLabel: LocaleText | string;
  readonly textIcon?: string;
}

// 줄마다 문단 하나로 쪼갠다 — 한 줄뿐이면 inline 으로 캐럿에 바로 이어 쓴다.
// One paragraph per line; a single line is marked inline and appended straight at the caret.
export function textCandidate(plain: string, label: LocaleText | string, icon?: string): PasteCandidate {
  const lines = canonicalTextLines(plain);
  const build = (): readonly ElementNode[] =>
    lines.map((line) => (line === '' ? { w: P, ch: [] } : { w: P, ch: [line] }));
  return {
    id: 'text',
    label,
    build,
    ...(icon === undefined ? {} : { icon }),
    ...(lines.length === 1 ? { inline: true } : {}),
  };
}

export function collectCandidates(data: PasteData, options: CollectOptions): readonly PasteCandidate[] {
  if (data.html === '' && data.plain === '') return [];

  const out: PasteCandidate[] = [];
  for (const filter of options.filters) {
    const paste = $ownDataObject(filter)?.['paste']?.value;
    if (paste === undefined) continue;
    if (typeof paste !== 'function') continue;
    const taken = $guarded(`paste filter ${filter.id}`, null, () => paste.call(filter, data) as unknown);
    if (!taken) continue;
    const values = Array.isArray(taken) ? $ownDataArray(taken) : [taken];
    if (!values) continue;
    for (const value of values) {
      const fields = $ownDataObject(value);
      if (!fields) continue;
      const id = fields['id']?.value;
      const labelValue = fields['label']?.value;
      const build = fields['build']?.value;
      const icon = fields['icon']?.value;
      const inline = fields['inline']?.value;
      if (typeof id !== 'string' || typeof build !== 'function') continue;
      let label: LocaleText | string | null = null;
      if (typeof labelValue === 'string') label = labelValue;
      else {
        const labels = $ownDataObject(labelValue);
        if (labels) {
          const copied: Record<string, string> = {};
          let valid = true;
          for (const [code, descriptor] of Object.entries(labels)) {
            if (typeof descriptor.value !== 'string') {
              valid = false;
              break;
            }
            copied[code] = descriptor.value;
          }
          if (valid) label = copied;
        }
      }
      if (label === null || (icon !== undefined && typeof icon !== 'string')) continue;
      out.push({
        id,
        label,
        build: () => build.call(value) as readonly ElementNode[],
        ...(typeof icon === 'string' ? { icon } : {}),
        ...(inline === true ? { inline: true } : {}),
      });
    }
  }
  // 맨 글자 후보는 plain 에서만 판다 — html만 있는 붙여넣기에 빈 줄 하나가 뜨는 것을 막는다.
  // Build the plain-text candidate only from `plain`, so an html-only paste doesn't add a spurious empty line.
  if (data.plain !== '') out.push(textCandidate(data.plain, options.textLabel, options.textIcon));
  return out;
}
