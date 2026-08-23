---
title: 표
---

# 표

## 설명

`tableWings`(식별자 `table`, 단축키 `T`)는 `table > tr > td` 구조의 표를 처리합니다. 행(`tr`)과 셀(`td`)은 `parts` 속성으로 내장되어 있어 별도로 등록할 필요가 없습니다.

```ts
parts: {
  tr: { holds: 'blocks' },
  td: { holds: 'blocks', singleParagraph: true, boolAttrs: ['th'] },
}
```

각 셀(`td`)에 `singleParagraph: true` 제약이 적용되어 있어, 셀 내부에서 Enter 키를 눌러도 표 격자 구조가 깨지지 않고 줄바꿈만 처리되며 셀 간 삭제 시에도 격자 무결성이 보장됩니다.

툴바 버튼을 클릭하면 최대 8×8 크기의 행×열 격자 선택 피커가 표시되며, 원하는 크기를 선택하면 커서 위치에 표가 삽입됩니다.

### 동적 컨텍스트 툴바

커서가 표 내부에 위치할 때 컨텍스트 툴바에 표 편집 도구가 표시됩니다:

| 기능 | 설명 |
|---|---|
| 행 조작 | 위에 행 추가 · 아래에 행 추가 · 행 삭제 |
| 열 조작 | 왼쪽에 열 추가 · 오른쪽에 열 추가 · 열 삭제 |
| 셀 병합 | 드래그 선택된 여러 셀 병합 및 병합 해제 토글 |
| 헤더 설정 | 현재 행을 헤더(`<th>`)로 변환 · 현재 열을 헤더로 변환 |
| 정렬 기능 | 읽기 전용 화면에서 표 열 정렬 기능 활성화/비활성화 (`data-nabi-sortable`) |
| 삭제 | 표 전체 삭제 |

표의 좌/우/가운데 정렬은 표를 감싸는 래퍼 문단(`<div data-nabi-p>`)에 적용되므로 메인 툴바의 정렬 버튼으로 설정합니다.

### 반응형 가로 스크롤

표의 너비는 셀 내용에 맞춰 자동으로 조절되며, 부모 컨테이너 너비를 초과하면 에디터 영역 밖으로 넘치지 않고 **내부에서 가로 스크롤**됩니다.

### 키보드 이동 및 셀 선택

- <kbd>Tab</kbd> / <kbd>Shift</kbd>+<kbd>Tab</kbd>: 다음/이전 셀로 커서 이동
- 방향키: 표의 행/열 격자 구조에 맞춰 커서 이동
- 마우스 드래그를 통해 여러 셀을 사각형 범위로 선택하여 일괄 병합하거나 서식을 적용할 수 있습니다. 마우스 드래그 선택 기능은 `attach` 훅으로 내장되어 있어 별도 마운트 없이 기본 동작합니다.

## 사용 예시

```ts
import { createNabiWith, mountSurface, mountToolbar, mountContextToolbar, tableWings } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

const { nabi, registry } = createNabiWith([...tableWings])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })
mountContextToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#context')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## 데모

<WingDemo path="/wing/block/table" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
