// 지금 판 하나 — **형제 저장소의 `package.json` 을 그대로 읽는다.**
//
// 문서에 판 번호를 손으로 적으면 올릴 때마다 쪽마다 돌며 고쳐야 하고, 한 곳만 빠뜨려도 문서가
// 조용히 거짓말을 한다. 읽는 자리를 하나로 두면 그럴 일이 없다 — 판을 올리고 사이트를 다시
// 지으면 문서가 저절로 따라온다.
//
// vite 가 JSON 을 모듈로 읽어 주므로 빌드 때 값이 박힌다(런타임 fetch 가 아니다).
import pkg from '../../../../nabi-npm/package.json'

export const NABI_VERSION: string = pkg.version

// CDN 주소 — 판을 고정해 쓰는 자리에 그대로 쓴다.
export const CDN_BUNDLE = `https://cdn.jsdelivr.net/npm/nabi-note@${NABI_VERSION}/dist/browser/nabi-note.min.js`
export const CDN_SHEET = `https://cdn.jsdelivr.net/npm/nabi-note@${NABI_VERSION}/dist/nabi.css`
