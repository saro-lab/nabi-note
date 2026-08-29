---
title: 서체
description: 문단의 서체 갈래를 선택하는 wing입니다.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# 서체

문단에 서체 토큰을 적용합니다. 실제 font-family는 사이트 CSS가 정하므로 서비스의 브랜드와 지원 언어에 맞춰 바꿀 수 있습니다.

<WingDemo path="/wing/etc/typeface" />

```ts
const selected = wings().use('tf', {
  values: ['sans', 'serif', 'mono'],
}).build()
```

`values`를 생략하면 기본 목록을 사용합니다.
