---
title: 번호 목록
description: 순서가 중요한 항목을 번호 목록으로 만듭니다.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# 번호 목록

순서가 중요한 항목을 번호 목록으로 만듭니다. 빈 문단에서 `1.`처럼 숫자와 마침표를 입력한 뒤 Space를 누르거나, 선택한 문단을 툴바에서 전환합니다.

표시되는 번호는 항목의 위치에서 계산하므로 항목을 추가하거나 들여써도 자동으로 이어집니다. 입력한 시작 숫자를 저장해 임의의 번호부터 세는 기능은 제공하지 않습니다.

<WingDemo path="/wing/block/ordered-list" />

```ts
const selected = wings().use('ol').build()
```
