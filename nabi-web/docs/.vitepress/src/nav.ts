import type { MessageKey } from '../locales/index.ts'

// `path` carries no locale prefix — the locale is prepended at render time
// `path` 에는 로케일 접두사가 없다 — 그릴 때 붙인다
export interface NavItem {
  readonly path: string
  readonly key: MessageKey
}

// Wings needed one more level: flattened, twenty rows run together and the grouping disappears
// 날개에서 한 겹이 더 필요해졌다 — 한 겹으로 눌러 담으면 무엇이 무엇의 갈래인지 안 보인다
export interface NavBranch {
  readonly key: MessageKey
  readonly items: readonly NavItem[]
}

export type NavEntry = NavItem | NavBranch

export interface NavGroup {
  readonly key: MessageKey
  readonly entries: readonly NavEntry[]
}

export function isLink(entry: NavEntry): entry is NavItem {
  return 'path' in entry
}

// The left menu — adding a document means adding a line here
// 왼쪽 메뉴 — 문서를 늘리면 여기에 추가한다
export const NAV: readonly NavGroup[] = [
  {
    key: 'menu_intro',
    entries: [
      { path: '/intro', key: 'menu_intro_index' },
      // 쓰는 법은 두 갈래다 — npm 으로 무는 길과 <script> 한 줄로 무는 길
      // Two ways to use it: through npm, or through one <script> tag
      { path: '/intro/usage', key: 'menu_intro_usage' },
      { path: '/intro/ssr', key: 'menu_intro_ssr' },
      { path: '/intro/cdn', key: 'menu_intro_cdn' },
      { path: '/intro/vibe-coding', key: 'menu_intro_vibe_coding' },
    ],
  },
  {
    key: 'menu_wing',
    entries: [
      {
        key: 'menu_inline',
        items: [
          { path: '/wing/inline/bold', key: 'menu_inline_bold' },
          { path: '/wing/inline/italic', key: 'menu_inline_italic' },
          { path: '/wing/inline/underline', key: 'menu_inline_underline' },
          { path: '/wing/inline/strikethrough', key: 'menu_inline_strikethrough' },
          { path: '/wing/inline/superscript', key: 'menu_inline_superscript' },
          { path: '/wing/inline/subscript', key: 'menu_inline_subscript' },
          { path: '/wing/inline/link', key: 'menu_inline_link' },
          // The two marks that carry a value — you pick a color rather than toggle
          // 값을 가진 마크 둘 — 켜고 끄는 것이 아니라 색을 고른다
          { path: '/wing/inline/highlight', key: 'menu_inline_highlight' },
          { path: '/wing/inline/text-color', key: 'menu_inline_text_color' },
        ],
      },
      {
        key: 'menu_block',
        items: [
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
      },
      {
        // Neither inline nor block: attributes that change no tag, the eraser, and upload
        // 인라인도 블록도 아닌 것들 — 태그를 안 바꾸는 속성, 마크를 벗기는 지우개, 업로드
        key: 'menu_etc',
        items: [
          { path: '/wing/etc/align', key: 'menu_etc_align' },
          { path: '/wing/etc/dropcap', key: 'menu_etc_dropcap' },
          { path: '/wing/etc/typeface', key: 'menu_etc_typeface' },
          { path: '/wing/etc/font-size', key: 'menu_etc_font_size' },
          { path: '/wing/etc/clear-format', key: 'menu_etc_clear_format' },
          { path: '/wing/etc/upload', key: 'menu_etc_upload' },
        ],
      },
      {
        // Split by which slot you fill; the first row (`/wing/custom`) is the getting-started page
        // 채우는 칸별로 나눈다 — 첫 줄(`/wing/custom`)이 시작하기 페이지다
        key: 'menu_wing_custom',
        items: [
          { path: '/wing/custom', key: 'menu_custom_start' },
          { path: '/wing/custom/inline', key: 'menu_custom_inline' },
          { path: '/wing/custom/block', key: 'menu_custom_block' },
          { path: '/wing/custom/input', key: 'menu_custom_input' },
          { path: '/wing/custom/ui', key: 'menu_custom_ui' },
        ],
      },
    ],
  },
  {
    // Wings are what you can use; this group is how it looks
    // 날개가 무엇을 쓸 수 있나라면 이쪽은 어떻게 보이나다
    key: 'menu_style',
    entries: [{ path: '/style/custom', key: 'menu_style_custom' }],
  },
]

// Drives prev/next navigation, so the order must match what the menu shows
// 이전/다음 문서 이동용 — 메뉴에 보이는 순서 그대로 편다
export const NAV_FLAT: readonly NavItem[] = NAV.flatMap((group) =>
  group.entries.flatMap((entry) => (isLink(entry) ? [entry] : entry.items)),
)
