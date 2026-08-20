---
title: 밑줄
---

# 밑줄

## 설명

`underlineWing`은 `<u>`의 소유자(claim)입니다.

- 인정하는 태그는 `<u>` 하나입니다. 나갈 때도 언제나 `<u>` 이고 속성은 하나도
  살리지 않습니다. **`<ins>` 는 안 받습니다** — 껍데기가 벗겨지고 글자만 남습니다.
  굵게(`<b>`·`<strong>`)나 취소선(`<s>`·`<strike>`·`<del>`)처럼 짝을 함께 받는
  마크가 아닙니다.
- 힌트 모드 단축키는 `U`, 가속키는 `Ctrl`/`⌘`+`U`(`mod+u`)입니다.
- 글자를 고른 채 누르면 토글입니다.
- 등록하지 않으면 `<u>`는 껍데기가 벗겨져 평문으로 떨어집니다.
- 밑줄과 링크는 화면에서 모양이 겹칠 수 있지만 서로 다른 wing(`a`)이 소유하는
  별개의 마크입니다 — 같은 글자에 둘 다 걸릴 수 있습니다.

## 사용 예시

```ts
import { createNabiWith, mountSurface, mountToolbar, underlineWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// 날개 목록이 갈래 지식·커맨드·조립기를 함께 짓는다 — 그것이 `registry` 다
const { nabi, registry } = createNabiWith([underlineWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## 데모

<WingDemo path="/wing/inline/underline" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
