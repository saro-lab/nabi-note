---
title: AI 바이브 코딩
description: 코딩 에이전트가 NABI NOTE의 현재 API와 경계를 읽고 정확하게 구현하도록 안내합니다.
---

# AI 바이브 코딩

NABI NOTE는 코딩 에이전트가 필요한 정보를 짧은 경로로 찾을 수 있도록 [`llms.txt`](/llms.txt)를 제공합니다. 에이전트에게 라이브러리 사용법을 추측하게 하지 말고, 먼저 이 파일을 읽은 뒤 현재 작업에 필요한 문서만 따라가도록 요청하세요.

## 가장 짧은 시작 방법

아래 내용을 복사한 뒤 사용 중인 프레임워크와 필요한 기능만 바꾸면 됩니다.

```text
NABI NOTE(nabi-note)를 사용해 편집기를 구현해 주세요.
먼저 https://nabi.saro.me/llms.txt를 읽고, 현재 작업에 필요한 문서만 따라가세요.

환경: Vue 3 + TypeScript
필요한 기능: 기본 서식, 표, 이미지, 업로드
저장 원본: NABI TREE JSON
게시 방식: 저장된 JSON을 HTML로 변환

공개 export와 타입에 실제로 존재하는 API만 사용하고,
구현이 끝나면 타입 검사와 빌드를 실행해 주세요.
```

URL을 읽을 수 없는 에이전트를 사용한다면 `llms.txt`와 필요한 하위 문서의 내용을 대화에 함께 넣어 주세요.

## 작업에 맞는 문서 고르기

| 구현하려는 내용 | 먼저 읽을 문서 |
| --- | --- |
| npm으로 편집기 조립 | [`quickstart-npm.md`](https://nabi.saro.me/llms/quickstart-npm.md) |
| CDN으로 연결 | [`quickstart-cdn.md`](https://nabi.saro.me/llms/quickstart-cdn.md) |
| wing 선택 | [`wings.md`](https://nabi.saro.me/llms/wings.md) |
| 저장 형식과 변경 알림 | [`document-model.md`](https://nabi.saro.me/llms/document-model.md) |
| HTML·붙여넣기·업로드 보안 | [`io-security.md`](https://nabi.saro.me/llms/io-security.md) |
| 커스텀 wing | [`custom-wing.md`](https://nabi.saro.me/llms/custom-wing.md) |
| SSR과 hydrate | [`ssr.md`](https://nabi.saro.me/llms/ssr.md) |
| viewer와 diff | [`viewer-diff.md`](https://nabi.saro.me/llms/viewer-diff.md) |
| 스타일과 드롭캡 | [`styling.md`](https://nabi.saro.me/llms/styling.md) |
| 공개 API와 타입 찾기 | [`api-reference.md`](https://nabi.saro.me/llms/api-reference.md) |

`llms.txt`는 안내 색인입니다. 처음부터 모든 문서를 한꺼번에 넣기보다, 작업에 필요한 문서만 읽히는 편이 답변이 짧고 정확합니다.

## 요구사항을 구체적으로 전달하기

코딩 에이전트는 편집 화면만 보고 저장·게시·보안 정책까지 알 수 없습니다. 다음 내용을 프롬프트에 함께 적어 주세요.

- React, Vue, 순수 JavaScript처럼 실제로 사용하는 환경을 알려 주세요.
- 필요한 wing과 제외할 기능을 구체적으로 적어 주세요.
- 원본을 JSON으로 저장할지, HTML도 함께 저장할지 정해 주세요.
- 업로드 API의 요청·응답 형식과 파일 제한을 알려 주세요.
- 게시 화면에서 SSR, viewer, diff가 필요한지 알려 주세요.
- 기존 디자인 토큰과 다크 모드 적용 방식을 알려 주세요.

요구사항이 아직 정해지지 않았다면 에이전트에게 임의로 결정하게 하기보다, 선택지를 비교하고 질문하도록 요청하는 편이 안전합니다.

## 생성된 코드를 검토할 때

- `nabi-note/nabi.css`가 편집 화면과 게시 화면에 로드되었는지 확인합니다.
- 선택한 wing과 mount가 같은 `registry`를 사용하는지 확인합니다.
- 저장 원본으로 `getJson()`을 사용하고 `getEditorHtml()`은 저장하지 않는지 확인합니다.
- 편집 중인 `.nabi-content`의 `innerHTML`을 직접 교체하지 않는지 확인합니다.
- 화면을 제거할 때 생성한 mount를 모두 `unmount()`하는지 확인합니다.
- 업로드 서버가 MIME, 크기, 권한과 저장 위치를 검증하는지 확인합니다.
- SSR과 브라우저가 같은 wing 순서와 옵션을 사용하는지 확인합니다.
- 마지막으로 타입 검사, 테스트와 빌드를 실행해 실제 export 이름을 검증합니다.

AI가 만든 코드도 일반 코드와 같은 검토가 필요합니다. 특히 입력·IME·캐럿과 저장 형식은 화면이 한 번 정상적으로 보이는 것만으로 안전하다고 판단할 수 없습니다.

## 설치된 패키지를 함께 확인하기

프로젝트에 `nabi-note`가 이미 설치되어 있다면 에이전트에게 `node_modules/nabi-note/package.json`의 exports와 배포된 타입 선언도 함께 확인하도록 요청하세요. 웹 문서와 설치 버전이 다를 때는 실제로 설치된 버전의 공개 타입을 우선해야 합니다.
