---
title: 저장·입출력
description: JSON, HTML, Markdown, 파일, 업로드, 로컬 히스토리, diff를 연결합니다.
---

# 저장·입출력

저장의 기준은 NABI TREE JSON입니다. HTML은 게시용, editor HTML은 hydrate용이며 원본을 대체하지 않습니다. 파일 기능은 wing을 켜는 것만으로 끝나지 않고 해당 mount와 서버 정책을 연결해야 합니다.

## 무엇을 저장할까

| 목적 | 값 | 주의 |
| --- | --- | --- |
| 데이터베이스 원본 | `nabi.getJson()` | 장기 저장의 원본으로 사용합니다. |
| 게시 페이지 | `nabi.getHtml()` | 허용된 어휘에서 다시 만든 HTML을 사용합니다. |
| 빠른 화면 복원 | `getEditorHtml()` | 저장하지 않고 같은 문서를 hydrate할 때만 사용합니다. |
| 사용자 파일 | `.nabi`, `.nhtml`, `.md` | `mountFile()`을 함께 연결합니다. |

## 파일과 히스토리

```ts
import {
  browserFileStore, browserHistoryStorage,
  mountFile, mountLocalHistory, parseNodes,
} from 'nabi-note'

const file = mountFile({ nabi, registry, store: browserFileStore(document), parse: parseNodes })
const storage = browserHistoryStorage(window)
const history = storage ? mountLocalHistory({ nabi, storage, limit: 20 }) : null
```

로컬 히스토리는 브라우저 저장소에만 있습니다. 계정 간 동기화나 백업을 뜻하지 않습니다. 복구 UI를 제공한다면 저장소가 없거나 비활성화된 경우도 처리하세요.

## 업로드

```ts
import { mountUpload } from 'nabi-note'

const upload = mountUpload({
  nabi,
  root: document.querySelector('.nabi-content')!,
  uploader: async (task) => {
    const response = await fetch('/api/uploads', { method: 'POST', body: task.file })
    if (!response.ok) return null
    return { uri: (await response.json()).url }
  },
  maxFileSize: 10 * 1024 * 1024,
})
```

업로드 서버는 확장자만 믿지 말고 MIME, 크기, 권한, 저장 위치를 검증해야 합니다. 실패하면 결과 객체를 문서에 남기지 않습니다. 로컬 경로 허용은 개발 편의가 아니라 별도의 보안 선택입니다.

## diff의 기준선

`mountDiffWing()`은 마지막으로 **불러온** 문서를 기준선으로 잡습니다. 타이핑·undo·redo는 기준선을 옮기지 않습니다. 저장 시점 비교가 필요하면 애플리케이션에서 저장한 JSON을 별도로 보관해 `diffDocs(before, after, registry)`를 호출하세요.
