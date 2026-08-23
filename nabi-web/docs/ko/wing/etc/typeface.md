---
title: 서체 (글꼴 패밀리)
---

# 서체 (글꼴 패밀리)

## 설명

`typefaceWing`(식별자 `tf`)은 텍스트의 글꼴 서체 계열(`<span data-nabi-typeface="serif">`)을 지정하는 값 기반 인라인 마크 날개입니다.

지원하는 4가지 서체 계열(`TYPEFACES`): `sans`, `serif`, `mono`, `cursive`

- 특정 폰트 이름을 하드코딩하지 않고 서체 분류 계열만 지정하며, 실제 적용되는 폰트는 호스트가 `--nabi-font-*` CSS 변수로 정의합니다.
- 메인 툴바 버튼을 클릭하면 기본적으로 `serif` 서체가 적용됩니다.
- 커서가 서체 마크 내부에 위치하면 동적 컨텍스트 툴바에 4가지 서체 선택 버튼이 표시되며, 원하는 서체를 클릭하여 즉시 변경할 수 있습니다. 이미 적용된 서체를 다시 클릭하면 마크가 해제되어 기본 본문 서체(`--nabi-typeface-base`)로 복원됩니다.
- 텍스트 선택 영역 없이 커서 상태에서 서체를 선택할 경우, 해당 문단 전체에 서식이 적용됩니다.

## 사용 예시

```ts
import { createNabiWith, mountSurface, mountToolbar, mountContextToolbar, typefaceWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

const { nabi, registry } = createNabiWith([typefaceWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })
mountContextToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#context')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

호스트 애플리케이션에서 각 서체 계열별 폰트 패밀리를 CSS 변수로 정의합니다:

```css
:root {
  --nabi-font: 'Noto Sans', 'Noto Sans KR', system-ui, sans-serif;
  --nabi-font-serif: 'Noto Serif', 'Noto Serif KR', Georgia, serif;
  --nabi-font-mono: 'Noto Sans Mono', ui-monospace, monospace;
  --nabi-font-cursive: 'Caveat', 'Gaegu', cursive;
}
```

## 데모

<WingDemo path="/wing/etc/typeface" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
