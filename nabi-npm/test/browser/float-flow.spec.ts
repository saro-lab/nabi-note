import { expect, test } from '@playwright/test';
import type { Nabi } from '../../src/index.js';

for (const side of ['left', 'right']) {
  for (const dark of [false, true]) {
    test(`headings and structural blocks flow beside a ${side} float in ${dark ? 'dark' : 'light'} editor and viewer`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: 1280, height: 1050 });
      await page.goto('/float.html');
      await page.evaluate(
        ({ side, dark }) => {
          document.documentElement.classList.toggle('dark', dark);
          const p = (text: string) => ({ w: 'p', ch: [text] });
          (globalThis as unknown as { nabi: Nabi }).nabi.setJson([
            {
              w: 'p',
              ch: [{ w: 'float', a: { side, w: 30 }, ch: Array.from({ length: 40 }, (_, i) => p(`Float line ${i}`)) }],
            },
            ...Array.from({ length: 6 }, (_, i) => ({ w: 'p', a: { h: i + 1 }, ch: [`Heading ${i + 1}`] })),
            {
              w: 'p',
              ch: [
                {
                  w: 'table',
                  ch: [
                    {
                      w: 'tr',
                      ch: Array.from({ length: 18 }, (_, i) => ({ w: 'td', ch: [p(`Column-${i}-content`)] })),
                    },
                  ],
                },
              ],
            },
            { w: 'p', ch: [{ w: 'code', ch: ['const longLine = "' + 'code '.repeat(90) + '";'] }] },
            { w: 'p', ch: [{ w: 'hr', ch: [] }] },
            p('Following text'),
            { w: 'p', ch: [{ w: 'float', a: { side, w: 30 }, ch: [p('Next float')] }] },
          ]);
        },
        { side, dark },
      );
      const read = () =>
        page.evaluate(() =>
          ['#content', '#reader'].map((selector) => {
            const root = document.querySelector<HTMLElement>(selector)!;
            const blocks = [...root.children];
            const box = (el: Pick<Element, 'getBoundingClientRect'>) => {
              const rect = el.getBoundingClientRect();
              return { top: rect.top, bottom: rect.bottom, left: rect.left, right: rect.right };
            };
            const range = document.createRange();
            const headingText = root.querySelector('h1')!.firstChild!;
            range.selectNodeContents(headingText);
            return {
              float: box(blocks[0]),
              headings: blocks.slice(1, 7).map(box),
              headingText: box(range),
              structures: blocks.slice(7, 10).map(box),
              following: box(blocks[10]),
              nextFloat: box(blocks[11]),
              width: root.clientWidth,
              scroll: root.scrollWidth,
              floatStyle: getComputedStyle(blocks[0]).float,
            };
          }),
        );
      for (const geometry of await read()) {
        expect(geometry.floatStyle).toBe(side);
        for (const block of [...geometry.headings, ...geometry.structures, geometry.following]) {
          expect(block.top).toBeLessThan(geometry.float.bottom);
        }
        for (const block of [geometry.headingText, ...geometry.structures]) {
          if (side === 'left') expect(block.left).toBeGreaterThanOrEqual(geometry.float.right);
          else expect(block.right).toBeLessThanOrEqual(geometry.float.left);
        }
        expect(geometry.nextFloat.top).toBeGreaterThanOrEqual(geometry.float.bottom);
        expect(geometry.scroll).toBeLessThanOrEqual(geometry.width + 1);
      }
      await page.getByRole('button', { name: '좁은 본문', exact: true }).click();
      await expect(page.locator('#content > [data-nabi-p]').first()).toHaveCSS('float', 'none');
      await expect(page.locator('#reader > [data-nabi-p]').first()).toHaveCSS('float', 'none');
      for (const geometry of await read()) {
        expect(geometry.floatStyle).toBe('none');
        expect(geometry.headings[0].top).toBeGreaterThanOrEqual(geometry.float.bottom);
        expect(geometry.scroll).toBeLessThanOrEqual(geometry.width + 1);
      }
      await page.getByRole('button', { name: '좁은 본문', exact: true }).click();
      await page.emulateMedia({ media: 'print' });
      await expect(page.locator('#content > [data-nabi-p]').first()).toHaveCSS('float', 'none');
      await expect(page.locator('#reader > [data-nabi-p]').first()).toHaveCSS('float', 'none');
      for (const geometry of await read()) {
        expect(geometry.floatStyle).toBe('none');
        expect(geometry.headings[0].top).toBeGreaterThanOrEqual(geometry.float.bottom);
      }
    });
  }
}
