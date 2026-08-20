---
title: 기울임
---

# 기울임

## 설명

`italicWing`은 `<i>`의 소유자(claim)입니다. 낯선 낱말이나 인용처럼 결을 달리하는
글자에 씁니다.

- 들어올 때는 `<i>`와 `<em>`을 함께 인정하고, 나갈 때는 `<i>` 하나로 모읍니다.
  속성은 하나도 살리지 않습니다.
- 힌트 모드(Shift 두 번 연타)의 단축키는 `I` — 물리 키(`KeyI`)로 잡아 한글 자판
  에서도 먹습니다. 가속키는 `Ctrl`/`⌘`+`I`(`mod+i`)입니다.
- 글자를 고른 채 누르면 토글입니다.
- 등록하지 않으면 `<i>`는 껍데기가 벗겨져 평문으로 떨어집니다.

## 사용 예시

```ts
import { createNabiWith, mountSurface, mountToolbar, italicWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// 날개 목록이 갈래 지식·커맨드·조립기를 함께 짓는다 — 그것이 `registry` 다
const { nabi, registry } = createNabiWith([italicWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## 데모

<WingDemo path="/wing/inline/italic" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
