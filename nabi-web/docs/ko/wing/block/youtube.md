---
title: 유튜브
description: YouTube 영상을 문서에 임베드하고 폭을 조절합니다.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# 유튜브

YouTube 영상 주소나 영상 ID를 받아 임베드 블록으로 만듭니다. 문서에는 전체 주소가 아니라 11글자 영상 ID와 폭만 저장되고, 새 영상은 가운데 정렬과 70% 폭으로 시작합니다.

폭은 정해진 단계에서 고르며 정렬은 영상을 감싼 문단에 저장됩니다. 편집기에서는 첫 클릭으로 영상을 선택하고, 선택한 뒤 다시 클릭하면 재생할 수 있습니다. 주소를 바꾸는 대신 영상을 지우고 새로 넣습니다.

<WingDemo path="/wing/block/youtube" />

```ts
const selected = wings().use('youtube').build()
```

## CSS 스타일

영상은 `.nabi-content iframe`으로 테두리와 모서리를 바꿀 수 있습니다. 저장된 폭과 정렬은 바꾸지 마세요.

```css
.article-body iframe {
  border-radius: 14px;
  box-shadow: 0 10px 28px rgb(0 0 0 / 16%);
}
```

`aspect-ratio`, 폭, 정렬 margin은 패키지가 영상 크기를 유지하는 데 사용하므로 덮어쓰지 않습니다.
