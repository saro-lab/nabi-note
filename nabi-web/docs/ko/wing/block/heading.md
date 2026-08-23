---
title: 제목
---

# 제목

## 설명

`headingWing`(식별자 `h`)은 H1부터 H6까지의 6단계 제목 서식을 제공합니다. 제목은 별도의 독립 노드가 아니라 **문단(`p`)의 속성**으로 처리됩니다 (저장값: `{"w":"p","a":{"h":2}}`, HTML 출력: `<h2>`).

문단 자체가 제목이 되므로 텍스트 정렬, 드롭캡 등 다른 문단 속성과 결합하여 사용할 수 있습니다 (`<h2 data-nabi-align="c">`).

## 툴바 및 컨텍스트 바 동작

**메인 툴바에는 `H` 버튼 하나가 제공됩니다.** 일반 문단에서 클릭하면 H1 제목으로 변환되며, 커서가 제목 블록 내부에 위치하면 동적 컨텍스트 툴바에 `본문` 및 `H1`~`H6` 선택 버튼이 표시됩니다. 현재 제목 레벨이 활성화 상태로 표시되며, 다른 레벨을 선택하여 즉시 변경하거나 `본문`을 눌러 일반 문단으로 되돌릴 수 있습니다.

빈 줄에서 `#` 문자를 원하는 단계 수만큼 입력하고 스페이스를 누르면(예: `## ` 입력) 해당 단계의 제목으로 자동 변환됩니다.

## 사용 예시

제목 단계 선택 UI를 사용하려면 `mountContextToolbar`를 함께 마운트합니다.

```ts
import { createNabiWith, mountSurface, mountToolbar, mountContextToolbar, headingWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

const { nabi, registry } = createNabiWith([headingWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })
mountContextToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#context')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

프로그래밍 방식으로 커맨드를 직접 호출할 수도 있습니다:

```ts
nabi.applyCommand('setHeading', { value: 2 })  // H2 제목으로 설정
nabi.applyCommand('setHeading', { value: 2 })  // 동일한 단계를 다시 호출 시 일반 문단으로 복원
```

여러 문단을 드래그 선택한 후 커맨드를 실행하면 선택된 모든 문단에 일괄 적용됩니다. 표나 목록처럼 문단 자리를 차지하는 블록 객체는 건너뜁니다.

## 데모

<WingDemo path="/wing/block/heading" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
