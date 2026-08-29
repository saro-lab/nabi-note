---
title: 유튜브
description: YouTube 영상을 문서에 삽입하는 wing입니다.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# 유튜브

YouTube 주소를 받아 임베드 블록으로 만들고, 문서 안에서 너비와 정렬을 조절합니다.

<WingDemo path="/wing/block/youtube" />

```ts
const selected = wings().use('youtube').build()
```
