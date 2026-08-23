---
title: 파일 업로드
---

# 파일 업로드

## 설명

파일 업로드 기능은 3가지 모듈의 연동으로 구성됩니다:

1. **`uploadWing`**: 툴바에 파일 첨부 버튼을 제공합니다. 업로드된 결과물은 이미지 또는 파일 링크 노드로 문서에 삽입되므로, **`imageWing` 또는 `linkWing`이 함께 등록**되어 있어야 합니다. 둘 다 누락된 경우 초기화 시점에 예외가 발생합니다.
2. **`mountUpload({ … })`**: 드래그 앤 드롭, 클립보드 붙여넣기, 툴바 파일 선택을 통해 유입된 파일을 받아 호스트의 `uploader` 함수로 전달합니다.
3. **`mountUploadView({ … })`**: 업로드 진행률(Progress) 플레이스홀더 UI를 화면에 렌더링합니다.

::: warning 클립보드 붙여넣기 시 파일 업로드 처리 규칙
클립보드 데이터에 **텍스트나 HTML이 포함되어 있는 경우**(`text/html` 또는 `text/plain`)에는 파일 업로드가 아닌 일반 텍스트/마크다운 붙여넣기 파이프라인으로 처리됩니다. 파일 데이터만 단독으로 포함된 클립보드 붙여넣기 시에만 업로드 파이프라인이 호출됩니다. (드래그 앤 드롭 파일 첨부는 항상 업로드 파이프라인으로 처리됩니다.)
:::

`uploader` 함수는 `(task) => Promise<{ uri: string } | null>` 시그니처를 가집니다. 서버 업로드 성공 시 `{ uri }` 객체를 반환하고, 실패 시 `null`을 반환합니다. `task.onProgress(0~100)` 콜백을 통해 업로드 진행률을 업데이트할 수 있으며, `task.signal`을 통해 취소 신호를 처리합니다.

파일 확장자 및 용량 제한 옵션: `extensions`, `maxFileSize`, `maxTotalSize` (생략 시 제한 없음). 유효하지 않은 파일은 `onReject` 콜백으로 전달됩니다.

## 업로드 완료 후 문서 렌더링

- **이미지 파일**: `imageWing`의 `<img>` 블록 객체로 삽입됩니다.
- **일반 첨부파일**: `linkWing`의 파일 다운로드 링크(`<a data-nabi-file="pdf" href="...">`)로 삽입됩니다. 첨부파일의 표시 텍스트는 로케일에 맞춰 "첨부파일"로 생성되며, 커서를 링크에 두고 컨텍스트 툴바에서 표시 이름을 자유롭게 변경할 수 있습니다.

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

// 업로드 날개는 이미지 또는 링크 날개가 함께 등록되어야 합니다.
const { nabi, registry } = createNabiWith([imageWing, linkWing, uploadWing])

mountSurface({ nabi, registry, root: surface })

// 업로드 진행률 UI 뷰 마운트
const view = mountUploadView({ nabi, surface, locale: 'ko' })

const upload = mountUpload({
  nabi,
  root: surface,
  locale: 'ko',
  extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf', 'zip'],
  maxFileSize: 10 * 1024 * 1024,   // 10MB
  uploader: async (task) => {
    // 실제 백엔드 서버에 파일을 업로드하는 로직 구현
    // const uri = await myUploadApi(task.file, task.onProgress, task.signal)
    // return { uri }
    return null
  },
  onStart: (tasks) => view.start(tasks),
  onProgress: (id, percent) => view.progress(id, percent),
  onSettle: () => view.settle(),
  onDone: () => view.done(),
})

mountToolbar({
  nabi,
  registry,
  surface,
  root: document.querySelector<HTMLElement>('#toolbar')!,
  onFiles: (files) => upload.take(files),
})
```

## 데모

<WingDemo path="/wing/etc/upload" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
