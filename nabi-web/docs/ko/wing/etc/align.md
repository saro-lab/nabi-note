---
title: 정렬
description: 문단과 블록의 가로 정렬을 바꾸는 wing입니다.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# 정렬

현재 문단이나 선택한 블록을 왼쪽, 가운데, 오른쪽으로 정렬합니다. 정렬은 글자 mark가 아니라 블록 속성으로 저장됩니다.

<WingDemo path="/wing/etc/align" />

```ts
const selected = wings().use('align').build()
```
