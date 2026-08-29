---
title: 이미지
description: 이미지 주소를 넣고 폭과 정렬을 조절합니다.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# 이미지

이미지 주소를 넣고 폭과 정렬을 조절합니다. 주소는 `http:`, `https:` 또는 같은 사이트 경로만 기본으로 허용하며, 새 이미지는 가운데 정렬과 60% 폭으로 시작합니다.

폭은 정해진 단계 안에서만 저장되고 정렬은 이미지를 감싼 문단에 저장됩니다. `blob:`과 `data:image/...` 미리보기를 쓰려면 이미지 wing과 편집기 조립 쪽에서 각각 로컬 URL을 명시적으로 허용해야 합니다. SVG 데이터 URL은 허용되지 않습니다.

<WingDemo path="/wing/block/image" />

```ts
const selected = wings().use('img', {
  allowLocalUrls: false,
}).build()
```

이 wing은 주소를 문서에 넣는 기능이며 파일 전송은 하지 않습니다. 파일을 서버로 보내려면 [업로드 wing](/ko/wing/etc/upload)을 연결합니다.
