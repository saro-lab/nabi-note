import { DEFAULT_LOCALE, localeCodes, type LocaleCode } from '../docs/.vitepress/locales/codes.ts'

// 언어 없는 주소(/intro)는 예전엔 404 후 스크립트가 옮겨 크롤러엔 죽은 페이지였다 — 이 워커가 엣지 302로 바꾼다.
// A language-less URL used to 404 then bounce via client script, invisible to crawlers; this worker does an edge 302 instead.
// 워커는 자산이 없을 때만 불린다(wrangler.jsonc의 not_found_handling: "none").
// The worker only runs when no asset matched (wrangler.jsonc's not_found_handling: "none").

interface Env {
  ASSETS: { fetch(request: Request): Promise<Response> }
}

const LANG_COOKIE = 'lang'

function isLocaleCode(code: string): code is LocaleCode {
  return (localeCodes as string[]).includes(code)
}

// 쿠키 → Accept-Language → 기본값 — 브라우저의 src/langs.ts와 같은 차례여야 어긋나 두 번 안 움직인다.
// Cookie → Accept-Language → default, same order as src/langs.ts, or the script bounces a second time.
function preferredLocale(request: Request): LocaleCode {
  const cookie = new RegExp(`(?:^|;\\s*)${LANG_COOKIE}=([^;]*)`).exec(request.headers.get('cookie') ?? '')
  const saved = cookie ? decodeURIComponent(cookie[1]) : ''
  if (isLocaleCode(saved)) {
    return saved
  }

  // `ko-KR,ko;q=0.9,en;q=0.8` 형식을 품질값 순으로 본다 — 크롤러는 이 머리가 없어 기본값(en)으로 간다.
  // Parses `ko-KR,ko;q=0.9,en;q=0.8` by quality; crawlers send none of this and land on the default.
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

// 진짜로 없는 문서 — 자산 쪽 not_found_handling을 껐으므로(워커가 대신 서려고) 여기서 404로 직접 낸다.
// A genuinely missing page: not_found_handling is off on the asset side, so this serves the 404 itself.
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

    // 언어가 이미 붙어 있는데도 못 찾았다면 정말 없는 문서다 — 또 옮기면 한 번 더 헛돈다.
    // A missing page under an existing language prefix is simply missing; redirecting it again just loops.
    if (isLocaleCode(first) || (request.method !== 'GET' && request.method !== 'HEAD')) {
      return notFound(request, env)
    }

    // cleanUrls라 문서 주소엔 꼬리 빗금이 없다 — 여기서 미리 떼어 자산 서버의 301 한 번을 줄인다.
    // Docs URLs carry no trailing slash (cleanUrls); trimmed here to skip a second redirect hop.
    const target = new URL(url)
    target.pathname = `/${preferredLocale(request)}${url.pathname.replace(/\/+$/, '')}`

    // 있는 쪽으로만 보낸다 — 없는 주소를 그대로 보내면 고치려던 죽은 링크가 한 걸음 뒤로 밀릴 뿐이다.
    // Only redirect to something that exists, or the dead end this fixes just moves one hop later.
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
