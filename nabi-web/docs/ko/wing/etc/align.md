---
title: 정렬
description: 문단과 객체 블록의 가로 정렬을 바꿉니다.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# 정렬

현재 문단과 선택 범위에 걸친 문단을 왼쪽, 가운데, 오른쪽으로 정렬합니다. 그림·영상·표처럼
문단에 들어가는 객체도 그 객체를 감싼 문단을 기준으로 정렬합니다.

정렬은 글자 서식이 아니라 문단 속성으로 저장됩니다. 코드 블록은 들여쓰기 자체가 의미를
가지므로 정렬 대상에서 제외됩니다.

<WingDemo path="/wing/etc/align" />

```ts
const selected = wings().use('align').build()
```
