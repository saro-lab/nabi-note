---
title: 접기
description: 요약과 본문을 접고 펼치는 블록 wing입니다.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# 접기

요약 줄과 본문을 한 블록으로 묶습니다. 펼침 상태도 문서에 저장되어 viewer에서 같은 상태로 시작할 수 있습니다.

<WingDemo path="/wing/block/details" />

```ts
const selected = wings().use('details').build()
```
