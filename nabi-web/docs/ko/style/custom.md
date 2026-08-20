---
title: 스타일 바꾸기
description: 색·모양은 CSS 변수로 덮어 바꿉니다.
---

# 스타일 바꾸기

시트는 **호스트가 겁니다** — 번들러를 쓰면 `import 'nabi-note/nabi.css'` 한 줄,
CDN 이면 `<link>` 한 줄입니다. 그 뒤로는 변수만 덮으면 됩니다.

컴포넌트 규칙에는 **색 리터럴이 한 글자도 없습니다.** 전부 `--nabi-*` 변수로 그려져 있어서,
변수만 덮으면 나머지가 따라옵니다.

```css
.nabi.nabi.nabi {
  --nabi-accent: #7c3aed;
}
```

클래스를 세 번 겹친 이유는 아래 [특이도에 걸리지 않게](#특이도에-걸리지-않게)에 있습니다.

::: tip 이 문서의 큰 전제 — 저장값은 혼자 서지 않습니다
나가는 HTML(`getHtml()`)에는 **인라인 `style` 이 한 글자도 없습니다.** 저장값은
무엇인가만 속성으로 말하고(`data-nabi-align="center"`), 어떻게 보이는지는 이 시트가
말합니다. 그래서 저장한 HTML 을 읽는 쪽에서 그릴 때도 **이 시트가 걸린 `.nabi-content`
안**이어야 편집기와 같은 모습이 됩니다 — 아래 [저장한 HTML 을 밖에서 그릴
때](#저장한-html-을-밖에서-그릴-때)를 보세요.
:::

::: tip 다크·라이트는 이미 들어 있습니다
테마를 위해 호스트가 덮어야 할 토큰은 **없습니다.** 코어 시트가 라이트 기본값 · `.dark`
재정의 · 명시적 `.light` 재정의 셋을 다 들고 옵니다. 이 사이트도 편집기 안에서는
글꼴 토큰 넷 말고는 아무것도 덮지 않습니다.
:::

## 색 · 모양 토큰

| 토큰 | 뜻 | 기본값(라이트) |
|---|---|---|
| `--nabi-bg` · `--nabi-soft` | 바탕 · 살짝 눌린 면 | `#fff` · `rgb(0 0 0 / 4.5%)` |
| `--nabi-fg` · `--nabi-muted` · `--nabi-on-accent` | 글자 · 흐린 글자 · 강조 위의 글자 | `#1b1b1f` · `#6b6b76` · `#fff` |
| `--nabi-line` · `--nabi-accent` | 선 · 강조색 | `#e2e2e8` · `#3b6fe0` |
| `--nabi-danger` · `--nabi-on-danger` | 위험 · 그 위의 글자 | `#d93b3b` · `#fff` |
| `--nabi-shadow` · `--nabi-scrim` | 상자 그림자 · 미리보기 배경 | — |
| `--nabi-radius` · `--nabi-radius-sm` · `--nabi-radius-xs` | 모서리 | `6px` · `4px` · `3px` |
| `--nabi-layer-radius` | 층(판·미리보기·라이트박스)의 모서리 | `.25rem` |
| `--nabi-z-sticky` | 붙어 서는 줄의 층 번호 | `20` |
| `--nabi-grid-cell` | 표 크기 격자의 칸 크기 | `1.125rem` |
| `--nabi-hl-yellow`·`green`·`cyan`·`pink`·`purple`·`orange` | 형광펜 여섯 색 | 반투명 색 |
| `--nabi-tc-green`·`coral`·`violet`·`amber`·`blue` | 글자색 다섯 색 | 진한 색 |

이 표는 코어 시트(`nabi.css`)가 **직접 선언하는** 것만 담았습니다. 선언 자리는 `.nabi`
하나가 아니라 셋입니다 — `:is(.nabi, .nabi-scrim, .nabi-content:where(:not(.nabi *)))`.
미리보기 오버레이는 `body` 자식이라 `.nabi` 로부터 상속이 닿지 않고, 편집기 밖에서 홀로 선
`.nabi-content` 도 토큰을 직접 받아야 하기 때문입니다.

같은 목록이 세 벌(라이트 기본값 · `.dark` · 명시적 `.light`)로 적혀 있습니다. **덮는 쪽은
세 벌을 다 볼 필요가 없습니다** — 특이도만 이기면 한 번 덮은 값이 세 경우 모두에 걸립니다.
다만 다크에서 다른 값을 쓰고 싶다면 `.dark` 조건을 스스로 붙여야 합니다.

## 값 없이 참조만 하는 토큰

아래는 코어가 **선언하지 않고 참조만** 하는 변수들입니다. 호스트가 값을 주지 않으면 괄호
안의 폴백이 섭니다. 선언된 자리가 없으므로 **`:root` 에 적어도 그대로 먹습니다** — 위
색·모양 토큰과 갈리는 지점이 여기입니다(그쪽은 `.nabi` 에 선언돼 있어 상속이 못 이깁니다).

| 토큰 | 뜻 | 폴백 |
|---|---|---|
| `--nabi-font` · `--nabi-font-serif` · `--nabi-font-mono` · `--nabi-font-cursive` | 서체 날개의 네 갈래에 실제로 물릴 글꼴 | 시스템 글꼴 |
| `--nabi-cursive-adjust` | 필기체의 `font-size-adjust`. 손글씨 얼굴은 x-높이가 낮아 같은 px 로도 작아 보이는데, 이 값이 x-높이 기준으로 다시 재웁니다 | `0.4` |
| `--nabi-sticky-top` | 붙는 줄이 얼마나 내려와 앉나. 사이트에 고정 머리줄이 있으면 그 높이 | `0px` |
| `--nabi-preview-width` | 미리보기 카드의 폭. **`openPreview` 가 열 때 편집 영역의 폭을 재서 카드에 직접 적으므로**, 호스트가 겉에서 덮어도 그 인라인 값이 이깁니다 | `720px` |
| `--nabi-placeholder` | 빈 편집기의 안내글(따옴표까지 담은 글자열). **`mountSurface` 가 제 `placeholder` 옵션(또는 코어 사전)의 말을 편집 영역 뿌리에 직접 적으므로**, 겉에서 덮어도 그 인라인 값이 이깁니다 — 결을 바꾸려면 `.nabi-content.nabi-editing > :is(p, h1, h2, h3, h4, h5, h6):only-child:has(> br:only-child)::before` 를 고쳐 쓰세요 | 없음(안 뜸) |

`--nabi-typeface-base` 는 이 갈래가 아닙니다 — **코어가 선언합니다**(기본은 `--nabi-font` 를
따라갑니다). 서체 날개에는 이 값을 정하는 옵션이 없으므로, 바꾸려면 이 토큰을 덮으세요.

`--nabi-keyboard-top` · `--nabi-keyboard-bottom` 도 같은 자리에 서지만 이것은 **코어가
씁니다** — `mountSticky()` 이 모바일 키보드가 화면을 밀어낸 만큼을 재서 여기에
적고, 붙는 줄과 전체화면이 그 값을 읽습니다. 손으로 적을 값이 아닙니다.

## 토큰이 없는 자리 — 규칙을 덮습니다

아래 셋은 **변수가 없습니다.** 코어가 규칙에 값을 박아 두었으므로, 바꾸려면 그 선택자를
덮습니다.

**글자 크기 네 단계** — `em` 이라 부모 크기를 따라갑니다.

```css
.nabi-content [data-nabi-size="xs"] { font-size: .75em; }
.nabi-content [data-nabi-size="sm"] { font-size: .875em; }
.nabi-content [data-nabi-size="lg"] { font-size: 1.25em; }
.nabi-content [data-nabi-size="xl"] { font-size: 1.5em; }
```

**드롭 캡의 크기** — 몇 줄을 감쌀지 정하는 값이 아니라 글자 크기 하나입니다. 실제로 몇 줄을
덮을지는 그 문단의 줄 높이가 정합니다.

```css
.nabi-content [data-nabi-dropcap="1"]::first-letter { font-size: 5.9em; line-height: .83; }
```

**코드 토큰 색** — 코드 날개의 시트가 `[data-nabi-token]` 에 색을 직접 적습니다. 지금 색이
붙는 갈래는 **다섯**입니다.

```css
.nabi-content [data-nabi-token="comment"] { color: #7a8a7a; font-style: italic; }
.nabi-content [data-nabi-token="string"] { color: #a2543a; }
.nabi-content [data-nabi-token="keyword"] { color: #7b4fd0; }
.nabi-content [data-nabi-token="number"] { color: #2f6fd0; }
.nabi-content [data-nabi-token="literal"] { color: #2f8f4e; }
```

하이라이터가 답하는 `type` 은 자유로운 글자입니다 — 위 다섯 밖의 이름을 답하면 색 없이
그려지므로, 쓰고 싶은 갈래는 호스트가 같은 모양으로 규칙을 더하면 됩니다. 다크에서 다른
색을 쓰려면 `.dark` 조건을 스스로 붙이세요 — 코어는 이 다섯에 다크 변형을 안 답니다.

업로드 날개의 진행률 애니메이션(`--nabi-per`·`--nabi-t`·`--nabi-span`·`--nabi-clear`·
`--nabi-blur-max`)은 **날개 내부 구현용**입니다 — 이름이 `--nabi-` 로 시작하지만 호스트가
덮으라고 연 자리가 아닙니다.

---

## 겉의 치수는 `rem` 이다

버튼·여백·툴바 칩을 비롯한 겉의 치수는 대부분 `rem` 이라 **루트(`html`)의 글자 크기를
따라 자랍니다.** 사용자가 브라우저나 OS 에서 글자를 키우면 편집기 틀도 함께 커집니다.
크기를 바꾸고 싶으면 루트의 `font-size` 를 바꾸세요. 선(`border`)은 크기가 아니라
**선**이므로 `px` 로 남아 있는 곳도 있습니다.

---

## 특이도에 걸리지 않게

색·모양 토큰을 덮으려면 **클래스 셋**을 겹치세요.

```css
.nabi.nabi.nabi,
.nabi-scrim.nabi-scrim.nabi-scrim {
  --nabi-accent: var(--내-강조색);
}
```

세어 보면 이렇습니다. 라이트 기본값 규칙 `:is(.nabi, …)` 는 `:is()` 가 인자 중 가장 높은
것을 따르므로 **(0,1,0)**, 다크 규칙 `:where(html, body).dark :is(.nabi, …)` 는
`:where()` 가 0 이고 `.dark` 와 `:is()` 가 각각 클래스 하나씩이라 **(0,2,0)** 입니다.
그러니 `.nabi.nabi` 로는 다크와 **비깁니다** — 비기면 나중에 실린 쪽이 이기고, 코어 시트가
호스트 시트보다 나중에 실릴 수도 있습니다. 셋을 겹쳐 (0,3,0) 으로 올려야 순서에 안 기댑니다.

미리보기 오버레이는 `.nabi` 밖(`body` 자식)에 서므로 그쪽 선택자도 함께 적어야 같은 색이
됩니다.

**글꼴처럼 코어가 선언하지 않는 토큰은 이 씨름이 필요 없습니다** — 선언된 자리가 없어
상속만으로 닿으니 `:root` 한 줄이면 됩니다.

```css
:root {
  --nabi-font: 'Noto Sans', system-ui, sans-serif;
}
```

---

## 라이트 · 다크

`html` 이나 `body` **둘 중 하나**에 `dark` 클래스가 있으면 다크, `light` 면 라이트입니다.
클래스가 없으면 라이트가 기본이고, 둘 다 있으면 명시적 `light` 가 이깁니다(`.light` 규칙이
`.dark` 규칙 뒤에 실려 있습니다).

```html
<html class="dark"><!-- 또는 <body class="dark"> --></html>
```

클래스를 토글하면 CSS 가 반응합니다. 부를 API 는 없습니다. 테마가 갈아 끼우는 것은 색
변수뿐이고 컴포넌트 규칙은 그대로입니다 — 직접 만든 스타일도 `--nabi-*` 변수만 쓰면
다크를 따라갑니다.

---

## 시트를 거는 두 길

**① 파일 하나** — 가장 흔한 길입니다. 모든 날개의 CSS 가 들어 있습니다.

```ts
import 'nabi-note/nabi.css'
```

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/nabi-note/dist/nabi.css">
```

**② 등록한 것만 주입** — 실제로 켠 날개의 시트만 담고 싶을 때입니다.

```ts
import { collectSheets, injectSheets } from 'nabi-note'

const drop = injectSheets(document, collectSheets(registry))
// drop() 을 부르면 이 부름이 넣은 것만 걷힙니다
```

같은 글의 시트는 **한 번만** 들어갑니다 — 접는 열쇠가 시트의 **내용**이라, 한 문서에 편집기를
여럿 띄워도 쌓이지 않고 서로 다른 날개 구성이 섞여도 합집합 하나로 모입니다.

::: tip 둘의 차이 — 무엇이 실리나, 언제 걸리나
**무엇이 실리나.** 파일은 어느 날개를 등록했는지 알 수 없으므로 **전부** 싣습니다. 주입은
`registry` 를 보고 **등록한 것만** 담습니다. 저장된 HTML 을 보여 주기만 하는 페이지는
편집기가 없어 `registry` 도 없으므로 파일 쪽을 씁니다.

**언제 걸리나.** 파일은 `<link>` 로 머리(head)에서 **그리기를 막고** 들어오지만, 주입은
편집기 자바스크립트가 **도착한 뒤에야** 붙습니다. 그래서 문서를 서버에서 미리 그려
내려보내는 페이지는 파일 쪽이어야 합니다 — 주입으로 걸면 서버가 보낸 문서가 맨몸으로 한 번
그려졌다가 스타일이 얹히며 배치가 다시 잡힙니다.
:::

등록한 wing 의 시트는 코어 시트 **뒤에** 들어가므로, 같은 우선순위에서는 wing 이
이깁니다.

---

## 붙일 수 있는 자리

변수로 안 되는 것은 실제로 존재하는 클래스를 직접 겨냥합니다.

| 선택자 | 무엇 | 누가 붙입니까 |
|---|---|---|
| `.nabi` | 편집기 전체(크롬 + 편집 영역)를 감싸는 껍데기. 색·모양 토큰이 여기 걸립니다 | 호스트 |
| `.nabi-content[contenteditable]` | 편집 영역 자신 | 호스트 |
| `.nabi-toolbar` | 툴바 줄 + 상황 줄을 감싸는 자리. 이 클래스가 곧 "위에 붙는다" 입니다 | 호스트 |
| `.nabi-toolbar-row` | 툴바가 들어앉은 그릇 | `mountToolbar()` |
| `.nabi-context` | 상황 줄이 들어앉은 그릇 | `mountContextToolbar()` |
| `.nabi-tools` | 미리보기·전체화면 두 단추의 자리 — 코어가 오른쪽 위로 띄웁니다 | `mountViewTools()` |
| `.nabi-tool` | 그 두 단추 자신 | `mountViewTools()` |
| `.tb-group` | 툴바의 버튼 묶음 | `mountToolbar()` |
| `.ctb-group` · `.ctb-button` · `.ctb-swatch` · `.ctb-input` | 상황 줄의 묶음·버튼·색 견본·글자 칸 | `mountContextToolbar()` |
| `.tb-picker` · `.tb-picker-grid` · `.tb-picker-cell` | 표 크기 격자 등 버튼 아래 뜨는 상자 | `mountToolbar()` |
| `.tb-prompt` · `.tb-prompt-input` | 새로 넣을 때 뜨는 주소 입력 레이어 | `mountToolbar()` |
| `.nabi-hints [data-hint]` | Shift 두 번 연타로 뜨는 단축키 배지 — 배지는 `::before`, 이름표는 `::after` 라 둘이 함께 보입니다 | `mountHints()` |
| `[data-nabi-tip]` | 이름표(tooltip) — CSS `::after` 로만 그립니다 | 코어 전반 |
| `.nabi-content.nabi-dropping` | 파일을 끌고 온 동안의 편집 영역. 안내 글자는 `data-nabi-drop` 속성에 실립니다 | `mountUpload()` |

미리보기·전체화면도 **코어가 짓습니다.**

| 선택자 | 무엇 | 누가 |
|---|---|---|
| `.nabi-scrim` > `.nabi-card` > (`.nabi-close` · `.nabi-content.nabi-preview-body`) | 문서 미리보기 오버레이 | `openPreview()` |
| `.nabi-scrim` > `.nabi-card.nabi-lightbox` | 그림 하나만 크게 보는 상자 | `openImageLightbox()` |
| `.nabi.is-fullscreen` | 전체화면 — `.nabi` 상자를 화면에 고정합니다 | `setFullscreen()` (클래스 이름은 `FULLSCREEN_CLASS`) |

`mountViewTools()` 를 붙이면 두 단추가 알아서 이것들을 열고 닫습니다. 직접 열고 싶으면
`openPreview({ nabi, editor })` · `openImageLightbox({ editor, src, alt?, locale })` ·
`setFullscreen(root, on)` · `isFullscreen(root)` 를 부르세요.

::: tip 도구 자리는 스스로 섭니다
`mountViewTools` 가 `.nabi-tools` 상자를 직접 만들어 받은 그릇의 맨 앞에 넣습니다. 호스트가
`<span>` 을 툴바보다 앞에 놓아 둘 일이 없습니다 — 자리를 미리 만들어 두면 오히려 상자가
둘이 됩니다.
:::

편집 화면 전용 표식도 겨냥할 수 있습니다 — `[data-nabi-token]`(코드 블록의 토큰 색),
`[data-nabi-lang]`(코드 블록의 언어), `[data-color]`(형광펜·글자색 — `<mark>`·`<span>`
태그로 구분), `data-nabi-align`·`data-nabi-typeface`·`data-nabi-size`·`data-nabi-dropcap`
(문단 속성). 이 표식들의 실제 이름은 각 wing 파일의 `*_ATTR` 상수가 정본입니다.

---

## 저장한 HTML 을 밖에서 그릴 때

나가는 값(`getHtml()`)은 `data-nabi-*` 속성이 남은 HTML 이고, **인라인 `style` 은
한 글자도 없습니다.** 모양은 전부 시트의 몫이라는 뜻이고, 그래서 시트 없이 그리면 정렬도
글자 크기도 표의 줄도 없는 맨 HTML 이 됩니다.

편집기와 같은 모습으로 그리려면 `.nabi-content` 로 감싸세요 — 이 클래스는 `.nabi` 로
감싸지 않아도 색·모양 토큰을 직접 받습니다(`nabi.css` 의
`.nabi-content:where(:not(.nabi *))` 규칙).

```html
<div class="nabi-content">저장한 HTML</div>
```

시트는 위 「시트를 거는 두 길」에서 본 그대로 걸면 됩니다 — 번들러면 `import
'nabi-note/nabi.css'`, 그 밖이면 `<link>` 하나입니다. 편집기를 안 세우는 페이지라도
`.nabi-content` 만 있으면 코어 시트가 토큰을 선언해 줍니다.

### 보는 쪽에서 도는 동작 — 표 정렬

지금은 **표 정렬 하나**만 읽는 쪽 전용 함수로 나옵니다. 임의의 wing 이 저마다 읽는 쪽
동작을 다는 범용 체계는 아직 없습니다.

```ts
import { attachTableSort } from 'nabi-note/viewer'

const detach = attachTableSort(document.querySelector('#article')!, { locale: 'ko' })
```

`data-nabi-sortable` 이 붙은 표를 찾아 제목 칸에 정렬 버튼을 답니다. 해제 함수(`detach`)가
꽂은 버튼과 바꾼 행 순서를 되돌립니다.

::: danger 편집 대상 엘리먼트에는 붙이지 마세요
`attachTableSort()` 는 DOM 에 버튼을 꽂고 행 순서를 바꿉니다. 붙어 있는 동안의 DOM 을
저장하면 그것이 값에 굳습니다 — 보는 쪽은 읽기 전용 사본에만 붙이세요.
:::

---

## 다음 문서

- [{{ t('menu_wing_custom') }}](../wing/custom) — 없는 서식을 직접 만들기
- [{{ t('menu_intro_index') }}](../intro) — 이 문서가 쓰는 말

<script setup lang="ts">
import { useTranslate } from '../../.vitepress/src/langs.ts'
const { t } = useTranslate()
</script>
