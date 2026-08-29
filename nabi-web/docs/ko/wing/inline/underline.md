---
title: 밑줄
description: 선택한 글자에 밑줄을 긋는 wing입니다.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# 밑줄

선택한 글자에 밑줄을 적용합니다. 링크의 밑줄과 달리 이동 기능은 생기지 않습니다.

<WingDemo path="/wing/inline/underline" />

```ts
const selected = wings().use('u').build()
```
