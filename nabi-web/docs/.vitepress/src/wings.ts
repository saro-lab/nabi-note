// 날개 하나만 켜면 실감이 안 나고 다 켜면 주제가 흐려져, 자기 자신 + 같은 묶음의 이웃만 켠다.
// One wing alone feels lifeless and all of them blur the topic, so only self + same-branch neighbours light up.
import type { NavItem } from './nav.ts'

// 독자 작업 순서를 따로 짠 색인이라 사이드바를 그대로 안 쓴다 — 개별 페이지엔 이웃 날개가 필요하다.
// This index follows reader tasks rather than borrowing the sidebar; standalone pages still need neighbour wings.
const BRANCHES: readonly (readonly NavItem[])[] = [
  [
    { path: '/wing/inline/bold', key: 'menu_inline_bold' },
    { path: '/wing/inline/italic', key: 'menu_inline_italic' },
    { path: '/wing/inline/underline', key: 'menu_inline_underline' },
    { path: '/wing/inline/strikethrough', key: 'menu_inline_strikethrough' },
    { path: '/wing/inline/superscript', key: 'menu_inline_superscript' },
    { path: '/wing/inline/subscript', key: 'menu_inline_subscript' },
    { path: '/wing/inline/link', key: 'menu_inline_link' },
    { path: '/wing/inline/highlight', key: 'menu_inline_highlight' },
    { path: '/wing/inline/text-color', key: 'menu_inline_text_color' },
  ],
  [
    { path: '/wing/block/heading', key: 'menu_block_heading' },
    { path: '/wing/block/bullet-list', key: 'menu_block_bullet_list' },
    { path: '/wing/block/ordered-list', key: 'menu_block_ordered_list' },
    { path: '/wing/block/task-list', key: 'menu_block_task_list' },
    { path: '/wing/block/table', key: 'menu_block_table' },
    { path: '/wing/block/image', key: 'menu_block_image' },
    { path: '/wing/block/youtube', key: 'menu_block_youtube' },
    { path: '/wing/block/code', key: 'menu_block_code' },
    { path: '/wing/block/details', key: 'menu_block_details' },
    { path: '/wing/block/quote', key: 'menu_block_quote' },
    { path: '/wing/block/divider', key: 'menu_block_divider' },
  ],
  [
    { path: '/wing/etc/align', key: 'menu_etc_align' },
    { path: '/wing/etc/dropcap', key: 'menu_etc_dropcap' },
    { path: '/wing/etc/typeface', key: 'menu_etc_typeface' },
    { path: '/wing/etc/font-size', key: 'menu_etc_font_size' },
    { path: '/wing/etc/clear-format', key: 'menu_etc_clear_format' },
    { path: '/wing/etc/upload', key: 'menu_etc_upload' },
  ],
]

// 데모는 경로가 아니라 wing id로 켜고 끈다 — 새 nabi-note wing 상수의 id 그대로다(예: boldWing.id==='b').
// The demo toggles by wing id, not path — these match the new nabi-note wing constants (e.g. boldWing.id==='b').
const ID_BY_PATH: Readonly<Record<string, string>> = {
  '/wing/inline/bold': 'b',
  '/wing/inline/italic': 'i',
  '/wing/inline/underline': 'u',
  '/wing/inline/strikethrough': 's',
  '/wing/inline/superscript': 'sup',
  '/wing/inline/subscript': 'sub',
  '/wing/inline/link': 'a',
  '/wing/inline/highlight': 'hl',
  '/wing/inline/text-color': 'tc',

  '/wing/block/heading': 'h',
  '/wing/block/bullet-list': 'ul',
  '/wing/block/ordered-list': 'ol',
  '/wing/block/task-list': 'tl',
  '/wing/block/table': 'table',
  '/wing/block/image': 'img',
  '/wing/block/youtube': 'youtube',
  '/wing/block/code': 'code',
  '/wing/block/details': 'details',
  '/wing/block/quote': 'quote',
  '/wing/block/divider': 'hr',

  '/wing/etc/align': 'align',
  '/wing/etc/dropcap': 'dc',
  '/wing/etc/typeface': 'tf',
  '/wing/etc/font-size': 'fs',
  '/wing/etc/clear-format': 'clearFormat',
  '/wing/etc/upload': 'upload',
}

// 한 페이지가 갈래 전체를 다루면 하나만 켜선 툴바가 이상해진다 — 버튼 없는 부속은 주인 wing에 딸려온다.
// A page covering a whole family looks broken with only one wing on; buttonless parts ride along with their owner.
const EXTRA_BY_PATH: Readonly<Record<string, readonly string[]>> = {
  // 지우개는 벗길 것이 있어야 보인다 — 마크가 없으면 예시가 평문이라 지울 것도 없다.
  // Clear-format needs something to strip, or the sample is already plain text with nothing to clear.
  '/wing/etc/clear-format': ['b', 'i', 'u', 's'],
  // 업로드 결과가 문서에 남으려면 그 어휘의 주인이 함께 있어야 한다(이미지는 image, 첨부는 link).
  // Upload results need the wing that owns their markup, or the uploaded file's markup vanishes.
  '/wing/etc/upload': ['img', 'a'],
}

// `path` 는 로케일 접두사를 뺀 경로여야 한다(예: `/wing/inline/bold`).
// `path` must already have the locale prefix stripped (e.g. `/wing/inline/bold`).
export function wingsFor(path: string): string[] {
  const branch = BRANCHES.find((items) => items.some((item) => item.path === path))
  const index = branch?.findIndex((item) => item.path === path) ?? -1

  const paths =
    branch && index >= 0
      ? [branch[index - 1], branch[index], branch[index + 1]]
          .filter((item): item is NavItem => item !== undefined)
          .map((item) => item.path)
      : [path]

  const ids = paths.flatMap((each) => {
    const id = ID_BY_PATH[each]
    return id ? [id] : []
  })

  // 이웃 날개도 의존성을 함께 데려온다 — clear-format 옆 upload만 켜면 registry 조립이 실패한다.
  // A neighbour brings its dependencies too — enabling upload without image/link breaks the registry.
  const extras = paths.flatMap((each) => EXTRA_BY_PATH[each] ?? [])
  return [...new Set([...ids, ...extras])]
}
