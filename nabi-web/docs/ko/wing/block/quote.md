---
title: 인용문
---

# 인용문

## 설명

`quoteWing`(식별자 `quote`)은 인용문 블록(`<blockquote>`)을 처리합니다. `place: 'container'` 및 `holds: 'blocks'` 속성을 가지며, 내부에 일반 문단뿐만 아니라 표나 이미지 등 다른 블록 요소를 포함할 수 있습니다.

```json
[{"w":"p","ch":[{"w":"quote","ch":[
  {"w":"p","ch":["인용 텍스트"]},
  {"w":"p","ch":[{"w":"table","ch":[]}]}
]}]}]
```

툴바 버튼을 클릭하면 선택된 블록들이 인용문 블록으로 감싸집니다. 선택 영역이 이미 인용문인 경우 인용문이 해제됩니다.

문단 시작 위치에서 `> `(꺾쇠와 공백)을 입력하면 해당 문단이 인용문으로 자동 변환됩니다.

## 사용 예시

```ts
import { createNabiWith, mountSurface, mountToolbar, quoteWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

const { nabi, registry } = createNabiWith([quoteWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## 데모

<WingDemo path="/wing/block/quote" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
