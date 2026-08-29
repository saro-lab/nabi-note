---
title: 글자 크기
description: 허용한 단계 안에서 글자 크기를 바꿉니다.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# 글자 크기

선택한 글자의 크기 단계를 바꿉니다. 범위를 선택하면 그 범위에 적용하고, 캐럿만 있으면 현재 문단의 글자 크기를 바꿉니다. 저장 데이터에는 `px` 같은 임의 값이 아니라 허용한 단계만 남습니다.

<WingDemo path="/wing/etc/font-size" />

```ts
const selected = wings().use('fs', {
  values: ['sm', 'lg', 'xl'],
}).build()
```

`values`를 생략하면 `xs`, `sm`, `lg`, `xl` 단계를 사용합니다. 목록을 좁히면 이전 문서에 들어 있던 다른 단계도 불러올 때 제거됩니다.
