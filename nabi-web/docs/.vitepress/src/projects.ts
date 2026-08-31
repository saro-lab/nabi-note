// 소스가 사는 곳 — 헤더가 여기로 건다. 저장소 이름은 폴더(nabi-npm/)가 아니라 패키지 이름을 따른다.
// Where the source lives, linked from the header; the repo is named after the package, not its folder (nabi-npm/).
export const REPO = 'https://github.com/saro-lab/nabi-note'

export interface ProjectLink {
  readonly name: string
  readonly icon: string
  readonly href: string
}

// NABI NOTE 자신은 빼 둔다 — 여기가 그 사이트다.
// NABI NOTE itself is left out: this is that site.
export const PROJECTS: readonly ProjectLink[] = [
  { name: 'SARO Lab', icon: '/logo/saro-lab.svg', href: 'https://lab.saro.me' },
  { name: 'DAT', icon: '/logo/dat.svg', href: 'https://dat.saro.me' },
  { name: 'Ticketing', icon: '/logo/ticketing.svg', href: 'https://ticketing.saro.me' },
]
