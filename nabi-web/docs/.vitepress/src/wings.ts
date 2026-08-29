// One wing alone makes a lifeless demo, all of them blur what the page is about
// 자기 wing 하나만 켜면 실감이 안 나고, 전부 켜면 그 페이지의 주제가 흐려진다
// So: self + the immediate menu neighbours, within the same branch only
// 그래서 자기 자신 + 같은 묶음의 앞뒤 이웃만 켠다 — 인라인 페이지에 표가 딸려 오지 않는다
import type { NavItem } from './nav.ts'

// The documentation navigation follows reader tasks. Interactive legacy pages still need nearby
// wings from their own family, so this index stays explicit rather than borrowing the sidebar.
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

// The demo toggles wings by id, not by path — ids match the new nabi-note wing constants
// (e.g. `boldWing.id === 'b'`), not old's namespaced `text-bold`/`block-*`/`attr-*` scheme.
// 데모가 켜고 끄는 열쇠는 경로가 아니라 wing id 다 — 새 nabi-note wing 상수의 id 그대로다
// (예: `boldWing.id === 'b'`) — old 의 `text-bold`/`block-*`/`attr-*` 갈래 이름이 아니다.
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

// Some pages cover a whole family; enabling one member leaves the toolbar looking broken.
// Heading and align need no entry any more: each is one wing carrying several buttons
// (h1–h6, left/center/right), and the buttonless parts (tr/td, summary, li/oli, tli) are declared
// inside their owner wing, so they ride along on their own.
// 한 페이지가 한 갈래 전체를 다루는 경우다 — 하나만 켜면 툴바가 이상해진다. 제목·정렬은 이제
// 여기 안 적어도 된다: 저마다 wing 하나가 단추 여럿을 든다(h1~h6, 왼쪽·가운데·오른쪽). 버튼 없는
// 조각(tr/td, summary, li/oli, tli)도 제 주인 wing 안에 선언돼 있어 저절로 따라온다.
const EXTRA_BY_PATH: Readonly<Record<string, readonly string[]>> = {
  // Clear-format needs something to strip — with no marks on, the sample falls to plain text
  // 지우개는 벗길 것이 있어야 보인다 — 마크가 없으면 예시가 평문이라 지울 것도 없다
  '/wing/etc/clear-format': ['b', 'i', 'u', 's'],
  // Upload results need the wing that owns their markup, or the uploaded file vanishes
  // 업로드 결과가 문서에 남으려면 그 어휘의 주인이 함께 있어야 한다 (이미지는 image, 첨부는 link)
  '/wing/etc/upload': ['img', 'a'],
}

// `path` must already have the locale prefix stripped (`/wing/inline/bold`)
// `path` 는 로케일 접두사를 뺀 경로여야 한다 (`/wing/inline/bold`)
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

  // A neighbour must bring its dependencies too. Clear-format sits next to upload, for example;
  // enabling upload without image or link makes the whole registry invalid before the demo opens.
  // 이웃으로 고른 날개도 의존성을 함께 데려온다. 서식 지우기 옆의 upload만 켜고 이미지·링크를
  // 빼면 예문을 열기도 전에 registry 조립이 실패한다.
  const extras = paths.flatMap((each) => EXTRA_BY_PATH[each] ?? [])
  return [...new Set([...ids, ...extras])]
}
