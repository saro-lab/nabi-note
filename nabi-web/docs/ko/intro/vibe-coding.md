---
title: AI 바이브 코딩
description: 코딩 에이전트가 현재 공개 API와 문서 경계를 읽고 NABI NOTE를 정확하게 사용하도록 돕습니다.
---

# AI 바이브 코딩

NABI NOTE에는 AI와 자동화 도구를 위한 [`llms.txt`](/llms.txt)가 있습니다. 에이전트에게 전체 라이브러리를 추측하게 하기보다 이 색인부터 읽게 하고, 필요한 주제 문서만 따라가게 하면 답변과 구현이 모두 더 정확해집니다.

## 바로 사용할 프롬프트

아래 예시에 사용하는 프레임워크와 필요한 기능만 채워 넣어 보세요.

```text
NABI NOTE(nabi-note)로 편집기를 구현해 주세요.
먼저 https://nabi.saro.me/llms.txt를 읽고, 이번 작업에 필요한 문서만 이어서 읽으세요.

환경: Vue 3 + TypeScript
필요한 기능: 기본 서식, 표, 이미지, 업로드
저장 원본: NABI TREE JSON
게시 방식: 저장한 JSON을 서버에서 HTML로 렌더링

공개 export와 설치된 타입에 실제로 있는 API만 사용하세요.
구현 뒤에는 타입 검사와 빌드를 실행하고, 바꾼 파일과 검증 결과를 알려 주세요.
```

URL을 읽을 수 없는 에이전트라면 `llms.txt`와 이번 작업에 해당하는 하위 문서 내용을 대화에 함께 넣어 주세요.

## 필요한 문서만 고르게 합니다

`llms.txt`는 짧은 안내 색인입니다. 처음부터 모든 문서를 넣기보다 작업에 맞는 문서만 지정하는 편이 좋습니다.

- npm으로 편집기를 조립할 때는 [`quickstart-npm.md`](https://nabi.saro.me/llms/quickstart-npm.md)를 읽게 합니다.
- CDN 예제는 [`quickstart-cdn.md`](https://nabi.saro.me/llms/quickstart-cdn.md)를 사용합니다.
- wing 선택과 조합은 [`wings.md`](https://nabi.saro.me/llms/wings.md)를 확인합니다.
- 저장 JSON, HTML, 변경 알림은 [`document-model.md`](https://nabi.saro.me/llms/document-model.md)를 봅니다.
- HTML 가져오기, 붙여넣기, 업로드 경계는 [`io-security.md`](https://nabi.saro.me/llms/io-security.md)를 봅니다.
- 새 wing은 [`custom-wing.md`](https://nabi.saro.me/llms/custom-wing.md), 서버 렌더링은 [`ssr.md`](https://nabi.saro.me/llms/ssr.md)를 사용합니다.
- viewer와 diff는 [`viewer-diff.md`](https://nabi.saro.me/llms/viewer-diff.md), 스타일과 드롭캡은 [`styling.md`](https://nabi.saro.me/llms/styling.md)를 확인합니다.
- 정확한 import와 타입은 [`api-reference.md`](https://nabi.saro.me/llms/api-reference.md)에서 찾습니다.

## 요구사항을 함께 전달합니다

에이전트는 편집 화면만 보고 저장 방식이나 보안 정책을 알 수 없습니다. 실제 프레임워크, 필요한 wing과 제외할 기능, JSON과 HTML의 저장 범위, 업로드 서버의 요청·응답 형식과 파일 제한, 게시 화면에 SSR·viewer·diff가 필요한지를 같이 알려 주세요.

아직 결정하지 못한 항목이 있다면 임의로 정해 구현하지 말고, 선택지와 영향부터 설명한 뒤 질문하도록 요청하는 편이 좋습니다.

## 결과를 검토하는 기준

생성한 코드는 일반 코드처럼 검토해야 합니다. 다음 내용은 특히 직접 확인하세요.

- 편집 화면과 게시 화면에 `nabi-note/nabi.css`를 불러왔는지
- 선택한 wing과 모든 mount가 같은 `registry`를 쓰는지
- 저장 원본은 `getJson()`이고 `getEditorHtml()`을 저장하지 않는지
- 편집 중인 `.nabi-content`의 `innerHTML`을 직접 바꾸지 않는지
- 화면을 닫을 때 만든 mount를 `unmount()`하는지
- 업로드 서버가 MIME, 크기, 권한, 저장 위치를 검증하는지
- SSR과 브라우저가 같은 wing 순서와 HTML 관련 옵션을 쓰는지
- 타입 검사, 테스트, 빌드로 실제 export 이름을 확인했는지

특히 IME와 캐럿, 저장 형식은 화면이 한 번 정상적으로 보인다는 이유만으로 안전하다고 판단하기 어렵습니다. 모바일 조합 입력과 저장·불러오기까지 실제로 확인해 보세요.

## 설치한 버전을 우선합니다

프로젝트에 `nabi-note`가 이미 설치되어 있다면 웹 문서보다 설치된 패키지의 `package.json` exports와 타입 선언이 현재 코드에 더 직접적인 기준입니다. 문서와 설치 버전이 다를 수 있으므로, 에이전트에게 이 차이를 먼저 확인하도록 요청하세요.
