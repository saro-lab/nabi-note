---
title: 입출력
description: JSON과 HTML을 불러오고 내보내며 파일, 히스토리, 업로드를 연결합니다.
---

# 입출력

NABI NOTE는 다시 편집할 데이터와 게시할 결과를 구분합니다. 보통 서버에는 NABI TREE JSON을 원본으로 저장하고, 게시 화면에는 그 JSON에서 만든 HTML을 사용합니다.

## 네 가지 기본 함수

| 함수 | 역할 |
| --- | --- |
| `setJson(value)` | 저장한 NABI TREE를 편집기로 불러옵니다. |
| `getJson()` | 다시 편집할 수 있는 NABI TREE를 읽습니다. |
| `setHtml(html)` | 외부 HTML을 등록된 날개의 문서 구조로 가져옵니다. |
| `getHtml()` | 게시 화면에 넣을 HTML을 만듭니다. |

```ts
const savedJson = nabi.getJson()
const publishedHtml = nabi.getHtml()

const jsonLoaded = nabi.setJson(savedJson)
const htmlLoaded = nabi.setHtml(publishedHtml)
```

`setJson()`과 `setHtml()`은 성공하면 새 문서를 불러온 것으로 처리합니다. undo로 이전 문서에 돌아갈 수 있고, `isChanged()`의 저장 기준선과 diff 날개의 불러오기 기준선도 새 문서로 바뀝니다. 잘못된 비어 있지 않은 입력은 `false`를 반환하며 기존 문서를 바꾸지 않습니다.

`setHtml()`로 HTML을 가져오려면 편집기를 만들 때 `parseHtml: parseNodes`를 넣습니다. `getEditorHtml()`은 서버에서 미리 그린 편집 화면을 이어받는 용도이며, 장기 저장 형식으로 사용하지 않습니다.

## 파일로 저장하고 열기

파일 저장과 열기 날개를 선택한 뒤 `mountFile()`을 연결합니다.

```ts
import {
  browserFileStore,
  createNabiWith,
  mountFile,
  parseNodes,
  wings,
} from 'nabi-note'

const { nabi, registry } = createNabiWith(
  wings().allBasic().use('save').use('open'),
  { parseHtml: parseNodes, locale: 'ko' },
)

const file = mountFile({
  nabi,
  registry,
  store: browserFileStore(document),
  parse: parseNodes,
  locale: 'ko',
})

file.save()
await file.open()
```

기본 파일 저장소는 `.nabi`, `.nhtml`, `.md`로 저장하고, 이 형식과 일반 `.html`을 엽니다. `.nabi`는 다시 편집할 원본입니다. `.nhtml`과 `.md`는 내보낸 사본이므로 저장에 성공해도 `isChanged()`의 기준선을 옮기지 않습니다. 마크다운으로 표현할 수 없는 등록 요소는 HTML로 남을 수 있습니다.

## 브라우저에 로컬 히스토리 남기기

로컬 히스토리는 현재 브라우저의 저장소에 복구용 스냅샷을 남깁니다. 계정 동기화나 서버 백업을 대신하지 않습니다.

```ts
import { browserHistoryStorage, mountLocalHistory } from 'nabi-note'

const history = mountLocalHistory({
  nabi,
  storage: browserHistoryStorage(window),
})
```

브라우저 설정이나 `file://` 환경에서는 저장소를 사용할 수 없을 수 있습니다. `browserHistoryStorage()`가 `null`을 반환해도 그대로 mount에 넘기면, 화면에서 사용할 수 없는 이유를 안내할 수 있습니다.

## 업로드 연결하기

업로드 날개는 파일을 문서에 넣는 명령을 제공하고, 실제 전송은 애플리케이션의 업로더가 담당합니다. 이미지를 넣으려면 이미지 날개가, 첨부 링크를 넣으려면 링크 날개가 함께 있어야 합니다.

```ts
import { mountUpload, mountUploadView } from 'nabi-note'

const uploadView = mountUploadView({ nabi, surface: content })
const upload = mountUpload({
  nabi,
  root: content,
  uploader: async ({ file, signal }) => {
    const body = new FormData()
    body.append('file', file as File)

    const response = await fetch('/api/uploads', {
      method: 'POST',
      body,
      signal,
    })
    if (!response.ok) return null
    return { uri: (await response.json()).url }
  },
  onStart: uploadView.start,
  onProgress: uploadView.progress,
  onSettle: uploadView.settle,
  onDone: uploadView.done,
  locale: 'ko',
})

const surface = mountSurface({
  nabi,
  registry,
  root: content,
  fileSink: upload.take,
  locale: 'ko',
})
```

업로드 서버는 확장자만 믿지 않고 MIME, 크기, 사용자 권한, 저장 위치를 검증해야 합니다. 일반적인 서버 업로드는 HTTPS 주소를 반환하면 됩니다. `blob:`이나 `data:image/...` 주소를 문서에 남기는 미리보기는 문서 조립, 이미지 날개, 업로드 날개에서 각각 로컬 URL을 허용해야 합니다.

## diff의 기준 정하기

`mountDiffWing()`은 마지막으로 `setJson()`이나 `setHtml()`에 성공한 문서를 기준으로 현재 문서를 비교합니다. 타이핑, 붙여넣기, undo, redo는 이 기준을 바꾸지 않습니다.

서버에 저장한 시점끼리 비교하려면 애플리케이션이 두 JSON을 보관한 뒤 `diffDocs(before, after, registry)`를 직접 호출합니다. 자세한 화면 연결 방법은 [SSR·viewer·diff](/ko/guide/rendering)에서 확인할 수 있습니다.

화면을 제거할 때는 `surface`, `upload`, `uploadView`, `history`, `file`처럼 만든 부품을 역순으로 해제합니다.
