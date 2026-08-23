---
title: 코드 블록
---

# 코드 블록

## 설명

`codeWing`(식별자 `code`)은 코드 블록(`<pre><code>`)을 처리하는 불변 날개 객체입니다.

`holds: 'inline'` 컨테이너이며, 내부 텍스트는 `repair` 단계에서 순수 텍스트로 정규화되어 다른 인라인 마크나 블록이 중첩되지 않습니다.

빈 줄에서 ` ``` `을 입력하고 스페이스 또는 Enter를 누르면 코드 블록으로 자동 변환됩니다 (` ```ts `처럼 언어 식별자를 함께 입력하면 해당 언어로 자동 설정됩니다). <kbd>Tab</kbd>과 <kbd>Shift</kbd>+<kbd>Tab</kbd>으로 코드 줄을 들여쓰거나 내어쓸 수 있으며, 여러 줄을 선택한 상태에서도 일괄 적용됩니다. Enter 키 입력 시 이전 줄의 들여쓰기 깊이가 자동으로 유지됩니다.

커서가 코드 블록 내부에 있을 때 동적 컨텍스트 툴바가 활성화되며, 언어 직접 입력란, "언어 없음" 버튼, 자주 사용하는 주요 언어 단축 버튼이 제공됩니다:

```
javascript typescript jsx tsx · python java kotlin swift
c cpp csharp go rust · php ruby sql
html xml css scss · json yaml toml markdown
bash powershell dockerfile diff
```

위 목록에 없는 언어라도 입력 폼에 직접 언어명을 입력할 수 있으며, 입력된 값은 문법 하이라이터로 전달됩니다.

## 문법 하이라이팅 연동

`highlight` 옵션은 소스 코드와 언어를 받아 토큰 배열을 반환하는 훅 함수입니다:
`(source, lang) => { text: string, type?: string }[]`

토큰의 `type`은 `CODE_TOKEN_TYPES`에 정의된 14가지 표준 토큰 유형 중 하나를 반환합니다 (`keyword`, `string`, `number`, `comment`, `function`, `class`, `variable`, `operator`, `punctuation`, `tag`, `attribute`, `literal`, `regexp`, `meta`).

코어 스타일시트는 `[data-nabi-token="…"]` 선택자로 기본 5가지 토큰(`comment`, `string`, `keyword`, `number`, `literal`)에 테마 색상을 부여합니다. 다크 모드나 커스텀 색상을 적용하려면 해당 CSS 선택자를 재정의할 수 있습니다.

```css
.dark .nabi-content [data-nabi-token="keyword"] { color: #c9a0ff; }
```

Shiki나 Prism 등 외부 하이라이터를 연결할 때는 `makeCodeAttach`를 사용하여 `attach` 훅을 구성합니다.

```ts
import { codeWing, makeCodeAttach } from 'nabi-note'

const wing = { ...codeWing, attach: makeCodeAttach({ highlight: myHighlighter }) }
```

Shiki처럼 비동기로 문법 언어 번들을 로드하는 경우 `version` 옵션을 전달하여 문법 로드가 완료되었을 때 에디터 화면을 다시 하이라이팅할 수 있습니다:

```ts
let grammarAge = 0
const wing = {
  ...codeWing,
  attach: makeCodeAttach({ highlight: myHighlighter, version: () => grammarAge }),
}

// 비동기 언어 문법 로드 완료 시
grammarAge += 1
```

저장되는 HTML 구조는 표준 형식을 따릅니다: `<pre data-nabi-lang="ts"><code class="language-ts">`. 각 토큰은 `data-nabi-token` 속성으로 안전하게 마크업됩니다.

## 사용 예시

```ts
import { createNabiWith, mountSurface, mountToolbar, mountContextToolbar, codeWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

const { nabi, registry } = createNabiWith([codeWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })
mountContextToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#context')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## 데모

<WingDemo path="/wing/block/code" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
