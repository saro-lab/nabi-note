---
title: 이미지
description: 이미지 주소를 넣고 폭과 정렬을 조절합니다.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# 이미지

이미지 주소를 넣고 폭과 정렬을 조절합니다. 주소는 `http:`, `https:` 또는 같은 사이트 경로만 기본으로 허용하며, 새 이미지는 가운데 정렬과 60% 폭으로 시작합니다.

폭은 정해진 단계 안에서만 저장되고 정렬은 이미지를 감싼 문단에 저장됩니다. `blob:`과 `data:image/...` 미리보기를 쓰려면 이미지 wing과 편집기 조립 쪽에서 각각 로컬 URL을 명시적으로 허용해야 합니다. SVG 데이터 URL은 허용되지 않습니다.

<WingDemo path="/wing/block/image" />

```ts
const selected = wings().use('img', {
  allowLocalUrls: false,
}).build()
```

이 wing은 주소를 문서에 넣는 기능이며 파일 전송은 하지 않습니다. 파일을 서버로 보내려면 [업로드 wing](/ko/wing/etc/upload)을 연결합니다.

## 이미지 선택창 연결하기

`mountToolbar()`의 `panels.img`로 이미지 버튼의 기본 URL 입력창을 서비스의 이미지 선택창으로 바꿀 수 있습니다. 키는 툴바 슬롯 이름이며, 생략한 도구는 기존 입력창을 사용합니다.

`mode: 'modal'`은 전체 화면 반투명 배경 위에 창을 엽니다. `mode: 'inline'`은 PC에서는 도구 버튼 근처에 열고 모바일에서는 전체 화면으로 표시합니다. 모바일 여부는 화면 폭과 `--nabi-mobile-breakpoint`로 정하며, `inline` 창이 열린 채로 이 기준을 넘으면 창을 닫습니다.

두 모드는 빈 `root`만 제공하며 제목·입력칸·버튼은 만들지 않습니다. `render`에서 원하는 HTML이나 UI를 넣고, 닫기 버튼은 `close()`에, 이미지 선택은 `insertImage(url, 'pointer')`에 연결합니다. 기존 `img: renderer` 함수형 설정의 표시 방식은 유지됩니다.

```ts
import { mountToolbar } from 'nabi-note'

const toolbar = mountToolbar({
  nabi,
  registry,
  root: toolbarRoot,
  surface: content,
  panels: {
    img: {
      mode: 'inline',
      render: ({ root, signal, close, insertImage }) =>
        mountMyImagePicker(root, {
          signal,
          onClose: close,
          onSelect: (url: string) => insertImage(url, 'pointer'),
        }),
    },
  },
})
```

`mountMyImagePicker`는 서비스에서 구현하는 함수입니다. 전달받은 `root`에 원하는 UI를 동기적으로 만들고 해제 함수를 반환합니다. 이미지 목록 조회·업로드 같은 비동기 작업에는 `signal`을 연결하고, 고른 이미지 URL을 `onSelect`에 넘깁니다. 이 API는 파일을 전송하지 않으며, URL에는 기존 이미지 허용 규칙이 적용됩니다.

`insertImage(src, by?)`는 `run('insertImage', { src }, by)`와 같으며 반환값과 선택 복원 규칙도 같습니다. `by`를 생략하면 `'keyboard'`를 사용합니다. `render`는 `async` 함수로 만들지 마세요.

창을 닫거나 툴바를 해제하면 `signal`이 중단되고 해제 함수가 실행됩니다. `run()`은 창을 닫고 열 당시 선택에 명령을 한 번 적용합니다. 이미 창이 닫혔거나 열린 뒤 문서 내용이 바뀌었다면 `false`를 반환하고 명령을 실행하지 않습니다.

## CSS 스타일

이미지는 `.nabi-content img`로 꾸밉니다. 저장된 폭과 정렬은 그대로 두고 테두리나 그림자처럼 모양만 바꾸세요.

```css
.article-body img {
  border-radius: 12px;
  box-shadow: 0 8px 24px rgb(0 0 0 / 12%);
}

.dark .article-body img { box-shadow: 0 8px 24px rgb(0 0 0 / 35%); }
```

`max-inline-size`, `block-size`, 폭과 정렬에 관한 기본 규칙은 유지하세요. 이미지 크기는 문서에
저장된 값이므로 CSS에서 강제로 고정하면 작성자가 정한 폭과 충돌할 수 있습니다.
