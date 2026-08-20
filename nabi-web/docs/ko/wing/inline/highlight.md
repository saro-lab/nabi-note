---
title: 형광펜
---

# 형광펜

## 설명

`highlightWing`(이름 `hl`)은 `<mark data-color="...">`의 소유자(claim)입니다. 값을 가진
인라인 마크라 켜고 끄는 토글이 아니라 색을 고르는 갈래입니다 — 글자색과 같은 결입니다.

- **툴바 단추(단축키 `H`)는 노랑을 겁니다** — `setHighlight` 에 `{ c: 'yellow' }` 를 실어
  보냅니다. 인자 없이 도는 단추가 아닙니다.
- 그래서 이 단추의 토글은 **노랑에 대한 토글**입니다. 고른 범위가 **전부 노랑일 때만** 벗겨
  집니다 — 전부 초록인 범위에서 누르면 벗겨지는 대신 노랑으로 갈아입고, 한 번 더 눌러야
  벗겨집니다.
- 캐럿이 형광펜 마크 안에 있으면 상황 줄에 색 견본 여섯이 뜹니다 — 누르면 그 자리에서 색만
  바뀝니다. 별도의 "지우기" 칸은 이 날개에 없습니다. 같은 색을 다시 누르면 벗겨지고, 서식
  지우기는 `clearFormatWing` 의 몫입니다(따로 등록해야 합니다).
- **캐럿만 두고 골랐을 때는 두 갈래입니다.** 캐럿이 이미 형광펜 마크 안이면 그 마크가 덮은
  글 전체가 겨눔이 됩니다(범위를 다시 고를 필요가 없습니다). 마크 밖이면 걸 글자가 없으므로
  **예약**으로 남아, 다음에 치는 글자가 그 색을 입고 나옵니다.
- 저장값에는 색 이름만 남습니다 — `data-color="yellow"` 같은 식. 인라인 `style` 은 나가지
  않습니다. 실제 배경색은 이 날개가 `styles` 로 나르는 시트가 그리고(글자색과 한 벌을 나눠
  씁니다), 색값 자체는 코어 토큰 `--nabi-hl-*` 이 듭니다 — 호스트는 그 토큰을 덮어 바꿉니다.
- **목록 밖 값은 어디서도 안 삽니다.** 커맨드는 아예 안 돌고, 들어오는 HTML 에서 목록에 없는
  `data-color` 를 단 `<mark>` 은 껍데기가 벗겨져 **글만 남습니다.** `data-color` 가 아예 없는
  `<mark>` 도 마찬가지입니다 — 색이 곧 값이라 값 없는 형광펜은 설 자리가 없습니다.
- 손으로 고친 저장값도 같습니다 — `repair` 가 목록 밖 값을 만나면 그 노드를 껍데기째 걷습니다.

| 색 이름 | 저장값 |
|---|---|
| 노랑 | `yellow` |
| 연두 | `green` |
| 하늘 | `cyan` |
| 분홍 | `pink` |
| 보라 | `purple` |
| 주황 | `orange` |

이 여섯이 `HIGHLIGHT_COLORS` 로 내보내집니다 — 색값이 아니라 **이름의 배열**입니다
(`readonly string[]`). 색값은 시트가 듭니다.

## 사용 예시

```ts
import { createNabiWith, mountSurface, mountToolbar, mountContextToolbar, highlightWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// 날개 목록이 갈래 지식·커맨드·조립기를 함께 짓는다 — 그것이 `registry` 다
const { nabi, registry } = createNabiWith([highlightWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })
mountContextToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#context')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## 데모

<WingDemo path="/wing/inline/highlight" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
