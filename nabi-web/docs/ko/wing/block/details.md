---
title: 접기
description: 요약과 본문을 묶고 처음 펼칠 상태를 저장합니다.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# 접기

짧은 요약과 본문을 한 블록으로 묶습니다. 툴바에서 만들면 먼저 요약을 입력하고 그 아래에 내용을 이어 쓸 수 있습니다.

삼각형으로 정한 펼침 상태는 문서에 저장되어 발행 화면의 처음 상태가 됩니다. 편집 중에는 내용을 고칠 수 있도록 본문을 펼쳐 두지만, 저장되는 상태값은 그대로 유지됩니다.

<WingDemo path="/wing/block/details" />

```ts
const selected = wings().use('details').build()
```
