---
title: AI 바이브 코딩
description: llms.txt를 활용하여 AI 코딩 어시스턴트와 함께 NABI NOTE를 도입하고 개발하는 방법을 안내합니다.
---

# AI 바이브 코딩

**`llms.txt`**는 웹사이트가 AI 에이전트(LLM)에게 프로젝트 구조와 사용법을 효율적으로 전달하기 위해 고안된 표준 규격입니다.
HTML 마크업 대신 AI가 파싱하기 쉬운 깔끔한 마크다운 문서로 프로젝트의 명세와 API를 제공합니다. 자세한 규격은 [llmstxt.org](https://llmstxt.org/)를 참고하세요.

NABI NOTE 공식 사이트 역시 `llms.txt`를 완벽히 지원합니다. 복잡한 문서를 일일이 복사할 필요 없이 **AI 에이전트에게 아래 URL만 전달**하면 AI가 스스로 문서를 탐색하여 작업을 수행합니다.

```
https://nabi.saro.me/llms.txt
```

Cursor, Claude Code, OpenAI Codex, Windsurf 등 최신 AI 코딩 도구에서 `llms.txt` 표준을 지원합니다.

## 처음 도입할 때

NABI NOTE를 프로젝트에 처음 도입할 때는 원하는 기능, 라이트/다크 모드 지원 여부, 배포 환경(SSR/CSR/CDN)만 명시하면 AI 에이전트가 최적의 코드를 작성합니다.

### npm + 서버 렌더링(SSR) — Next.js, Nuxt, SvelteKit 등

```
우리 사이트에 nabi-note를 새 에디터로 도입하려고 해. 설명서는
https://nabi.saro.me/llms.txt 를 참고해줘. 사이트에 라이트/다크 모드가 있으니
에디터 테마도 맞춰줘. 날개(Wing)는 기본 제공되는 것을 전부 활성화해줘.

우리 서비스는 Nuxt로 서버 사이드 렌더링을 하고 있어. 첫 접속 시 화면 깜빡임 없이
서버에서 미리 렌더링해서 내려줄 수 있도록 npm 패키지 설치와 SSR + hydrate 방식으로 연동해줘.
```

### npm + 클라이언트 전용(CSR) — Vite, CRA, SPA 환경

```
우리 사이트에 nabi-note를 새 에디터로 도입하려고 해. 설명서는
https://nabi.saro.me/llms.txt 를 참고해줘. 사이트에 라이트/다크 모드가 있으니
에디터 테마도 맞춰줘. 날개(Wing)는 기본 제공되는 것을 전부 활성화해줘.

Vite 기반 프론트엔드 SPA 환경이며 서버 사이드 렌더링은 필요 없어. npm 패키지로
설치해서 브라우저 클라이언트에서만 조립해줘.
```

### CDN — 정적 HTML 환경

```
우리 사이트에 nabi-note를 새 에디터로 도입하려고 해. 설명서는
https://nabi.saro.me/llms.txt 를 참고해줘. 사이트에 라이트/다크 모드가 있으니
에디터 테마도 맞춰줘. 날개(Wing)는 기본 제공되는 것을 전부 활성화해줘.

이 페이지는 빌드 도구가 없는 정적 HTML이야. <script> 및 <link> 태그로 연동해줘.
```

::: tip 테마(라이트/다크)는 자동으로 대응됩니다
`nabi.css`는 기본 라이트, `.dark` 클래스, `.light` 명시 클래스를 모두 내장하고 있습니다. 페이지 루트 요소의 `class="dark"` 토글에 맞춰 에디터 테마가 자동으로 전환됩니다. 브랜드 고유 색상으로 커스텀하려면 `llms/styling.md`를 함께 참조하게 하세요.
:::

## 기능을 추가하거나 커스텀할 때

기존에 연동된 에디터에서 새로운 기능을 추가하거나 수정할 때는, **먼저 조사 및 구현 계획을 수립하도록 요청**하는 것이 안전합니다. 특히 백엔드 API 연동이 수반되는 기능(파일 업로드 등)은 요구사항을 명확히 정리해야 합니다.

### 조사 및 계획 수립 프롬프트 예시

```
파일 업로드 기능을 연동하고 싶어. https://nabi.saro.me/llms/wings.md 와
https://nabi.saro.me/llms/api-reference.md 를 참고해서 upload 날개를 활성화하려면
백엔드 API 규격(엔드포인트, 허용 확장자/용량 제한, 응답 JSON 형식 등)과
프론트엔드 연동 코드가 어떻게 구성되어야 하는지 먼저 조사해줘.
바로 코드를 작성하지 말고, 준비해야 할 요구사항과 구현 계획을 정리해서 보여줘.
```

### 단순 스타일 변경 프롬프트 예시

```
https://nabi.saro.me/llms/styling.md 를 참고해서 에디터 강조색(Accent)과 다크 테마 배경색을
우리 브랜드 색상에 맞게 CSS 변수로 재정의해줘.
```

::: tip 규격을 위반한 날개는 등록 시점에 즉시 예외가 발생합니다
새로운 커스텀 날개를 작성하게 할 때는 [`llms/custom-wing.md`](https://nabi.saro.me/llms/custom-wing.md)를 함께 참조하게 하세요. 예약어 충돌, 필수 메서드 누락 등 흔한 실수는 런타임에 늦게 발견되지 않고 **초기 등록 시점에 즉시 예외로 감지**됩니다.
:::

::: tip 프로젝트 규칙 파일에 등록해 두세요
프로젝트 가이드 문서(`CLAUDE.md`, `.cursorrules`, `AGENT.md` 등)에 아래 문구를 추가해 두면, 이후 "에디터에 ~ 기능 추가해줘"라고만 요청해도 AI가 알아서 `llms.txt`를 참조합니다.

```md
이 프로젝트는 WYSIWYG 에디터로 `nabi-note`를 사용합니다. 관련 작업 시
https://nabi.saro.me/llms.txt 문서를 먼저 확인하세요.
```
:::

## 다음 문서

- [{{ t('menu_intro_index') }}](../intro) — NABI NOTE 소개 및 아키텍처
- [{{ t('menu_wing_custom') }}](../wing/custom) — 커스텀 날개 제작 가이드

<script setup lang="ts">
import { useTranslate } from '../../.vitepress/src/langs.ts'

const { t } = useTranslate()
</script>
