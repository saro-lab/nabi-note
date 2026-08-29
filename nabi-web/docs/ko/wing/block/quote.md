---
title: 인용
description: 여러 문단을 묶는 인용 블록 wing입니다.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# 인용

빈 문단에서 `>` 뒤에 Space를 입력하면 인용 블록이 됩니다. 인용 안에 문단을 이어 쓸 수 있습니다.

<WingDemo path="/wing/block/quote" />

```ts
const selected = wings().use('quote').build()
```
