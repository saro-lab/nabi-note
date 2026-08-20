---
title: SSR 지원
description: 저장본을 서버에서 미리 그리고, 편집기·툴바를 hydrate 로 이어받습니다.
---

# SSR 지원

## 저장본만 그리는 자리 — 편집기를 안 세웁니다

댓글 목록처럼 **보여 주기만 하는 자리**는 편집기가 필요 없습니다. 문서를 그리는 데 드는 것은
등록한 날개 목록(`registry`) 하나뿐이라, 그것만 받는 문이 따로 있습니다.

```ts
import { makeRegistry, defaultWings, renderStoredHtml, renderStoredEditorHtml } from 'nabi-note/ssr'

// 서버가 뜰 때 한 번 — 저장본이 몇 개든 이 하나를 나눠 씁니다
const registry = makeRegistry(defaultWings)

const saved = [{ w: 'p', ch: ['댓글 한 줄'] }]   // DB 에서 읽은 나비트리

renderStoredHtml(saved, registry)        // '<p>댓글 한 줄</p>'
renderStoredEditorHtml(saved, registry)  // '<p data-key="n0">댓글 한 줄</p>'
```

**`nabi-note/ssr` 은 그리는 데 필요한 것만 든 진입점입니다.** 편집 표면(`surface`)과 화면
도구(`ui`)를 한 파일도 딛지 않아(그물이 지킵니다) 서버 묶음에 DOM 코드가 섞여 들지 않습니다.
같은 문이 `nabi-note` 에도 있으니, 편집기를 이미 실은 페이지는 그쪽을 그대로 쓰면 됩니다.

| | |
|---|---|
| `renderStoredHtml(json, registry, options?)` | 저장·발행하는 HTML — `getHtml()` 과 같은 값 |
| `renderStoredEditorHtml(json, registry, options?)` | 편집기 HTML — `getEditorHtml()` 과 같은 값(`data-key` 가 붙습니다) |

- **둘 다 DOM 을 안 씁니다** — 서버에서 그대로 돕니다.
- **나비트리가 아니면 `null` 입니다** — 거절의 규칙이 `setJson()` 과 같습니다(문서 전체가
  배열이어야 합니다). 던지지 않습니다 — 읽는 도중 예외를 일으키는 값도 `null` 로 바뀌고
  `console.error` 로 알립니다.
- **편집기가 내는 값과 한 글자도 다르지 않습니다.** 같은 걸음(정규화 → 조립)을 지나므로
  XSS 가 걸러지는 자리도 똑같습니다 — 보여 주는 쪽만 덜 씻기는 일이 없습니다.
- `options` 는 `{ allowLocalUrls }` 하나입니다 — `createNabiWith` 의 그 옵션과 같은 뜻입니다.

**같은 저장본은 언제나 같은 `data-key` 를 얻습니다.** 그래서 서버가 `renderStoredEditorHtml`
로 편집기를 미리 그려 내려보내고, 브라우저에서 `hydrate` 로 이어받으면 화면을 다시 그리지
않습니다.

```ts
mountSurface({ nabi, registry, root: surface, hydrate: true })
```

어긋나면 그 자리에서 새로 그리므로, 서버와 클라이언트의 날개 목록만 같으면 됩니다.

::: tip 이 사이트의 홈이 그 견본입니다
홈 데모의 문서는 **빌드 때 `renderStoredEditorHtml` 로 미리 그려** 페이지에 심어 둔 것이고,
편집기는 그 위에서 `hydrate` 로 깨어납니다. 그래서 편집기 코드가 도착하기 전에도 글이 이미
읽힙니다 — 빈 자리가 있다가 갑자기 채워지는 구간이 없습니다.
:::

---

## 툴바도 미리 그릴 수 있습니다

단추 줄은 **문서를 안 봅니다.** 등록한 날개 목록과 말과 그룹 순서만 보므로, 나오는 글자가
**상수**입니다 — 서버가 뜰 때 한 번 부르고 그 글자를 계속 씁니다. 요청마다 다시 부를 것이
없습니다.

```ts
import { makeRegistry, defaultWings, renderToolbarHtml } from 'nabi-note/ssr'

const registry = makeRegistry(defaultWings)

const toolbarHtml = renderToolbarHtml({ registry, locale: 'ko' })
// '<div class="nabi-group" data-group="font">…</div>'
```

이 글자를 툴바 그릇 안에 그대로 넣어 보내면, 브라우저에서는 `mountToolbar` 가 **같은 함수**로
그립니다. 이미 같은 줄이 서 있으면 **다시 그리지 않고 배선만 겁니다.**

```ts
mountToolbar({ nabi, registry, surface, root: toolbar })
```

::: warning 그릇에 `class="nabi-toolbar-row"` 를 함께 적으세요
미리 그린 줄을 내보낼 때는 **첫 그림부터** 이 클래스가 있어야 합니다. 코어는 이 클래스가 없으면
mount 때 스스로 다는데, 그러면 좌우 여백이 그때 붙으면서 **단추 줄이 옆으로 한 번 밀립니다.**
호스트가 미리 적어 두면 코어는 그것을 건드리지 않습니다(제가 단 것만 뗍니다).

```html
<div class="nabi-toolbar-row">미리 그린 줄</div>
```
:::

- **어긋나도 안 깨집니다** — 서 있는 줄이 지금 날개 목록과 다르면 그 자리에서 새로 그립니다.
  잃는 것은 미리 그린 값뿐이고 화면은 언제나 옳습니다.
- **미리 그린 줄은 "아무것도 안 눌리고 아무것도 안 숨은" 상태입니다.** 눌림(`aria-pressed`)과
  숨김은 캐럿이 정하는 것이라 서버가 모릅니다. 캐럿에 따라 단추가 숨는 구성이라면, mount 뒤
  몇 개가 사라지며 줄이 다시 접힐 수 있습니다.
- **편집기를 세우는 자리에만 넣으세요.** 읽기만 하는 페이지는 툴바가 없으므로 이 글자를 받을
  까닭이 없습니다.

**미리보기·전체화면 두 단추도 같은 길입니다.** 그 둘은 날개가 아니라 덮개의 부품이라 위의 툴바
글자에 안 듭니다 — 따로 그려 `mountViewTools` 가 설 그릇에 넣습니다.

```ts
import { renderViewToolsHtml } from 'nabi-note/ssr'

renderViewToolsHtml({ locale: 'ko' })
// '<span class="nabi-tools">…</span>'
```

::: tip 이 사이트의 홈이 그 견본입니다
홈 데모의 툴바는 **빌드 때 `renderToolbarHtml`·`renderViewToolsHtml` 로 미리 그려** 심어 둔
것이고, `mountToolbar`·`mountViewTools` 는 그 줄을 알아보고 배선만 겁니다. 그래서 아이콘
서른다섯이 뒤늦게 들어차는 구간이 없습니다.
:::

---

## 다음 문서

- [{{ t('menu_intro_usage') }}](./usage) — npm 으로 무는 길, 조립·입력·출력 전체
- [{{ t('menu_intro_cdn') }}](./cdn) — 빌드 도구 없이 `<script>` 하나로

<script setup lang="ts">
import { useTranslate } from '../../.vitepress/src/langs.ts'

const { t } = useTranslate()
</script>
