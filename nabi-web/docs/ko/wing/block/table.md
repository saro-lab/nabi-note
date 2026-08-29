---
title: 표
description: 행과 열, 셀 병합과 정렬을 다루는 wing입니다.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# 표

툴바에서 표를 만들고 행·열 추가, 삭제, 셀 병합, 제목 셀 전환을 사용할 수 있습니다. 정렬을 켠 표는 viewer에서 제목 셀을 눌러 값을 정렬할 수 있습니다.

<WingDemo path="/wing/block/table" />

```ts
const selected = wings().use('table').build()
```
