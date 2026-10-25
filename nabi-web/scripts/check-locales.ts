import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createMarkdownRenderer } from 'vitepress';
import { messages, localeCodes } from '../docs/.vitepress/locales/index.ts';
import { trees as koTrees } from '../docs/.vitepress/trees/ko.ts';
import { SAMPLE_KEYS, messageKeyFor } from '../docs/.vitepress/src/sample.ts';
import { LOCALES } from '../../nabi-npm/src/locale/index.ts';
import { $createNabiWith } from '../../nabi-npm/src/wing/index.ts';
import { defaultWings } from '../../nabi-npm/src/wings/index.ts';
import { tinyHtml } from '../../nabi-npm/test/tiny-html.ts';

const docs = fileURLToPath(new URL('../docs/', import.meta.url));
const pageFiles = (locale: string): string[] => {
  const root = resolve(docs, locale);
  return readdirSync(root, { recursive: true, encoding: 'utf8' }).filter((file) => file.endsWith('.md')).sort();
};
const placeholders = (text: string): string[] => [...text.matchAll(/\{([a-z][a-z_]*)\}/g)].map((m) => m[1]!).sort();
const shape = (value: unknown): unknown => {
  if (Array.isArray(value)) return value.filter((child) => typeof child !== 'string').map(shape);
  const node = value as { w: string; a?: Record<string, unknown>; ch: unknown[] };
  return {
    w: node.w,
    a: Object.fromEntries(Object.entries(node.a ?? {}).filter(([key]) => !['t', 'alt'].includes(key)).sort()),
    empty: node.ch.length === 0,
    ch: shape(node.ch),
  };
};

assert.deepEqual([...localeCodes].sort(), [...LOCALES].sort(), 'package and site locales');
const pages = pageFiles('ko');
const markdown = await createMarkdownRenderer(docs);
const pageStructure = (source: string): string => markdown.parse(source.replace(/^---\n[\s\S]*?\n---\n/, ''), {})
  .filter((token) => token.type !== 'inline')
  .map((token) => token.type === 'html_block'
    ? `${token.type}:${token.content.replace(/\/[a-z]{2}(?=[/.])/g, '/LANG')}`
    : token.type === 'fence' ? `${token.type}:${token.info.trim()}` : token.type)
  .join('|');
const sourcePages = new Map(pages.map((page) => [page, pageStructure(readFileSync(resolve(docs, 'ko', page), 'utf8'))]));
for (const locale of localeCodes) {
  const sheet = messages[locale] as Record<string, string>;
  for (const [key, source] of Object.entries(messages.ko)) {
    assert.ok(sheet[key]?.trim(), `${locale}.${key}: missing translation`);
    assert.deepEqual(placeholders(sheet[key]!), placeholders(source), `${locale}.${key}: placeholders`);
    assert.ok(!sheet[key]!.includes('\uFFFD'), `${locale}.${key}: invalid character`);
  }
  assert.deepEqual(pageFiles(locale), pages, `${locale}: documentation pages`);
  for (const page of pages) {
    const path = resolve(docs, locale, page);
    const source = readFileSync(path, 'utf8');
    assert.ok(!source.includes('\uFFFD'), `${relative(docs, path)}: invalid character`);
    assert.equal(pageStructure(source), sourcePages.get(page), `${relative(docs, path)}: page structure`);
  }
  if (locale === 'ko') continue;
  for (const key of SAMPLE_KEYS) {
    const html = sheet[messageKeyFor(key)];
    assert.ok(html?.trim(), `${locale}.${key}: missing sample`);
    const { nabi } = $createNabiWith(defaultWings, { parseHtml: tinyHtml, allowLocalUrls: true });
    assert.equal(nabi.setHtml(html!), true, `${locale}.${key}: invalid sample`);
    assert.deepEqual(shape(nabi.getJson()), shape(koTrees[key]), `${locale}.${key}: sample structure`);
  }
}
console.log('Locale keys, placeholders, page structures, and samples match the Korean source.');
