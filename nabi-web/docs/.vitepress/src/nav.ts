import type { LocaleCode, MessageKey } from '../locales/index.ts'

export interface NavItem {
  readonly path: string
  readonly key: MessageKey
  readonly locales?: readonly LocaleCode[]
}

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

export const NAV: readonly NavGroup[] = [
  {
    key: 'menu_start',
    entries: [
      { path: '/guide/getting-started', key: 'menu_getting_started' },
      { path: '/guide/rendering', key: 'menu_rendering' },
      { path: '/guide/cdn', key: 'menu_cdn' },
      { path: '/intro/vibe-coding', key: 'menu_intro_vibe_coding' },
    ],
  },
  {
    key: 'menu_features',
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
          { path: '/wing/block/float', key: 'menu_block_float' },
          { path: '/wing/block/image', key: 'menu_block_image' },
          { path: '/wing/block/youtube', key: 'menu_block_youtube' },
          { path: '/wing/block/code', key: 'menu_block_code' },
          { path: '/wing/block/details', key: 'menu_block_details' },
          { path: '/wing/block/quote', key: 'menu_block_quote' },
          { path: '/wing/block/divider', key: 'menu_block_divider' },
        ],
      },
      {
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
      { path: '/guide/extend', key: 'menu_extend_guide' },
    ],
  },
  {
    key: 'menu_style',
    entries: [
      { path: '/guide/style', key: 'menu_style_guide' },
      { path: '/guide/icons', key: 'menu_icon_theme' },
    ],
  },
  {
    key: 'menu_addons',
    entries: [
      { path: '/guide/compare', key: 'menu_compare' },
      { path: '/guide/merge', key: 'menu_merge' },
    ],
  },
]

export const NAV_FLAT: readonly NavItem[] = NAV.flatMap((group) =>
  group.entries.flatMap((entry) => (isLink(entry) ? [entry] : entry.items)),
)

export function hasLocalePage(path: string, locale: string): boolean {
  const item = NAV_FLAT.find((item) => item.path === path.replace(/\.(html|md)$/, '').replace(/\/$/, ''))
  return !item?.locales || item.locales.some((code) => code === locale)
}

export function navFor(locale: string): readonly NavGroup[] {
  return NAV.map((group) => ({
    ...group,
    entries: group.entries.flatMap((entry): NavEntry[] => {
      if (isLink(entry)) return hasLocalePage(entry.path, locale) ? [entry] : []
      const items = entry.items.filter((item) => hasLocalePage(item.path, locale))
      return items.length ? [{ ...entry, items }] : []
    }),
  })).filter((group) => group.entries.length > 0)
}
