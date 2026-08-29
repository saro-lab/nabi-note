---
title: 서식 지우기
description: 선택 영역의 글자 서식과 문단 서식을 걷어냅니다.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# 서식 지우기

선택 영역의 글자 서식을 한꺼번에 걷어냅니다. 굵게, 색, 서체와 같은 등록된 기본 mark와 제목·정렬·드롭캡 문단 속성이 대상입니다. Esc를 빠르게 두 번 눌러도 같은 동작을 할 수 있습니다.

목록, 표, 인용, 이미지처럼 문서 구조를 평문으로 바꾸지는 않습니다. 이미지와 영상의 바깥 정렬, 업로드로 만든 첨부 링크도 그대로 남습니다.

<WingDemo path="/wing/etc/clear-format" />

```ts
const selected = wings()
  .use('b')
  .use('i')
  .use('clearFormat')
  .build()
```

지울 대상 서식 wing도 함께 골라야 그 서식을 지울 수 있습니다.
