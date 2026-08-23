---
title: 이미지
---

# 이미지

## 설명

`imageWing`(식별자 `img`)은 이미지 요소(`<img>`)를 처리합니다. `hr`이나 `youtube`와 마찬가지로 내부에 텍스트가 들어가지 않는 `place: 'void'` 객체입니다. 툴바 버튼을 클릭하면 이미지 URL 입력 팝업이 표시됩니다.

**URL은 파일 확장자가 아닌 프로토콜 스킴으로 검증합니다.** `http:`, `https:` 및 상대 경로만 허용되며, `javascript:` 등의 악성 스크립트나 프로토콜 상대 주소(`//example.com/a.png`)는 필터링됩니다. 확장자 없이 이미지를 반환하는 동적 API URL도 정상적으로 지원합니다.

커서는 이미지 내부로 진입할 수 없으므로, 이미지를 클릭하면 이미지 객체 전체가 선택되며 전용 컨텍스트 툴바가 표시됩니다:

| 컨트롤 | 설명 |
|---|---|
| 너비 조절 | `30%`부터 `100%`까지 10% 단위로 너비를 조절하는 슬라이더 (기본값: `60%`) |
| 크게 보기 (라이트박스) | 이미지를 원본 크기 모달 팝업으로 확대 표시 |

이미지의 좌/우/가운데 정렬은 이미지를 감싸고 있는 **래퍼 문단(`<div data-nabi-p>`)**에 적용되므로, 메인 툴바의 정렬 버튼을 사용하여 정렬할 수 있습니다.

새로 삽입된 이미지는 기본적으로 가운데 정렬(`data-nabi-align="c"`)이 적용됩니다.

```html
<div data-nabi-p data-nabi-align="c"><img src="…" alt="" data-nabi-width="70"/></div>
```

인라인 `style` 없이 시맨틱 속성으로 저장되며, 실제 크기와 정렬 스타일은 `nabi.css`가 렌더링합니다.

### 로컬 URL 허용 (`allowLocalUrls`)

```ts
makeImageWing({ allowLocalUrls?: boolean })
```

`allowLocalUrls: true`를 설정하면 `blob:`, `data:image/...` 형식의 로컬 URL도 허용합니다. 파일 업로드 전 로컬 미리보기 시나리오 등에서 활용할 수 있습니다 (기본값은 `false`).

이미지 주소가 잘못되었거나 blob URL이 만료되어 로드가 실패한 경우, 날개의 `attach` 훅이 깨진 이미지 플레이스홀더를 자동으로 표시합니다. 별도의 마운트 설정 없이 기본 동작하며 화면 전용 UI이므로 저장 데이터에는 영향을 주지 않습니다.

## 사용 예시

```ts
import { createNabiWith, mountSurface, mountToolbar, mountContextToolbar, imageWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

const { nabi, registry } = createNabiWith([imageWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })
mountContextToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#context')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

`blob:` 주소를 허용하려면 팩토리 함수를 사용합니다:

```ts
makeImageWing({ allowLocalUrls: true })
```

## 데모

<WingDemo path="/wing/block/image" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
