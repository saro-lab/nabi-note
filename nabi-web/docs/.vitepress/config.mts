import { existsSync } from 'node:fs'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { defineConfig, type HeadConfig } from 'vitepress'
import tailwindcss from '@tailwindcss/vite'

import { GA_ID } from './src/ga.ts'
import { DEFAULT_LOCALE, localeCodes, vitepressLocales } from './locales/index.ts'

// 'nabi-note' 는 아직 배포 전 프로토타입이라 dist·exports 가 없다 — npm 의존성이 아니라
// 옆 저장소(`nabi-npm/src`)의 TS 소스를 vite 가 직접 물게 한다(패키지가 exports 를
// 갖추고 발행되면 이 alias 를 걷고 진짜 의존성으로 되돌린다).
// 'nabi-note' has no dist/exports yet (pre-release prototype) — point vite straight at the
// sibling repo's TS source instead of an npm dependency (drop this alias once it ships).
const NABI_NOTE_SRC = fileURLToPath(new URL('../../../nabi-npm/src/index.ts', import.meta.url))
// 보는 쪽 엔트리(`nabi-note/viewer`)도 따로 이어 준다 — **먼저 서야 한다.** 문자열 alias 는
// 접두사로 맞으므로, 'nabi-note' 가 먼저 서면 'nabi-note/viewer' 가 그 뒤에 걸려
// `…/src/index.ts/viewer` 라는 없는 길이 된다.
// The viewer entry needs its own line, and it must come first: string aliases match by prefix
const NABI_VIEWER_SRC = fileURLToPath(new URL('../../../nabi-npm/src/viewer/index.ts', import.meta.url))
// 서버 진입점(`nabi-note/ssr`)도 같은 규칙이다 — **`nabi-note` 보다 먼저 서야 한다** (095).
const NABI_SSR_SRC = fileURLToPath(new URL('../../../nabi-npm/src/ssr.ts', import.meta.url))
// 발행 시트 — 여기만 소스가 아니라 **빌드 산출물**을 문다. 코어 시트와 wing 시트를 이어 붙이는
// 일은 빌드(`build-css.mjs`)가 하고, 호스트가 실제로 거는 것도 그 한 장이기 때문이다.
// `npm run pack:note` 가 그 빌드를 함께 돌린다.
// 다만 그 `dist/` 는 git 에 안 올라간다(루트 `.gitignore` 의 `dist`). 이 저장소만 클론해서
// 짓는 자리(Cloudflare)에는 형제 저장소의 산출물이 없으므로, 없으면 **설치된 패키지**의 것을
// 문다 — `nabi-note-*.tgz` 가 그 한 장을 그대로 들고 있다(`files: ["dist"]`).
// The sibling repo's `dist/` is gitignored, so CI clones have no such file — fall back to the
// packed dependency, which carries the same sheet.
const NABI_CSS_LOCAL = fileURLToPath(new URL('../../../nabi-npm/dist/nabi.css', import.meta.url))
const NABI_CSS = existsSync(NABI_CSS_LOCAL)
  ? NABI_CSS_LOCAL
  : createRequire(import.meta.url).resolve('nabi-note/nabi.css')

const SITE_HOST = 'https://nabi.saro.me'
const SITE_NAME = 'NABI NOTE'
const SITE_DESC = 'NABI NOTE — an open-source WYSIWYG editor.'

// 아이콘 글꼴은 **더 이상 안 받는다** (2026-08-19). 크롬의 아이콘이 전부 인라인 SVG 가 되어
// (`ui/Icon.vue`) 쓰는 자리가 하나도 안 남았다. 글꼴이 없으니 리거처 낱말이 잠깐 보였다가
// 그림으로 바뀌며 줄이 튀는 일도 없고, 남의 서버로 가는 왕복도 하나 준다.
// The icon font is gone: every chrome icon is inline SVG now, so nothing can flash or shift.
// Weights are kept narrow so the fonts stay light; `display=swap` shows system fonts meanwhile
// 무게를 좁게 잡아 글꼴 자체를 가볍게 유지한다 — `display=swap` 이라 그동안 시스템 글꼴로 그린다
const FONT_TEXT =
  'https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400..700&family=Noto+Serif:wght@400;600&family=Noto+Sans+Mono:wght@400&display=swap'

// `<link rel="stylesheet">` blocks first paint until it downloads, no matter what `display=`
// says inside it — `display` only decides how the *font file* behaves once that CSS is already
// in. Fonts.google.com is a third-party host, so every page used to wait on it before showing
// anything. The `media="print"` swap trick fetches the sheet without it counting as
// render-blocking for screen media, then `onload` flips it live the instant it lands
// `<link rel="stylesheet">` 는 안에 `display=` 가 뭐라 적혀 있든 그 시트를 받을 때까지 첫 화면을
// 막는다 — `display` 는 그 CSS 가 이미 들어온 뒤 **글꼴 파일**이 어떻게 구는지만 정한다.
// fonts.google 은 남의 서버라 지금까지 모든 문서 페이지가 그걸 기다린 뒤에야 뭔가를 그렸다.
// `media="print"` 스위치는 화면 렌더링을 막는 것으로 안 치면서도 시트를 받아 오고,
// `onload` 가 도착하는 순간 그것을 켠다
function asyncStylesheet(href: string): HeadConfig[] {
  return [
    ['link', { rel: 'stylesheet', href, media: 'print', onload: "this.media='all'" }],
    // No-JS fallback: without it a disabled-script visit never gets past `media="print"`
    // 자바스크립트가 없으면 `onload` 가 안 불려 `media="print"` 에 영원히 머문다 — 그 경우의 대비책
    ['noscript', {}, `<link rel="stylesheet" href="${href}">`],
  ]
}

// `/ko/intro` → `{ locale: 'ko', path: '/intro' }`; empty values when there is no language prefix
// 언어 접두사가 없으면 빈 값을 돌려준다
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
    // iOS home screen can't use transparency, so it gets its own PNG with a background (original/render.mjs)
    // iOS 홈 화면은 투명을 못 쓰므로 바탕을 깐 PNG 를 따로 준다 (original/render.mjs)
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
    // We ship a 1200×630 image, so the card must be large — `summary` would crop it to a square
    // 1200×630 을 실었으면 카드도 큰 것으로 — summary 로 두면 잘린 정사각형만 보인다
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['meta', { name: 'twitter:image', content: `${SITE_HOST}/og.png` }],
  ],
  sitemap: { hostname: SITE_HOST },
  // Builds canonical, hreflang, OG and JSON-LD per page
  // 페이지마다 canonical · hreflang · OG · JSON-LD 를 만들어 붙인다
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
  // 편집기 코어를 **미리 받아 둔다** (095). 안 걸면 브라우저는 hydrate 가 끝나고 데모가
  // mount 되어 `import('nabi-note')` 를 부르는 순간에야 그 조각이 필요한 줄을 안다 — 그때부터
  // 95KB(gzip)를 받으므로 그동안 데모 자리가 빈 상자로 남는다. 이 한 줄이 그 다운로드를
  // 페이지의 다른 자원과 **같은 시각에** 시작시킨다.
  //
  // **`transformHead` 로는 못 한다** — 거기 오는 `assets` 에는 페이지 조각과 정적 파일만 있고
  // 코드 분할로 난 `assets/chunks/*` 가 없다(실측). 그래서 빌드가 끝난 뒤 결과 HTML 에 직접
  // 넣는다. 힌트일 뿐이라 동작을 안 바꾸고, 조각을 못 찾으면 아무 일도 안 일어난다.
  async buildEnd(siteConfig) {
    const { readdir, readFile, writeFile } = await import('node:fs/promises')
    const { join } = await import('node:path')
    const out = siteConfig.outDir

    // 코어는 형제 저장소의 `src/` 를 alias 로 무는 탓에 조각 이름이 `src.<해시>.js` 로 난다.
    const chunkDir = join(out, 'assets', 'chunks')
    const core = (await readdir(chunkDir).catch(() => [] as string[])).find((name) =>
      /^src\.[\w-]+\.js$/.test(name),
    )
    if (!core) return
    const tag = `<link rel="modulepreload" href="/assets/chunks/${core}">`

    // 데모가 실제로 선 페이지에만 건다 — 데모 없는 문서에는 받을 까닭이 없는 95KB 다.
    // 판정은 경로 짐작이 아니라 **결과 HTML 에 데모 상자가 있는가**로 한다.
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
      // 문법 하나 = 조각 하나 (102 §2) — Shiki 의 문법 모듈마다 제 조각을 준다.
      //
      // 그냥 두면 rolldown 이 문법의 딸린 문법까지 그 조각 안에 넣는다(`includeDependenciesRecursively`
      // 의 기본값이 참이다). C++ 이 그 꼴이었다 — cpp 하나에 cpp-macro·regexp·glsl 이 얹혀 768K 였다.
      // 딸린 것을 밖에 세우면 cpp 는 492K 로 내려가 경고의 문턱(500K) 아래가 되고, 실제로 받는
      // 바이트도 그대로다(필요한 딸린 문법만 따로 받는다). `<script>` 를 품은 html 처럼 남의 문법을
      // 무는 것들이 그 조각을 나눠 쓰는 것도 이 모양이라야 보인다.
      //
      // 남는 경고 하나는 emacs-lisp(776K)다 — **그건 딸린 것 없는 모듈 한 덩어리**라 어떤 번들러도
      // 못 쪼갠다. 문턱을 올려 덮지 않고 남겨 둔다: 그래야 진짜로 무거운 조각이 새로 생길 때 잡힌다.
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
    // 문자열 alias 는 접두사로 맞는다 — 긴 이름이 먼저 서야 한다(`nabi-note` 가 앞서면
    // `…/src/index.ts/nabi.css` 같은 없는 길이 된다).
    resolve: {
      alias: {
        'nabi-note/viewer': NABI_VIEWER_SRC,
        'nabi-note/nabi.css': NABI_CSS,
        'nabi-note/ssr': NABI_SSR_SRC,
        'nabi-note': NABI_NOTE_SRC,
      },
    },
  },
})
