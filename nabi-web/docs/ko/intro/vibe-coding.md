---
title: AI 바이브 코딩
description: llms.txt
---

# AI 바이브 코딩

**`llms.txt`** 는 웹사이트가 AI 에이전트(LLM)에게 내용을 건네주려고 만든 규격입니다.
HTML 대신 에이전트가 바로 읽기 쉬운 마크다운으로 프로젝트의 구조와 쓰는 법을 정리해
둡니다. 자세한 규격은 [llmstxt.org](https://llmstxt.org/)에 있습니다.

이 사이트도 그 문을 열어 두었습니다. 주소를 외울 필요는 없습니다 — 아래 예시처럼
**에이전트에게 주소만 건네면** 나머지는 에이전트가 알아서 따라갑니다.

```
https://nabi.saro.me/llms.txt
```

Cursor, Claude Code, OpenAI Codex, Windsurf등은 llms.txt 표준을 지원합니다.

## 처음 도입할 때

아직 nabi-note 를 안 쓰는 사이트에 처음 들여올 때는, 무엇을 켜고 싶은지·
라이트/다크 모드가 있는지·배포 방식이 무엇인지만 한 번에 알려주면 나머지는
에이전트가 알아서 조립합니다. **배포 방식만 다르고 나머지 문장은 그대로
써도 됩니다** — 아래 세 가지가 갈리는 자리입니다.

### npm + 서버 렌더링(SSR) — 요청마다 서버(Node)에서 그려서 내려주는 경우

Node 백엔드를 직접 두었든, Next.js·Nuxt·SvelteKit 같은 SSR 프레임워크를
쓰든 여기에 해당합니다 — 둘 다 요청마다 Node 위에서 문서를 그려 내려보내는
것은 같습니다.

```
우리 사이트에 nabi-note 를 새 에디터로 들여오려고 해. 설명서는
https://nabi.saro.me/llms.txt 를 참고해. 사이트에 라이트/다크 모드가 있으니
편집기도 거기 맞춰줘. 날개(wing)는 기본 제공되는 걸 전부 켜줘.

우리 쪽은 Nuxt 로 서버 렌더링을 하고 있고, 방문하자마자 글이 이미 보이게
서버에서 미리 그려서 내려주고 싶어. npm 으로 설치해서 SSR + hydrate 로 붙여줘.
```

### npm + 브라우저에서만 조립(CSR) — 번들러는 있지만 서버 렌더링은 필요 없는 경우

```
우리 사이트에 nabi-note 를 새 에디터로 들여오려고 해. 설명서는
https://nabi.saro.me/llms.txt 를 참고해. 사이트에 라이트/다크 모드가 있으니
편집기도 거기 맞춰줘. 날개(wing)는 기본 제공되는 걸 전부 켜줘.

Vite 로 빌드하는 프론트엔드고 서버 렌더링은 필요 없어. npm 으로 설치해서
브라우저에서만 조립해줘.
```

### CDN — 빌드 도구가 없는 정적 페이지

```
우리 사이트에 nabi-note 를 새 에디터로 들여오려고 해. 설명서는
https://nabi.saro.me/llms.txt 를 참고해. 사이트에 라이트/다크 모드가 있으니
편집기도 거기 맞춰줘. 날개(wing)는 기본 제공되는 걸 전부 켜줘.

이 페이지는 빌드 도구가 없는 정적 HTML 이야. `<script>` 태그로 붙여줘.
```

::: tip 라이트·다크는 따로 알려줄 것이 없습니다
`nabi.css` 가 라이트 기본값·다크·명시적 라이트 셋을 전부 들고 옵니다 —
페이지의 `dark`/`light` 클래스만 그대로 두면 편집기가 저절로 따라갑니다. 브랜드
색만 바꾸고 싶으면 `llms/styling.md` 를 함께 읽히세요.
:::

세 예시는 배포 방식만 다르고 나머지 문장은 같습니다 — 에이전트는 각각
`llms/ssr.md`(+`llms/quickstart-npm.md`) · `llms/quickstart-npm.md` ·
`llms/quickstart-cdn.md` 를 찾아 읽고 그 방식대로 붙입니다.

## 기능을 고치거나 더하거나 뺄 때

이미 붙어 있는 곳에서 무엇을 바꾸거나 더할 때는, **바로 구현부터 시키기보다
먼저 조사해서 계획을 세우게** 하는 편이 안전합니다 — 특히 백엔드까지 걸리는
기능은 무엇을 준비해야 하는지부터 알아야 합니다.

### 예시 — 조사와 계획부터

```
업로드 기능을 붙이고 싶어. https://nabi.saro.me/llms/wings.md 랑
https://nabi.saro.me/llms/api-reference.md 를 보고, upload 날개를 켜려면
우리 백엔드 쪽에 무엇이 필요한지(업로드 받는 주소, 허용 확장자·용량 제한,
실패했을 때 응답 모양 같은 것) 먼저 조사해줘. 바로 구현하지 말고, 무엇을
준비해야 하는지 계획만 세워서 보여줘.
```

에이전트는 `llms/wings.md` 에서 `upload` 가 `Uploader` 를 받는 도구(tool) wing
이라는 것을, `llms/api-reference.md` 에서 `mountUpload`·`Uploader`·
`allowLocalUrls` 같은 실제 시그니처를 확인한 뒤, 백엔드에 뚫어야 할 자리와
프런트에서 결정할 값을 나눠 계획으로 정리합니다. 계획을 보고 승인한 뒤에
구현을 이어서 시키면 됩니다.

### 더 간단한 예시 — 바로 시켜도 되는 것

계획까지 필요 없는 좁은 수정은 곧바로 부탁해도 됩니다.

```
https://nabi.saro.me/llms/styling.md 보고 강조색이랑 어두운 테마 배경만
우리 브랜드 색으로 바꿔줘.
```

::: tip 계약을 어긴 날개는 등록하는 그 자리에서 던져집니다
새 날개를 짓게 할 때는 [`llms/custom-wing.md`](https://nabi.saro.me/llms/custom-wing.md)
를 함께 읽히세요. 예약어를 이름으로 쓰거나, 노드를 세우는데 `toHtml` 이
없거나 하는 흔한 실수는 늦게 터지지 않고 **등록하는 순간 바로** 던져집니다 —
그 문서의 "등록하는 그 자리에서 죽습니다" 절에 무엇이 걸리는지 정리돼 있습니다.
:::

::: tip 도입이 끝났으면 한 줄만 남겨 두세요
한 번 붙이고 나면, 다음부터 매번 주소를 다시 알려줄 필요는 없습니다. 프로젝트
규칙 파일(`CLAUDE.md`·`.cursorrules` 등)에 이렇게 적어 두면, "nabi-note 로
~해줘" 라고만 말해도 에이전트가 알아서 주소를 찾아갑니다.

```md
이 프로젝트는 에디터로 `nabi-note` 를 쓰고 있습니다. 관련 작업 전에
https://nabi.saro.me/llms.txt 를 먼저 확인하세요.
```
:::

## 다음 문서

- [{{ t('menu_intro_index') }}](../intro) — 이 문서가 쓰는 말
- [{{ t('menu_wing_custom') }}](../wing/custom) — 없는 서식을 사람이 읽는 문서로 직접 만들기

<script setup lang="ts">
import { useTranslate } from '../../.vitepress/src/langs.ts'

const { t } = useTranslate()
</script>
