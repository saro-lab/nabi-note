import { expect, test, type Page } from '@playwright/test';
import type { MergeMount, MergeResult } from '../../src/merge/index.js';
import type { Selection } from '../../src/index.js';

interface MergeDemo {
  readonly current: MergeMount;
  readonly lastResult: MergeResult | null;
  reset(scenario?: 'conflicts' | 'automatic'): void;
}

const action = (page: Page, name: string) => page.locator(`#merge-host [data-merge-action="${name}"]`);
const lineAction = (page: Page, source: 'base' | 'incoming', line: number) =>
  page.locator(`#merge-host [data-merge-action="${source}"][data-source-start="${line}"]`);
const coreEntry = `/@fs${new URL('../../src/index.ts', import.meta.url).pathname}`;
const remaining = (page: Page) =>
  page.evaluate(
    () => (globalThis as unknown as { mergeDemo: MergeDemo }).mergeDemo.current.session.getState().unresolvedCount,
  );
async function select(page: Page, block: number, start: number, end = start): Promise<void> {
  const selection: Selection = { anchor: { path: [block], offset: start }, focus: { path: [block], offset: end } };
  await page.evaluate((selection) => {
    document.querySelector<HTMLElement>('.nabi-merge-content')!.focus();
    (globalThis as unknown as { mergeDemo: MergeDemo }).mergeDemo.current.nabi.select(selection);
  }, selection);
}

async function mountDocuments(
  page: Page,
  docs: { base: unknown[]; local: unknown[]; incoming: unknown[] },
): Promise<void> {
  await page.evaluate(
    async ({ entry, docs }) => {
      (globalThis as unknown as { mergeDemo: MergeDemo }).mergeDemo.current.unmount();
      const api = await import(/* @vite-ignore */ entry);
      const merge = await import(/* @vite-ignore */ entry.replace('/index.ts', '/merge/index.ts'));
      let lastResult: MergeResult | null = null;
      const current = merge.mountMerge({
        root: document.getElementById('merge-host')!,
        ...docs,
        wings: api.defaultWings,
        locale: 'en',
        onConfirm(result: MergeResult) {
          lastResult = result;
        },
      });
      Object.assign(globalThis, {
        mergeDemo: {
          current,
          get lastResult() {
            return lastResult;
          },
        },
      });
    },
    { entry: coreEntry, docs },
  );
}

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1100 });
  await page.goto('/merge.html');
  await expect(page.locator('.nabi-merge-content')).toHaveAttribute('contenteditable', 'true');
});

test('automatically merges independent changes and keeps line actions without conflict controls', async ({ page }) => {
  await page.locator('#scenario').selectOption('automatic');
  const content = page.locator('.nabi-merge-content');
  await expect(content).toContainText('준비물은 모자, 물, 우산입니다.');
  await expect(content).toContainText('오후에는 미술관을 둘러봅니다.');
  expect(await remaining(page)).toBe(0);
  await expect(page.locator('.nabi-merge-actions')).toBeHidden();
  await expect(page.locator('.nabi-merge-bar button:visible')).toHaveCount(1);
  await expect(action(page, 'base')).toHaveCount(2);
  await expect(action(page, 'incoming')).toHaveCount(1);
  await expect(action(page, 'confirm')).toBeEnabled();
  await action(page, 'confirm').click();
  await expect(page.locator('#confirmed')).toBeVisible();
  await expect(action(page, 'confirm')).toBeDisabled();
  const submitted = await page.evaluate(() => {
    const result = (globalThis as unknown as { mergeDemo: MergeDemo }).mergeDemo.lastResult!;
    return { version: result.incomingVersion, json: result.json, html: result.html };
  });
  expect(submitted.version).toBe('weekend-2');
  expect(JSON.stringify(submitted.json)).not.toContain('nabi-merge');
  expect(submitted.html).not.toContain('nabi-diff');
});

test('edits and formats the result, resolves current content with undo, then adopts incoming and confirms', async ({
  page,
}) => {
  const content = page.locator('.nabi-merge-content');
  expect(await remaining(page)).toBe(2);
  await expect(page.locator('.nabi-merge-base .nabi-merge-source')).toContainText('출발 시간은 오전 9시입니다.');
  await expect(page.locator('.nabi-merge-incoming .nabi-merge-source')).toContainText('출발 시간은 오전 11시입니다.');
  await expect(content).toContainText('출발 시간은 오전 10시입니다.');
  await expect(content).toContainText('준비물은 모자, 물, 우산입니다.');
  await expect(content).toContainText('오후에는 미술관을 둘러봅니다.');
  await expect(action(page, 'confirm')).toBeDisabled();
  expect(
    await page.evaluate(() => (globalThis as unknown as { mergeDemo: MergeDemo }).mergeDemo.current.confirm()),
  ).toBe(false);

  await select(page, 1, 0, '출발 시간은 오전 10시입니다.'.length);
  await page.keyboard.insertText('직접 정한 출발 시간');
  await expect(content.locator(':scope > *').nth(1)).toHaveText('직접 정한 출발 시간');
  await select(page, 1, 0, '직접 정한'.length);
  await page.locator('#merge-host .nabi-toolbar [data-name="b"]').first().click();
  await expect(content.locator(':scope > *').nth(1).locator('b,strong')).toHaveText('직접 정한');
  expect(await remaining(page)).toBe(2);
  await action(page, 'current').click();
  expect(await remaining(page)).toBe(1);
  await page.locator('#undo').click();
  expect(await remaining(page)).toBe(2);
  await expect(content.locator(':scope > *').nth(1).locator('b,strong')).toHaveText('직접 정한');
  await page.locator('#redo').click();
  expect(await remaining(page)).toBe(1);

  await select(page, 1, '직접 정한 출발 시간'.length);
  await page.keyboard.insertText(' 확정');
  expect(await remaining(page)).toBe(1);
  await lineAction(page, 'incoming', 7).click();
  expect(await remaining(page)).toBe(0);
  await expect(content).toContainText('모임 장소는 카페 앞입니다.');
  await expect(content).toContainText('직접 정한 출발 시간 확정');
  await expect(page.locator('.nabi-merge-actions')).toBeHidden();
  await expect(action(page, 'confirm')).toBeEnabled();
  await action(page, 'confirm').click();
  await expect(page.locator('#confirmed-html')).toContainText('직접 정한 출발 시간 확정');
  await expect(page.locator('#confirmed-html')).toContainText('모임 장소는 카페 앞입니다.');
});

test('the left arrow restores the starting version and result edits do not reopen resolved conflicts', async ({
  page,
}) => {
  await lineAction(page, 'base', 1).click();
  expect(await remaining(page)).toBe(1);
  await expect(page.locator('.nabi-merge-content')).toContainText('출발 시간은 오전 9시입니다.');
  await select(page, 1, 0);
  await page.keyboard.insertText('안내: ');
  expect(await remaining(page)).toBe(1);
  await action(page, 'current').click();
  await expect(action(page, 'confirm')).toBeEnabled();
});

test('synthetic composition holds both conflict resolution and final confirmation', async ({ page }) => {
  const content = page.locator('.nabi-merge-content');
  await content.focus();
  await content.dispatchEvent('compositionstart', { data: '' });
  await expect(action(page, 'current')).toBeDisabled();
  for (const button of await action(page, 'incoming').all()) await expect(button).toBeDisabled();
  const refused = await page.evaluate(() => {
    const { session } = (globalThis as unknown as { mergeDemo: MergeDemo }).mergeDemo.current;
    return session.resolve(session.getState().conflicts[0]!.id, 'current');
  });
  expect(refused).toBe(false);
  await content.dispatchEvent('compositionend', { data: '' });
  await expect(action(page, 'current')).toBeEnabled();

  await page.locator('#scenario').selectOption('automatic');
  await content.focus();
  await content.dispatchEvent('compositionstart', { data: '' });
  await expect(action(page, 'confirm')).toBeDisabled();
  expect(
    await page.evaluate(() => (globalThis as unknown as { mergeDemo: MergeDemo }).mergeDemo.current.confirm()),
  ).toBe(false);
  await content.dispatchEvent('compositionend', { data: '' });
  await expect(action(page, 'confirm')).toBeEnabled();
});

test('narrow layout retains the full editable result and conflict actions', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator('.nabi-merge-content')).toBeVisible();
  await action(page, 'current').click();
  await lineAction(page, 'incoming', 7).click();
  await expect(action(page, 'confirm')).toBeEnabled();
  await action(page, 'confirm').click();
  await expect(page.locator('#confirmed')).toBeVisible();
});

test('adopts only the selected adjacent conflict, highlights differences and preserves clean output through undo', async ({
  page,
}) => {
  const paragraph = (text: string) => ({ w: 'p', ch: [text] });
  await mountDocuments(page, {
    base: [paragraph('base first'), paragraph('base second'), paragraph('tail')],
    local: [paragraph('local first'), paragraph('local second'), paragraph('tail')],
    incoming: [paragraph('incoming first'), paragraph('incoming second'), paragraph('tail')],
  });
  const content = page.locator('.nabi-merge-content');
  expect(await remaining(page)).toBe(2);
  await expect(action(page, 'incoming')).toHaveCount(2);
  await expect(page.locator('.nabi-merge-incoming .nabi-diff-del')).not.toHaveCount(0);
  await expect(page.locator('.nabi-merge-overlay .nabi-merge-band')).not.toHaveCount(0);
  await expect(content.locator('[class*="nabi-merge"], [class*="nabi-diff"]')).toHaveCount(0);
  const second = lineAction(page, 'incoming', 1);
  const buttonBox = await second.boundingBox();
  const sourceBox = await page.locator('.nabi-merge-incoming .nabi-merge-source-block[data-unit="1"]').boundingBox();
  expect(buttonBox).not.toBeNull();
  expect(sourceBox).not.toBeNull();
  expect(Math.abs(buttonBox!.y - sourceBox!.y)).toBeLessThan(2);
  await second.click();
  await expect(content.locator(':scope > *').nth(0)).toHaveText('local first');
  await expect(content.locator(':scope > *').nth(1)).toHaveText('incoming second');
  expect(await remaining(page)).toBe(1);
  await expect(action(page, 'incoming')).toHaveCount(1);
  await page.evaluate(() => (globalThis as unknown as { mergeDemo: MergeDemo }).mergeDemo.current.nabi.undo());
  await expect(content.locator(':scope > *').nth(1)).toHaveText('local second');
  expect(await remaining(page)).toBe(2);
  await page.evaluate(() => (globalThis as unknown as { mergeDemo: MergeDemo }).mergeDemo.current.nabi.redo());
  await expect(content.locator(':scope > *').nth(1)).toHaveText('incoming second');
  expect(await remaining(page)).toBe(1);
  await action(page, 'current').click();
  await action(page, 'confirm').click();
  const result = await page.evaluate(() => {
    const value = (globalThis as unknown as { mergeDemo: MergeDemo }).mergeDemo.lastResult!;
    return { html: value.html, json: value.json };
  });
  expect(result.json).toEqual([paragraph('local first'), paragraph('incoming second'), paragraph('tail')]);
  expect(result.html).not.toMatch(/nabi-merge|nabi-diff|data-source-start|data-result-start|data-key/);
});

test('uses explicit line breaks as independent rows without splitting the saved paragraph', async ({ page }) => {
  const paragraph = (first: string, second: string) => ({ w: 'p', ch: [first, { w: 'br', ch: [] }, second] });
  await mountDocuments(page, {
    base: [paragraph('base first', 'base second')],
    local: [paragraph('local first', 'local second')],
    incoming: [paragraph('incoming first', 'incoming second')],
  });
  await expect(page.locator('.nabi-merge-incoming .nabi-merge-source-block')).toHaveCount(2);
  await expect(action(page, 'incoming')).toHaveCount(2);
  await lineAction(page, 'incoming', 1).click();
  await expect(page.locator('.nabi-merge-content > p')).toHaveCount(1);
  await expect(page.locator('.nabi-merge-content > p > br')).toHaveCount(1);
  const json = await page.evaluate(() =>
    (globalThis as unknown as { mergeDemo: MergeDemo }).mergeDemo.current.nabi.getJson(),
  );
  expect(json).toEqual([paragraph('local first', 'incoming second')]);
  expect(await remaining(page)).toBe(1);
});

test('synchronizes long panes and keeps focus on a visible control after adopting the last change', async ({
  page,
}) => {
  const paragraph = (text: string) => ({ w: 'p', ch: [text] });
  const base = Array.from({ length: 70 }, (_, index) => paragraph(`Line ${index}: original text.`));
  const changed = (name: string) =>
    base.map((node, index) => (index === 5 || index === 60 ? paragraph(`Line ${index}: ${name} text.`) : node));
  await mountDocuments(page, { base, local: changed('local'), incoming: changed('incoming') });
  await page.locator('.nabi-merge-incoming .nabi-merge-source').evaluate((element) => {
    element.scrollTop = element.scrollHeight;
  });
  await expect
    .poll(async () =>
      page
        .locator('.nabi-merge-scroll, .nabi-merge-source')
        .evaluateAll((elements) =>
          elements.every((element) => element.scrollTop > (element.scrollHeight - element.clientHeight) * 0.99),
        ),
    )
    .toBe(true);
  const last = lineAction(page, 'incoming', 60);
  await expect(last).toBeVisible();
  await last.click();
  expect(await remaining(page)).toBe(1);
  await expect(page.locator('.nabi-merge-content > p').nth(5)).toHaveText('Line 5: local text.');
  await expect(page.locator('.nabi-merge-content > p').nth(60)).toHaveText('Line 60: incoming text.');
  await page.evaluate(
    () => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))),
  );
  await expect
    .poll(async () =>
      page.evaluate(() => {
        const focused = document.activeElement;
        return (
          focused?.matches('.nabi-merge-content, .nabi-merge-line-action') === true &&
          focused.getClientRects().length > 0
        );
      }),
    )
    .toBe(true);
});

test('pending confirmation blocks native typing and repeated submission until it settles', async ({ page }) => {
  await page.evaluate(async (entry) => {
    const demo = (globalThis as unknown as { mergeDemo: MergeDemo }).mergeDemo;
    demo.current.unmount();
    const api = await import(/* @vite-ignore */ entry);
    const merge = await import(/* @vite-ignore */ entry.replace('/index.ts', '/merge/index.ts'));
    const source = [{ w: 'p', ch: ['Original'] }];
    let complete!: () => void;
    const mounted = merge.mountMerge({
      root: document.getElementById('merge-host')!,
      base: source,
      local: source,
      incoming: [{ w: 'p', ch: ['Incoming result'] }],
      wings: api.defaultWings,
      onConfirm: () =>
        new Promise<void>((resolve) => {
          complete = resolve;
        }),
    });
    Object.assign(globalThis, { pendingMerge: { mounted, complete: () => complete() } });
  }, coreEntry);
  const content = page.locator('.nabi-merge-content');
  await content.focus();
  await action(page, 'confirm').click();
  await expect(content).toHaveAttribute('contenteditable', 'false');
  await expect(action(page, 'confirm')).toBeDisabled();
  await content.click();
  await page.keyboard.insertText('Do not save this');
  await expect(content).toHaveText('Incoming result');
  const accepted = await page.evaluate(async () => {
    const { mounted } = (globalThis as unknown as { pendingMerge: { mounted: MergeMount } }).pendingMerge;
    return { command: mounted.nabi.applyCommand('insertText', { text: 'blocked' }), confirm: await mounted.confirm() };
  });
  expect(accepted).toEqual({ command: false, confirm: false });
  await page.evaluate(() => (globalThis as unknown as { pendingMerge: { complete(): void } }).pendingMerge.complete());
  await expect(content).toHaveAttribute('contenteditable', 'true');
  await expect(content).toHaveText('Incoming result');
  await expect(action(page, 'confirm')).toBeDisabled();
});
