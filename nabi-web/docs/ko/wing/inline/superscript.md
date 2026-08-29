---
title: 윗첨자
description: 각주와 지수처럼 글자를 기준선 위에 작게 표시합니다.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# 윗첨자

선택한 글자를 기준선 위에 작게 표시합니다. 지수나 각주 표시에 쓸 수 있고, 선택한 범위에만 적용됩니다.

<WingDemo path="/wing/inline/superscript" />

```ts
const selected = wings().use('sup').build()
```
