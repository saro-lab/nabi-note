---
title: 파일 업로드
description: 파일 전송을 호스트 업로더와 연결하는 wing입니다.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# 파일 업로드

드래그 앤 드롭, 붙여넣기, 파일 선택을 업로드 흐름으로 연결합니다. 이 페이지의 데모는 서버에 전송하지 않는 예제이며, 실제 서비스에서는 업로더를 직접 제공해야 합니다.

<WingDemo path="/wing/etc/upload" />

```ts
const selected = wings().use('upload', {
  allowLocalUrls: false,
}).build()
```

`upload`를 선택하면 업로드 결과를 표시하는 이미지와 링크 의존성도 함께 들어옵니다. 전송과 진행 상태 UI는 `mountUpload()`와 `mountUploadView()`로 연결하세요.
