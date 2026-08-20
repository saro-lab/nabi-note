---
title: 글자 크기
---

# 글자 크기

## 설명

`fontSizeWing`(이름 `fs`)은 **인라인 값 마크**입니다. 글자 위에 씌우는 서식이지 문단 속성이
아닙니다. 나갈 때는 `<span data-nabi-size="lg">` 로 그려집니다.

값은 `xs`·`sm`·`lg`·`xl` 넷이고, 기본 크기는 다섯째 값이 아니라 **속성이 아예 없는 것**입니다.

- 서체(`tf`)와 짝입니다 — 날개 하나가 값 전부를 들고, 고르는 자리는 상황 줄입니다. 다만
  서체는 칸 넷을 늘어놓고, 크기는 눈금 하나를 씁니다.
- **상황 줄은 눈금(`range`)입니다.** 크기는 순서를 갖는 값이라(작게 → 크게) 칸을 늘어놓는
  대신 손잡이 하나로 밉니다. 지금 걸린 값이 손잡이 자리로 보이고, 이름표에 그 값의 이름이
  함께 뜹니다.
- **눈금의 맨 앞 칸이 "기본"입니다.** 가운데가 아니라 맨 앞인 까닭은 목록이 작은 것부터 큰 것
  순이라, 그 앞이 "아무것도 안 걸림" 의 자리이기 때문입니다. 이 칸으로 옮기면 `base` 같은 값이
  써지는 것이 아니라 **마크가 벗겨집니다**.
- **칸의 이름표는 로케일을 탑니다** — 한국어에서는 "기본 · 아주 작게 · 작게 · 크게 ·
  아주 크게" 입니다.
- 툴바 단추를 누르면 **`lg`(크게)** 가 걸립니다. 눈금이 작은 것부터라 그냥 두면 첫 칸인 `xs` 가
  걸리는데, 크기 단추를 눌러 글자가 작아지기를 바라는 사람은 없기 때문입니다.
- **캐럿만 있을 때는 그 문단 전체**에 걸립니다. 크기는 낱말 하나만 키우는 일이 드물어, 범위를
  안 잡았으면 문단을 겨눕니다(형광펜·글자색은 이와 달리 지금 마크 구간만 겨눕니다).
- 글이 한 글자도 없는 문단에서 누르면 **예약**으로 남습니다 — 다음에 치는 글자가 그 크기를
  입고 나옵니다.
- 같은 값을 다시 걸면 벗습니다.

## 사용 예시

```ts
import { createNabiWith, mountSurface, mountToolbar, mountContextToolbar, fontSizeWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// 날개 목록이 갈래 지식·커맨드·조립기를 함께 짓는다 — 그것이 `registry` 다
const { nabi, registry } = createNabiWith([fontSizeWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })
mountContextToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#context')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## 데모

<WingDemo path="/wing/etc/font-size" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
