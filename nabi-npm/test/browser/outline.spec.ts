import { expect, test, type Page } from '@playwright/test';
import type { OutlineAttachment, OutlineState } from '../../src/viewer/index.js';
import type { Nabi } from '../../src/index.js';

const entry = `/@fs${new URL('../../src/index.ts', import.meta.url).pathname}`;
interface Fixture {
  outline: OutlineAttachment;
  states: OutlineState[];
  nabi: Nabi;
  detachViewer: () => void;
}
async function setup(page: Page, html: string, inner = false): Promise<void> {
  await page.goto('/');
  await page.evaluate(
    async ({ entry, html, inner }) => {
      const { mountOutline } = await import(/* @vite-ignore */ entry.replace('/index.ts', '/viewer/index.ts'));
      const host = document.createElement('section');
      host.className = 'nabi';
      host.id = 'outline-host';
      host.style.cssText = '--nabi-font:Arial,sans-serif;--nabi-typeface-base:serif';
      const root = document.createElement('article');
      root.id = 'outline-content';
      root.className = 'nabi-content';
      root.style.cssText = inner ? 'height:400px;overflow:auto' : '';
      root.innerHTML = html;
      const trigger = document.createElement('button');
      trigger.id = 'outline-trigger';
      trigger.textContent = 'Contents';
      trigger.style.cssText = 'position:fixed;right:16px;bottom:16px;z-index:1000';
      host.append(root, trigger);
      document.body.prepend(host);
      const fixture = window as unknown as Fixture;
      fixture.states = [];
      fixture.outline = mountOutline(root, {
        trigger,
        locale: 'ko',
        ...(inner ? { scrollContainer: root } : {}),
        onChange: (state: OutlineState) => fixture.states.push(state),
        onAvailabilityChange: (available: boolean) => {
          trigger.hidden = !available;
        },
      });
      trigger.onclick = () => fixture.outline.toggle();
    },
    { entry, html, inner },
  );
}
const spaced =
  '<h1>First</h1><p style="height:700px">Body</p><h2>Child</h2><p style="height:700px">Body</p><h1>Last</h1><p style="height:800px">End</p>';

test('initial absence, dynamic collection, exclusions, numbering and final empty callback', async ({ page }) => {
  await setup(page, '<p>No headings</p>');
  expect(
    await page.evaluate(() => (window as unknown as Fixture).states.map((s) => [s.items.length, s.available, s.open])),
  ).toEqual([[0, false, false]]);
  await expect(page.locator('#outline-trigger')).toBeHidden();
  await page.locator('#outline-content').evaluate((root) => {
    root.innerHTML =
      '<h2>First child</h2><h1>Same</h1><h1>  </h1><details open><summary>Fold</summary><h1>Excluded</h1></details><h1 hidden>Hidden</h1><h2>Same</h2><h1>End</h1><div class="nabi-content"><h1>Other root</h1></div>';
  });
  await expect
    .poll(() =>
      page.evaluate(() =>
        (window as unknown as Fixture).outline.getItems().map((item) => [item.text, item.level, item.number]),
      ),
    )
    .toEqual([
      ['First child', 2, null],
      ['Same', 1, 1],
      ['Same', 2, null],
      ['End', 1, 2],
    ]);
  await expect(page.locator('#outline-content > h1').last()).toHaveAttribute('data-nabi-outline-number', '2');
  await expect(page.locator('#outline-content > h1').last()).toHaveCSS('font-family', 'serif');
  await page.locator('#outline-trigger').click();
  await expect(page.locator('.nabi-outline')).toBeVisible();
  await expect(page.locator('.nabi-outline')).toHaveCSS('font-family', 'Arial, sans-serif');
  await expect(page.locator('.nabi-outline-item')).toHaveCount(4);
  await page.locator('#outline-content').evaluate((root) => {
    root.innerHTML = '<p>Removed</p>';
  });
  await expect(page.locator('.nabi-outline')).toBeHidden();
  await expect(page.locator('#outline-trigger')).toBeHidden();
  expect(
    await page.evaluate(() => {
      const last = (window as unknown as Fixture).states.at(-1)!;
      return [last.items.length, last.activeIndex, last.available, last.open];
    }),
  ).toEqual([0, -1, false, false]);
});

test('pointer scrub scrolls immediately and release closes without changing the URL', async ({ page }) => {
  await setup(page, spaced);
  const url = page.url();
  await page.locator('#outline-trigger').click();
  await expect(page.locator('.nabi-outline')).toHaveAttribute('data-state', 'open');
  const first = (await page.locator('.nabi-outline-item').first().boundingBox())!;
  const last = (await page.locator('.nabi-outline-item').last().boundingBox())!;
  await page.mouse.move(first.x + 30, first.y + first.height / 2);
  await page.mouse.down();
  await page.mouse.move(last.x + 30, last.y + last.height / 2, { steps: 5 });
  await expect.poll(() => page.evaluate(() => (window as unknown as Fixture).outline.getState().activeIndex)).toBe(2);
  await expect(page.locator('.nabi-outline')).toBeVisible();
  await page.mouse.up();
  await expect(page.locator('.nabi-outline')).toBeHidden();
  expect(page.url()).toBe(url);
  expect(
    await page
      .locator('#outline-content > h1')
      .last()
      .evaluate((h) => Math.abs(h.getBoundingClientRect().top - 16)),
  ).toBeLessThan(3);
  await expect(page.locator('#outline-trigger')).toBeFocused();
});

test('long lists scroll from edges; keyboard selection and Escape work in an inner scroller', async ({ page }) => {
  await setup(
    page,
    Array.from({ length: 40 }, (_, i) => `<h1>Section ${i + 1}</h1><p style="height:200px">Body</p>`).join(''),
    true,
  );
  await page.locator('#outline-trigger').click();
  const down = page.locator('[data-nabi-outline-scroll="1"]');
  await expect(down).toBeVisible();
  await down.hover();
  await page.mouse.down();
  await expect.poll(() => page.locator('.nabi-outline-list').evaluate((list) => list.scrollTop)).toBeGreaterThan(50);
  await page.mouse.up();
  await expect(page.locator('.nabi-outline')).toBeVisible();
  await page.keyboard.press('End');
  await expect(page.locator('.nabi-outline-item').last()).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('.nabi-outline')).toBeHidden();
  await expect.poll(() => page.locator('#outline-content').evaluate((root) => root.scrollTop)).toBeGreaterThan(6000);
  await page.locator('#outline-trigger').click();
  await page.keyboard.press('Escape');
  await expect(page.locator('.nabi-outline')).toBeHidden();
});

test('editor updates stay out of JSON/HTML; cleanup permits remount and restores host attributes', async ({ page }) => {
  await page.goto('/');
  const result = await page.evaluate(async (entry) => {
    const { mountOutline } = await import(/* @vite-ignore */ entry.replace('/index.ts', '/viewer/index.ts'));
    const f = window as unknown as Fixture;
    f.nabi.setJson([
      { w: 'p', a: { h: 1 }, ch: ['One'] },
      { w: 'p', a: { h: 1 }, ch: ['Two'] },
    ]);
    const before = [f.nabi.getJson(), f.nabi.getHtml()];
    const root = document.querySelector<HTMLElement>('#content')!;
    const trigger = document.createElement('button');
    trigger.setAttribute('aria-expanded', 'mixed');
    document.body.append(trigger);
    const outline = mountOutline(root, { trigger });
    const numbers = [...root.querySelectorAll('h1')].map((h) => h.getAttribute('data-nabi-outline-number'));
    const after = [f.nabi.getJson(), f.nabi.getHtml()];
    let duplicate = false;
    try {
      mountOutline(root);
    } catch {
      duplicate = true;
    }
    outline.unmount();
    outline.unmount();
    const attrs = [
      trigger.getAttribute('aria-expanded'),
      root.hasAttribute('data-nabi-outline-root'),
      root.querySelector('[data-nabi-outline-number]'),
    ];
    mountOutline(root).unmount();
    return { before, after, numbers, duplicate, attrs };
  }, entry);
  expect(result.before).toEqual(result.after);
  expect(result.numbers).toEqual(['1', '2']);
  expect(result.duplicate).toBe(true);
  expect(result.attrs).toEqual(['mixed', false, null]);
  await expect(page.locator('.nabi-outline')).toHaveCount(0);
});

test('body scrolling reveals the current heading in the open outline without moving focus', async ({ page }) => {
  await setup(
    page,
    Array.from({ length: 40 }, (_, i) => `<h1>Heading ${i}</h1><p style="height:400px">Text</p>`).join(''),
    true,
  );
  await page.locator('#outline-trigger').click();
  for (const index of [28, 3]) {
    await page.locator('#outline-content').evaluate((root, index) => {
      const heading = root.querySelectorAll('h1')[index]!;
      root.scrollTop += heading.getBoundingClientRect().top - root.getBoundingClientRect().top - 16;
    }, index);
    await expect(page.locator(`.nabi-outline-item[data-nabi-outline-index="${index}"]`)).toHaveAttribute(
      'aria-current',
      'location',
    );
    await expect
      .poll(() =>
        page.locator('.nabi-outline-list').evaluate((list) => {
          const active = list.querySelector('[aria-current]')!.getBoundingClientRect();
          const box = list.getBoundingClientRect();
          return active.top >= box.top - 1 && active.bottom <= box.bottom + 1;
        }),
      )
      .toBe(true);
  }
  await expect(page.locator('.nabi-outline-item').first()).toBeFocused();
  await expect(page.locator('.nabi-outline')).toBeVisible();
  await page.keyboard.press('ArrowDown');
  await expect(page.locator('[data-nabi-outline-index="4"]')).toBeFocused();
  await expect(page.locator('[data-nabi-outline-index="4"]')).toHaveAttribute('aria-current', 'location');
});

test('outline edges only step from the selected heading while pressed and stop on release', async ({ page }) => {
  await setup(
    page,
    Array.from({ length: 40 }, (_, i) => `<h1>Heading ${i}</h1><p style="height:400px">Text</p>`).join(''),
    true,
  );
  await page.evaluate(() => (window as unknown as Fixture).outline.goTo(20, 'instant'));
  await page.locator('#outline-trigger').click();
  const active = () => page.evaluate(() => (window as unknown as Fixture).outline.getState().activeIndex);
  const down = page.locator('[data-nabi-outline-scroll="1"]');
  const up = page.locator('[data-nabi-outline-scroll="-1"]');
  const scrollTop = await page.locator('.nabi-outline-list').evaluate((list) => list.scrollTop);
  await down.hover();
  await page.waitForTimeout(500);
  expect(await active()).toBe(20);
  expect(await page.locator('.nabi-outline-list').evaluate((list) => list.scrollTop)).toBe(scrollTop);
  await down.click();
  await expect.poll(active).toBe(21);
  await up.click();
  await expect.poll(active).toBe(20);
  await down.hover();
  await page.evaluate(() => {
    (window as unknown as Fixture).states = [];
  });
  await page.mouse.down();
  await expect.poll(active).toBeGreaterThanOrEqual(24);
  await page.mouse.up();
  const stopped = await active();
  await page.waitForTimeout(500);
  expect(await active()).toBe(stopped);
  const visited = await page.evaluate(() => (window as unknown as Fixture).states.map((state) => state.activeIndex));
  expect(visited).toEqual(Array.from({ length: stopped - 20 }, (_, i) => 21 + i));
  await up.hover();
  await page.waitForTimeout(500);
  expect(await active()).toBe(stopped);
  await up.click();
  await expect.poll(active).toBe(stopped - 1);
  await down.focus();
  await page.keyboard.press('Enter');
  await expect.poll(active).toBe(stopped);
  await page.keyboard.press('Space');
  await expect.poll(active).toBe(stopped + 1);
  await expect(page.locator('.nabi-outline')).toBeVisible();
});

test('outline edges step through headings at the list and document boundaries without jumping', async ({ page }) => {
  await setup(page, Array.from({ length: 40 }, (_, i) => `<h1>Heading ${i}</h1><p>Text</p>`).join(''), true);
  await page.evaluate(() => (window as unknown as Fixture).outline.goTo(36, 'instant'));
  await page.locator('#outline-trigger').click();
  const active = () => page.evaluate(() => (window as unknown as Fixture).outline.getState().activeIndex);
  const down = page.locator('[data-nabi-outline-scroll="1"]');
  const up = page.locator('[data-nabi-outline-scroll="-1"]');
  await expect.poll(active).toBe(36);
  await expect(down).toHaveAttribute('aria-disabled', 'false');
  await down.click();
  await expect.poll(active).toBe(37);
  await up.click();
  await expect.poll(active).toBe(36);
  await down.hover();
  await page.mouse.down();
  await expect.poll(active).toBe(39);
  await expect(down).toHaveAttribute('aria-disabled', 'true');
  await page.mouse.up();
  await page.waitForTimeout(500);
  expect(await active()).toBe(39);
  await down.click({ force: true });
  expect(await active()).toBe(39);
  await up.click();
  await expect.poll(active).toBe(38);
});

test('viewer mounted before connection discovers headings and remains isolated from another root', async ({ page }) => {
  await setup(page, '<h1>Original</h1>');
  await page.evaluate(async (entry) => {
    const { attachViewer } = await import(/* @vite-ignore */ entry.replace('/index.ts', '/viewer/index.ts'));
    const holder = document.createElement('div');
    holder.className = 'nabi';
    holder.innerHTML = '<article class="nabi-content" id="late-root"><h1>Late</h1></article>';
    const root = holder.firstElementChild as HTMLElement;
    const viewer = attachViewer(root, { outline: {} });
    document.body.append(holder);
    (window as unknown as Fixture).detachViewer = () => viewer.unmount();
  }, entry);
  await expect(page.locator('#late-root h1')).toHaveAttribute('data-nabi-outline-number', '1');
  expect(await page.evaluate(() => (window as unknown as Fixture).outline.getItems().map((item) => item.text))).toEqual(
    ['Original'],
  );
  await page.evaluate(() => (window as unknown as Fixture).detachViewer());
  await expect(page.locator('.nabi-outline')).toHaveCount(1);
});

test.describe('touch viewport', () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true });
  test('tap opens and selects; cancellation keeps the panel open; RTL fits the viewport', async ({ page }) => {
    await setup(page, spaced);
    await page.locator('#outline-content').evaluate((root) => {
      root.setAttribute('dir', 'rtl');
    });
    await page.locator('#outline-trigger').tap();
    const panel = page.locator('.nabi-outline');
    await expect(panel).toHaveAttribute('dir', 'rtl');
    const box = (await panel.boundingBox())!;
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(390);
    await page.locator('.nabi-outline-item').last().tap();
    await expect(panel).toBeHidden();
    await page.locator('#outline-trigger').tap();
    const first = page.locator('.nabi-outline-item').first();
    await first.evaluate((element) =>
      element.addEventListener(
        'pointerdown',
        (event) => {
          element.dataset['testPointer'] = String((event as PointerEvent).pointerId);
        },
        { once: true },
      ),
    );
    await first.hover();
    await page.mouse.down();
    const pointerId = Number(await first.getAttribute('data-test-pointer'));
    await panel.dispatchEvent('pointercancel', { pointerId, isPrimary: true, pointerType: 'mouse' });
    await page.mouse.up();
    await expect(panel).toBeVisible();
  });
});

test('failed setup rolls back and heading edits update the outline without saving projection data', async ({
  page,
}) => {
  await page.goto('/');
  await page.evaluate(async (entry) => {
    const { mountOutline } = await import(/* @vite-ignore */ entry.replace('/index.ts', '/viewer/index.ts'));
    const f = window as unknown as Fixture;
    f.nabi.setJson([{ w: 'p', a: { h: 1 }, ch: ['Original'] }]);
    const root = document.querySelector<HTMLElement>('#content')!;
    try {
      mountOutline(root, {
        offset: () => {
          throw new Error('offset failure');
        },
      });
    } catch {}
    if (document.querySelector('.nabi-outline') || root.hasAttribute('data-nabi-outline-root'))
      throw new Error('Failed setup leaked DOM');
    f.outline = mountOutline(root);
  }, entry);
  await page.evaluate(() => {
    const nabi = (window as unknown as Fixture).nabi;
    const pos = { path: [0], offset: 8 };
    nabi.select({ anchor: pos, focus: pos });
    nabi.applyCommand('insertText', { text: ' changed' });
  });
  await expect
    .poll(() => page.evaluate(() => (window as unknown as Fixture).outline.getItems().map((item) => item.text)))
    .toEqual(['Original changed']);
  expect(await page.evaluate(() => (window as unknown as Fixture).nabi.getHtml())).toBe('<h1>Original changed</h1>');
  await page.evaluate(() => (window as unknown as Fixture).nabi.setJson([]));
  await expect.poll(() => page.evaluate(() => (window as unknown as Fixture).outline.getState().available)).toBe(false);
});

test('CSS numbers without an outline and diff numbers survive folding', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(async (entry) => {
    const api = await import(/* @vite-ignore */ entry);
    const diff = await import(/* @vite-ignore */ entry.replace('/index.ts', '/diff/index.ts'));
    const heading = (text: string) => ({ w: 'p', a: { h: 1 }, ch: [text] });
    const before = [
      heading('First'),
      ...Array.from({ length: 8 }, (_, i) => ({ w: 'p', ch: [`Body ${i}`] })),
      heading('Last'),
    ];
    const after = before.map((block, index) => (index === before.length - 1 ? heading('Last changed') : block));
    const { nabi, registry } = api.createNabiWith(api.defaultWings, {
      doc: [heading('First'), heading('   '), heading('Last')],
    });
    const reader = document.createElement('article');
    reader.id = 'css-reader';
    reader.className = 'nabi-content';
    reader.innerHTML = nabi.getHtml();
    const root = document.createElement('section');
    root.id = 'outline-diff';
    document.body.prepend(reader, root);
    diff.mountDiff({ root, registry, before, after });
  }, entry);
  await expect(page.locator('#css-reader h1').nth(1)).toHaveAttribute('data-nabi-heading-empty', '');
  await expect(page.locator('#css-reader h1').nth(1)).toHaveCSS('counter-increment', 'none');
  await expect(page.locator('#outline-diff .nabi-diff-doc').last().locator('h1').last()).toHaveAttribute(
    'data-nabi-outline-number',
    '2',
  );
  await expect(page.locator('#outline-diff .nabi-diff-doc').last().locator('h1').last()).toBeVisible();
});

test('preview outline paints above its scrolling card and Escape only closes the outline', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(async (entry) => {
    const api = await import(/* @vite-ignore */ entry);
    const viewer = await import(/* @vite-ignore */ entry.replace('/index.ts', '/viewer/index.ts'));
    const nabi = (window as unknown as Fixture).nabi;
    nabi.setHtml('<h1>First</h1><p>Body</p><h2>Child</h2>');
    api.openPreview({
      nabi,
      surface: document.querySelector('#content'),
      locale: 'en',
      onBody: (body: HTMLElement) => {
        const trigger = document.createElement('button');
        trigger.textContent = 'Open outline';
        trigger.style.cssText = 'position:fixed;right:16px;bottom:16px';
        body.parentElement!.append(trigger);
        const attachment = viewer.attachViewer(body, { outline: { trigger, scrollContainer: body.parentElement! } });
        trigger.onclick = () => attachment.outline.toggle();
        return () => attachment.unmount();
      },
    });
  }, entry);
  await page.getByRole('button', { name: 'Open outline' }).click();
  await expect(page.getByRole('dialog', { name: 'Contents' })).toBeVisible();
  await page.getByRole('button', { name: 'Child', exact: true }).hover();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog', { name: 'Contents' })).toBeHidden();
  await expect(page.getByRole('dialog', { name: 'Preview' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog', { name: 'Preview' })).toHaveCount(0);
});
