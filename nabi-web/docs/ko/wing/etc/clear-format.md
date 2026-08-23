---
title: 서식 지우기
---

# 서식 지우기

## 설명

`clearFormatWing`은 적용된 서식을 제거하고 일반 텍스트로 초기화하는 도구(`place: 'tool'`) 날개입니다.

- **제거 대상 서식**: 인라인 마크 11종(`b`, `i`, `u`, `s`, `sub`, `sup`, `hl`, `tc`, `fs`, `tf`, `a`) 및 문단 속성 3종(`h` 제목, `a` 정렬, `dc` 드롭캡).
- **텍스트 영역을 선택한 상태에서 실행 시**: 선택된 구간에 포함된 모든 인라인 마크와 문단 속성이 일괄 제거됩니다.
- **커서 상태에서 실행 시**: 커서가 위치한 가장 안쪽의 인라인 마크부터 순차적으로 해제되며, 더 이상 해제할 마크가 없을 때 문단 속성이 초기화됩니다.
- **첨부파일 링크(`data-nabi-file`)는 보호됩니다**: 일반 웹 링크와 달리 파일 첨부 링크는 서식 지우기 대상에서 제외되어 파일 정보가 보존됩니다.
- **블록 객체(이미지, 표 등)의 래퍼 문단 정렬은 유지**됩니다.

## <kbd>Esc</kbd> 2회 연속 입력 단축키

툴바 버튼 외에도 **Esc 키를 350ms 이내에 2번 연속 입력**하면 서식 지우기 커맨드가 즉시 실행됩니다.

- 텍스트 선택 영역이 있을 때는 물론, 커서만 있는 상태에서도 툴바 버튼을 누른 것과 완전히 동일하게 서식을 단계적으로 해제합니다.
- Esc 키의 우선순위는 가장 낮게 처리되어, 첫 번째 Esc 입력으로 마크 탈출 예약이 동작했더라도 2번째 Esc 입력 시 서식 지우기가 정상적으로 발동됩니다.

## 사용 예시

```ts
import { createNabiWith, mountSurface, mountToolbar, clearFormatWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

const { nabi, registry } = createNabiWith([clearFormatWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## 데모

<WingDemo path="/wing/etc/clear-format" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
