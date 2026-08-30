---
title: 코드
description: 여러 줄의 코드와 구문 강조용 언어 정보를 담습니다.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# 코드

여러 줄의 코드를 일반 본문과 구분해 넣습니다. 빈 문단에 백틱 세 개를 입력한 뒤 Space 또는 Enter를 누르거나 툴바에서 전환합니다. 백틱 뒤에 `ts`처럼 언어 이름을 붙이면 그 이름도 함께 저장됩니다.

언어 이름은 구문 강조에 쓰는 식별자이며, 등록된 목록 밖 이름도 직접 입력할 수 있습니다. 코드 내용과 들여쓰기를 보존해야 하므로 코드 블록은 문단 정렬을 적용하지 않습니다.

<WingDemo path="/wing/block/code" />

```ts
const selected = wings().use('code').build()
```

## 코드 하이라이터 연결

코드 블록을 등록하면 편집기에서 기본 색칠을 사용합니다. 게시 화면에서도 색칠하려면
`nabi-note/viewer`를 연결합니다. viewer는 `pre > code`를 찾아 부모의 `data-nabi-lang` 값을
언어 이름으로 읽습니다. 그 값이 없으면 `code` 요소의 `language-...` 클래스를 확인합니다.

```ts
import { attachViewer } from 'nabi-note/viewer'

const viewer = attachViewer(article, {
  locale: 'ko',
})

// 게시 HTML을 바꾼 뒤
viewer.refresh()

// 화면을 닫을 때
viewer.unmount()
```

별도 하이라이터가 없거나 해당 언어를 처리하지 못하면, 의존성 없는 내장 토크나이저가 대신
색칠합니다. 하이라이터가 넣는 토큰 span은 화면에만 존재하며 저장 JSON이나 게시 HTML 원본에는
남지 않습니다. `refresh()`와 `unmount()`는 이 span을 지우고 현재 원본 코드로 다시 연결합니다.

### NABI 웹사이트의 Shiki 연결 방식

NABI 웹사이트는 Shiki를 첫 화면과 SSR 번들에서 제외하기 위해 하이라이터를 동적으로 불러옵니다.
`nabi-web/docs/.vitepress/src/highlight.ts`의 `loadCodeHighlighting()`은 Shiki core를 만들고,
코드 언어가 실제로 필요해질 때 그 언어 문법만 가져옵니다. 아래는 게시 화면에서 쓰는 같은
연결 방식입니다.

```ts
import { attachViewer } from 'nabi-note/viewer'
import { loadCodeHighlighting } from '../src/highlight'

const highlighting = await loadCodeHighlighting()
const viewer = attachViewer(article, {
  locale: 'ko',
  highlight: highlighting?.highlight,
})

const stop = highlighting?.onGrammarLoaded(() => viewer.refresh())

// 화면을 닫을 때
stop?.()
viewer.unmount()
```

처음 어떤 언어를 만나면 문법 다운로드가 시작되고, 그 사이에는 내장 토크나이저 또는 평문으로
보입니다. 문법이 도착하면 `onGrammarLoaded()`가 `viewer.refresh()`를 호출해 다시 색칠합니다.
그래서 필요한 언어만 내려받고, 늦게 도착한 문법도 다음 화면 이동 없이 반영됩니다.

편집기 쪽도 같은 `highlight` 함수를 사용합니다. NABI 웹사이트의 데모는 기본 `codeWing`의
`attach`만 `makeCodeAttach({ highlight, version })`으로 교체합니다. `version`은 문법이 하나
도착할 때마다 바뀌는 값이며, 이미 그린 코드도 다시 색칠하게 하는 표시입니다. 독립된 서비스는
먼저 게시 화면 연결만 구현하고, 편집 중에도 Shiki 색칠이 꼭 필요할 때 이 방식을 추가하면 됩니다.

## CSS 스타일

코드 블록은 `.nabi-content pre`, 코드는 `.nabi-content pre > code`로 꾸밉니다. `white-space`는
코드의 줄바꿈과 편집에 영향을 주므로 바꾸지 마세요. 토큰 색은 `[data-nabi-token]` 선택자로
바꿀 수 있습니다.

```css
.nabi-content [data-nabi-token="keyword"] { color: #7b4fd0; }
.nabi-content [data-nabi-token="string"] { color: #a2543a; }
```
