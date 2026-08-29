---
title: 밑줄
description: 선택한 글자에 이동 기능 없는 밑줄을 긋습니다.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# 밑줄

선택한 글자에 밑줄을 긋습니다. 링크처럼 보일 수 있지만 주소나 이동 동작은 생기지 않는 단순한 글자 서식입니다.

<WingDemo path="/wing/inline/underline" />

```ts
const selected = wings().use('u').build()
```
