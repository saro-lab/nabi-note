// 데모가 여는 예문 — **HTML 이 아니라 나비트리로 굳혀 둔 것**을 읽는다.
//
// 왜 트리인가: 문서의 실체는 나비트리이고 HTML 은 그것을 그린 결과다. 예문을 HTML 로 들고
// 있으면 데모는 열 때마다 들여오기(파싱·화이트리스트·정리)를 한 번 더 돌아야 하고, 그 문을
// 거치기 전까지는 무엇이 문서인지도 알 수 없다. 굳혀 두면 데모가 하는 일은 넣는 것뿐이다.
//
// 사람이 고치는 자리는 여기가 아니라 **로케일 사전**(`../locales/<lang>.ts` 의 `demo_html`·
// `demo_html_*`)이고, `npm run build:trees` 가 그것을 `../trees/<lang>.ts` 로 굳힌다.
// 예문은 번역문이라 다른 글과 함께 사전에 산다 — 트리는 거기서 뽑은 생성물일 뿐이다.
//
// 로케일마다 한 벌이라 **읽는 쪽 언어의 한 벌만** 늦게 부른다 — 데모 자체가 그렇게 온다
// (`onMounted` 안 동적 import, SSR 밖).

// 예문 이름표 — 사전 키·트리·페이지 짝이 전부 이 목록을 따른다. 사전 키는 `demo_html_<이름>`
// 이고 `main` 만 `demo_html` 이다(홈의 큰 예문이라 이름이 먼저 있었다).
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

// 그 이름표가 사전에서 갖는 키.
export function messageKeyFor(key: SampleKey): string {
  return key === 'main' ? 'demo_html' : `demo_html_${key}`
}

// 나비트리 한 벌 — 사용자 JSON 그대로다(`nabi.getJson()` 이 낸 모양, `setJson`·`doc` 이 받는 모양).
// 여기서 노드 모양을 다시 적지 않는다 — 그 규격은 패키지의 것이고, 굳힌 값은 그 문으로만 드나든다.
export type SampleTree = readonly unknown[]
export type SampleTrees = Readonly<Record<SampleKey, SampleTree>>

// Samples may only use markup the page actually enables — wings.ts turns on just that wing and its neighbours
// 예시에는 그 페이지에서 켜지는 마크업만 쓴다 — 안 켜진 서식은 평문으로 떨어져 예시가 조용히 망가진다
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

// `path` must already have the locale prefix stripped (`/wing/inline/bold`)
// `path` 는 로케일 접두사를 뺀 경로여야 한다 (`/wing/inline/bold`)
export function sampleKeyFor(path: string): SampleKey {
  return SAMPLE_BY_PATH[path] ?? 'small'
}

// 한 줄씩 적는다 — 번들러가 정적으로 읽어야 로케일마다 조각을 가를 수 있다(글로브는 타입이 없다).
// 언어를 늘릴 때 여기 한 줄이 따라온다.
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
}

// 그 언어의 예문 한 벌. 모르는 언어는 영어로 떨어진다 — 사전의 폴백 규칙과 같은 결이다.
export async function loadSampleTrees(lang: string): Promise<SampleTrees> {
  const code = (lang || 'en').split('-')[0] as string
  const load = TREES[code] ?? (TREES['en'] as () => Promise<{ trees: SampleTrees }>)
  return (await load()).trees
}
