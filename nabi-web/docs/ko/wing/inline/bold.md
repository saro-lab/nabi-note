---
title: 굵게
description: 선택한 글자를 굵게 표시하는 wing입니다.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# 굵게

선택한 글자에 굵은 강조를 적용합니다. 같은 버튼을 다시 누르면 서식이 해제됩니다.

<WingDemo path="/wing/inline/bold" />

```ts
const selected = wings().use('b').build()
```
