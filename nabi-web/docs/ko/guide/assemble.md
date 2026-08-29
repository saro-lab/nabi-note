---
title: 에디터 조립
description: surface, toolbar, 파일·업로드·히스토리 mount를 책임별로 연결합니다.
---

# 에디터 조립

NABI는 한 덩어리 위젯이 아닙니다. 문서 상태(`nabi`), 허용 어휘(`registry`), 입력 표면(`surface`), 화면 도구를 분리해 조립합니다. 그래서 사용하지 않는 기능을 올리지 않아도 되고, 각 수명 주기도 명확합니다.

## 권장 뼈대

```ts
import {
  createNabiWith, mountSurface, mountToolbar, mountFile,
  browserFileStore, parseNodes, wings,
} from 'nabi-note'

const { nabi, registry } = createNabiWith(wings().all().build(), { parseHtml: parseNodes })
const content = document.querySelector<HTMLElement>('.nabi-content')!
const toolbarRoot = document.querySelector<HTMLElement>('.nabi-toolbar')!

const surface = mountSurface({ nabi, registry, root: content })
const file = mountFile({ nabi, registry, store: browserFileStore(document), parse: parseNodes })
const toolbar = mountToolbar({
  nabi, registry, root: toolbarRoot, surface, file,
  onHost: (wing) => {
    if (wing === 'save') void file.save()
  },
})

function dispose() {
  toolbar.unmount()
  file.unmount()
  surface.unmount()
}
```

## 구성 요소의 역할

| 대상 | 맡는 일 | 유의할 점 |
| --- | --- | --- |
| `nabi` | 상태, 명령, undo/redo와 JSON/HTML 변환을 관리합니다. | DOM을 직접 수정하면 문서 상태와 어긋날 수 있습니다. |
| `registry` | wing을 검증하고 명령·입출력 규칙을 모읍니다. | 서버와 브라우저에서 같은 wing 순서를 사용해야 합니다. |
| `surface` | contenteditable, 선택, IME와 캐럿을 관리합니다. | mount한 뒤 자식 DOM을 임의로 교체하지 마세요. |
| toolbar | wing이 선언한 버튼을 화면에 연결합니다. | 버튼에서 문서를 직접 조작하지 마세요. |
| file/upload/history/diff | 선택 기능의 수명 주기를 관리합니다. | 사용이 끝나면 빠짐없이 `unmount()`해야 합니다. |

## 변경을 저장소와 연결하기

```ts
const stop = nabi.onChange((change) => {
  // change가 올 때마다 JSON을 읽어 debounce한 서버 저장을 예약할 수 있습니다.
  queueSave(nabi.getJson())
})

// 화면을 떠날 때
stop()
```

`isChanged()`는 마지막으로 저장된 기준과 비교합니다. 파일 mount가 저장에 성공하면 기준도 갱신합니다. 직접 저장했다면 저장 완료 시점을 애플리케이션에서 함께 관리하세요.

## 조립할 때 유의할 점

- `nabi-note/nabi.css`는 편집 화면과 게시 화면에 모두 로드합니다.
- `parseHtml: parseNodes`는 HTML 입력을 사용할 때만 추가합니다.
- 선택한 wing과 모든 mount는 같은 `registry`에 연결합니다.
- 화면을 제거할 때는 생성한 mount를 역순으로 해제합니다.
- 툴바는 wing 선언을 사용하고, 같은 도메인 규칙을 별도로 구현하지 않습니다.
