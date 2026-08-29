---
title: 아랫첨자
description: 화학식처럼 글자를 기준선 아래에 작게 표시합니다.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# 아랫첨자

선택한 글자를 기준선 아래에 작게 표시합니다. 화학식의 `H₂O`처럼 아래 첨자가 필요한 표기에 알맞습니다. 수식 계산 기능을 추가하는 서식은 아니므로, 표현 자체를 보존해야 할 때 사용합니다.

<WingDemo path="/wing/inline/subscript" />

```ts
const selected = wings().use('sub').build()
```
