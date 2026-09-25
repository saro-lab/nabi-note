import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { ICON_CSS } from '../../src/style/icon-css.js';
import { renderViewToolsHtml } from '../../src/wing/toolbar-html.js';

const entry = `/@fs${new URL('../../src/index.ts', import.meta.url).pathname}`;

test('external CSS resolves packaged images beside the stylesheet with a base URL', async ({ page }) => {
  const css = ICON_CSS.replace(/url\("file:[^"]*\/icons\/([^"/]+)"\)/g, 'url("./icons/$1")');
  await page.route('**/theme-assets/nabi.css', (route) => route.fulfill({ contentType: 'text/css', body: css }));
  await page.route('**/theme-assets/icons/*.svg*', (route) => {
    const name = new URL(route.request().url()).pathname.split('/').at(-1)!;
    return route.fulfill({
      contentType: 'image/svg+xml',
      body: readFileSync(new URL(`../../src/style/icons/${name}`, import.meta.url)),
    });
  });
  await page.goto('/');
  await page.addStyleTag({ url: '/theme-assets/nabi.css' });
  await page.evaluate((html) => {
    const base = document.createElement('base');
    base.href = '/nested/base/';
    document.head.prepend(base);
    const root = document.createElement('div');
    root.id = 'external-icons';
    root.className = 'nabi';
    root.innerHTML = html;
    document.body.prepend(root);
  }, renderViewToolsHtml());
  const icon = page.locator('#external-icons [data-nabi-icon="view-preview"]');
  await expect(icon).toHaveCSS('background-image', /\/theme-assets\/icons\/preview\.svg/);
  const width = await icon.evaluate(async (el) => {
    const image = new Image();
    image.src = getComputedStyle(el).backgroundImage.slice(5, -2);
    await image.decode();
    return image.naturalWidth;
  });
  expect(width).toBeGreaterThan(0);
});

test('SVG and WebP themes stay isolated and follow open panels', async ({ page }) => {
  await page.route('**/theme-*.svg', (route) =>
    route.fulfill({
      contentType: 'image/svg+xml',
      body: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><circle cx="8" cy="8" r="7" fill="red"/></svg>',
    }),
  );
  await page.goto('/');
  const webp = readFileSync(new URL('./fixtures/theme.webp', import.meta.url));
  await page.route('**/theme-*.webp', (route) => route.fulfill({ contentType: 'image/webp', body: webp }));
  await page.evaluate(async (entry) => {
    const api = await import(/* @vite-ignore */ entry);
    const style = document.createElement('style');
    style.textContent =
      '.theme-a { --nabi-icon-view-preview:url("/theme-a.svg"); --nabi-icon-panel-preview-close:url("/theme-a.webp"); } .theme-b { --nabi-icon-view-preview:url("/theme-b.webp"); --nabi-icon-panel-preview-close:url("/theme-b.svg"); }';
    document.head.append(style);
    for (const id of ['a', 'b']) {
      const root = document.createElement('div');
      root.id = `icon-${id}`;
      root.className = `nabi theme-${id}`;
      root.innerHTML = '<div class="tools"></div><div class="nabi-content">Theme test</div>';
      document.body.prepend(root);
      const { nabi } = api.createNabiWith(api.defaultWings);
      api.mountViewTools({
        nabi,
        root,
        surface: root.querySelector('.nabi-content'),
        container: root.querySelector('.tools'),
      });
    }
  }, entry);
  const previewA = page.locator('#icon-a [data-nabi-icon="view-preview"]');
  const previewB = page.locator('#icon-b [data-nabi-icon="view-preview"]');
  await expect(previewA).toHaveCSS('background-image', /theme-a\.svg/);
  await expect(previewB).toHaveCSS('background-image', /theme-b\.webp/);
  await page.locator('#icon-a [data-name="preview"]').click();
  const close = page.locator('.nabi-scrim [data-nabi-icon="panel-preview-close"]');
  await expect(close).toHaveCSS('background-image', /theme-a\.webp/);
  await page.locator('#icon-a').evaluate((root) => {
    root.setAttribute('class', 'nabi theme-b');
  });
  await expect(close).toHaveCSS('background-image', /theme-b\.svg/);
  await page.locator('#icon-a').evaluate((root) => {
    root.setAttribute('class', 'nabi');
    root.setAttribute('data-nabi-theme', 'dark');
  });
  await expect(close).toHaveCSS('background-image', /close-dark\.svg/);
  await close.locator('..').click();
  await expect(close).toHaveCount(0);
  await page.locator('#icon-a [data-name="fullscreen"]').click();
  await expect(page.locator('#icon-a')).toHaveClass(/is-fullscreen/);
  await expect(page.locator('#icon-a [data-nabi-icon="view-fullscreen-exit"]')).toHaveCSS(
    'background-image',
    /fullscreen-exit-dark\.svg/,
  );
  await page.locator('#icon-a [data-name="fullscreen"]').click();
  const images = await page.evaluate(async () => {
    return Promise.all(
      ['/theme-a.svg', '/theme-b.webp'].map(async (url) => {
        const image = new Image();
        image.src = url;
        await image.decode();
        return image.naturalWidth;
      }),
    );
  });
  expect(images.every((width) => width > 0)).toBe(true);
});

test('legacy SVG retains currentColor and CSS replaces it with a file', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(async (entry) => {
    const api = await import(/* @vite-ignore */ entry.replace('/index.ts', '/style/icon.ts'));
    const root = document.createElement('div');
    root.id = 'legacy-icon';
    root.className = 'nabi';
    root.style.color = 'rgb(12, 34, 56)';
    root.innerHTML = api.iconHtml('toolbar-custom', undefined, '<path d="M2 2h12v12H2Z"/>');
    document.body.prepend(root);
  }, entry);
  const icon = page.locator('#legacy-icon .nabi-icon');
  await expect(icon.locator('svg')).toHaveCSS('stroke', 'rgb(12, 34, 56)');
  await expect(icon).toHaveCSS('content', 'normal');
  await page.locator('#legacy-icon').evaluate((root) => {
    (root as HTMLElement).style.setProperty('--nabi-icon-toolbar-custom', 'url("/nabi-note.svg")');
  });
  await expect(icon).toHaveCSS('content', /nabi-note\.svg/);
  await expect(icon).toHaveCSS('width', '16px');
  await expect(icon.locator('svg')).not.toBeVisible();
});

test('viewer states and standalone diff use the same theme variables', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(async (entry) => {
    const api = await import(/* @vite-ignore */ entry);
    const viewer = await import(/* @vite-ignore */ entry.replace('/index.ts', '/viewer/index.ts'));
    const diff = await import(/* @vite-ignore */ entry.replace('/index.ts', '/diff/index.ts'));
    document.documentElement.className = 'light';
    const root = document.createElement('div');
    root.className = 'nabi';
    root.setAttribute('data-nabi-theme', 'dark');
    root.innerHTML =
      '<article id="icon-viewer" class="nabi-content"><table data-nabi-sortable><tr><th>A</th></tr><tr><td>2</td></tr><tr><td>1</td></tr></table></article>';
    document.body.prepend(root);
    viewer.attachTableSort(root.querySelector('article'));
    const diffRoot = document.createElement('div');
    diffRoot.id = 'icon-diff';
    diffRoot.style.setProperty('--nabi-icon-diff-fold', 'url("/custom-diff.webp")');
    document.body.prepend(diffRoot);
    diff.mountDiff({
      root: diffRoot,
      registry: api.makeRegistry(api.defaultWings),
      before: [{ w: 'p', ch: ['a'] }],
      after: [{ w: 'p', ch: ['b'] }],
    });
  }, entry);
  const sort = page.locator('#icon-viewer .nabi-sort');
  await expect(sort.locator('.nabi-icon')).toHaveCSS('background-image', /sort-original-dark\.svg/);
  await sort.click();
  await expect(sort.locator('.nabi-icon')).toHaveAttribute('data-nabi-icon', 'viewer-sort-descending');
  await expect(sort.locator('.nabi-icon')).toHaveCSS('background-image', /sort-descending-dark\.svg/);
  await sort.click();
  await expect(sort.locator('.nabi-icon')).toHaveAttribute('data-nabi-icon', 'viewer-sort-ascending');
  await expect(page.locator('#icon-diff [data-nabi-icon="diff-fold"]')).toHaveCSS(
    'background-image',
    /custom-diff\.webp/,
  );
  const fold = page.locator('#icon-diff [data-nabi-icon="diff-fold"]').locator('..');
  await fold.click();
  await expect(fold).toHaveAttribute('aria-pressed', 'true');
});

test('hidden controls do not fetch their custom images', async ({ page }) => {
  await page.goto('/');
  const requests: string[] = [];
  page.on('request', (request) => {
    if (request.url().includes('hidden-icon')) requests.push(request.url());
  });
  await page.evaluate(async (entry) => {
    const api = await import(/* @vite-ignore */ entry);
    const root = document.createElement('div');
    root.id = 'hidden-icons';
    root.className = 'nabi';
    root.style.cssText =
      '--nabi-icon-view-preview:url("/hidden-icon-preview.svg");--nabi-icon-view-fullscreen-enter:url("/hidden-icon-fullscreen.webp")';
    root.innerHTML = '<div class="tools"></div><div class="nabi-content"></div>';
    document.body.prepend(root);
    const { nabi } = api.createNabiWith(api.defaultWings);
    api.mountViewTools({
      nabi,
      root,
      surface: root.querySelector('.nabi-content'),
      container: root.querySelector('.tools'),
      showPreview: false,
      showFullscreen: false,
    });
    await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
  }, entry);
  await expect(page.locator('#hidden-icons .nabi-tools')).toHaveCount(0);
  expect(requests).toEqual([]);
});
