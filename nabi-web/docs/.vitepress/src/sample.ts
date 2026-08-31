// 예문은 HTML이 아니라 나비트리로 굳혀 둔다 — 안 그러면 데모를 열 때마다 들여오기를 다시 돈다.
// Samples are frozen as NABI TREE, not HTML — otherwise the demo would re-import on every open.
// ko는 트리(../trees/ko.ts)를 직접 고치고, 다른 로케일은 사전의 demo_html*을 build:trees가 굳힌다.
// ko edits the tree (../trees/ko.ts) directly; other locales freeze from the dict's demo_html* via build:trees.
// 로케일마다 한 벌이라 읽는 쪽 언어 하나만 늦게 부른다(onMounted 동적 import, SSR 밖).
// One set per locale, so only the reader's language loads lazily (onMounted dynamic import, outside SSR).

// 예문 이름표 — 트리·페이지 짝과 사전 키가 이 목록을 따른다.
// Sample labels — tree/page pairing and locale-dict keys both follow this list.
export const SAMPLE_KEYS = [
  'main',
  'small',
  'bold',
  'italic',
  'underline',
  'strikethrough',
  'superscript',
  'subscript',
  'link',
  'highlight',
  'text_color',
  'heading',
  'bullet_list',
  'ordered_list',
  'task_list',
  'table',
  'image',
  'youtube',
  'code',
  'details',
  'quote',
  'divider',
  'align',
  'font_size',
  'typeface',
  'dropcap',
  'clear_format',
  'upload',
] as const

export type SampleKey = (typeof SAMPLE_KEYS)[number]

export function messageKeyFor(key: SampleKey): string {
  return key === 'main' ? 'demo_html' : `demo_html_${key}`
}

// 나비트리는 사용자 JSON 그대로다(nabi.getJson()/setJson 모양) — 노드 규격은 패키지 쪽 것이라 여기서 다시 안 적는다.
// A sample tree is raw user JSON (nabi.getJson()/setJson shape); the node schema belongs to the package, not here.
export type SampleTree = readonly unknown[]
export type SampleTrees = Readonly<Record<SampleKey, SampleTree>>

// 예시에는 그 페이지에서 켜지는 마크업만 쓴다 — 안 켜진 서식은 평문으로 떨어져 예시가 조용히 망가진다.
// Samples may only use markup the page actually enables; wings.ts turns on just that wing and its neighbours.
const SAMPLE_BY_PATH: Readonly<Record<string, SampleKey>> = {
  '/wing/inline/bold': 'bold',
  '/wing/inline/italic': 'italic',
  '/wing/inline/underline': 'underline',
  '/wing/inline/strikethrough': 'strikethrough',
  '/wing/inline/superscript': 'superscript',
  '/wing/inline/subscript': 'subscript',
  '/wing/inline/link': 'link',
  '/wing/inline/highlight': 'highlight',
  '/wing/inline/text-color': 'text_color',

  '/wing/block/heading': 'heading',
  '/wing/block/bullet-list': 'bullet_list',
  '/wing/block/ordered-list': 'ordered_list',
  '/wing/block/task-list': 'task_list',
  '/wing/block/table': 'table',
  '/wing/block/image': 'image',
  '/wing/block/youtube': 'youtube',
  '/wing/block/code': 'code',
  '/wing/block/details': 'details',
  '/wing/block/quote': 'quote',
  '/wing/block/divider': 'divider',

  '/wing/etc/align': 'align',
  '/wing/etc/dropcap': 'dropcap',
  '/wing/etc/typeface': 'typeface',
  '/wing/etc/font-size': 'font_size',
  '/wing/etc/clear-format': 'clear_format',
  '/wing/etc/upload': 'upload',
}

// `path` 는 로케일 접두사를 뺀 경로여야 한다(예: `/wing/inline/bold`).
// `path` must already have the locale prefix stripped (e.g. `/wing/inline/bold`).
export function sampleKeyFor(path: string): SampleKey {
  return SAMPLE_BY_PATH[path] ?? 'small'
}

// 한 줄씩 적는다 — 번들러가 정적으로 읽어야 로케일마다 조각을 가를 수 있다(글로브는 타입이 없다).
// One line per locale so the bundler can statically split each into its own chunk (a glob loses types).
const TREES: Readonly<Record<string, () => Promise<{ trees: SampleTrees }>>> = {
  en: () => import('../trees/en.ts'),
  ko: () => import('../trees/ko.ts'),
  ja: () => import('../trees/ja.ts'),
  zh: () => import('../trees/zh.ts'),
  de: () => import('../trees/de.ts'),
  fr: () => import('../trees/fr.ts'),
  es: () => import('../trees/es.ts'),
  pt: () => import('../trees/pt.ts'),
  ru: () => import('../trees/ru.ts'),
  ar: () => import('../trees/ar.ts'),
  hi: () => import('../trees/hi.ts'),
  bn: () => import('../trees/bn.ts'),
  ur: () => import('../trees/ur.ts'),
  id: () => import('../trees/id.ts'),
  fa: () => import('../trees/fa.ts'),
  mr: () => import('../trees/mr.ts'),
  vi: () => import('../trees/vi.ts'),
  te: () => import('../trees/te.ts'),
  ha: () => import('../trees/ha.ts'),
  tr: () => import('../trees/tr.ts'),
  sw: () => import('../trees/sw.ts'),
  ta: () => import('../trees/ta.ts'),
  th: () => import('../trees/th.ts'),
  it: () => import('../trees/it.ts'),
}

// 그 언어의 예문 한 벌 — 모르는 언어는 영어로 떨어진다(사전의 폴백 규칙과 같다).
// That language's sample set; an unknown language falls back to English, same as the dictionary.
export async function loadSampleTrees(lang: string): Promise<SampleTrees> {
  const code = (lang || 'en').split('-')[0] as string
  const load = TREES[code] ?? (TREES['en'] as () => Promise<{ trees: SampleTrees }>)
  return (await load()).trees
}
