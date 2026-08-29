---
title: 구분선
description: 문서의 흐름을 나누는 가로선을 만드는 wing입니다.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# 구분선

빈 문단에 하이픈을 이어 쓰고 Enter를 누르면 구분선으로 바뀝니다. 툴바에서도 바로 삽입할 수 있습니다.

<WingDemo path="/wing/block/divider" />

```ts
const selected = wings().use('hr').build()
```
