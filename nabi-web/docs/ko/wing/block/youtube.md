---
title: 유튜브
---

# 유튜브

## 설명

`youtubeWing`(이름 `youtube`, 단축키 없음)은 유튜브 임베드(`<iframe>`)를
소유합니다. `hr`·`img`와 같은 **속 없는 물건**(`place: 'void'`)입니다. 버튼을 누르면 주소
입력 판이 뜨고, `watch?v=`·`youtu.be/`·`/embed/`·`/shorts/`·`/v/`·`/live/`
형태의 유튜브 주소만 통과합니다(`www.`·`m.`·`music.` 접두사, `youtube-nocookie.com`
포함) — 문자열 포함 검사가 아니라 `URL()` 파싱으로 판정하므로
`youtube.com.evil.test` 같은 주소는 걸리지 않습니다.

넘어온 주소를 그대로 믿지 않고 **11자 영상 id만** 뽑아 저장합니다. 주소는 저장값에
안 남습니다 — 남는 것은 `{"w":"youtube","a":{"v":"<id>","w":"70"}}` 뿐이고, 나갈 때
`https://www.youtube-nocookie.com/embed/<id>` 한 모양으로 새로 조립됩니다.

`hr`와 같은 이유로 캐럿이 안으로 들어가지 않고, 바로 앞/뒤에서 Backspace·Delete를
누르면 통째로 사라집니다. 유튜브가 아닌 임베드는 들여올 때 **통째로 버립니다** —
낯선 문서를 우리 문서 안에 세우지 않습니다.

## 상황 줄

영상을 클릭하면 칸 둘이 뜹니다.

| 갈래 | 칸 |
|---|---|
| 폭 | `50` `60` `70` `80` `90` `100` 여섯 단계 (기본 `70`) — 눈금이고, 지금 값이 함께 뜹니다 |
| 주소 | 지금 영상의 id 가 채워진 입력 판 |

**왼쪽·가운데·오른쪽 칸은 여기 없습니다.** 영상의 자리는 영상이 아니라 **그것을 담은
래퍼 문단**이 드는 것이라, 툴바의 정렬 단추가 그 일을 합니다. 새로 넣은 영상은 래퍼
문단이 가운데 정렬(`c`)을 입고 섭니다.

그래서 나갈 때 폭은 영상에, 정렬은 그것을 감싼 문단에 붙습니다.

```html
<div data-nabi-p data-nabi-align="c">
  <iframe src="https://www.youtube-nocookie.com/embed/<id>" title="YouTube"
          allowfullscreen loading="lazy" data-nabi-width="70"></iframe>
</div>
```

인라인 `style`은 나가지 않습니다. 호스트가 자기 UI 로 넣고 싶으면 커맨드를 직접
부릅니다 — `applyCommand('insertYoutube', { v: 주소, w: '80' })`, 폭만 바꾸려면
`applyCommand('setYoutubeWidth', { w: '80' })`. 목록 밖의 폭은 거절합니다.

## 사용 예시

```ts
import { createNabiWith, mountSurface, mountToolbar, mountContextToolbar, youtubeWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// 날개 목록이 갈래 지식·커맨드·조립기를 함께 짓는다 — 그것이 `registry` 다
const { nabi, registry } = createNabiWith([youtubeWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })
mountContextToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#context')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## 데모

<WingDemo path="/wing/block/youtube" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
