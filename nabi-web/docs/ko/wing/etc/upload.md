---
title: 파일 업로드
description: 파일 전송을 서비스의 업로더와 연결합니다.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# 파일 업로드

파일 선택, 드래그 앤 드롭, 파일만 들어 있는 붙여넣기를 업로드 흐름으로 연결합니다. 이 페이지의 데모는 서버에 보내지 않으며, 서비스에서는 파일을 받고 URL을 돌려주는 업로더를 직접 연결해야 합니다.

업로드 결과를 이미지 블록으로 넣으려면 이미지 날개가, 그 밖의 파일을 첨부 링크로 넣으려면 링크 날개가 필요합니다. 두 형식을 모두 받는 서비스라면 두 날개를 명시적으로 함께 고릅니다. 업로드하는 동안 편집기는 잠기고, 성공한 파일은 한 번의 실행 취소 단계로 함께 들어갑니다.

<WingDemo path="/wing/etc/upload" />

```ts
const selected = wings()
  .use('img')
  .use('a')
  .use('upload', { allowLocalUrls: false })
  .build()
```

`upload`만 선택하면 이미지와 링크 중 아직 없는 한 가지 의존성을 자동으로 보충합니다. 전송은 `mountUpload()`로, 편집 화면의 진행 상태 표시는 보통 `mountUploadView()`로 연결합니다. 서버가 HTTPS URL을 돌려주면 로컬 URL 허용 옵션은 필요하지 않습니다.

## 서버 API 약속

NABI NOTE는 파일을 서버로 보내지 않습니다. `uploader` 함수가 파일 하나를 서버에 보내고,
성공하면 공개 또는 인증된 `https:` URL만 돌려주는 구조입니다. 가장 단순한 API 약속은 아래와
같습니다.

```text
POST /api/uploads
Content-Type: multipart/form-data
필드 이름: file

성공: { "url": "https://cdn.example.com/uploads/8f2c.webp" }
실패: 4xx 또는 5xx 응답
```

서버는 원래 파일 이름, 확장자, 브라우저가 보낸 MIME만 믿으면 안 됩니다. 인증과 권한을 먼저
확인하고, 파일 크기를 스트리밍 단계에서 제한하며, 실제 파일 형식을 검사해야 합니다. 저장 이름은
서버가 새로 만들고, 이미지라면 필요에 따라 재인코딩하거나 썸네일을 만듭니다. 업로드한 파일을
다른 사람이 내려받을 수 없는 서비스라면 URL 대신 인증이 필요한 다운로드 경로를 돌려주세요.

| 서버에서 확인할 것 | 이유 |
| --- | --- |
| 로그인한 사용자와 업로드 권한 | 다른 사용자의 저장 공간을 쓰지 못하게 함 |
| 파일 하나당 크기와 요청 전체 크기 | 메모리·저장 공간 고갈 방지 |
| 허용한 실제 MIME과 확장자 | 이름만 바꾼 실행 파일 차단 |
| 랜덤 저장 이름과 분리된 저장소 | 경로 조작과 기존 파일 덮어쓰기 방지 |
| 응답 URL의 접근 권한과 만료 정책 | 비공개 파일이 URL만으로 노출되는 일 방지 |

클라이언트의 `extensions`, `maxFileSize`는 사용자에게 빠르게 알려 주기 위한 첫 단계일 뿐입니다.
같은 제한을 서버에도 반드시 둡니다.

## 브라우저에서 업로더 연결

아래 예시는 NABI NOTE가 기대하는 실제 연결입니다. `XMLHttpRequest`를 쓰는 이유는 브라우저의
기본 `fetch()`가 업로드 진행률을 제공하지 않기 때문입니다. 서버가 응답한 `url`만 반환하면,
이미지는 이미지 블록으로, 다른 파일은 첨부 링크로 들어갑니다.

```ts
import {
  createNabiWith,
  mountSurface,
  mountUpload,
  mountUploadView,
  wings,
  type UploadTask,
} from 'nabi-note'

const content = document.querySelector<HTMLElement>('#content')!
const { nabi, registry } = createNabiWith(
  wings().use('img').use('a').use('upload').build(),
  { locale: 'ko' },
)

function sendUpload(task: UploadTask): Promise<{ uri: string } | null> {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest()
    request.open('POST', '/api/uploads')
    request.responseType = 'json'

    request.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable) task.onProgress((event.loaded / event.total) * 100)
    })

    request.addEventListener('load', () => {
      const url = request.response?.url
      if (request.status >= 200 && request.status < 300 && typeof url === 'string') {
        resolve({ uri: url })
      } else {
        resolve(null)
      }
    })
    request.addEventListener('error', () => reject(new Error('업로드 요청에 실패했습니다.')))
    task.signal.addEventListener('abort', () => request.abort(), { once: true })

    const body = new FormData()
    body.append('file', task.file as File, task.name)
    request.send(body)
  })
}

let uploadView: ReturnType<typeof mountUploadView>
const upload = mountUpload({
  nabi,
  root: content,
  uploader: sendUpload,
  extensions: ['png', 'jpg', 'jpeg', 'webp', 'pdf'],
  maxFileSize: 10 * 1024 * 1024,
  maxTotalSize: 20 * 1024 * 1024,
  locale: 'ko',
  onStart: (tasks) => uploadView.start(tasks),
  onProgress: (id, percent) => uploadView.progress(id, percent),
  onSettle: () => uploadView.settle(),
  onDone: () => uploadView.done(),
})

uploadView = mountUploadView({ nabi, surface: content, upload, locale: 'ko' })

const surface = mountSurface({
  nabi,
  registry,
  root: content,
  fileSink: upload.take,
  locale: 'ko',
})
```

`fileSink: upload.take`를 연결해야 드래그 앤 드롭과 파일만 있는 붙여넣기가 업로드로 들어갑니다.
파일 선택 버튼은 `upload` 날개의 UI가 `upload.take()`로 넘깁니다. 업로드하는 동안 편집기는
잠기고, 성공한 파일은 배치 하나당 실행 취소 한 번으로 들어갑니다. `upload.cancel()` 또는
`uploadView`의 취소 버튼은 `AbortSignal`을 통해 진행 중인 요청을 끊습니다.

## 실패와 화면 해제

서버가 오류 응답을 주거나 `uploader`가 `null`을 반환하면 해당 파일은 문서에 넣지 않습니다.
같은 배치의 다른 파일은 계속 처리됩니다. 전체 크기 제한을 넘으면 배치 전체가 시작되지 않습니다.
화면을 닫을 때는 생성 순서의 반대로 해제합니다.

```ts
function dispose() {
  surface.unmount()
  uploadView.unmount()
  upload.unmount()
}
```

개발 중에만 `blob:` URL을 써서 즉시 미리보기를 만들 수 있습니다. 이 경우에는 편집기 조립,
이미지 날개, 업로드 날개에서 각각 `allowLocalUrls: true`를 켜야 합니다. 실제 서버 업로드가
HTTPS URL을 돌려준다면 이 옵션은 켜지 않는 편이 안전합니다.

## CSS 스타일

완료한 일반 파일은 링크 날개의 `a[data-nabi-file]`로 표시됩니다. 게시 화면에서 첨부 모양만 바꾸려면 이 선택자를 사용합니다.

```css
.article-body a[data-nabi-file] {
  padding: .3em .6em;
  border: 1px solid var(--nabi-line);
  border-radius: 8px;
  background: var(--nabi-soft);
}
```

이미지 업로드 결과는 이미지 날개의 CSS를 따릅니다. 업로드 진행 표시는 편집 화면에만 있으므로
게시 화면 CSS로 진행 상태를 만들 필요는 없습니다.
