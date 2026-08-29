---
title: 제목
description: 문서의 제목 단계를 만드는 wing입니다.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# 제목

문단을 제목으로 바꾸고 제목 단계를 선택합니다. 빈 문단에서 `#` 뒤에 Space를 입력해도 제목으로 전환됩니다.

<WingDemo path="/wing/block/heading" />

```ts
const selected = wings().use('h').build()
```
