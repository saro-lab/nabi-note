---
title: 제목
description: 문단을 제목으로 바꾸고 단계를 정합니다.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# 제목

문단을 제목으로 바꾸고 단계도 정합니다. 툴바에서 제목을 켠 뒤 H1부터 H6까지 고르거나, 빈 문단에서 `#`부터 `######` 뒤에 Space를 입력합니다.

제목은 별도 블록 종류가 아니라 문단에 저장되는 속성입니다. 제목을 다시 누르면 일반 문단으로 돌아오므로, 본문 구조를 유지한 채 단계만 바꿀 수 있습니다.

<WingDemo path="/wing/block/heading" />

```ts
const selected = wings().use('h').build()
```
