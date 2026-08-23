---
title: 형광펜
---

# 형광펜

## 설명

`highlightWing`(식별자 `hl`)은 텍스트 강조 배경색(`<mark data-color="...">`)을 처리하는 값 기반 인라인 마크 날개입니다.

- 메인 툴바 버튼(단축키 `H`)을 클릭하면 기본 노란색(`yellow`) 형광펜이 적용됩니다. 선택 영역이 이미 전체 노란색이면 서식이 해제되고, 다른 색상인 경우 노란색으로 변경됩니다.
- 커서가 형광펜 서식 내부에 위치하면 동적 컨텍스트 툴바에 6가지 색상 선택 스와치가 표시되며, 원하는 색상을 클릭하여 즉시 변경할 수 있습니다. 이미 적용된 색상을 다시 클릭하면 형광펜 서식이 해제됩니다.
- 텍스트 선택 영역 없이 커서 상태에서 색상을 선택할 경우, 이미 형광펜 내부라면 해당 마크 전체의 색상이 변경되고, 형광펜 외부라면 다음 입력될 텍스트에 예약 적용됩니다.
- 저장 시에는 색상 식별자만 속성으로 기록되며(`data-color="yellow"`), 실제 색상 스타일은 `nabi.css`의 `--nabi-hl-*` 테마 변수를 참조하여 렌더링됩니다.

### 지원 색상 목록 (`HIGHLIGHT_COLORS`)

| 색상 이름 | 식별자 |
|---|---|
| 노랑 | `yellow` |
| 초록 | `green` |
| 청록 | `cyan` |
| 분홍 | `pink` |
| 보라 | `purple` |
| 주황 | `orange` |

## 사용 예시

```ts
import { createNabiWith, mountSurface, mountToolbar, mountContextToolbar, highlightWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

const { nabi, registry } = createNabiWith([highlightWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })
mountContextToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#context')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## 데모

<WingDemo path="/wing/inline/highlight" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
