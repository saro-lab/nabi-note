---
title: 플로트 영역
description: 글·이미지·표를 본문 옆에 배치하고, 뒤 문단이 그 옆으로 흐르게 합니다.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# 플로트 영역

짧은 설명이나 이미지, 작은 표를 왼쪽 또는 오른쪽에 놓고 본문이 그 옆으로 흐르게 합니다.
영역 안의 내용도 같은 편집기에서 바로 고칠 수 있습니다. 편집할 때만 점선 테두리를 표시하고,
미리보기와 게시 화면에서는 내용과 배치만 남습니다.

아래 예시의 영역 안에 커서를 두고 속성 도구에서 좌우 방향과 최대 너비를 바꿔 보세요.
미리보기에서는 점선 없이 본문이 이어지는 모습을 확인할 수 있습니다.

<WingDemo path="/wing/block/float" />

```ts
const selected = wings().allBasic().build()
```

플로트 영역은 기본 날개에 포함됩니다. 필요한 날개만 조립한다면 `wings().use('float')`를
사용하거나 `floatWing`을 직접 등록합니다. 영역 안에서 쓸 이미지·표·목록 등의 날개도 함께
등록해야 합니다.

## 만들고 배치하기

본문에 커서를 두고 **플로트 영역** 버튼을 누르면 빈 영역이 생깁니다. 기본값은 오른쪽,
최대 너비 40%입니다. 여러 문단을 선택한 뒤 누르면 선택이 닿은 문단 전체를 한 영역으로
묶습니다. 이미 있는 플로트 영역을 다시 감싸거나 영역 안에 다른 플로트 영역을 만들 수는
없습니다.

```ts
nabi.applyCommand('insertFloat', { side: 'right', w: 40 })
```

영역 안에 커서가 있을 때 속성 도구에서 왼쪽·오른쪽과 최대 너비를 바꿉니다. 최대 너비는
20%, 30%, 40%, 50% 중에서 고릅니다. 화면 전체가 아니라 본문 폭을 기준으로 하며,
내용이 짧으면 실제 영역은 더 좁을 수 있습니다.

```ts
nabi.applyCommand('setFloatSide', { side: 'left' })
nabi.applyCommand('setFloatWidth', { w: 30 })
```

글·이미지·표 붙여넣기, 블록 전환과 업로드는 영역 안에 유지됩니다. 내부 표를 지우면 표만
사라집니다. 영역 안팎을 함께 선택한 상태에서는 내부 블록 삽입·변환을 적용할 수 없습니다.

너비 값 옆의 **플로트 영역 해제** 버튼은 안의 내용을 본문으로 돌려놓습니다. 내용은 삭제하지
않으며, 만들기·배치 변경·해제 모두 실행 취소와 다시 실행을 지원합니다.

```ts
nabi.applyCommand('unwrapFloat')
```

## 본문과 함께 흐르는 방식

뒤따르는 문단은 영역 옆으로 흐르다가 영역이 끝나면 본문 전체 폭으로 돌아옵니다. 다음 제목,
표, 코드, 구분선이나 새 플로트 영역은 앞 영역의 아래에서 시작합니다.

본문 폭이 `36rem` 미만이면 영역과 본문을 한 열로 배치합니다. 인쇄할 때도 한 열로 표시하며,
저장한 방향과 최대 너비는 유지합니다. 문서 비교 화면에서는 각 영역의 좌우 배치와 최대 너비를
유지하되, 다음 블록은 그 아래에 따로 표시해 변경 내용을 읽기 쉽게 합니다.

## 저장과 불러오기

JSON에는 `float` 노드의 `a.side`와 `a.w`, 내부 블록을 함께 저장합니다. HTML에서는 일반 객체
문단 안의 `div`에 `data-nabi-float`와 `data-nabi-float-width` 속성을 사용합니다.

```html
<div data-nabi-p>
  <div data-nabi-float="right" data-nabi-float-width="40">
    <p>본문 옆에 놓을 설명입니다.</p>
  </div>
</div>
<p>이 문단은 영역 옆으로 이어집니다.</p>
```

Markdown으로 내보낼 때는 HTML로 보존합니다. 임의의 CSS `float` 스타일을 가져오는 방식은
아니므로, 저장과 복원에는 NABI NOTE가 만든 JSON이나 HTML을 사용하세요. 편집기, SSR,
미리보기와 게시 화면에 같은 날개와 CSS를 연결해야 방향과 너비가 그대로 유지됩니다.

## CSS 스타일

영역 안의 색과 여백은 `[data-nabi-float]` 선택자로 꾸밀 수 있습니다. 바깥 문단이 배치와
최대 너비를 관리하므로 `float`, `display`, 폭을 직접 덮어쓰지 않습니다.

```css
.brand-note .nabi-content [data-nabi-float] {
  background: var(--nabi-soft);
  border-radius: var(--nabi-radius);
  padding: .75rem;
}
```
