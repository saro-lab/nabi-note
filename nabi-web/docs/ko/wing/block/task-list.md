---
title: 체크리스트
description: 완료 상태를 문서에 함께 저장하는 목록입니다.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# 체크리스트

완료 여부가 있는 목록입니다. 빈 문단에서 `[ ]` 또는 `[x]` 뒤에 Space를 입력하거나 툴바에서 만들고, 체크 상자를 눌러 상태를 바꿉니다.

체크 여부는 항목 속성으로 문서에 함께 저장됩니다. 항목을 나눌 때는 체크 상태가 빈 앞 항목이 아니라 글자가 남은 항목을 따라가므로, 완료한 일을 둘로 나눠도 상태가 뒤바뀌지 않습니다.

<WingDemo path="/wing/block/task-list" />

```ts
const selected = wings().use('tl').build()
```
