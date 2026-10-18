---
title: 비교
description: 두 문서를 나란히 비교하고 선택한 이전 내용을 현재 문서에 반영합니다.
---

<script setup>
import CompareDemo from '../../.vitepress/ui/CompareDemo.vue'
</script>

# 비교

저장한 문서 두 개를 나란히 놓고 바뀐 부분을 확인합니다. 편집기 없이 비교 화면만 열 수
있으며, 콜백을 연결하면 선택한 이전 내용을 현재 문서에 반영할 수 있습니다.

## 이전 내용을 골라 반영하기

왼쪽은 이전 문서, 오른쪽은 현재 문서입니다. 바뀐 부분의 **&gt;&gt;**를 누르면 해당
문단·줄 묶음의 이전 내용을 현재 문서에 반영합니다. 글자마다 따로 선택하는 방식은 아닙니다.
현재 문서에서 지운 이전 내용을 되살리거나 현재 문서에 새로 추가한 내용을 제거할 수도 있습니다.

아래 예제에서 모임 시간이나 준비물만 원래대로 돌려 보세요. **콜백으로 반영한 현재 문서**를
펼치면 결과를 확인할 수 있습니다. **처음부터 다시**로 원래 예제로 돌아옵니다.

<CompareDemo />

## 독립 비교 화면

`nabi-note/diff`에서 불러옵니다. `before`와 `after`에는 저장한 NABI TREE JSON 또는
HTML 문자열을 넣습니다. 문서를 만든 편집기와 같은 날개로 registry를 구성해야 표·목록·이미지
등을 그대로 읽고 표시할 수 있습니다.

```ts
import { makeRegistry, wings } from 'nabi-note'
import { mountDiff } from 'nabi-note/diff'
import 'nabi-note/nabi.css'

const registry = makeRegistry(wings().allBasic().build())
const diff = mountDiff({
  root: document.querySelector('#comparison')!,
  before: previousDocument,
  after: currentDocument,
  registry,
  locale: 'ko',
})

diff.update(nextPreviousDocument, nextCurrentDocument)

diff.unmount()
```

기본으로 바뀐 부분과 앞뒤 문맥만 보입니다. 접기 버튼으로 전체 문서를 펼칠 수 있고,
이전·다음 버튼으로 변경 위치를 이동합니다. 변경이 없으면 문서 전체를 보여 줍니다.
`onMerge`를 생략하면 읽기 전용 비교 화면으로 동작합니다.

## 콜백으로 클릭 머지 연결하기

버튼을 누르면 `onMerge`에 결과 후보를 전달합니다. 콜백만 연결했다고 문서가 자동으로
저장되지는 않습니다. 서비스가 후보를 받아들이고 `update()`를 호출해야 비교 결과도 바뀝니다.

```ts
const diff = mountDiff({
  root,
  before: previousDocument,
  after: currentDocument,
  registry,
  locale: 'ko',
  onMerge(proposal) {
    if (proposal.signal.aborted) return
    const accepted = diff.update(proposal.before, proposal.result, proposal.revision)
    if (!accepted) return
    currentDocument = proposal.result
  },
  onError(error) {
    showError(error)
  },
})
```

`proposal.result`는 선택한 변경만 반영한 NABI TREE JSON입니다. `before`와 `after`는
클릭할 당시의 두 문서이고, `changeId`는 선택한 변경, `revision`은 해당 비교 상태를 식별합니다.
`update()`의 세 번째 인자에 이 `revision`을 넘기면 비교 화면이 이미 바뀐 경우 `false`를
반환하고 후보를 적용하지 않습니다.

비동기 콜백을 기다리는 동안에는 중복 클릭을 막습니다. 다른 문서로 갱신하거나 비교 화면을
해제하면 `signal`이 취소됩니다. 서버에 저장하는 서비스는 이 신호와 서버 문서 버전을 함께
확인해 오래된 결과로 새 문서를 덮어쓰지 않도록 연결합니다.

## 편집기에서 비교 열기

`diff` 날개와 `mountDiffWing()`을 연결하면 툴바에서 비교 화면을 열 수 있습니다. 기준은
마지막으로 불러온 문서입니다. 일반 편집이나 실행 취소로 기준 문서가 바뀌지는 않습니다.

```ts
import { createNabiWith, mountToolbar, wings } from 'nabi-note'
import { mountDiffWing } from 'nabi-note/diff'

const { nabi, registry } = createNabiWith(wings().allBasic().use('diff'))
const comparison = mountDiffWing({
  nabi,
  registry,
  surface: content,
  locale: 'ko',
  merge: true,
})
const toolbar = mountToolbar({
  nabi,
  registry,
  root: toolbarRoot,
  surface: content,
  onHost(wing) {
    if (wing === 'diff') comparison.open()
  },
})
```

`merge: true`를 주면 비교 화면에서 선택한 이전 내용을 편집기에 반영합니다. 이 변경은 실행
취소할 수 있고, 기준 문서는 유지합니다. 열려 있는 동안 원본 편집기가 바뀌면 비교도 다시
계산합니다. `merge`를 생략하면 기존 읽기 전용 비교 화면입니다.

서비스에서 화면을 제거할 때 `toolbar.unmount()`와 `comparison.unmount()`를 호출합니다.
편집 시작 버전까지 함께 보고 양쪽 변경을 자동으로 합치려면 [머지](./merge)를 사용합니다.
