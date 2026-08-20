// Import this module dynamically only — Shiki is browser-side and VitePress pre-renders pages with SSR
// 이 모듈은 동적으로만 불러야 한다 — Shiki 는 브라우저 것이고 VitePress 는 SSR 로 미리 그린다
// The editor contract takes token *kinds*, not colors: `--nabi-code-*` owns the colors so light/dark follow by itself
// 에디터 계약은 색이 아니라 종류를 받는다 — 색은 시트의 `--nabi-code-*` 가 쥐고 있어 테마를 저절로 따라온다
import { createHighlighterCore, type HighlighterCore } from 'shiki/core'
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript'
import { bundledLanguages } from 'shiki/langs'
import type { CodeHighlighter, CodeToken } from 'nabi-note'

// Unused for color, but the tokenize API demands a theme — we only read `explanation` scope names
// 색으로는 안 쓰지만 토큰화 API 가 테마를 요구한다 — 우리가 읽는 건 `explanation` 의 스코프 이름뿐이다
const THEME = 'github-light'

// Ship both themes (`defaultColor: false`) so switching theme is pure CSS, no repaint
// 라이트·다크를 함께 실어 `--shiki-light`/`--shiki-dark` 만 남긴다 — 테마 전환이 CSS 만으로 끝난다
const DOC_THEMES = { light: 'github-light', dark: 'github-dark' } as const

// A table of name → loader function, so holding it downloads no grammar at all (~26KB)
// 이름 → 문법을 가져오는 함수의 표라, 들고 있어도 문법 자체는 하나도 내려오지 않는다
// Abbreviations (`js`, `ts`, `sh`, `yml`, `py`, `c#`) are keys here too, so we keep no alias table
// 줄임말도 이 표의 열쇠다 — 그래서 별칭 표를 따로 들지 않는다
const LOADERS: Readonly<Record<string, () => Promise<unknown>>> = bundledLanguages

// Longest first: `string.regexp` must precede `string`, `keyword.operator` must precede `keyword`
// 긴 것이 먼저다 — 판정은 접두사 일치이고, 목록에 없는 스코프는 색 없이 지나간다
// `meta.*` is left out on purpose — it wraps almost every token and would paint the whole document one color
// `meta.*` 는 일부러 넣지 않았다 — 넣으면 문서 전체가 한 색이 된다
const SCOPE_TYPES: readonly (readonly [string, string])[] = [
  ['comment', 'comment'],
  ['string.regexp', 'regexp'],
  ['string', 'string'],
  ['constant.numeric', 'number'],
  ['constant.language', 'literal'],
  ['constant.character', 'literal'],
  ['constant.other', 'literal'],
  // Prose grammars (markdown, diff) use `markup.*`; without these two they go entirely colorless
  // 글을 다루는 문법은 `markup.*` 을 쓴다 — 이어 주지 않으면 그 둘만 통째로 무채색이 된다
  ['markup.inserted', 'tag'],
  ['markup.deleted', 'keyword'],
  ['markup.changed', 'attribute'],
  ['markup.heading', 'keyword'],
  ['entity.name.section', 'keyword'],
  ['markup.bold', 'class'],
  ['markup.italic', 'function'],
  ['markup.underline.link', 'attribute'],
  ['markup.inline.raw', 'string'],
  ['markup.fenced_code', 'string'],
  ['markup.quote', 'comment'],
  // `markup.list` is omitted on purpose — it would stain the item text too
  // `markup.list` 는 일부러 넣지 않는다 — 항목 글자까지 통째로 물든다
  ['meta.diff', 'meta'],
  ['keyword.operator', 'operator'],
  ['keyword', 'keyword'],
  ['storage', 'keyword'],
  ['entity.name.function', 'function'],
  ['support.function', 'function'],
  ['entity.name.tag', 'tag'],
  ['entity.other.attribute-name', 'attribute'],
  ['support.type.property-name', 'attribute'],
  ['entity.name.type', 'class'],
  ['entity.name.class', 'class'],
  ['entity.other.inherited-class', 'class'],
  ['support.class', 'class'],
  ['support.type', 'class'],
  ['variable', 'variable'],
  ['punctuation', 'punctuation'],
]

export interface CodeHighlighting {
  readonly highlight: CodeHighlighter
  // Fires when a grammar arrives late — a chance to repaint. Returns an unsubscribe function
  // 문법이 뒤늦게 도착했다는 신호 — 한 번 더 칠할 기회다. 해지 함수를 돌려준다
  onGrammarLoaded(listener: () => void): () => void
}

let corePromise: Promise<HighlighterCore | null> | null = null

function getCore(): Promise<HighlighterCore | null> {
  corePromise ??= createHighlighterCore({
    langs: [],
    themes: [import('@shikijs/themes/github-light'), import('@shikijs/themes/github-dark')],
    // JavaScript regex engine, so no oniguruma WASM download; `forgiving` skips odd regexes and keeps going
    // 자바스크립트 정규식 엔진 — WASM 을 안 받는다. `forgiving` 은 낯선 정규식을 건너뛰고 계속 돈다
    engine: createJavaScriptRegexEngine({ forgiving: true }),
  }).catch(() => {
    // Clear the slot so a later call retries; code blocks work fine without color
    // 다시 시도할 수 있게 자리를 비운다 — 실패해도 코드 블록 기능 자체는 멀쩡하다
    corePromise = null
    return null
  })
  return corePromise
}

// `null` means the caller should simply skip installing the hook
// `null` 이면 부르는 쪽은 훅 없이 그냥 두면 된다
export async function loadCodeHighlighting(): Promise<CodeHighlighting | null> {
  const core = await getCore()
  if (!core) {
    return null
  }

  // Stores the names we asked for, verbatim — Shiki resolves aliases itself
  // 우리가 부른 이름 그대로 담는다 — 별칭 해석은 Shiki 가 한다
  const ready = new Set<string>()
  const loading = new Set<string>()
  const listeners = new Set<() => void>()

  // An arrow, not a `function` declaration: hoisting would undo the null-narrowing above
  // 화살표로 둔다 — `function` 선언은 끌어올려져 위 널 검사의 좁힘이 안에서 풀린다
  const request = (name: string): void => {
    const loader = LOADERS[name]
    if (!loader || ready.has(name) || loading.has(name)) {
      return
    }
    loading.add(name)
    // Shiki knows the grammar module's shape (array or `default`), so don't retype it here
    // 문법 모듈의 모양은 Shiki 가 스스로 푸니 여기서 타입을 다시 세우지 않는다
    void core
      .loadLanguage(loader() as never)
      .then(() => {
        ready.add(name)
        for (const listener of listeners) listener()
      })
      .catch(() => {
        // Only that language loses color; asking again retries
        // 그 언어만 색을 잃는다 — 다시 물어보면 또 시도한다
      })
      .finally(() => loading.delete(name))
  }

  const highlight: CodeHighlighter = (code, language) => {
    const name = (language ?? '').toLowerCase()
    if (name === '' || !(name in LOADERS)) {
      return null
    }
    if (!ready.has(name)) {
      request(name)
      return null
    }
    return tokenize(core, code, name)
  }

  return {
    highlight,
    onGrammarLoaded(listener) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
  }
}

const docLoaded = new Set<string>()

// Unlike the editor hook this side can await the grammar — the editor is mid-typing, so only it is sync
// 에디터에 물리는 쪽과 달리 이쪽은 기다릴 수 있다 — 에디터는 타이핑 중이라 못 기다려서 그쪽만 동기다
// Empty string means "not painted"; the caller just renders plain text
// 못 칠하면 빈 문자열이다 — 부르는 쪽이 평문을 그대로 그리면 된다
export async function highlightToHtml(code: string, language: string): Promise<string> {
  const core = await getCore()
  if (!core) {
    return ''
  }

  const name = language.toLowerCase()
  const loader = LOADERS[name]
  if (loader && !docLoaded.has(name)) {
    try {
      await core.loadLanguage(loader() as never)
      docLoaded.add(name)
    } catch {
      // Only that language loses color
      // 그 언어만 색을 잃는다
    }
  }

  try {
    return core.codeToHtml(code, {
      lang: docLoaded.has(name) ? name : 'text',
      themes: DOC_THEMES,
      defaultColor: false,
    })
  } catch {
    return ''
  }
}

// Shiki returns a per-line 2-D array and drops the newlines, so we splice `\n` tokens back in
// Shiki 는 줄 단위 2차원 배열을 주고 줄바꿈은 버리므로 줄 사이에 `\n` 토막을 다시 끼운다
// The rejoined text must equal the original — painting a mismatch would alter the code, so we drop color instead
// 이어 붙인 것이 원본과 같은지 반드시 확인한다 — 어긋난 채 칠하면 글자가 바뀌므로 색을 포기한다
function tokenize(core: HighlighterCore, code: string, lang: string): readonly CodeToken[] | null {
  let lines
  try {
    lines = core.codeToTokens(code, { lang, theme: THEME, includeExplanation: 'scopeName' }).tokens
  } catch {
    return null
  }

  const tokens: CodeToken[] = []
  lines.forEach((line, index) => {
    if (index > 0) {
      tokens.push({ text: '\n' })
    }
    for (const token of line) {
      // Shiki merges same-color tokens, but we need kinds, so split down to explanation pieces
      // 색이 같으면 Shiki 가 토막을 이어 붙인다 — 우리에겐 종류가 필요하니 explanation 조각까지 쪼갠다
      for (const piece of token.explanation ?? [{ content: token.content, scopes: [] }]) {
        if (piece.content === '') continue
        const type = typeOf(piece.scopes)
        tokens.push(type ? { text: piece.content, type } : { text: piece.content })
      }
    }
  })

  return tokens.map((token) => token.text).join('') === code ? tokens : null
}

// Scopes run outermost-first, so walk backwards — the innermost (most specific) wins
// 스코프는 바깥에서 안쪽 순서라 뒤에서부터 훑는다 — 가장 안쪽이 이긴다
// `punctuation` is deferred to last: a comment's innermost scope is `punctuation.definition.comment`,
// `punctuation` 은 맨 뒤로 미룬다 — 주석·문자열의 가장 안쪽 스코프가 punctuation 이라 통째로 물든다
function typeOf(scopes: readonly { readonly scopeName: string }[] | undefined): string | null {
  if (!scopes || scopes.length === 0) {
    return null
  }

  let punctuation: string | null = null
  for (let index = scopes.length - 1; index >= 0; index -= 1) {
    const type = matchScope(scopes[index]!.scopeName)
    if (type !== null && type !== 'punctuation') {
      return type
    }
    if (type !== null && punctuation === null) {
      punctuation = type
    }
  }
  return punctuation
}

function matchScope(scope: string): string | null {
  for (const [prefix, type] of SCOPE_TYPES) {
    if (scope === prefix || scope.startsWith(`${prefix}.`)) {
      return type
    }
  }
  return null
}
