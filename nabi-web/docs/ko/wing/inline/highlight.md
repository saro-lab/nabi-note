---
title: 형광펜
description: 선택한 글자의 배경색을 강조하는 wing입니다.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# 형광펜

선택한 글자에 의미가 있는 색 토큰을 적용합니다. 저장 데이터에는 임의의 CSS 색상값 대신 허용된 토큰이 남습니다.

<WingDemo path="/wing/inline/highlight" />

```ts
const selected = wings().use('hl', {
  values: ['yellow', 'green', 'cyan'],
}).build()
```

`values`를 생략하면 기본 팔레트를 사용합니다.
