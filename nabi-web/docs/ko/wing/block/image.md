---
title: 이미지
description: 이미지 주소, 너비와 정렬을 다루는 wing입니다.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# 이미지

이미지 주소를 문서에 넣고 너비와 문단 정렬을 바꿉니다. 로컬 URL은 기본적으로 거부되며, 필요할 때만 명시적으로 허용해야 합니다.

<WingDemo path="/wing/block/image" />

```ts
const selected = wings().use('img', {
  allowLocalUrls: false,
}).build()
```

파일을 서버로 보내는 기능은 [업로드 wing](/ko/wing/etc/upload)이 담당합니다.
