---
title: 글자색
description: 선택한 글자에 허용한 색 이름을 적용합니다.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# 글자색

선택한 글자에 색 이름을 적용합니다. 저장되는 값은 CSS 색상 문자열이 아니라 허용한 이름이며, 실제 색은 `--nabi-tc-<name>` CSS 변수로 정합니다. 그래서 같은 문서도 라이트·다크 테마에서 읽기 좋게 조정할 수 있습니다.

<WingDemo path="/wing/inline/text-color" />

```ts
const selected = wings().use('tc', {
  values: ['green', 'coral', 'blue'],
}).build()
```

`values`를 생략하면 기본 팔레트(`green`, `coral`, `violet`, `amber`, `blue`)를 사용합니다. 목록을 줄이면 그 밖의 색은 명령과 불러오기에서도 받아들이지 않습니다.
