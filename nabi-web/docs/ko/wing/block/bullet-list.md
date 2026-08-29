---
title: 글머리 목록
description: 순서 없는 목록을 만드는 wing입니다.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# 글머리 목록

빈 문단에서 `-` 뒤에 Space를 입력하면 글머리 목록이 됩니다. Tab과 Shift+Tab으로 목록의 깊이를 바꿀 수 있습니다.

<WingDemo path="/wing/block/bullet-list" />

```ts
const selected = wings().use('ul').build()
```
