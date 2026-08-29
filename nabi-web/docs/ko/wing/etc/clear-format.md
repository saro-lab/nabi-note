---
title: 서식 지우기
description: 선택 영역의 글자 서식을 한 번에 제거하는 wing입니다.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# 서식 지우기

선택 영역에 겹쳐진 기본 글자 서식과 일부 문단 속성을 지웁니다. 문서 구조와 객체 블록을 무조건 평문으로 바꾸지는 않습니다.

<WingDemo path="/wing/etc/clear-format" />

```ts
const selected = wings()
  .use('b')
  .use('i')
  .use('clearFormat')
  .build()
```

지울 대상 wing도 함께 선택해야 실제로 동작을 확인할 수 있습니다.
