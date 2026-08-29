---
title: 취소선
description: 지운 값이나 변경 전 내용에 취소선을 표시합니다.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# 취소선

선택한 글자 가운데에 선을 긋습니다. 바뀐 문구나 더는 유효하지 않은 내용을 지우지 않고 남겨 둘 때 쓸 수 있으며, 같은 범위에 다시 적용하면 해제됩니다.

<WingDemo path="/wing/inline/strikethrough" />

```ts
const selected = wings().use('s').build()
```
