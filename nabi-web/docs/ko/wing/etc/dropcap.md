---
title: 드롭캡 (첫 글자 장식)
---

# 드롭캡 (첫 글자 장식)

## 설명

`dropCapWing`은 문단의 첫 글자를 대형 장식 글자로 표현하는 문단 속성 날개입니다 (`data-nabi-dropcap="1"`).

- 켜짐/꺼짐 단일 토글 방식으로 동작합니다.
- 코어 스타일시트의 `::first-letter` 규칙을 통해 첫 글자의 크기가 고정 렌더링됩니다 (`font-size: 5.9em; line-height: .83`).
- 텍스트 입력 시 Enter로 문단을 분할해도 첫 글자 속성은 복제되지 않고 원본 첫 글자에만 유지됩니다.

크기를 커스텀하려면 아래 CSS 규칙을 재정의할 수 있습니다:

```css
.nabi-content [data-nabi-dropcap="1"]::first-letter { font-size: 4.6em; line-height: .86; }
```

## 사용 예시

```ts
import { createNabiWith, mountSurface, mountToolbar, dropCapWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

const { nabi, registry } = createNabiWith([dropCapWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## 데모

<WingDemo path="/wing/etc/dropcap" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
