---
title: 이미지
---

# 이미지

## 설명

`imageWing`(이름 `img`)은 이미지(`<img>`)를 소유합니다. `hr`·`youtube` 처럼 **속이 없는
물건**입니다. 단추를 누르면 주소 입력 판이 뜹니다.

**주소는 확장자가 아니라 스킴으로 가립니다.** `http:`·`https:` 와 상대 경로만 통과하고,
`//example.com/a.png` 같은 프로토콜 상대 주소는 거절합니다. `.png` 로 끝나는지는 **아무도 안
봅니다** — 확장자 없이 그림을 내주는 주소가 흔하기 때문입니다.

캐럿은 이미지 안에 못 들어가므로, 이미지를 클릭하면 그 이미지가 통째로 골라지고 상황 줄이
뜹니다.

| 갈래 | 칸 |
|---|---|
| 폭 | `30`부터 `100`까지 열씩 여덟 칸 (기본 `60`) — 눈금이고, 지금 값이 함께 뜹니다 |
| 보기 | 그림 하나만 크게 — 문서를 안 바꿉니다 |

**상황 줄은 이 둘뿐입니다.** 왼쪽·가운데·오른쪽 칸은 여기 없습니다 — 그림의 자리는 그림이
아니라 **그것을 담은 래퍼 문단**이 드는 것이라, 툴바의 정렬 단추가 그 일을 합니다.

**새로 넣은 그림은 가운데입니다** — `insertLump` 가 래퍼 문단에 정렬 `c` 를 입혀 세우기
때문입니다.

나갈 때 폭은 그림에, 정렬은 그것을 감싼 문단에 붙습니다.

```html
<div data-nabi-p data-nabi-align="c"><img src="…" alt="" data-nabi-width="70"/></div>
```

정렬 값은 `l`·`c`·`r` 입니다. 인라인 `style` 은 안 나갑니다 — 실제 모양은 `nabi.css` 를 건
`.nabi-content` 안에서 그 속성을 읽는 시트가 그립니다.

```ts
makeImageWing({ allowLocalUrls?: boolean })
```

`allowLocalUrls`를 켜면 `blob:`·`data:image/...` 주소도 허용합니다 — 서버 없이
파일을 미리 보여 주는 데모·업로드 시나리오에서만 켭니다. 기본은 꺼짐입니다.

이미지가 깨졌을 때(주소가 죽었거나 만료됐거나 blob이 사라졌을 때)는 자리표시자가
저절로 뜹니다 — 날개가 `attach` 로 그 일을 들고 있고, `mountSurface` 가 등록된
날개의 `attach` 를 함께 붙입니다. **따로 mount 할 것이 없습니다.** 이 표식은 화면
전용이고 저장값에는 절대 남지 않습니다.

`allowLocalUrls` 는 두 자리에서 켤 수 있습니다 — 편집기 전체(`createNabiWith(wings,
{ allowLocalUrls: true })`)이거나, 그림 날개 하나만(`makeImageWing({ allowLocalUrls: true })`).

## 사용 예시

```ts
import { createNabiWith, mountSurface, mountToolbar, mountContextToolbar, imageWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// 날개 목록이 갈래 지식·커맨드·조립기를 함께 짓는다 — 그것이 `registry` 다
const { nabi, registry } = createNabiWith([imageWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })
mountContextToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#context')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

업로드로 받은 파일(`blob:` 주소)을 그대로 열어 두려면:

```ts
makeImageWing({ allowLocalUrls: true })
```

## 데모

<WingDemo path="/wing/block/image" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
