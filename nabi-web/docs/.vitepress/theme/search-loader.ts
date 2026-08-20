import { createContentLoader } from 'vitepress'

// One index per language, built at build time — the pages are rendered anyway, so the words are
// already there. Nothing is fetched at runtime and no service indexes this site from outside.
// 언어마다 색인 하나를, 빌드할 때 짓는다 — 어차피 페이지를 그리는 김에 낱말이 나온다.
// 실행 중에 무엇을 받아 오지도 않고, 바깥 서비스가 이 사이트를 훑지도 않는다.

// Tags out, entities back to characters: what is left is what a reader would read aloud.
// 태그는 걷고 엔티티는 글자로 돌린다 — 남는 것은 읽는 사람이 소리 내어 읽을 그것이다.
function clean(html?: string): string {
  return (
    html
      ?.replace(/<[^>]+>/g, ' ')
      .replace(/&#8203;|​/g, '')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, ' ')
      .replace(/\s+/g, ' ')
      .trim() || ''
  )
}

export interface SearchDoc {
  readonly id: string
  readonly title: string
  readonly text: string
}

export function localeIndex(locale: string) {
  return createContentLoader(`${locale}/**/*.md`, {
    includeSrc: false,
    render: true,
    transform(raw): SearchDoc[] {
      return raw.map(({ url, frontmatter, html }) => {
        const firstHeading = clean(html?.match(/<h1[^>]*>(.*?)<\/h1>/i)?.[1])
        return {
          id: url,
          title: clean(frontmatter.title as string | undefined) || firstHeading || 'NABI NOTE',
          text: clean(html),
        }
      })
    },
  })
}
