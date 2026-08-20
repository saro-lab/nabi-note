import { makeRegistry } from '../src/wing/index.js';
import { defaultWings } from '../src/wings/index.js';
import { renderToolbarHtml, toolbarSlots, TOOLBAR_GROUPS } from '../src/wing/toolbar-html.js';
import { makeTranslator } from '../src/locale/index.js';
const registry = makeRegistry(defaultWings);
const html = renderToolbarHtml({ registry, locale: 'ko' });
const slots = toolbarSlots(registry, makeTranslator('ko'), TOOLBAR_GROUPS);
console.log(JSON.stringify({
  bytes: html.length,
  buttons: slots.length,
  groups: (html.match(/class="nabi-group"/g) || []).length,
  names: slots.map((s) => s.name).join(','),
  labels: slots.map((s) => s.label).join(','),
}));
