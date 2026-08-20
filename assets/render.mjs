// PNGs are shot with headless Chrome to keep image tooling (rsvg, imagemagick) out of the repo
// PNG 는 헤드리스 크롬으로 찍는다 — 저장소에 이미지 도구를 들이지 않으려고 이미 있는 브라우저를 쓴다
// Override the binary path with the CHROME env var
// 크롬 경로가 다르면 CHROME 환경변수로 준다
import { execFileSync } from 'node:child_process'
import { mkdtempSync, readFileSync, writeFileSync, copyFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const web = resolve(here, '../nabi-web/docs/public')
const CHROME =
  process.env.CHROME ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'

// Only the `<g>` guts are taken — colour and padding are decided at each use site
// `<g>` 알맹이만 꺼낸다 — 색과 여백은 쓰는 자리에서 다시 정한다
const master = readFileSync(join(here, 'nabi-butterfly.svg'), 'utf8')
const guts = master.slice(master.indexOf('<g'), master.lastIndexOf('</g>') + 4)

// `scale` is the share of the 32 grid the mark takes — the remainder becomes padding
// `scale` 은 32 격자 안에서 차지할 비율이다 — 나머지가 여백이 된다
function mark(color, scale = 1) {
  const pad = (32 * (1 - scale)) / 2
  return `<g transform="translate(${pad} ${pad}) scale(${scale})" color="${color}">${guts}</g>`
}

// The colour is baked in because nothing in a browser tab passes down currentColor
// 탭에서는 currentColor 를 물려줄 사람이 없어 색을 박고 라이트/다크를 스스로 가른다
writeFileSync(
  join(web, 'nabi-note.svg'),
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none">
  <style>
    .mark { color: #4a63b8; }
    @media (prefers-color-scheme: dark) { .mark { color: #8ba0d4; } }
  </style>
  <g class="mark">${mark('currentColor', 0.86)}</g>
</svg>
`,
)

function shoot(name, width, height, body) {
  const dir = mkdtempSync(join(tmpdir(), 'nabi-icon-'))
  const page = join(dir, 'page.html')
  writeFileSync(
    page,
    `<!doctype html><meta charset="utf-8">
     <style>html,body{margin:0;width:${width}px;height:${height}px;overflow:hidden}</style>
     ${body}`,
  )
  execFileSync(CHROME, [
    '--headless=new',
    '--disable-gpu',
    '--hide-scrollbars',
    `--window-size=${width},${height}`,
    `--screenshot=${join(dir, 'shot.png')}`,
    page,
  ])
  copyFileSync(join(dir, 'shot.png'), join(web, name))
  rmSync(dir, { recursive: true, force: true })
  console.log(`${name} ${width}×${height}`)
}

// The iOS home screen cannot take transparency, so a background is laid under a white mark
// iOS 홈 화면은 투명을 못 쓰므로 바탕을 깔고 흰 마크를 얹는다
shoot(
  'apple-touch-icon.png',
  180,
  180,
  `<div style="width:180px;height:180px;background:#4a63b8;display:grid;place-items:center">
     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="124" height="124" fill="none">${mark('#ffffff')}</svg>
   </div>`,
)

// A dark plate keeps contrast alive wherever the share card is pasted
// 어두운 판이라 공유 카드가 어디에 붙어도 대비가 산다
shoot(
  'og.png',
  1200,
  630,
  `<div style="width:1200px;height:630px;background:#16181d;color:#e6e8ec;
               font:400 30px/1.5 -apple-system,'Noto Sans',system-ui,sans-serif;
               display:flex;flex-direction:column;justify-content:center;gap:34px;padding:0 96px;box-sizing:border-box">
     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="132" height="132" fill="none">${mark('#8ba0d4')}</svg>
     <div>
       <div style="font-size:82px;font-weight:800;letter-spacing:-.02em">NABI NOTE</div>
       <div style="margin-top:14px;color:#9aa1ac">Open-Source WYSIWYG Editor</div>
     </div>
   </div>`,
)
