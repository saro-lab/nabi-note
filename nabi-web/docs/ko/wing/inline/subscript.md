---
title: 아랫첨자
description: 화학식처럼 글자를 아래에 작게 표시하는 wing입니다.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# 아랫첨자

선택한 글자를 기준선 아래에 작게 표시합니다. 화학식이나 수식 표기에 사용할 수 있습니다.

<WingDemo path="/wing/inline/subscript" />

```ts
const selected = wings().use('sub').build()
```
