---
title: 코드
description: 여러 줄의 코드와 구문 강조용 언어 정보를 담습니다.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# 코드

여러 줄의 코드를 일반 본문과 구분해 넣습니다. 빈 문단에 백틱 세 개를 입력한 뒤 Space 또는 Enter를 누르거나 툴바에서 전환합니다. 백틱 뒤에 `ts`처럼 언어 이름을 붙이면 그 이름도 함께 저장됩니다.

언어 이름은 구문 강조에 쓰는 식별자이며, 등록된 목록 밖 이름도 직접 입력할 수 있습니다. 코드 내용과 들여쓰기를 보존해야 하므로 코드 블록은 문단 정렬을 적용하지 않습니다.

<WingDemo path="/wing/block/code" />

```ts
const selected = wings().use('code').build()
```
