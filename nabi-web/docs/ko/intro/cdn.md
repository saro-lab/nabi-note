---
title: CDN 사용법
description: CDN 예제
---

# CDN 사용법

<CdnDemo />

---

## 방금 무엇을 한 것인가

읽지 않아도 위 파일은 돕니다. 고쳐 쓰고 싶을 때만 보세요.

### 태그 둘이 곧 설치입니다

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/nabi-note@latest/dist/nabi.css">
<script src="https://cdn.jsdelivr.net/npm/nabi-note@latest"></script>
```

패키지가 내보내는 것 **전부**가 전역 `NabiNote` 하나에 걸립니다. **시트는 손으로 겁니다** —
mount 는 CSS 를 주입하지 않으므로 `<link>` 를 빠뜨리면 편집기가 맨몸으로 보입니다.

### 뼈대

```html
<div id="app" class="nabi">                    <!-- 색·모서리·글꼴이 사는 뿌리 -->
  <div id="chrome" class="nabi-toolbar">        <!-- 툴바와 상황 줄이 한 덩어리로 붙는다 -->
    <div class="nabi-toolbar-row">
      <span id="tools"></span>                 <!-- 미리보기·전체화면 (오른쪽 끝) -->
      <div id="toolbar"></div>
    </div>
    <div id="context"></div>                   <!-- 캐럿이 짚은 것에 따라 저 혼자 채워진다 -->
  </div>
  <div id="editor" class="nabi-content" contenteditable="true"></div>
</div>
```

`id` 는 아무 이름이나 써도 됩니다 — mount 에 넘기는 것은 **엘리먼트**이지 이름이 아닙니다.
클래스 넷(`nabi`·`nabi-toolbar`·`nabi-toolbar-row`·`nabi-content`)은 시트가 붙잡는 손잡이라 그대로
두세요. 미리보기·전체화면을 안 쓸 거면 `<span id="tools">` 와 `mountViewTools` 줄을 함께
지우면 됩니다. 그릇은 어디를 넘겨도 됩니다 — `mountViewTools` 가 오른쪽 끝으로 뜨는 제
상자를 스스로 세우므로, 툴바를 그대로 넘겨도 단추 줄이 안 흐트러집니다.

### 날개 고르기

날개 고르기는 빌더 한 줄입니다. 위 파일은 기본 날개 스물아홉에서 업로드를 빼고, 서체를
둘로 좁혔습니다.

```js
var wings = N.wings().all().drop('upload').use('tf', { values: ['sans', 'serif'] })
```

- `all()` 은 공식 날개 전부에서 시작합니다. **안 부르면 빈 손입니다** — `use()` 로 든 것만
  실립니다.
- `use('이름', 옵션?)` 은 하나 더하기입니다. 이미 든 날개에 부르면 옵션만 얹습니다 — 위의
  `use('tf', { values: [...] })` 가 그 꼴입니다. 딛고 서는 날개가 필요하면(업로드는 그림이나
  링크 중 하나가 있어야 삽니다) 조용히 함께 끌어옵니다.
- `drop('이름')` 은 든 것에서 빼기입니다. 다른 날개가 딛고 선 것을 빼려 하면 그 자리에서
  던지고 함께 뺄 것을 알려 줍니다.
- 이름은 저장값에 적히는 짧은 열쇠입니다 — `b`(굵게)·`tf`(서체)·`upload` 처럼. 전체 목록은
  `console.log(N.wingNames())` 로 봅니다.
- **잘못 부르면 부른 그 줄에서 던집니다.** 이름 오타·모르는 옵션 키·목록 밖 값 전부가
  그렇고, 던지는 말에 고칠 방법이 들어 있습니다 — `use('bod')` 는 "혹시 'b'(굵게)?" 라고
  답합니다. 조용히 무시되는 자리가 없습니다.

`createNabiWith` 는 빌더를 그대로 받으므로 `build()` 를 부를 일이 없습니다 — 배열이 필요한
자리에서만 `build()` 가 배열을 내놓습니다. 몇 개만 골라 쓸 때는 배열이 여전히 답입니다.

```js
var wings = [N.boldWing, N.italicWing, N.headingWing, N.bulletListWing]
```

직접 만든 날개는 객체로 넣습니다 — `N.wings().all().use(customWing)` 처럼. 그 날개의 `w` 는
`ex` 로 시작해야 합니다(`exNote`) — 나중에 나올 공식 이름과 저장값에서 겹치면 이미 저장된
문서가 다른 뜻으로 읽히기 때문입니다. 만드는 법은
[{{ t('menu_wing_custom') }}](../wing/custom) 에 있습니다.

날개 하나하나는 [{{ t('menu_wing') }}](../wing/inline/bold) 에서 봅니다.

### 묻고 알리는 길

위 파일은 `ask` 로 브라우저의 `alert`·`confirm` 을 끼웠습니다 — "쓰던 글이 있습니다. 그래도
여시겠습니까?" 같은 물음이 그 상자로 갑니다. 안 끼우면 물음의 답은 "아니오" 이고, 답이 필요
없는 한 마디는 코어가 든 toast 그릇이 툴바 아래에 띄웁니다 — 업로드 오류 같은 알림에 따로
꽂을 것이 없습니다. 자세한 것은 [{{ t('menu_intro_usage') }}](./usage) 에 있습니다.

### 값 꺼내기

| | |
|---|---|
| `nabi.getHtml()` | 저장·발행하는 HTML |
| `nabi.getJson()` | 나비트리(JSON) |
| `nabi.setHtml(html)` · `nabi.setJson(json)` | 다시 넣기 |
| `nabi.onChange(fn)` | 값이 바뀔 때마다 |
| `N.renderStoredHtml(json, registry)` | 저장본을 편집기 없이 HTML 로 (아래 [보는 쪽](#보는-쪽)) |

---

## 주소

판을 고정하려면 주소에 판 번호를 답니다. unpkg 도 같은 파일을 줍니다.

**판을 안 적은 주소(`/npm/nabi-note`)는 쓰지 마세요** — jsDelivr 가 그 자리를 오래 캐시해서
묶음과 시트가 서로 다른 판으로 섞일 수 있습니다.

| | 주소 |
|---|---|
| **묶음 (최신)** | `https://cdn.jsdelivr.net/npm/nabi-note@latest` |
| **묶음 (고정)** | <code>{{ CDN_BUNDLE }}</code> |
| **시트 (최신)** | `https://cdn.jsdelivr.net/npm/nabi-note@latest/dist/nabi.css` |
| **시트 (고정)** | <code>{{ CDN_SHEET }}</code> |
| **묶음** (unpkg) | `https://unpkg.com/nabi-note` |

묶음은 npm 배포물 안에 함께 실려 나가므로 **CDN 이 따로 배포되는 것은 아닙니다.**

---

## 보는 쪽

저장된 HTML 을 **보여 주기만 하는 페이지**는 편집기를 안 세웁니다. 같은 시트를 걸고
`.nabi-content` 안에 값을 넣으면 편집기에서 보던 그대로 나옵니다.

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/nabi-note@latest/dist/nabi.css">

<div class="nabi-content">
  <!-- getHtml() 로 저장해 둔 값 -->
</div>
```

HTML 이 아니라 **나비트리(JSON)로 저장해 두었다면** 편집기를 세우지 않고 그 자리에서
그립니다. 받는 것은 저장본과 등록한 날개 목록 둘입니다.

```html
<script>
  var registry = N.makeRegistry(N.wings().all().build())

  var saved = [{ w: 'p', ch: ['댓글 한 줄'] }]   // 서버에서 받은 나비트리
  document.querySelector('.nabi-content').innerHTML = N.renderStoredHtml(saved, registry)
</script>
```

나비트리가 아니면 `null` 을 답하고, 통과한 값은 편집기가 내는 `getHtml()` 과 한 글자도
다르지 않습니다 — XSS 가 걸러지는 자리도 똑같습니다. 이 문은 DOM 을 안 쓰므로 서버(Node.js)
에서도 그대로 돌아, **HTML 을 서버에서 미리 만들어 내려보내는 길**이 같은 문으로 열립니다
([{{ t('menu_intro_ssr') }}](./ssr#저장본만-그리는-자리-편집기를-안-세웁니다) 참고).

npm 으로 무는 서버는 전역 묶음이 아니라 **`nabi-note/ssr`** 을 씁니다 — 그리는 데 필요한
것만 든 진입점이라 편집 표면과 화면 도구가 실리지 않습니다.

시트 파일 하나에 **모든 날개의 CSS 가 들어 있습니다** — 파일은 어느 날개를 등록했는지 알 수
없으므로 전부 싣습니다.

보이는 것은 시트가 전부 감당하지만, **표 정렬과 코드 색칠은 읽는 쪽에서 자바스크립트가
해야 하는 일**입니다 — 열 제목을 눌러 행을 재배열하고, 코드 글자를 토막 내 색을 얹는 일은
CSS 가 못 합니다. 원하면 보는 쪽 런타임을 한 문으로 겁니다.

```html
<script type="module">
  import { attachViewer } from 'https://cdn.jsdelivr.net/npm/nabi-note@latest/dist/viewer/index.js'

  attachViewer(document.querySelector('.nabi-content'), { locale: 'ko' })
</script>
```

- 안 걸어도 문서는 멀쩡히 보입니다 — 정렬을 켠 표가 안 돌고 코드가 한 색일 뿐입니다.
- 표 정렬은 편집기에서 정렬을 켠 표(`data-nabi-sortable` 표식이 남습니다)에만 붙습니다.
- 코드 색칠은 내장 토크나이저가 답하므로 의존성이 필요 없습니다. Shiki 같은 하이라이터를
  쓰려면 `{ locale: 'ko', highlight }` 처럼 훅으로 끼웁니다 — 그 무게는 끼운 페이지의
  것입니다.
- 전역 `NabiNote` 묶음에는 이 문이 없습니다 — 읽는 페이지가 편집기 전체를 싣지 않도록
  `nabi-note/viewer` 가 따로 삽니다. npm 으로 무는 호스트는
  [{{ t('menu_intro_usage') }}](./usage#미리보기에-보는-쪽-런타임을-겁니다) 처럼 미리보기에도
  같은 문을 겁니다.

---

## 다음 문서

- [{{ t('menu_intro_usage') }}](./usage) — npm 으로 무는 길, 조립·입력·출력 전체
- [{{ t('menu_wing_custom') }}](../wing/custom) — 없는 서식을 직접 만들기

<script setup lang="ts">
import CdnDemo from '../../.vitepress/ui/CdnDemo.vue'
import { useTranslate } from '../../.vitepress/src/langs.ts'
// 판 번호는 손으로 안 적는다 — nabi-npm 의 package.json 을 그대로 읽는다
import { CDN_BUNDLE, CDN_SHEET } from '../../.vitepress/src/version.ts'

const { t } = useTranslate()
</script>
