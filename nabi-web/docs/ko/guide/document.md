---
title: NABI TREE와 데이터
description: 저장 형식, HTML 변환, 정규화와 보안 경계를 이해합니다.
---

<script setup>
import FlowChain from '../../.vitepress/ui/FlowChain.vue'
const documentFlow = [
  { label: '외부 JSON·HTML', note: '신뢰하지 않는 입력', kind: 'input' },
  { label: 'registry 검증', note: '등록된 wing 어휘만 통과', kind: 'core' },
  { label: '정규화된 NABI TREE', note: '저장할 원본', kind: 'output' },
  { label: '게시 HTML', note: '허용된 출력으로 재생성', kind: 'output' },
]
</script>

# NABI TREE와 데이터

NABI TREE는 문서를 표현하는 작은 JSON 트리입니다. 텍스트는 `{"t":"..."}`, 요소는 `{"w":"...","ch":[...]}`처럼 저장합니다. `w`는 wing이 소유하는 단어이고, 등록하지 않은 단어는 문서의 기능이 될 수 없습니다.

<FlowChain :steps="documentFlow" caption="NABI는 입력 HTML을 보관하지 않고, 허용된 문서 어휘로 다시 만듭니다." />

```json
[
  { "w": "p", "ch": [{ "t": "안녕하세요" }] },
  { "w": "p", "a": { "h": 2 }, "ch": [{ "t": "제목" }] }
]
```

문단은 항상 `p`입니다. 제목·정렬·드롭캡은 별도 블록이 아니라 문단의 `a` 속성입니다. 목록·표·이미지처럼 독립 블록도 문단이 한 겹 감싸므로, 객체 앞뒤에 커서를 둘 수 있고 정렬도 문단이 가집니다.

## 입력별 결과

| 호출 | 성공 시 | 실패 시 |
| --- | --- | --- |
| `setJson(value)` | 정규화해 문서 교체 | `false`, 기존 문서 유지 |
| `setHtml(html)` | 허용 HTML을 트리로 import | parser 없음·잠금·잘못된 입력이면 `false` |
| `getJson()` | 내부 ID가 빠진 저장용 JSON | 항상 직렬화 가능한 값 |
| `getHtml()` | 게시용 HTML | 저장 원본으로 쓰지 않음 |

```ts
const ok = nabi.setJson(await response.json())
if (!ok) showError('문서 형식을 읽을 수 없습니다.')
```

## 보안 경계

- URL은 기본적으로 안전한 `http:`/`https:`만 허용합니다. 로컬 URL은 명시적으로 켜야 합니다.
- 등록한 wing의 HTML builder와 import claim만 문서 어휘가 됩니다.
- JSON도 외부 입력입니다. custom wing의 `repair`와 `claim`에서 속성을 검증하세요.
- `getHtml()` 결과도 게시 환경의 CSP, 권한, 업로드 서버 검증을 대체하지 않습니다.

**하지 말 것:** 편집 중인 `.nabi-content`의 `innerHTML`을 직접 바꾸거나, `getEditorHtml()`을 DB에 저장하지 마세요. 선택과 composing DOM이 문서 모델과 달라질 수 있습니다.

## HTML을 받아야 한다면

```ts
import { createNabiWith, parseNodes, wings } from 'nabi-note'

const { nabi } = createNabiWith(wings().allBasic().build(), { parseHtml: parseNodes })
nabi.setHtml('<p>가져온 내용</p>')
```

HTML import는 편집기의 등록된 wing 기준으로 제한됩니다. 마크다운과 클립보드, 파일 입출력의 선택 규칙은 [저장·입출력](/ko/guide/storage)에서 다룹니다.
