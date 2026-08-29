---
title: 드롭캡
description: 문단의 첫 글자를 크게 배치하는 wing입니다.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# 드롭캡

문단의 첫 글자를 크게 놓고 이어지는 줄이 그 옆으로 흐르게 합니다. 편집 화면에서는 캐럿과 삭제 위치가 어긋나지 않도록 실제 글자 span을 사용합니다.

<WingDemo path="/wing/etc/dropcap" />

```ts
const selected = wings().use('dc').build()
```
