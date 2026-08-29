---
title: 코드
description: 코드 블록과 언어 정보를 다루는 wing입니다.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# 코드

빈 문단에 백틱 세 개를 입력한 뒤 Space 또는 Enter를 누르면 코드 블록이 됩니다. 백틱 뒤에 언어 이름을 붙이면 구문 강조용 언어 정보도 저장됩니다.

<WingDemo path="/wing/block/code" />

```ts
const selected = wings().use('code').build()
```
