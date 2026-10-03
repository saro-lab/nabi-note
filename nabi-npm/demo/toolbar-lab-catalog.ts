import {
  defaultWings,
  makeRegistry,
  makeTranslator,
  toolbarSlots,
  type ContextControl,
  type Wing,
} from '../src/index.js';

export type LabTool = {
  id: string;
  wing: string;
  group: string;
  label: string;
  icon: string;
};

const registry = makeRegistry(defaultWings);
const translator = makeTranslator('ko');
const slots = toolbarSlots(registry, translator);
const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

function iconOf(source: { icon?: string; svg?: string }, fallback: string): string {
  if (source.icon && /^[a-zA-Z0-9-]+$/.test(source.icon)) {
    const url = new URL(`../src/style/icons/${source.icon}.svg`, import.meta.url).href;
    return `<svg viewBox="0 0 16 16" aria-hidden="true"><image href="${escapeHtml(url)}" width="16" height="16" /></svg>`;
  }
  if (source.svg)
    return `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${source.svg}</svg>`;
  return escapeHtml(fallback);
}

export const tools: LabTool[] = slots.map((slot) => ({
  id: slot.name,
  wing: slot.wing.w,
  group: slot.group,
  label: slot.label,
  icon: iconOf(slot.decl, slot.label.slice(0, 2)),
}));

const categoryLabels: Record<string, string> = {
  font: '글꼴',
  heading: '제목',
  emphasis: '강조',
  script: '첨자',
  color: '색상',
  link: '링크',
  align: '정렬',
  list: '목록',
  structure: '표·구분선',
  media: '미디어',
  container: '블록',
  clear: '서식 정리',
  file: '문서',
};

export const categories: { id: string; label: string }[] = [...new Set(tools.map((tool) => tool.group))].map((id) => ({
  id,
  label: categoryLabels[id] ?? id,
}));

function wingLabel(wing: Wing): string {
  if (wing.w === 'align') return '정렬';
  return translator.pick(wing.button?.label ?? wing.buttons?.[0]?.label ?? wing.context?.title, `wing.${wing.w}`);
}

export const wingCatalog: { id: string; label: string; group: string }[] = registry.wings.map((wing) => ({
  id: wing.w,
  label: wingLabel(wing),
  group: tools.find((tool) => tool.wing === wing.w)?.group ?? 'other',
}));

export const contextValueChoices: Record<string, { value: string | number; label: string; icon: string }[]> = {};

function contextTools(wing: Wing): LabTool[] {
  const group = `context:${wing.w}`;
  return (wing.context?.controls ?? []).flatMap((control: ContextControl) => {
    const id = `context:${wing.w}:${control.name}`;
    const label = translator.pick(control.tip ?? control.label, `ctx.${wing.w}.${control.name}`);
    if (control.kind === 'select' || control.kind === 'range') {
      const choices = control.values.map((choice) => {
        const choiceLabel = translator.pick(choice.tip ?? choice.label, `value.${wing.w}.${choice.value}`);
        return {
          value: choice.value,
          label: choiceLabel,
          icon: choice.swatch
            ? `<svg viewBox="0 0 16 16" aria-hidden="true"><rect x="2" y="2" width="12" height="12" rx="3" fill="${escapeHtml(choice.swatch)}" stroke="currentColor" stroke-width=".5" /></svg>`
            : iconOf(choice, choiceLabel.slice(0, 3)),
        };
      });
      contextValueChoices[id] = choices;
      if (control.kind === 'select')
        return choices.map((choice) => ({
          id: `${id}:${choice.value}`,
          wing: wing.w,
          group,
          label: `${label} · ${choice.label}`,
          icon: choice.icon,
        }));
    }
    return [
      {
        id,
        wing: wing.w,
        group,
        label,
        icon: iconOf(control, control.kind === 'range' ? '↔' : control.kind === 'text' ? 'Aa' : label.slice(0, 3)),
      },
    ];
  });
}

export const contextCatalog: Record<string, { label: string; controls: LabTool[] }> = Object.fromEntries(
  registry.wings
    .filter((wing) => wing.context)
    .map((wing) => [wing.w, { label: wingLabel(wing), controls: contextTools(wing) }]),
);

export const allContextTools: LabTool[] = Object.values(contextCatalog).flatMap((context) => context.controls);

export const contexts: Record<'text' | 'table' | 'image' | 'code', { label: string; controls: LabTool[] }> = {
  text: {
    label: '서식 있는 텍스트',
    controls: ['h', 'tf', 'fs', 'tc', 'hl', 'a'].flatMap((id) => contextCatalog[id]?.controls ?? []),
  },
  table: { label: '표 셀', controls: contextCatalog['table']?.controls ?? [] },
  image: { label: '이미지', controls: contextCatalog['img']?.controls ?? [] },
  code: { label: '코드 블록', controls: contextCatalog['code']?.controls ?? [] },
};
