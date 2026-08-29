---
title: 번호 목록
description: 순서가 있는 목록을 만드는 wing입니다.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# 번호 목록

빈 문단에서 `1.` 뒤에 Space를 입력하면 번호 목록이 됩니다. 항목을 추가하거나 들여써도 번호는 문서 구조에 맞춰 이어집니다.

<WingDemo path="/wing/block/ordered-list" />

```ts
const selected = wings().use('ol').build()
```
