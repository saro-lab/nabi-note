---
title: 링크
---

# 링크

## 설명

`linkWing`(id `a`)은 `<a href>`를 소유합니다. 버튼을 누르면 캐럿 자리
근처에 주소 입력 레이어가 열리고, `http`/`https`로 시작하는 주소만 확인이
활성화됩니다 — 이 화이트리스트 검사 자체가 XSS 방어입니다(`javascript:` 같은 스킴은
아예 통과하지 못합니다). 검증을 통과하지 못한 `href`는 저장되지 않고, 그런 경우
`<a>` 태그 없이 평문으로 나갑니다.

레이어에는 칸이 둘입니다 — 주소와 보일 글자. 글자 칸을 비우면 주소가 곧 글자가
되고, 캐럿만 있고 고른 글자가 없으면 캐럿이 든 링크 마크 전체가 대상이 됩니다
(형광펜·글자색과 같은 규칙).

## 이미 있는 링크는 상황 줄에서 고칩니다

캐럿이 링크 안에 서면 상황 줄에 **글자 칸 둘**이 뜹니다 — 판을 여는 단추가 아니라 그 줄
안에 바로 서는 입력 칸(`kind: 'text'`)입니다. 지금 값이 채워진 채로 뜨고,
Enter 를 치거나 다른 곳을 누르면 반영됩니다. 값이 그대로면 아무 일도 하지 않습니다.

| 칸 | 하는 일 |
|---|---|
| 주소 | 주소만 바꿉니다. 보일 글자는 그대로 남습니다. |
| 표시 이름 | 보일 글자만 바꿉니다. 주소와 첨부 표식은 그대로 남습니다. |

**첨부(파일 링크)에는 주소 칸이 뜨지 않습니다** — 그 주소는 업로드가 정한 것이지
손으로 고칠 값이 아니기 때문입니다. 이름 칸은 보통 링크든 첨부든 똑같이 뜹니다.
빈 이름은 받지 않습니다 — 이름 없는 링크를 만드는 것은 이름 바꾸기가 아니라
지우기입니다.

## 첨부는 화면에서 한 덩어리입니다

첨부는 통째로 다뤄집니다. 클릭하면 캐럿이 그 안에 내려앉는 대신 **링크 전체가 겨눠지고**,
바로 옆에서 백스페이스나 delete 를 누르면 **링크가 통째로 사라집니다.** 고치는 일은 캐럿이
아니라 상황 줄의 몫입니다.

이 일은 날개가 `attach` 로 들고 있고 `mountSurface` 가 함께 붙입니다 — **따로 mount 할 것이
없습니다.**

## 첨부 표식

업로드로 들어온 링크는 `data-nabi-file` 표식(값은 확장자)을 답니다 — 시트가 밑줄
대신 클립 상자를 그리게 하는 것이 이 표식입니다. 이름을 바꾸든 주소를 바꾸든 이
표식은 따라갑니다. 서식 지우기도 첨부만은 벗기지 않습니다 — 껍데기를 벗기면 첨부가
죽은 평문이 되기 때문입니다.

`linkWing` 은 **상수**입니다 — 괄호를 붙여 부르지 않고, 넘길 옵션도 없습니다.

::: warning 링크에는 `allowLocalUrls` 가 안 닿습니다
`blob:`·`data:` 주소를 여는 스위치는 **그림에만** 듣습니다. 나가는 자리는 언제나 엄격해서,
`getHtml()` 이 주소를 거를 때 쓰는 문(`ctx.url`)은 호스트가 무엇을 켜 두었든 화이트리스트
그대로 봅니다.

그래서 `blob:` 주소를 문 첨부 링크는 **내보내는 순간 평문으로 떨어집니다.** 업로드가 임시
주소를 그대로 두면 안 되는 까닭이 이것입니다 — 올린 뒤에 받은 진짜 주소로 갈아 끼워야
문서에 남습니다.
:::

## 사용 예시

```ts
import { createNabiWith, mountSurface, mountToolbar, mountContextToolbar, linkWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// 날개 목록이 갈래 지식·커맨드·조립기를 함께 짓는다 — 그것이 `registry` 다
const { nabi, registry } = createNabiWith([linkWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })
mountContextToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#context')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## 데모

<WingDemo path="/wing/inline/link" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
