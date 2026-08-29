---
title: 굵게
description: 선택한 글자를 굵게 표시합니다.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# 굵게

선택한 글자를 굵게 표시합니다. 같은 범위에 다시 적용하면 굵게를 걷어냅니다. 저장한 문서에서도 굵게 서식은 글자와 함께 유지됩니다.

<WingDemo path="/wing/inline/bold" />

```ts
const selected = wings().use('b').build()
```
