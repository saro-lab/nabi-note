---
title: 구분선
description: 문서 흐름을 나누는 가로선을 삽입합니다.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# 구분선

문서의 흐름을 가르는 가로선입니다. 빈 문단에 하이픈을 세 개 이상 입력한 뒤 Enter를 누르거나 툴바에서 삽입합니다.

구분선은 글자가 없는 독립 블록이라 제목이나 색 같은 서식을 담지 않습니다. 앞뒤 문단을 나누는 용도로만 사용합니다.

<WingDemo path="/wing/block/divider" />

```ts
const selected = wings().use('hr').build()
```
