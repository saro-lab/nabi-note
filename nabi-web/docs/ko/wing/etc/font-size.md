---
title: 글자 크기
description: 허용된 단계로 글자 크기를 바꾸는 wing입니다.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# 글자 크기

선택한 글자에 크기 토큰을 적용합니다. 저장 데이터는 px 같은 임의 값이 아니라 허용된 단계만 가집니다.

<WingDemo path="/wing/etc/font-size" />

```ts
const selected = wings().use('fs', {
  values: ['sm', 'lg', 'xl'],
}).build()
```

`values`를 생략하면 기본 목록을 사용합니다.
