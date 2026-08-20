// Where the source lives — the header links here. The repo is named after the package, not the
// folder it sits in (`nabi-npm/`)
// 소스가 사는 곳 — 헤더가 여기로 건다. 저장소 이름은 패키지 이름을 따른다, 담긴 폴더(`nabi-npm/`)가
// 아니라
export const REPO = 'https://github.com/saro-lab/nabi-note'

export interface ProjectLink {
  readonly name: string
  readonly icon: string
  readonly href: string
}

// NABI NOTE itself is left out: this is that site
// NABI NOTE 자신은 빼 둔다 — 여기가 그 사이트다
export const PROJECTS: readonly ProjectLink[] = [
  { name: 'SARO Lab', icon: '/logo/saro-lab.svg', href: 'https://lab.saro.me' },
  { name: 'DAT', icon: '/logo/dat.svg', href: 'https://dat.saro.me' },
  { name: 'Ticketing', icon: '/logo/ticketing.svg', href: 'https://ticketing.saro.me' },
]
