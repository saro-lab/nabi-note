---
title: 기능 카탈로그
description: 공식 wing을 사용자 과업 기준으로 고르고 예제를 확인합니다.
---

# 기능 카탈로그

wing은 문서 어휘, 명령, HTML/Markdown 변환, UI 선언, 입력 규칙을 한 모듈에 묶습니다. 먼저 필요한 결과를 고르고 해당 wing을 레지스트리에 넣으세요. 모든 기능을 한 화면에 켜는 것이 항상 최선은 아닙니다.

## 글쓰기와 서식

| 목표 | wing | 자동 입력 |
| --- | --- | --- |
| 강조 | `b`, `i`, `u`, `s`, `sup`, `sub` | 없음 |
| 글꼴·크기·색 | `tf`, `fs`, `tc`, `hl` | 없음 |
| 링크 | `a` | URL 뒤 Space/Enter |
| 제목·정렬·드롭캡 | `h`, `align`, `dc` | `#` + Space는 제목 |
| 서식 지우기 | `clearFormat` | Escape 두 번 |

`clearFormat`은 기본 글자 서식과 제목·링크·드롭캡 속성을 지우지만, 객체를 감싼 문단의 정렬과 첨부 링크 껍데기는 보존합니다.

## 구조와 콘텐츠

| 목표 | wing | 자동 입력/제약 |
| --- | --- | --- |
| 목록 | `ul`, `ol`, `tl` | `-`, `1.`, `[ ]` + Space |
| 인용·접기 | `quote`, `details` | `>` + Space, 접기는 요약·본문 |
| 코드 | `code` | 백틱 3개 + Space/Enter |
| 표 | `table` | 셀 격자 보정, 셀 범위 선택 |
| 구분선 | `hr` | 하이픈 3개 이상 + Enter |
| 이미지·YouTube | `img`, `youtube` | 크기·문단 정렬은 별도 |

이미지 폭은 30–100, YouTube 폭은 50–100입니다. 새 이미지는 폭 60·가운데 정렬, 새 YouTube는 폭 70·가운데 정렬로 시작합니다.

## 호스트 연결이 필요한 도구

| 기능 | wing | 추가 연결 |
| --- | --- | --- |
| 업로드 | `upload` | `mountUpload()`, 보통 `mountUploadView()` |
| 파일 저장/열기 | `save`, `open` | `mountFile()` |
| 로컬 복구 | `localHistory` | `mountLocalHistory()` |
| 변경 비교 | `diff` | `mountDiffWing()`과 toolbar `onHost` |

```ts
const selected = wings()
  .allBasic()
  .use('upload', { allowLocalUrls: false })
  .drop('clearFormat')
  .build()
```

`all()`은 공식 wing을 모두 넣고, `allBasic()`은 별도의 호스트 연결 없이 동작하는 wing만 넣습니다. `drop()`은 남은 wing의 필수 의존성을 끊으면 즉시 오류를 냅니다.

## 기능별 예제

각 wing 문서에는 실제로 입력해 볼 수 있는 편집기와 선택 코드가 있습니다.

- 글자 서식은 [굵게](/ko/wing/inline/bold), [기울임](/ko/wing/inline/italic), [밑줄](/ko/wing/inline/underline), [취소선](/ko/wing/inline/strikethrough), [윗첨자](/ko/wing/inline/superscript), [아랫첨자](/ko/wing/inline/subscript), [링크](/ko/wing/inline/link), [형광펜](/ko/wing/inline/highlight), [글자색](/ko/wing/inline/text-color) 문서에서 확인할 수 있습니다.
- 블록 기능은 [제목](/ko/wing/block/heading), [글머리 목록](/ko/wing/block/bullet-list), [번호 목록](/ko/wing/block/ordered-list), [체크리스트](/ko/wing/block/task-list), [표](/ko/wing/block/table), [이미지](/ko/wing/block/image), [유튜브](/ko/wing/block/youtube), [코드](/ko/wing/block/code), [접기](/ko/wing/block/details), [인용](/ko/wing/block/quote), [구분선](/ko/wing/block/divider) 문서에서 확인할 수 있습니다.
- 문단과 도구는 [정렬](/ko/wing/etc/align), [드롭캡](/ko/wing/etc/dropcap), [서체](/ko/wing/etc/typeface), [글자 크기](/ko/wing/etc/font-size), [서식 지우기](/ko/wing/etc/clear-format), [파일 업로드](/ko/wing/etc/upload) 문서에서 확인할 수 있습니다.
- 직접 기능을 확장하려면 [커스텀 wing](/ko/wing/custom)을 참고하세요.
