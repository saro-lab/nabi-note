import { existsSync } from 'node:fs'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { defineConfig, type HeadConfig } from 'vitepress'
import tailwindcss from '@tailwindcss/vite'

import { GA_ID } from './src/ga.ts'
import { DEFAULT_LOCALE, localeCodes, vitepressLocales } from './locales/index.ts'

// nabi-note 는 아직 dist·exports 없는 프로토타입이라 vite가 옆 저장소 TS 소스를 직접 문다.
// nabi-note has no dist/exports yet, so vite points straight at the sibling repo's TS source.
const NABI_NOTE_SRC = fileURLToPath(new URL('../../../nabi-npm/src/index.ts', import.meta.url))
// 문자열 alias는 접두사로 맞으므로, 아래 셋은 'nabi-note' 보다 먼저 서야 한다.
// String aliases match by prefix, so these three must precede 'nabi-note' below.
const NABI_VIEWER_SRC = fileURLToPath(new URL('../../../nabi-npm/src/viewer/index.ts', import.meta.url))
const NABI_DIFF_SRC = fileURLToPath(new URL('../../../nabi-npm/src/diff/index.ts', import.meta.url))
const NABI_SSR_SRC = fileURLToPath(new URL('../../../nabi-npm/src/ssr.ts', import.meta.url))
// 형제 저장소의 dist/ 는 git에 안 올라가 CI엔 없으니, 없으면 설치된 패키지 것으로 대체한다.
// The sibling repo's dist/ is gitignored and missing in CI, so this falls back to the packed dep.
const NABI_CSS_LOCAL = fileURLToPath(new URL('../../../nabi-npm/dist/nabi.css', import.meta.url))
const NABI_CSS = existsSync(NABI_CSS_LOCAL)
  ? NABI_CSS_LOCAL
  : createRequire(import.meta.url).resolve('nabi-note/nabi.css')

const SITE_HOST = 'https://nabi.saro.me'
const SITE_NAME = 'NABI NOTE'
const SITE_DESC = 'NABI NOTE — an open-source WYSIWYG editor.'

// 아이콘 글꼴은 안 쓴다 — 크롬 아이콘이 전부 인라인 SVG라(ui/Icon.vue) 받을 이유가 없다.
// No icon font: every chrome icon is inline SVG now (ui/Icon.vue), so nothing is left to load.
const FONT_TEXT =
  'https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400..700&family=Noto+Serif:wght@400;600&family=Noto+Sans+Mono:wght@400&display=swap'

// media=print로 받아 렌더링을 안 막고, onload 때 all로 바꿔 남의 서버 대기 없이 첫 화면을 그린다.
// The media=print swap fetches without blocking render; onload flips it live once it lands.
function asyncStylesheet(href: string): HeadConfig[] {
  return [
    ['link', { rel: 'stylesheet', href, media: 'print', onload: "this.media='all'" }],
    // JS 없으면 onload가 안 불려 media=print에 머무르니, noscript로 대비한다.
    // Without JS, onload never fires, so this noscript link covers that case.
    ['noscript', {}, `<link rel="stylesheet" href="${href}">`],
  ]
}

// `/ko/intro` → `{ locale: 'ko', path: '/intro' }`, 접두사가 없으면 둘 다 빈 문자열이다.
// `/ko/intro` → `{ locale: 'ko', path: '/intro' }`; empty strings when there is no locale prefix.
function splitLocale(relativePath: string): { locale: string; path: string } {
  const [first, ...rest] = relativePath.replace(/\.md$/, '').split('/')
  if (!localeCodes.includes(first as never)) {
    return { locale: '', path: '' }
  }
  return { locale: first, path: rest.length ? `/${rest.join('/')}` : '' }
}

export default defineConfig({
  title: SITE_NAME,
  titleTemplate: `:title | ${SITE_NAME}`,
  description: SITE_DESC,
  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/nabi-note.svg' }],
    // iOS 홈 화면은 투명을 못 쓰므로 바탕을 깐 PNG를 따로 준다(original/render.mjs).
    // iOS home screen can't use transparency, so it gets its own PNG with a background.
    ['link', { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.googleapis.com' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' }],
    ...asyncStylesheet(FONT_TEXT),
    ['script', { async: '', src: `https://www.googletagmanager.com/gtag/js?id=${GA_ID}` }],
    ['meta', { name: 'viewport', content: 'width=device-width,initial-scale=1,interactive-widget=resizes-content' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:site_name', content: SITE_NAME }],
    ['meta', { property: 'og:image', content: `${SITE_HOST}/og.png` }],
    ['meta', { property: 'og:image:type', content: 'image/png' }],
    ['meta', { property: 'og:image:width', content: '1200' }],
    ['meta', { property: 'og:image:height', content: '630' }],
    // 1200×630 이미지라 카드도 큰 것으로 — summary 로 두면 잘린 정사각형만 보인다.
    // We ship a 1200×630 image, so the card must be large, or summary crops it to a square.
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['meta', { name: 'twitter:image', content: `${SITE_HOST}/og.png` }],
  ],
  sitemap: { hostname: SITE_HOST },
  // 페이지마다 canonical · hreflang · OG · JSON-LD 를 만들어 붙인다.
  // Builds canonical, hreflang, OG and JSON-LD per page.
  transformPageData(pageData) {
    if (pageData.relativePath === '404.md') {
      pageData.title = SITE_NAME
      pageData.titleTemplate = false
    }

    if (!pageData.title) {
      pageData.titleTemplate = false
    }

    const { locale, path } = splitLocale(pageData.relativePath)
    const url = locale ? `${SITE_HOST}/${locale}${path}` : SITE_HOST
    const title = pageData.title ? `${pageData.title} | ${SITE_NAME}` : SITE_NAME
    const description = pageData.description || SITE_DESC

    const head: HeadConfig[] = [
      ['link', { rel: 'canonical', href: url }],
      ['meta', { property: 'og:url', content: url }],
    ]

    if (locale) {
      for (const code of localeCodes) {
        head.push(['link', { rel: 'alternate', hreflang: code, href: `${SITE_HOST}/${code}${path}` }])
      }
      head.push(['link', { rel: 'alternate', hreflang: 'x-default', href: `${SITE_HOST}/${DEFAULT_LOCALE}${path}` }])
    }

    if (pageData.title) {
      head.push(
        ['meta', { property: 'og:title', content: title }],
        ['meta', { name: 'twitter:title', content: title }],
      )
    }
    if (pageData.description) {
      head.push(
        ['meta', { property: 'og:description', content: description }],
        ['meta', { name: 'twitter:description', content: description }],
      )
    }

    head.push([
      'script',
      { type: 'application/ld+json' },
      JSON.stringify({
        '@context': 'https://schema.org',
        '@type': locale ? 'TechArticle' : 'WebSite',
        name: title,
        url,
        description,
        inLanguage: locale || DEFAULT_LOCALE,
        publisher: { '@type': 'Organization', name: SITE_NAME, url: SITE_HOST },
      }),
    ])

    pageData.frontmatter.head = [...(pageData.frontmatter.head ?? []), ...head]
  },
  // transformHead의 assets엔 코드 분할 청크가 안 잡혀, 빌드 후 HTML에 직접 modulepreload를 심는다.
  // transformHead's assets omit code-split chunks, so this injects modulepreload after the build instead.
  async buildEnd(siteConfig) {
    const { readdir, readFile, writeFile } = await import('node:fs/promises')
    const { join } = await import('node:path')
    const out = siteConfig.outDir

    // 코어는 alias로 형제 저장소 src/ 를 물기 때문에 청크 이름이 src.<해시>.js 로 난다.
    // The core aliases the sibling repo's src/, so its chunk is named src.<hash>.js.
    const chunkDir = join(out, 'assets', 'chunks')
    const core = (await readdir(chunkDir).catch(() => [] as string[])).find((name) =>
      /^src\.[\w-]+\.js$/.test(name),
    )
    if (!core) return
    const tag = `<link rel="modulepreload" href="/assets/chunks/${core}">`

    // 데모 있는 페이지에만 미리 받게 하며, 결과 HTML에 데모 상자가 있는지로 판정한다.
    // Only pages with the demo get the preload; detection checks the built HTML for the demo box.
    const walk = async (dir: string): Promise<string[]> => {
      const found: string[] = []
      for (const item of await readdir(dir, { withFileTypes: true })) {
        const full = join(dir, item.name)
        if (item.isDirectory()) found.push(...(await walk(full)))
        else if (item.name.endsWith('.html')) found.push(full)
      }
      return found
    }

    let touched = 0
    for (const file of await walk(out)) {
      const html = await readFile(file, 'utf8')
      if (!html.includes('demo-host') || html.includes(tag)) continue
      await writeFile(file, html.replace('</head>', `${tag}</head>`))
      touched += 1
    }
    console.log(`[modulepreload] 편집기 코어를 ${touched} 쪽에 미리 걸었다 — ${core}`)
  },
  locales: vitepressLocales,
  appearance: true,
  cleanUrls: true,
  vite: {
    plugins: [tailwindcss() as never],
    build: {
      target: 'esnext',
      // Shiki 문법마다 조각을 나누되 딸린 문법은 안 묶는다 — cpp 하나가 768K로 붇는 걸 막는다.
      // Each Shiki grammar gets its own chunk without pulling in dependents, keeping cpp under 500K.
      rolldownOptions: {
        output: {
          codeSplitting: {
            groups: [
              {
                name: (id: string) => {
                  const m = /@shikijs[\\/]langs[\\/]dist[\\/]([^\\/]+)\.mjs$/.exec(id)
                  return m ? `lang-${m[1]}` : null
                },
                includeDependenciesRecursively: false,
              },
            ],
          },
        },
      },
    },
    // 문자열 alias는 접두사로 맞으므로, 긴 이름(viewer/diff/nabi.css/ssr)이 nabi-note 보다 먼저 온다.
    // String aliases match by prefix, so the longer names must precede plain 'nabi-note' here.
    resolve: {
      alias: {
        'nabi-note/viewer': NABI_VIEWER_SRC,
        'nabi-note/diff': NABI_DIFF_SRC,
        'nabi-note/nabi.css': NABI_CSS,
        'nabi-note/ssr': NABI_SSR_SRC,
        'nabi-note': NABI_NOTE_SRC,
      },
    },
  },
})
