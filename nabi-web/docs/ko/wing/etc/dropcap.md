---
title: 드롭 캡
---

# 드롭 캡

## 설명

`dropCapWing`은 문단에 `data-nabi-dropcap="1"` 을 다는 단일값 문단 속성입니다.
새로운 블록을 만들지 않고 이미 있는 문단에 표시만 얹습니다.

- 값은 켜짐/꺼짐 하나뿐입니다 — 버튼을 다시 누르면 속성이 떨어집니다.
- **몇 줄을 감쌀지 정하는 옵션도 변수도 없습니다.** 코어 시트의 `::first-letter` 규칙
  하나가 크기를 고정합니다 — `font-size: 5.9em; line-height: .83`. 글자가 실제로 몇 줄을
  덮을지는 그 문단의 줄 높이가 정합니다.
- 닿는 곳이 첫 글자 하나뿐이라 Enter 는 이 속성을 마크처럼 다룹니다 — 문단을
  둘로 나눠도 양쪽에 복제되지 않고 그 글자를 따라갑니다.

크기를 바꾸려면 그 규칙을 덮습니다.

```css
.nabi-content [data-nabi-dropcap="1"]::first-letter { font-size: 4.6em; line-height: .86; }
```

## 사용 예시

```ts
import { createNabiWith, mountSurface, mountToolbar, dropCapWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// 날개 목록이 갈래 지식·커맨드·조립기를 함께 짓는다 — 그것이 `registry` 다
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
