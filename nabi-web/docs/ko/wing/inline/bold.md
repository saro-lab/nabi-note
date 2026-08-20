---
title: 굵게
---

# 굵게

## 설명

`boldWing`은 `<b>`의 소유자(claim)입니다. 글자를 고르고 툴바의 **B**를 누르거나
힌트 모드(Shift 두 번 연타 후 `B`)로 걸면 그 범위가 굵어집니다.

- 들어올 때는 `<b>`와 `<strong>`을 함께 인정하고, 나갈 때는 언제나 `<b>` 하나로
  나갑니다. 속성은 하나도 살리지 않습니다 — `class`·`style`·`data-*`는 떨어지고
  태그만 남습니다.
- 힌트 모드 단축키는 `B`, 가속키는 `Ctrl`/`⌘`+`B`(`mod+b`)입니다.
- 글자를 고른 채 누르면 토글(`toggleMark`)입니다 — 이미 전부 굵으면 벗기고,
  아니면 겁니다. 이 wing 은 자기 커맨드를 두지 않습니다 — 단추가 `action:
  { kind: 'mark' }`라 코어의 `toggleMark` 로 바로 갑니다.
- 등록하지 않으면 `<b>`는 껍데기가 벗겨져 평문으로 떨어집니다(등록 안 된 태그는
  전부 이렇게 됩니다 — nabi 전체의 규칙).

## 사용 예시

```ts
import { createNabiWith, mountSurface, mountToolbar, boldWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// 날개 목록이 갈래 지식·커맨드·조립기를 함께 짓는다 — 그것이 `registry` 다
const { nabi, registry } = createNabiWith([boldWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## 데모

<WingDemo path="/wing/inline/bold" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
