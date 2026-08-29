---
title: 링크
description: 안전한 웹 주소와 첨부 파일 링크를 다루는 wing입니다.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# 링크

글자를 선택해 주소를 연결하거나, 웹 주소를 입력한 뒤 Space 또는 Enter를 눌러 링크로 바꿉니다. 허용되지 않은 URL scheme은 문서에 들어오지 않습니다.

<WingDemo path="/wing/inline/link" />

```ts
const selected = wings().use('a').build()
```

같은 origin과 외부 origin을 어느 창에서 열지는 `createNabiWith()`의 링크 정책으로 정할 수 있습니다.
