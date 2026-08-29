---
title: 취소선
description: 지운 값이나 변경 전 내용을 남겨 두는 wing입니다.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# 취소선

선택한 글자 가운데에 선을 그어, 삭제되었거나 더 이상 유효하지 않은 내용임을 보여 줍니다.

<WingDemo path="/wing/inline/strikethrough" />

```ts
const selected = wings().use('s').build()
```
