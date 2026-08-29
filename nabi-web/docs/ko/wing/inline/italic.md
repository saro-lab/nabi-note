---
title: 기울임
description: 선택한 글자를 기울여 본문과 구분합니다.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# 기울임

선택한 글자를 기울여 표시합니다. 작품명이나 외국어처럼 본문과 결을 살짝 나눌 때 쓰기 좋고, 이미 기울임이 적용된 범위에서는 다시 눌러 해제합니다.

<WingDemo path="/wing/inline/italic" />

```ts
const selected = wings().use('i').build()
```
