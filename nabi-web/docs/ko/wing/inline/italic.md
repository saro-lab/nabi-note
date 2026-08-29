---
title: 기울임
description: 선택한 글자를 기울여 표시하는 wing입니다.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# 기울임

인용, 외국어, 작품명처럼 본문과 결이 다른 글자를 기울여 표시합니다.

<WingDemo path="/wing/inline/italic" />

```ts
const selected = wings().use('i').build()
```
