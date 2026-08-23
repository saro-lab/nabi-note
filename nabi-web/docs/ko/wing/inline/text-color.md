---
title: 글자색 (Text Color)
---

# 글자색 (Text Color)

## 설명

`textColorWing`(식별자 `tc`)은 텍스트 글자 색상(`<span data-color="...">`)을 처리하는 값 기반 인라인 마크 날개입니다.

- 메인 툴바 버튼(단축키 `C`)을 클릭하면 기본 초록색(`green`)이 적용됩니다. 선택 영역이 이미 전체 초록색이면 서식이 해제되고, 다른 색상인 경우 초록색으로 변경됩니다.
- 커서가 글자색 서식 내부에 위치하면 동적 컨텍스트 툴바에 5가지 색상 선택 스와치가 표시되며, 원하는 색상을 클릭하여 즉시 변경할 수 있습니다. 이미 적용된 색상을 다시 클릭하면 글자색 서식이 해제됩니다.
- 텍스트 선택 영역 없이 커서 상태에서 색상을 선택할 경우, 이미 글자색 내부라면 해당 마크 전체의 색상이 변경되고, 글자색 외부라면 다음 입력될 텍스트에 예약 적용됩니다.
- 저장 시에는 색상 식별자만 속성으로 기록되며(`data-color="green"`), 실제 색상 스타일은 `nabi.css`의 `--nabi-tc-*` 테마 변수를 참조하여 렌더링됩니다.
- 형광펜(`highlightWing`)과는 독립적인 마크이므로 동일한 텍스트에 형광펜 배경색과 글자색을 동시에 적용할 수 있습니다.

### 지원 색상 목록 (`TEXT_COLORS`)

| 색상 이름 | 식별자 |
|---|---|
| 초록 | `green` |
| 코랄 | `coral` |
| 보라 | `violet` |
| 호박 | `amber` |
| 파랑 | `blue` |

## 사용 예시

```ts
import { createNabiWith, mountSurface, mountToolbar, mountContextToolbar, textColorWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

const { nabi, registry } = createNabiWith([textColorWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })
mountContextToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#context')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## 데모

<WingDemo path="/wing/inline/text-color" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
