// 판 번호는 형제 저장소의 package.json에서 그대로 읽는다 — 손으로 적으면 갱신을 빠뜨려 문서가 거짓말한다.
// The version comes straight from the sibling repo's package.json; hand-copying it risks a stale doc.
// vite가 JSON을 모듈로 읽어 값이 빌드 때 박힌다(런타임 fetch가 아니다).
// vite loads the JSON as a module, so the value is baked in at build time, not fetched at runtime.
import pkg from '../../../../nabi-npm/package.json'

export const NABI_VERSION: string = pkg.version

// CDN 주소 — 판을 고정해 쓰는 자리에 그대로 쓴다.
// CDN URLs, pinned to this version, used as-is wherever a fixed release is needed.
export const CDN_BUNDLE = `https://cdn.jsdelivr.net/npm/nabi-note@${NABI_VERSION}/dist/browser/nabi-note.min.js`
export const CDN_SHEET = `https://cdn.jsdelivr.net/npm/nabi-note@${NABI_VERSION}/dist/nabi.css`
