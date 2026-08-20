---
title: 글자색
---

# 글자색

## 설명

`textColorWing`(이름 `tc`)은 `<span data-color="...">`의 소유자(claim)입니다. 형광펜과
같은 갈래로, 값을 가진 인라인 마크라 켜고 끄는 것이 아니라 색을 고릅니다.

- **툴바 단추(단축키 `C`)는 초록을 겁니다** — `setTextColor` 에 `{ c: 'green' }` 을 실어
  보냅니다. 인자 없이 도는 단추가 아닙니다.
- 그래서 이 단추의 토글은 **초록에 대한 토글**입니다. 고른 범위가 전부 초록일 때만 벗겨지고,
  다른 색이 걸려 있으면 초록으로 갈아입습니다.
- 캐럿이 글자색 마크 안에 있으면 상황 줄에 색 견본 다섯이 뜹니다 — 누르면 그 자리에서 색만
  바뀝니다(마크가 겹쳐 쌓이지 않습니다). 별도의 "지우기" 칸은 이 날개에 없습니다 — 같은 색을
  다시 누르면 벗겨지고, 그 밖은 `clearFormatWing` 의 몫입니다.
- **캐럿만 두고 골랐을 때는 두 갈래입니다.** 마크 안이면 그 마크가 덮은 글 전체가 겨눔이고,
  마크 밖이면 **예약**으로 남아 다음에 치는 글자가 그 색을 입습니다.
- 저장값에는 색 이름만 남습니다 — `data-color="green"` 같은 식. 인라인 `style` 은 나가지
  않습니다. 색값은 코어 토큰 `--nabi-tc-*` 이 들고, 시트는 형광펜과 한 벌을 나눠 씁니다.
- 들어올 때(`claim`)는 `<span>` 태그이면서 `data-color` 속성을 가진 것만 봅니다.
  `data-color` 가 아예 없는 `<span>` 은 이 날개가 주장하지 않아 껍데기가 벗겨져 평문으로
  떨어지고, **속성은 있는데 값이 목록 밖이면 그때도 껍데기가 벗겨져 글만 남습니다.**
- 손으로 고친 저장값의 목록 밖 값도 `repair` 가 껍데기째 걷습니다.
- 형광펜과는 서로 다른 마크라 같은 글자에 함께 걸 수 있습니다 — 형광펜 시트가 `color` 를
  안 적는 것이 그 까닭입니다.

| 색 이름 | 저장값 |
|---|---|
| 초록 | `green` |
| 코랄 | `coral` |
| 보라 | `violet` |
| 호박 | `amber` |
| 파랑 | `blue` |

이 다섯이 `TEXT_COLORS` 로 내보내집니다 — 색값이 아니라 **이름의 배열**입니다
(`readonly string[]`).

## 사용 예시

```ts
import { createNabiWith, mountSurface, mountToolbar, mountContextToolbar, textColorWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// 날개 목록이 갈래 지식·커맨드·조립기를 함께 짓는다 — 그것이 `registry` 다
const { nabi, registry } = createNabiWith([textColorWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })
mountContextToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#context')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## 데모

<WingDemo path="/wing/inline/text-color" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
