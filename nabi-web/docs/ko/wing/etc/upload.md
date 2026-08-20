---
title: 파일 업로드
---

# 파일 업로드

## 설명

업로드는 세 조각으로 나뉩니다 — 날개 등록만으로는 아무 일도 일어나지 않습니다.

1. **`uploadWing`** — 툴바에 파일 선택 단추를 답니다. 이 날개 자신은 `img` 도 `a` 도 만들지
   않습니다 — 올라간 파일은 그림·링크 날개가 그리는 것으로 커밋되므로, **`imageWing` 이나
   `linkWing` 을 함께 등록해야** 결과가 문서에 남습니다. 어느 쪽도 없으면 **등록하는 그 자리에서
   예외가 납니다**(늦게 터지지 않습니다).
2. **`mountUpload({ … })`** — 실제로 파일을 받아 `uploader` 를 돌리는 쪽입니다. 드롭·붙여넣기·
   파일 선택이 전부 이리로 흘러옵니다. **이 mount 를 빼면 단추는 있어도 아무 일도 안 납니다.**
3. **`mountUploadView({ … })`** — 진행률 자리표시자를 화면에 세우는 쪽입니다. 없어도 업로드는
   되지만 올라가는 동안 화면이 아무 말도 안 합니다.

`uploader` 는 `(task) => Promise<{ uri } | null>` 모양입니다 — **주소를 답하면 성공, `null`
이면 실패**라 자리표시자가 걷힙니다. `task.onProgress(0~100)` 로 진행률을 알리고,
`task.signal` 이 중단되면 멈춥니다.

제한은 `extensions`·`maxFileSize`·`maxTotalSize` 셋이고 전부 선택입니다(0 이나 생략이면
제한 없음). 걸러진 파일은 `onReject` 로 옵니다.

## 올라간 뒤에 남는 것

이미지는 `imageWing` 의 블록으로, 그 밖의 파일은 `linkWing` 의 첨부 링크로
커밋됩니다.

- **첨부의 이름은 파일명이 아니라 i18n 이름표입니다** — 한국어라면 "첨부파일".
  파일명은 대개 문서에 남기기엔 길고, 무엇보다 바꿀 수 있어야 하기 때문입니다.
  이름은 캐럿을 그 링크에 두고 [상황 줄의 이름 칸](../inline/link)에서 바꿉니다.
- **확장자는 표식으로 남습니다** — `data-nabi-file="pdf"`. 이 값은 진짜 파일명에서
  뽑고, 시트가 그것을 배지로 그립니다. 이름을 바꿔도 표식은 따라갑니다.
- 링크가 받아 주지 않는 주소(`allowLocalUrls` 를 안 켠 채로 온 `blob:` 등)는
  평문 파일명으로 강등됩니다 — 화이트리스트를 우회하지 않습니다.

## 올라가는 동안 보이는 것

올라가는 동안 그 자리에는 임시 상자가 섭니다 — 편집기 DOM 에만 있고 나비트리에는
없어서, 저장값에는 한 글자도 남지 않습니다.

- **이미지**는 고른 파일로 만든 미리보기가 바로 뜨고, 그 위를 격자가 덮습니다. 진행률만큼
  칸이 하나씩 걷히며 또렷해집니다. 칸이 걷히는 차례는 파일마다 섞여, 여러 장을 한꺼번에
  올려도 같은 무늬가 반복되지 않습니다.
- **이미지가 아닌 파일**은 격자 없이 📎 와 "첨부파일" 이름표가 선 상자를 받고, 확장자가
  대문자 배지(`PDF` 등)로 함께 뜹니다. 미리보기를 못 그리는 이미지도 여기로 떨어집니다.
- 진행률은 상자에 `data-nabi-per` 로 실려 시트가 그립니다. 올리는 동안 상자마다 취소(×)
  단추가 서고, 배치가 도는 동안 편집은 잠깁니다.

## 사용 예시

```ts
import {
  createNabiWith,
  mountSurface,
  mountToolbar,
  mountUpload,
  mountUploadView,
  imageWing,
  linkWing,
  uploadWing,
} from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// 업로드는 그림·링크 날개가 있어야 결과를 남길 수 있다 — 없으면 여기서 바로 예외다
const { nabi, registry } = createNabiWith([imageWing, linkWing, uploadWing])

mountSurface({ nabi, registry, root: surface })

// 진행률 자리표시자를 세우는 쪽 — 먼저 만들어 두고 아래에서 이어 준다
const view = mountUploadView({ nabi, surface, locale: 'ko' })

const upload = mountUpload({
  nabi,
  root: surface,
  locale: 'ko',
  extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf'],
  maxFileSize: 10 * 1024 * 1024,
  uploader: async (task) => {
    // 여기에 실제로 서버에 올리는 코드를 넣는다. 주소를 답하면 성공, null 이면 실패다
    // const uri = await user_callback(task.file, task.onProgress, task.signal)
    // return { uri }
    return null
  },
  onStart: (tasks) => view.start(tasks),
  onProgress: (id, percent) => view.progress(id, percent),
  onSettle: () => view.settle(),
  onDone: () => view.done(),
})

mountToolbar({
  nabi, registry, surface,
  root: document.querySelector<HTMLElement>('#toolbar')!,
  // 툴바의 파일 선택 단추가 고른 파일이 흘러가는 곳
  onFiles: (files) => upload.take(files),
})
```

## 데모

이 사이트에는 올릴 서버가 없어 `URL.createObjectURL()` 로 만든 `blob:` 주소를
그대로 돌려주는 시늉만 합니다. 결과는 이 페이지 안에서만 남습니다.

<WingDemo path="/wing/etc/upload" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
