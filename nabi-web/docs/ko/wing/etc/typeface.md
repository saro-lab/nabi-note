---
title: 서체
description: 선택한 글자 또는 문단에 서체 갈래를 적용합니다.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# 서체

선택한 글자에 서체 갈래를 적용합니다. 범위를 선택하면 그 범위만 바꾸고, 캐럿만 있으면 현재 문단의 글자에 적용합니다. 실제 글꼴 파일과 `font-family`는 서비스 CSS가 정합니다.

기본 갈래는 `sans`, `serif`, `mono`, `cursive`입니다. 특히 한글을 포함한 서비스에서는 각 갈래에 어떤 글꼴을 연결할지 직접 정해 두는 편이 좋습니다.

<WingDemo path="/wing/etc/typeface" />

```ts
const selected = wings().use('tf', {
  values: ['sans', 'serif', 'mono'],
}).build()
```

`values`를 생략하면 기본 갈래를 모두 사용합니다. `values`에 넣은 값만 문서에서 허용됩니다.
