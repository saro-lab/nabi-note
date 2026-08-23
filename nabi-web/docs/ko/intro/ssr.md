---
title: SSR 지원
description: 서버에서 문서를 미리 렌더링하고, 브라우저에서 하이드레이션(Hydrate)으로 에디터와 툴바를 즉시 활성화합니다.
---

# SSR (서버 사이드 렌더링) 지원

## 저장된 문서 렌더링 (읽기 전용 화면)

댓글 목록이나 게시글 조회 화면처럼 **문서를 단순히 표시하는 화면**에서는 에디터 인스턴스를 생성할 필요가 없습니다. 문서를 HTML로 렌더링하는 데 필요한 것은 등록된 날개 목록(`registry`)뿐이므로, 서버 전용 렌더링 함수를 사용합니다.

```ts
import { makeRegistry, defaultWings, renderStoredHtml, renderStoredEditorHtml } from 'nabi-note/ssr'

// 서버 구동 시 한 번만 생성하여 여러 요청에서 재사용합니다.
const registry = makeRegistry(defaultWings)

const saved = [{ w: 'p', ch: ['댓글 한 줄'] }]   // DB에서 읽어온 나비트리

renderStoredHtml(saved, registry)        // '<p>댓글 한 줄</p>'
renderStoredEditorHtml(saved, registry)  // '<p data-key="n0">댓글 한 줄</p>'
```

**`nabi-note/ssr`은 렌더링에 필요한 핵심 로직만 담긴 경량 진입점입니다.** 편집 영역(`surface`)과 화면 UI 도구(`ui`)를 일절 참조하지 않으며, 아키텍처 단위 테스트를 통해 서버 번들에 DOM 코드가 섞이지 않도록 보장합니다. 이미 에디터 전체 번들을 로드한 환경이라면 `nabi-note` 패키지에서도 동일한 함수를 사용할 수 있습니다.

| 함수 | 설명 |
|---|---|
| `renderStoredHtml(json, registry, options?)` | 배포 및 저장용 HTML 생성 — 에디터의 `getHtml()`과 동일한 값 |
| `renderStoredEditorHtml(json, registry, options?)` | 에디터 초기화용 HTML 생성 — `getEditorHtml()`과 동일한 값 (`data-key` 속성 포함) |

- **DOM API를 전혀 사용하지 않습니다.** Node.js 등 서버 환경에서 바로 실행할 수 있습니다.
- **유효한 나비트리 구조가 아니면 `null`을 반환합니다.** 검증 규칙은 `setJson()`과 동일하며, 잘못된 데이터가 전달되어도 에러를 던지지 않고 `null`을 반환하며 `console.error`로 원인을 기록합니다.
- **에디터 인스턴스에서 생성한 결과와 완전히 일치합니다.** 동일한 정규화 및 조립 파이프라인을 거치므로 XSS 필터링 역시 동일하게 적용됩니다.
- `options` 매개변수는 `{ allowLocalUrls?: boolean }`을 지원하며, `createNabiWith`의 동일 옵션과 같은 역할을 합니다.

**동일한 나비트리 데이터는 항상 동일한 `data-key`를 생성합니다.** 따라서 서버에서 `renderStoredEditorHtml`로 에디터 초기 HTML을 미리 렌더링하여 클라이언트로 내려보내고, 브라우저에서 `hydrate: true` 옵션으로 마운트하면 화면 재렌더링이나 깜빡임 없이 즉시 활성화됩니다.

```ts
mountSurface({ nabi, registry, root: surface, hydrate: true })
```

서버와 클라이언트의 렌더링 결과에 불일치가 발생하더라도 클라이언트에서 자동으로 정상 렌더링하므로, 서버와 클라이언트의 날개 목록(`registry`)만 동일하게 맞추면 안전하게 동작합니다.

::: tip 현재 사이트의 홈 데모가 SSR 하이드레이션으로 동작합니다
홈 데모의 문서는 **빌드 시점에 `renderStoredEditorHtml`로 사전 렌더링**되어 HTML에 포함되어 있으며, 클라이언트 스크립트 로드 후 `hydrate`를 통해 에디터가 활성화됩니다. 따라서 JS 로드 전에도 본문 텍스트가 즉시 화면에 표시되어 레이아웃 이동(CLS)이 발생하지 않습니다.
:::

---

## 툴바 사전 렌더링

툴바의 버튼 구조는 **문서 본문 내용에 의존하지 않습니다.** 등록된 날개 목록, 표시 언어(Locale), 그룹 순서만을 기반으로 생성되므로 결과 문자열이 결정론적(Deterministic)입니다. 서버 구동 시 한 번 렌더링하여 캐싱해 두고 여러 요청에서 재사용할 수 있습니다.

```ts
import { makeRegistry, defaultWings, renderToolbarHtml } from 'nabi-note/ssr'

const registry = makeRegistry(defaultWings)

const toolbarHtml = renderToolbarHtml({ registry, locale: 'ko' })
// '<div class="nabi-group" data-group="font">…</div>'
```

이 HTML 문자열을 툴바 컨테이너 내부에 포함하여 클라이언트로 전달하면, 브라우저의 `mountToolbar`가 기존 마크업을 감지하여 **다시 그리지 않고 이벤트 리스너만 바인딩**합니다.

```ts
mountToolbar({ nabi, registry, surface, root: toolbar })
```

::: warning 컨테이너 요소에 `class="nabi-toolbar-row"`를 명시하세요
사전 렌더링된 툴바를 내보낼 때는 툴바 행 요소에 `class="nabi-toolbar-row"`가 처음부터 포함되어 있어야 합니다. 이 클래스가 누락되면 마운트 시점에 클래스가 추가되면서 패딩이 적용되어 **버튼 줄이 순간적으로 밀리는 현상**이 발생할 수 있습니다.
:::

- **구조가 일치하지 않아도 안전합니다.** 전달된 HTML이 현재 날개 목록과 다르면 클라이언트에서 즉시 다시 렌더링하므로 화면이 깨지지 않습니다.
- **사전 렌더링된 툴바는 기본 상태(활성화 및 숨김 없음)로 렌더링됩니다.** 버튼의 활성 상태(`aria-pressed`)나 컨텍스트별 가시성은 커서 위치에 따라 결정되므로, 클라이언트 마운트 후 커서 위치에 맞춰 상태가 자동으로 동기화됩니다.
- **에디터가 포함된 화면에서만 사용하세요.** 단순 읽기 전용 페이지에는 툴바가 필요하지 않습니다.

**미리보기 및 전체화면 버튼도 동일하게 사전 렌더링할 수 있습니다.** 해당 도구는 날개가 아닌 뷰 도구 컴포넌트이므로 `renderViewToolsHtml`을 사용하여 별도로 렌더링합니다.

```ts
import { renderViewToolsHtml } from 'nabi-note/ssr'

renderViewToolsHtml({ locale: 'ko' })
// '<span class="nabi-tools">…</span>'
```

::: tip 홈 데모의 툴바도 사전 렌더링이 적용되어 있습니다
홈 데모의 툴바는 **빌드 시점에 `renderToolbarHtml`과 `renderViewToolsHtml`로 사전 렌더링**되어 있으며, `mountToolbar`와 `mountViewTools`는 기존 DOM에 이벤트만 연결합니다. 따라서 수십 개의 툴바 아이콘이 뒤늦게 렌더링되며 화면이 깜빡이는 현상이 없습니다.
:::

---

## 다음 문서

- [{{ t('menu_intro_usage') }}](./usage) — npm 패키지 설치 및 에디터 상세 사용법
- [{{ t('menu_intro_cdn') }}](./cdn) — 빌드 도구 없이 `<script>` 태그 하나로 사용하기

<script setup lang="ts">
import { useTranslate } from '../../.vitepress/src/langs.ts'

const { t } = useTranslate()
</script>
