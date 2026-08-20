---
title: 소개
description: NABI NOTE 는 브라우저에서 동작하는 오픈소스 WYSIWYG 에디터입니다.
---

# NABI NOTE란?

NABI NOTE 는 브라우저에서 동작하는 **오픈소스 WYSIWYG 에디터**입니다.


## 나비트리

HTML로 직접 처리 할 경우 DOM이 없는 서버 사이드에서 처리 불가능한 문제가 있어
**나비트리**라는 자바스크립트 객체로 처리되며 JSON, HTML으로 양방향 직렬화 됩니다.
또한 나비트리와 HTML 전환 과정중 XSS 요소들이 제거 됩니다.

> 나비노트가 지원하는 모든 날개는 XSS를 지원하지만 `커스텀 날개(외부 플러그인)`의 경우 해당 개발자로부터 XSS 지원여부를 확인하셔야 합니다. 

<FlowHub :sources="hubSources" :core="hubCore" :targets="hubTargets" caption="" />

## DOM 없는 SSR (서버 사이드) 지원

저장해 둔 나비트리를 **서버(Node.js)에서 그대로 읽어** 보낼 HTML 을 조립할 수 있습니다.
DOM 이 필요한 것은 **입력**(`setHtml()`)과 화면에 붙는 `mount*` 뿐입니다.

보여 주기만 하는 자리는 편집기를 세울 것도 없이 문 하나면 됩니다. 받는 것은 저장본과
`registry`(등록한 날개 목록) 둘이고, 답은 HTML 글자열입니다.

**서버에서는 `nabi-note/ssr` 로 뭅니다** — 그리는 데 필요한 것만 든 진입점이라 편집 표면과
화면 도구가 아예 실리지 않습니다.

```ts
import { makeRegistry, defaultWings, renderStoredHtml } from 'nabi-note/ssr'

// 날개 목록은 서버가 뜰 때 한 번만 세웁니다 — 저장본이 몇 개든 이 하나를 나눠 씁니다.
const registry = makeRegistry(defaultWings)

const saved = [{ w: 'p', ch: ['댓글 한 줄'] }]   // DB 에서 읽은 나비트리
renderStoredHtml(saved, registry)
// '<p>댓글 한 줄</p>'
```

**나비트리가 아니면 `null` 을 답합니다** — 거절의 규칙이 `setJson()` 과 같습니다. 통과한
값은 편집기가 내는 `getHtml()` 과 **한 글자도 다르지 않습니다**. 같은 걸음(정규화 → 조립)을
지나기 때문이고, 그래서 XSS 가 걸러지는 자리도 똑같습니다.

편집기를 서버에서 미리 그려 두려면 짝이 되는 문을 씁니다 — 붙는 것은 `data-key` 뿐입니다.

```ts
import { renderStoredEditorHtml } from 'nabi-note/ssr'

renderStoredEditorHtml(saved, registry)
// '<p data-key="n0">댓글 한 줄</p>'
```

같은 저장본은 언제나 같은 `data-key` 를 얻으므로, 이 HTML 을 그대로 내려보내고 브라우저에서
`mountSurface({ nabi, registry, root, hydrate: true })` 로 이어받으면 화면을 다시 그리지
않습니다. **이 사이트의 홈 데모가 실제로 그렇게 돕니다** — 첫 화면의 문서는 서버가 그려 보낸
것이고, 편집기는 그 위에서 깨어납니다.

### 진입점 셋

| 무는 것 | 무엇이 들어 있나 | 언제 |
|---|---|---|
| `nabi-note` | 편집기 전부 — 조립·표면·화면 도구 | 글을 **쓰는** 자리 |
| `nabi-note/ssr` | 저장본을 HTML 로 그리는 것만 | 서버, 또는 읽기만 하는 페이지 |
| `nabi-note/viewer` | 읽는 쪽 동작(표 정렬·코드 색칠) | 발행된 HTML 을 **보여 주는** 자리 |

`nabi-note/ssr` 은 편집 표면(`surface`)과 화면 도구(`ui`)를 **한 파일도 딛지 않습니다** —
그물이 소스를 훑어 그것을 지킵니다. 그래서 서버 묶음에 DOM 코드가 섞여 들 길이 없습니다.

## 서식은 전부 날개입니다

다른 에디터에서 "플러그인" 이라고 부르는 단위를 **날개(wing)** 라고 부릅니다.
코어가 직접 보는 것은 문단(`p`)과 라인(`br`), 그리고 평문뿐이고 제목·리스트·표·굵게는 전부 날개입니다.

```ts
import { createNabiWith, parseNodes, boldWing } from 'nabi-note'

const bare = createNabiWith([], { parseHtml: parseNodes }).nabi
bare.setHtml('<p><b>굵게</b> <i>기울임</i></p>')
bare.getHtml()
// '<p>굵게 기울임</p>'                    — 선언한 날개가 없어 평문으로 바뀝니다.

const bold = createNabiWith([boldWing], { parseHtml: parseNodes }).nabi
bold.setHtml('<p><b>굵게</b> <i>기울임</i></p>')
bold.getHtml()
// '<p><b>굵게</b> 기울임</p>'              — boldWing만 선언하였기 때문에 boldWing만 남고 평문으로 바뀝니다.
```

날개로 등록하지 않은 마크업은 **평문으로 변환됩니다.** 때문에 선언하지 않은 html을 제외되며, 나비에서 공식 지원하는 모든 날개는 악성스크립트를 제거합니다.


## 인터페이스

문서는 `applyCommand()` 통해서만 바꿀 수 있습니다.

```ts
nabi.applyCommand('toggleMark', { w: 'b' })     // Bold
nabi.applyCommand('setHeading', { value: 2 })   // H2
nabi.undo()
nabi.redo()
```
커맨드는 **성공여부를 `boolean` 으로 반환합니다.** 바뀌는 것이 없으면 `false`를 답하며 히스토리를 남기거나 수정을 하지 않습니다.


## 코드의 층

**값이 이 차례로 흐른다는 뜻이 아닙니다.** 아래에서 위로 쌓은 **의존 방향**이고, 규칙은 하나입니다
— **아랫층은 윗층을 모릅니다.** 그래서 아래쪽 층(`schema`·`doc`·`html`)은 DOM 을 안 딛고,
그것이 서버에서 그대로 도는 까닭입니다. 값이 드나드는 길은 위의 나비트리 그림입니다.

<LayerStack
  :layers="layers"
  caption=""
/>

이 방향은 글로 적어 둔 약속이 아니라 **그물이 기계로 지킵니다** — 층을 거스르는 import 가
하나라도 생기면 그 자리에서 시험이 깨집니다.


## 용어

| 말 | 뜻                                                    |
|---|-------------------------------------------------------|
| **마크(mark)** | 글서식 ex) `<b>` · `<i>` · `<a>`                      |
| **블록(block)** | ex) 문단·제목·리스트·표·이미지                        |
| **문단 속성(paragraph attribute)** | 문단의 속성 ex) 정렬·드롭 캡                          |
| **래퍼 문단** | 표·리스트·이미지같은 단일문단 오브젝트를 감싸는 문단. |
| **소유(claim)** | 어떤 마크업이 어느 날개의 것인지 가리는 판정.         |
| **부품(parts)** | 날개 내 기능 ex) 표의 행·칸, 접기의 요약줄          |

### 편집화면

| 말                           | 뜻                                                                                                                        |
|------------------------------|---------------------------------------------------------------------------------------------------------------------------|
| **캐럿(caret)**              | 에디터 내 선택 커서                                                                                                       |
| **컨텍스트 행(context row)** | 현재 캐럿이 선택한 상태를 제어하는 툴바 ex) 표의 행·열 커맨드, 코드의 언어 칸, 링크의 주소·이름 칸, 제목의 H1~H6 |

### 코어

| 말 | 뜻                                                                                                                                                              |
|---|-----------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **cocoon** | 나비트리의 정규화 단계입니다. **모든 커맨드 뒤에 돌아서** 어떤 커맨드도 규칙을 깬 문서를 남길 수 없습니다                                                       |
| **붙는 일(attach)** | 날개가 화면에 손을 대야 할 때 선언하는 훅입니다. ex) 표의 칸 드래그, 코드 색칠, 체크 토글이 전부 이것입니다. `mountSurface` 가 등록된 날개의 것을 함께 붙입니다 |
| **자동 변환(input rule)** | 글자를 치는 것만으로 일어나는 변환입니다. ex) 하이픈과 공백은 목록으로, `#` 과 공백은 제목으로                                                                  |


## 다음 문서

- [{{ t('menu_intro_usage') }}](./intro/usage) — 조립·입력·출력 전체
- [{{ t('menu_intro_cdn') }}](./intro/cdn) — 빌드 도구 없이 `<script>` 하나로
- [{{ t('menu_wing_custom') }}](./wing/custom) — 없는 서식을 직접 만들기

<script setup lang="ts">
import FlowHub from '../.vitepress/ui/FlowHub.vue'
import LayerStack from '../.vitepress/ui/LayerStack.vue'
import { useTranslate } from '../.vitepress/src/langs.ts'

const { t } = useTranslate()

const hubSources = [
  { label: 'HTML · JSON', note: '직접입력 · 붙여넣기 · 불러오기', kind: 'in' },
  { label: 'setHtml() · setJson()', note: '함수 입력', kind: 'gate' },
];

const hubCore = { label: '나비트리', note: 'Tree Object', kind: 'core' }

const hubTargets = [
  { label: 'getHtml()', note: 'Output HTML', kind: 'out' },
  { label: 'getJson()', note: 'Output JSON', kind: 'out' },
  { label: 'getEditorHtml()', note: '편집기용 HTML', kind: 'out' },
];

const layers = [
  { name: 'locale', what: '언어' },
  { name: 'code', what: '편집 화면과 보는 쪽이 함께 쓰는 순수 토크나이저' },
  { name: 'schema', what: '나비트리의 모양과 Cocoon 정의' },
  { name: 'doc', what: '넣기·지우기·나누기·범위 Dom-less' },
  { name: 'caret', what: '커서의 위치, 선택, 경계' },
  { name: 'html', what: '나비트리 ↔ HTML' },
  { name: 'editor', what: '커맨드 인터페이스를 가진 인스턴스' },
  { name: 'wing', what: '등록 시점의 Wings 검사' },
  { name: 'wings', what: '공식 날개들 (bold, italic ... table, upload...)' },
  { name: 'surface', what: '캐럿·IME·입력을 트리에 맞춤' },
  { name: 'ui', what: 'UI 레이어' },
  { name: 'viewer', what: '읽기 전용' },
]
</script>
