---
title: 파일 업로드
description: 파일 전송을 서비스의 업로더와 연결합니다.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# 파일 업로드

파일 선택, 드래그 앤 드롭, 파일만 들어 있는 붙여넣기를 업로드 흐름으로 연결합니다. 이 페이지의 데모는 서버에 보내지 않으며, 서비스에서는 파일을 받고 URL을 돌려주는 업로더를 직접 연결해야 합니다.

업로드 결과를 이미지 블록으로 넣으려면 이미지 날개가, 그 밖의 파일을 첨부 링크로 넣으려면 링크 날개가 필요합니다. 두 형식을 모두 받는 서비스라면 두 날개를 명시적으로 함께 고릅니다. 업로드하는 동안 편집기는 잠기고, 성공한 파일은 한 번의 실행 취소 단계로 함께 들어갑니다.

<WingDemo path="/wing/etc/upload" />

```ts
const selected = wings()
  .use('img')
  .use('a')
  .use('upload', { allowLocalUrls: false })
  .build()
```

`upload`만 선택하면 이미지와 링크 중 아직 없는 한 가지 의존성을 자동으로 보충합니다. 전송은 `mountUpload()`로, 편집 화면의 진행 상태 표시는 보통 `mountUploadView()`로 연결합니다. 서버가 HTTPS URL을 돌려주면 로컬 URL 허용 옵션은 필요하지 않습니다.
