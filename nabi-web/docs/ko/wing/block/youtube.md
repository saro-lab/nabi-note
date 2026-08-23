---
title: 유튜브
---

# 유튜브

## 설명

`youtubeWing`(식별자 `youtube`)은 유튜브 동영상 임베드(`<iframe>`)를 처리합니다. `hr`, `img`와 동일한 `place: 'void'` 독립 블록 객체입니다. 툴바 버튼을 클릭하면 유튜브 영상 주소 입력 팝업이 표시됩니다.

`watch?v=`, `youtu.be/`, `/embed/`, `/shorts/`, `/v/`, `/live/` 등 다양한 형태의 유튜브 URL을 지원합니다 (`youtube-nocookie.com` 포함).

입력된 URL에서 **11자리 영상 고유 ID만 추출하여 안전하게 저장**합니다 (`{"w":"youtube","a":{"v":"6j-gQmaZ9Zk","w":"70"}}`). HTML 출력 시 `https://www.youtube-nocookie.com/embed/<id>` 형태로 표준화되어 렌더링됩니다.

유튜브 이외의 비인가 iframe이나 외부 URL은 보안을 위해 파싱 과정에서 자동으로 차단됩니다.

## 동적 컨텍스트 툴바

동영상을 클릭하면 전용 컨텍스트 툴바가 표시됩니다:

| 컨트롤 | 설명 |
|---|---|
| 너비 조절 | `50%`, `60%`, `70%`, `80%`, `90%`, `100%` 6단계 너비 슬라이더 (기본값: `70%`) |
| 주소 수정 | 현재 동영상 ID가 들어 있는 주소 입력란 |

영상의 좌/우/가운데 정렬은 영상을 감싸고 있는 **래퍼 문단(`<div data-nabi-p>`)**에 적용되므로 메인 툴바의 정렬 버튼으로 설정합니다.

```html
<div data-nabi-p data-nabi-align="c">
  <iframe src="https://www.youtube-nocookie.com/embed/6j-gQmaZ9Zk" title="YouTube"
          allowfullscreen loading="lazy" data-nabi-width="70"></iframe>
</div>
```

인라인 `style` 없이 시맨틱 속성으로 출력되며 스타일시트가 반응형 비율을 렌더링합니다.

## 사용 예시

```ts
import { createNabiWith, mountSurface, mountToolbar, mountContextToolbar, youtubeWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

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
