# icon/original — 원본 보관

`nabi-butterfly.svg` 가 **마스터**다 (후보 `06-tilt` 로 확정, 2026-08-05).

- 좌표는 32×32 격자. 색은 `currentColor` 하나로만 쓴다 — 쓰는 자리에서 색이 정해진다.
- 날개는 넷이고 **몸통을 그리지 않는다** — 날개 사이의 틈이 몸통으로 읽힌다.
- 아래 날개를 먼저 깔고 위 날개가 덮는다. 같은 쪽에서도 톤을 갈라(1 / .78, 반대쪽 .55 / .40)
  겹친 자리에 층이 보인다.
- 모서리는 같은 색 선(`stroke-linejoin: round`)으로 깎았다. 선을 두껍게 하면 몸통 틈이
  좁아지므로, 안쪽 모서리를 선 굵기의 절반만큼 미리 벌려 두었다.

## 여기서 나간 것

| 파일 | 무엇 |
|---|---|
| `nabi-web/docs/public/nabi-note.svg` | 파비콘 — 색을 박고 여백을 줬다 (라이트/다크 자동) |
| `nabi-web/docs/public/apple-touch-icon.png` | iOS 홈 화면 180×180 |
| `nabi-web/docs/public/og.png` | 공유 카드 1200×630 |
| `nabi-web/docs/.vitepress/ui/Mark.vue` | 헤더 로고 (사이트 색을 따라간다) |

**고칠 때는 이 마스터를 고치고 아래 것들을 다시 뽑는다** — 파생물을 직접 손대지 않는다.
다시 뽑는 방법은 `render.mjs` 주석에 있다.
