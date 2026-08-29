---
title: 체크리스트
description: 완료 상태를 가진 목록을 만드는 wing입니다.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# 체크리스트

빈 문단에서 `[ ]` 또는 `[x]` 뒤에 Space를 입력하면 체크리스트가 됩니다. 체크 상태는 NABI TREE에 함께 저장됩니다.

<WingDemo path="/wing/block/task-list" />

```ts
const selected = wings().use('tl').build()
```
