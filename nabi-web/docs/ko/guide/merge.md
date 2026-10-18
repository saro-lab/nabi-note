---
title: 병합
description: 편집 시작 버전, 내 버전, 그동안 반영된 버전을 합치고 남은 충돌을 편집해 해결합니다.
---

<script setup>
import MergeDemo from '../../.vitepress/ui/MergeDemo.vue'
</script>

# 병합

내가 글을 편집하는 동안 다른 변경이 반영됐다면, 편집을 시작한 버전을 기준으로 양쪽 변경을
합칩니다. 자동으로 합칠 수 있는 내용은 처음부터 모두 반영하고, 겹치는 변경만 충돌로 남깁니다.
머지는 날개가 아닌 `nabi-note/merge`의 독립 화면입니다.

| 왼쪽 | 가운데 | 오른쪽 |
| --- | --- | --- |
| 내가 편집을 시작한 버전 | 내 현재 문서에 자동 머지를 반영한 결과 | 편집하는 동안 새로 반영된 버전 |
| 읽기 전용 | 직접 편집 가능 | 읽기 전용 |

가운데에서는 일반 편집기처럼 글·서식·표·목록·이미지 등을 고칠 수 있습니다. 사용할 기능은
전달한 날개로 정하며, 충돌 표시와 해결 상태는 저장되는 글에 섞이지 않습니다.

## 모두 자동으로 합칠 수 있는 예제

나는 회의 시간을 **오전 11시**로 바꿨고, 다른 사람은 장소를 **3층 회의실**로 바꿨습니다.
서로 다른 문단의 변경이므로 가운데 결과에 두 수정이 모두 들어갑니다.

남은 충돌이 없으므로 바로 **확인**을 누를 수 있습니다. 가운데에서 문장을 더 다듬은 뒤
확인해도 됩니다. 아래에 나타나는 최종 문서는 확인 콜백이 받은 실제 결과입니다.

<MergeDemo />

## 일부만 자동으로 합칠 수 있는 예제

이번에는 내가 회의 시간을 **오전 11시**, 다른 사람은 **오후 2시**로 바꿨습니다. 같은 문단을
서로 다르게 고쳤으므로 시간은 충돌로 남습니다. 내가 바꾼 진행 담당 **지민과 서연**, 다른
사람이 바꾼 장소 **3층 회의실**은 자동으로 반영됩니다.

충돌은 다음 중 하나로 해결합니다.

- 왼쪽 **&gt;&gt;**: 편집을 시작한 버전의 해당 내용을 채택합니다.
- 오른쪽 **&lt;&lt;**: 새로 반영된 버전의 해당 내용을 채택합니다.
- **현재 내용으로 해결**: 가운데 내용을 그대로 쓰거나 직접 고친 뒤 해결 처리합니다.

가운데 시간 문장을 원하는 내용으로 바꾸고 **현재 내용으로 해결**을 눌러 보세요.
남은 충돌이 모두 없어져야 확인할 수 있습니다.

<MergeDemo partial />

한번 해결한 부분을 다시 편집해도 해결 상태는 유지합니다. 해결 동작을 실행 취소하면
해결 상태도 함께 되돌아가며, 다시 실행하면 복원됩니다. 글을 지우거나 고치기만 해서는
미해결 충돌이 자동으로 완료 처리되지 않습니다.

## 자동 머지와 충돌 기준

편집 시작 문서에서 내 문서로 바뀐 내용과, 같은 시작 문서에서 새 버전으로 바뀐 내용을
비교합니다. 한쪽만 바꾼 부분과 양쪽이 같은 내용으로 바꾼 부분은 자동으로 반영합니다.
서로 다른 문단·줄을 바꾼 경우도 함께 반영합니다.

Git의 텍스트 머지처럼 문단·줄을 기준으로 겹치는 변경을 판단합니다. 같은 줄에서 서로 다른
단어를 바꿨더라도 자동으로 섞지 않고 충돌로 남깁니다. 같은 위치에 서로 다른 내용을
추가하거나, 한쪽이 지운 내용을 다른 쪽이 고친 경우도 직접 결정해야 합니다.

표·목록·플로트 영역처럼 내부 구조가 있는 블록은 양쪽이 함께 다르게 고쳤다면 해당 구조 전체를
충돌로 둡니다. 셀이나 목록 항목을 임의로 섞지 않으며, 내용을 선택하거나 가운데에서 직접
편집합니다. 이동과 편집이 겹쳐 위치를 확실하게 정할 수 없는 경우에도 자동 적용하지 않습니다.

## 독립 머지 화면 연결하기

`base`, `local`, `incoming`에는 저장한 NABI TREE JSON 또는 HTML 문자열을 넣습니다.
문서를 만든 편집기와 같은 날개와 옵션을 사용합니다. `mountMerge()`가 가운데 편집기와
툴바, 양쪽 원본, 충돌 선택 도구와 확인 버튼을 함께 만듭니다.

```ts
import { wings } from 'nabi-note'
import { mountMerge } from 'nabi-note/merge'
import 'nabi-note/nabi.css'

const merge = mountMerge({
  root: document.querySelector('#merge')!,
  base: editingStartedDocument,
  local: myEditedDocument,
  incoming: latestDocument,
  wings: wings().allBasic().build(),
  locale: 'ko',
  incomingVersion: latestVersion,
  async onConfirm({ json, html, incomingVersion, signal }) {
    return saveDocument({ json, html, expectedVersion: incomingVersion, signal })
  },
  onError(error) {
    showError(error)
  },
})
```

`onConfirm`은 충돌이 모두 해결된 현재 결과의 JSON·게시 HTML·편집 revision과
`incomingVersion`을 받습니다. `false`를 반환하면 확인을 완료하지 않습니다. Promise를
반환하는 동안에는 결과 편집과 충돌 선택, 중복 확인을 잠시 막습니다. 화면을 해제하면 해당
결과의 `signal`을 취소합니다. 한글 조합 입력 중에는 조합이 끝난 뒤 확인할 수 있습니다.

서비스의 이미지 선택창이나 업로드 등 별도 동작은 일반 편집기처럼 연결합니다.
`toolbarOptions`로 툴바 패널과 호스트 동작을, `surfaceOptions`로 편집 표면 옵션을 넘길 수
있습니다.

`incomingVersion`은 서비스가 전달한 값을 그대로 돌려줍니다. 저장할 때 서버의 최신 버전과
비교하는 일은 서비스에서 처리합니다. 머지 중 또 새 버전이 저장됐다면 오래된 결과를 덮어쓰지
말고, 최신 문서를 받아 새 머지를 시작해야 합니다.

화면 바깥에서도 상태를 읽거나 확인을 호출할 수 있습니다.

```ts
const stop = merge.session.onChange((state) => {
  updateRemainingCount(state.unresolvedCount)
})

const canConfirm = merge.session.getState().canConfirm
const confirmed = await merge.confirm()

stop()
merge.unmount()
```

현재 결과는 `merge.nabi.getJson()`과 `merge.nabi.getHtml()`로 읽습니다. 편집 화면의 DOM이나
`getEditorHtml()`을 저장하지 않습니다. 두 버전에서 이전 내용만 선택해 반영하려면
[비교](./compare)의 클릭 머지를 사용합니다.

## 업로드가 끝난 뒤 확인하기

파일 버튼·붙여넣기·드래그 앤 드롭을 사용하려면 `upload` 날개와 `mountUpload()`를 연결합니다.
`sendUpload`는 파일을 서버로 보내고 `{ uri }`를 반환하는 함수입니다. 서버 연결과 진행 표시의
전체 예제는 [파일 업로드](../wing/etc/upload)를 참고하세요.

업로드처럼 아직 문서에 반영되지 않은 비동기 작업은 `merge.session.hold()`로 확인과 충돌
선택을 보류합니다. 반환받은 함수를 완료·취소·화면 해제 때 호출해 보류를 해제합니다. 파일이
서버에 올라간 직후가 아니라 **문서에 삽입된 뒤** 해제해야 최종 결과에서 파일이 빠지지 않습니다.

```ts
import { mountUpload, wings, type UploadMount } from 'nabi-note'
import { mountMerge } from 'nabi-note/merge'

let upload: UploadMount | undefined
let releaseUpload: (() => void) | undefined

const merge = mountMerge({
  root,
  base,
  local,
  incoming,
  wings: wings().allBasic().use('upload').build(),
  locale: 'ko',
  incomingVersion: latestVersion,
  toolbarOptions: { onFiles: (files) => upload?.take(files) },
  surfaceOptions: { fileSink: (files) => upload?.take(files) },
  onConfirm: ({ json, html, incomingVersion, signal }) =>
    saveDocument({ json, html, expectedVersion: incomingVersion, signal }),
})

upload = mountUpload({
  nabi: merge.nabi,
  root: merge.content,
  locale: 'ko',
  uploader: sendUpload,
  onStart() {
    releaseUpload = merge.session.hold()
  },
  onDone() {
    releaseUpload?.()
    releaseUpload = undefined
  },
})

function dispose() {
  upload?.unmount()
  releaseUpload?.()
  merge.unmount()
}
```

`merge.content`는 가운데 편집 DOM이고, `merge.surface`와 `merge.toolbar`는 이미 연결된
편집 표면과 툴바입니다. 같은 자리에 편집 표면이나 툴바를 다시 만들지 않습니다. 추가한
업로드·진행 표시 등의 mount는 서비스에서 먼저 해제하고 마지막에 `merge.unmount()`를 호출합니다.
