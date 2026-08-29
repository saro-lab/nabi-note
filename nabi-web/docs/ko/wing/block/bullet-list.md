---
title: 글머리 목록
description: 여러 항목을 순서 없이 나열합니다.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# 글머리 목록

여러 항목을 순서 없이 나열하는 목록입니다. 빈 문단에서 `-` 뒤에 Space를 입력하거나 툴바에서 전환합니다. 선택한 문단도 한 번에 목록으로 묶을 수 있습니다.

목록 안에서는 Tab으로 한 단계 들여쓰고 Shift+Tab으로 내어씁니다. Enter는 다음 항목을 만들며, 비어 있는 항목에서 다시 Enter를 누르면 목록을 끝낼 수 있습니다.

<WingDemo path="/wing/block/bullet-list" />

```ts
const selected = wings().use('ul').build()
```
