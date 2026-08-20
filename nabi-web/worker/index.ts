import { DEFAULT_LOCALE, localeCodes, type LocaleCode } from '../docs/.vitepress/locales/codes.ts'

// 문서는 전부 언어 폴더 안에 있다(`/ko/intro`). 그래서 언어 없이 들어온 주소(`/intro`)는
// 정적 자산에 없고, 예전에는 **404 페이지가 200 대신 404 로 나간 뒤** 그 페이지의 스크립트가
// 뒤늦게 `/ko/intro` 로 옮겼다. 사람 눈에는 깜빡임이었지만, 스크립트를 안 돌리는 쪽(크롤러·
// 링크 미리보기·AI 스크래퍼)에는 그냥 **없는 쪽**이었다 — 실제로 README 가 가리키는 주소가
// 전부 그 꼴이었다. 이 워커가 그 자리를 엣지에서 302 로 바꾼다: 기계는 리다이렉트를 따라가
// 200 을 받고, 사람은 한 걸음에 제 언어로 간다.
//
// Docs live under language folders, so a language-less URL (`/intro`) used to answer 404 and only
// then bounce via client script — invisible to crawlers, which saw a dead page. This worker turns
// that into an edge 302 instead.
//
// 워커는 **자산이 없을 때만** 불린다 (`wrangler.jsonc` 의 `not_found_handling: "none"`).
// The worker only runs when no asset matched.

interface Env {
  ASSETS: { fetch(request: Request): Promise<Response> }
}

const LANG_COOKIE = 'lang'

function isLocaleCode(code: string): code is LocaleCode {
  return (localeCodes as string[]).includes(code)
}

// 쿠키 → Accept-Language → 기본값. 브라우저에서 도는 `src/langs.ts` 의 차례와 같아야 한다 —
// 어긋나면 워커가 보낸 곳에서 스크립트가 다시 다른 곳으로 옮겨 두 번 움직인다.
// Same order as `src/langs.ts` in the browser: mismatch would make the script bounce again.
function preferredLocale(request: Request): LocaleCode {
  const cookie = new RegExp(`(?:^|;\\s*)${LANG_COOKIE}=([^;]*)`).exec(request.headers.get('cookie') ?? '')
  const saved = cookie ? decodeURIComponent(cookie[1]) : ''
  if (isLocaleCode(saved)) {
    return saved
  }

  // `ko-KR,ko;q=0.9,en;q=0.8` — 품질값 차례로 본다. 크롤러는 이 머리를 대개 안 보내므로
  // 자연히 기본값(en)으로 간다.
  // Crawlers usually send no Accept-Language at all, so they land on the default.
  const header = request.headers.get('accept-language') ?? ''
  const tags = header
    .split(',')
    .map((part) => {
      const [tag, ...params] = part.trim().split(';')
      const q = params.map((p) => /^\s*q=([\d.]+)/.exec(p)?.[1]).find(Boolean)
      return { tag: (tag || '').split('-')[0].toLowerCase(), q: q ? Number(q) : 1 }
    })
    .filter((entry) => entry.tag !== '' && !Number.isNaN(entry.q))
    .sort((a, b) => b.q - a.q)

  for (const { tag } of tags) {
    if (isLocaleCode(tag)) {
      return tag
    }
  }
  return DEFAULT_LOCALE
}

// 진짜로 없는 문서 — 사이트의 404 페이지를 **404 로** 준다. 자산 쪽 `not_found_handling` 을
// 껐으므로(워커가 대신 서려고) 이 페이지는 여기서 직접 집어 온다.
// A genuinely missing page: serve the site's 404 document with a 404 status.
async function notFound(request: Request, env: Env): Promise<Response> {
  const page = await env.ASSETS.fetch(new Request(new URL('/404.html', request.url), { method: 'GET' }))
  return new Response(request.method === 'HEAD' ? null : page.body, {
    status: 404,
    headers: {
      'content-type': page.headers.get('content-type') ?? 'text/html; charset=utf-8',
      'cache-control': 'no-store',
    },
  })
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)
    const first = url.pathname.split('/')[1] ?? ''

    // 언어가 이미 붙어 있는데도 못 찾았다면 그건 정말 없는 문서다 — 옮기지 않는다
    // (`/ko/없는쪽` 을 `/en/ko/없는쪽` 으로 보내면 그것도 없어서 한 번 더 헛돈다).
    // A missing page under an existing language prefix is simply missing.
    if (isLocaleCode(first) || (request.method !== 'GET' && request.method !== 'HEAD')) {
      return notFound(request, env)
    }

    // `cleanUrls` 라 문서 주소에는 꼬리 빗금이 없다 — 붙어 온 것을 그대로 이어 보내면
    // 자산 서버가 한 번 더 301 로 다듬는다. 여기서 미리 떼어 한 걸음을 줄인다.
    // Docs URLs carry no trailing slash (`cleanUrls`), so trim it here instead of paying a second hop.
    const target = new URL(url)
    target.pathname = `/${preferredLocale(request)}${url.pathname.replace(/\/+$/, '')}`

    // 있는 쪽으로만 보낸다. 없는 주소를 그대로 언어 폴더에 붙여 보내면 리다이렉트 끝에
    // 404 가 서서, 고치려던 그 모양(기계가 보는 죽은 링크)이 한 걸음 뒤로 밀릴 뿐이다.
    // Only redirect to something that exists, or the dead end just moves one hop later.
    // 자산 서버는 `/ko/intro/` 같은 꼬리 빗금을 스스로 301 로 다듬으므로 400 미만이면 있는 것이다.
    // The asset server 301s trailing slashes itself, so anything under 400 counts as present.
    const probe = await env.ASSETS.fetch(new Request(target, { method: 'HEAD' }))
    if (probe.status >= 400) {
      return notFound(request, env)
    }

    return new Response(null, {
      status: 302,
      headers: {
        location: target.pathname + target.search,
        // 읽는 사람마다 가는 곳이 다르다 — 중간 캐시가 한 사람의 언어를 남에게 물려주면 안 된다.
        // The target varies per reader, so no shared cache may reuse one reader's language.
        vary: 'Accept-Language, Cookie',
        'cache-control': 'no-store',
      },
    })
  },
}
