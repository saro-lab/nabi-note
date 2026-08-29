---
title: 글자색
description: 선택한 글자에 허용된 색 토큰을 적용하는 wing입니다.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# 글자색

선택한 글자의 색을 바꿉니다. 팔레트 이름은 CSS 변수와 이어지므로 라이트·다크 테마에서 각각 읽기 좋은 실제 색을 지정할 수 있습니다.

<WingDemo path="/wing/inline/text-color" />

```ts
const selected = wings().use('tc', {
  values: ['green', 'coral', 'blue'],
}).build()
```

`values`를 생략하면 기본 팔레트를 사용합니다.
