---
title: 드롭캡
description: 문단 첫 글자를 크게 배치해 본문을 시작합니다.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# 드롭캡

문단 첫 글자를 크게 놓고 나머지 줄이 그 옆으로 흐르게 합니다. 문단 단위의 서식이므로 글자 일부만 선택해 적용하지 않습니다.

발행 화면과 편집 화면은 같은 모양을 유지합니다. 편집할 때는 첫 글자를 실제 요소로 감싸 캐럿과 삭제 위치가 어긋나지 않게 처리하며, 이 요소는 저장되는 문서 내용에는 포함되지 않습니다.

<WingDemo path="/wing/etc/dropcap" />

```ts
const selected = wings().use('dc').build()
```
