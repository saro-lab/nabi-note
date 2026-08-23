---
title: 구분선
---

# 구분선

## 설명

`dividerWing`(식별자 `hr`)은 가로 구분선(`<hr>`)을 처리합니다. `place: 'void'` 객체로 내부에 텍스트가 들어가지 않으며, 구분선 바로 앞뒤에서 Backspace 또는 Delete 키를 누르면 구분선 블록 전체가 삭제됩니다.

버튼을 클릭하면 구분선이 **전용 래퍼 문단(`<div data-nabi-p>`)으로 감싸여 삽입**됩니다. 커서는 구분선 바로 뒤에 위치합니다.

삽입 위치는 현재 커서가 위치한 문단 상태에 따라 동작합니다:

| 현재 커서 위치 | 삽입 동작 |
|---|---|
| 텍스트가 있는 문단 | 해당 문단 **뒤에** 새 구분선 삽입 |
| 빈 문단 | 해당 빈 문단을 **구문선으로 교체** (불필요한 빈 줄 방지) |

빈 문단을 교체할 때 해당 문단에 적용되어 있던 텍스트 정렬 속성은 그대로 유지됩니다.

빈 줄에서 하이픈을 3개 이상 입력한 후 Enter 키를 누르면(`---` + Enter) 구분선으로 자동 변환됩니다.

## 사용 예시

```ts
import { createNabiWith, mountSurface, mountToolbar, dividerWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

const { nabi, registry } = createNabiWith([dividerWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## 데모

<WingDemo path="/wing/block/divider" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
