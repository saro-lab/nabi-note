---
title: 표
description: 여러 문단과 블록을 셀에 담고, 배경색·병합·정렬을 편집합니다.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# 표

툴바에서 행과 열을 골라 표를 만듭니다. 셀에는 여러 문단과 이미지, 목록, 인용, 코드, 접기,
동영상을 넣을 수 있습니다. 셀에 커서를 두면 아래 속성 도구에서 행·열, 병합, 머리글,
배경색을 편집할 수 있습니다.

아래 예시에서 셀 안의 문단과 목록을 고쳐 보고, 여러 셀을 드래그해 배경색을 함께 바꿔 보세요.
속성 도구의 **표 전체 선택**을 누르면 메인 툴바에서 표 자체를 정렬할 수 있습니다.

<WingDemo path="/wing/block/table" />

```ts
const selected = wings().use('table').build()
```

셀에서 사용할 날개도 함께 등록해야 합니다. 기본 날개를 모두 쓰는 편집기라면
`wings().allBasic()`으로 조립하면 됩니다.

## 셀 안에서 쓰기

| 입력 | 동작 |
| --- | --- |
| 일반 문단에서 Enter | 같은 셀 안에 새 문단을 만듭니다. |
| Shift+Enter | 현재 문단이나 목록 항목 안에서 줄을 바꿉니다. |
| 일반 문단에서 Tab / Shift+Tab | 다음 / 이전 셀로 이동합니다. |
| 목록·코드에서 Tab / Shift+Tab | 해당 블록의 들여쓰기·내어쓰기를 사용합니다. |

목록과 코드의 Enter는 각 블록의 입력 규칙을 따릅니다. 코드에서 더 내어쓸 수 없어도
Shift+Tab이 이전 셀로 넘어가지는 않습니다. 셀의 처음이나 끝에서 Backspace·Delete를 눌러도
이웃 셀이나 표 밖의 문단과 합쳐지지 않습니다.

붙여넣기와 이미지·블록 삽입은 시작한 셀 안에 들어갑니다. 셀 경계를 넘는 선택에는 블록 삽입과
붙여넣기를 적용할 수 없습니다. 셀 안에는 표나 [플로트 영역](./float)을 중첩할 수 없으며,
이런 구조를 불러오거나 붙여넣으면 안의 내용을 순서대로 풀어 넣습니다.

일반 셀에는 제목을 쓸 수 있지만 머리글 셀에는 제목 서식을 적용하지 않습니다. 머리글로
전환하면 내부 제목은 일반 문단이 되고, 글자와 다른 서식은 유지됩니다.

## 셀 배경색

배경색은 셀 하나 또는 드래그로 선택한 직사각형 범위에 적용됩니다. 글자 일부만 선택해도
그 글자가 속한 셀 전체의 배경이 바뀝니다. 연한 색은 라이트·다크 테마에 맞춰 표시되며,
여러 셀의 색이 서로 다르면 특정 색이 선택된 것으로 표시하지 않습니다.

현재 셀 선택을 유지한 채 명령으로도 바꿀 수 있습니다.

```ts
nabi.applyCommand('setCellColor', { bg: 'cyan' })
```

허용 값은 `yellow`, `green`, `cyan`, `pink`, `purple`, `orange`입니다. 기본 배경으로 돌리려면
속성 도구의 **기본**을 고르거나 빈 문자열을 전달합니다.

```ts
nabi.applyCommand('setCellColor', { bg: '' })
```

내용 삭제, 잘라내기, 서식 지우기는 셀 배경색을 지우지 않습니다. 병합하면 왼쪽 위 셀의 색을
사용하고, 분할하면 새로 생긴 셀도 같은 색을 가집니다. 새로 추가한 행·열은 기본 배경으로
시작합니다. 배경색 변경은 실행 취소와 다시 실행을 지원합니다.

## 셀 안 정렬과 표 정렬

셀에 커서가 있으면 정렬은 내부 문단이나 이미지에 적용됩니다. 여러 셀을 선택하면 그 안에서
정렬할 수 있는 문단과 객체에 함께 적용하며, 코드는 제외합니다. 제목·정렬·드롭캡의 툴바 상태도
실제로 선택한 내부 문단을 따릅니다. 선택한 문단의 값이 섞여 있으면 하나의 값으로 표시하지
않습니다.

표 자체를 정렬하려면 속성 도구의 **표 전체 선택**을 누른 뒤 메인 툴바의 정렬 버튼을 사용합니다.
표를 감싼 문단의 앞이나 뒤에 커서를 두어 점선 테두리가 보일 때도 같은 정렬을 사용할 수
있습니다. 이 테두리는 커서를 표 전체 선택으로 바꾸지 않고 대상만 알려 줍니다.

```ts
nabi.applyCommand('selectTable')
nabi.applyCommand('setAlign', { value: 'c' })
```

행과 열 추가·삭제, 병합과 분할은 선택한 셀을 기준으로 동작합니다. 병합하면 각 셀의 블록이
행 순서대로 남고, 분할하면 내용은 원래 셀에 남으며 나머지 셀은 비어 있습니다.

## 복사와 저장

여러 셀을 선택해 복사하면 화면에 표시된 직사각형 범위를 마지막 셀까지 복사합니다. HTML과
내부 클립보드 형식은 빈 셀, 병합, 블록, 글자 서식과 배경색을 유지합니다. 일반 텍스트에서는
셀을 탭과 줄바꿈으로 구분하고, 셀 안 블록 사이의 줄바꿈과 이미지·동영상 주소를 보존합니다.
잘라내기는 선택한 셀의 내용만 비우며 실행 취소 한 번으로 되돌릴 수 있습니다.

표 앞뒤에 커서를 두어 점선 테두리가 보이면 복사·잘라내기가 표를 감싼 문단 전체에 적용됩니다.
잘라내기는 클립보드 쓰기가 성공한 뒤 문단과 표를 함께 제거합니다. 플로트 영역 안의 표를
잘라내거나 삭제해도 바깥 플로트 영역은 남습니다.

JSON과 HTML 저장은 셀의 블록과 배경색을 보존합니다. 단순한 표는 Markdown 표로 내보내고,
여러 블록이나 배경색이 있는 표는 HTML로 남겨 내용을 유지합니다. HTML에서 셀의 색 이름은
`td` 또는 `th`의 `data-nabi-cell-color` 속성에 저장됩니다. 외부 HTML의 임의 배경색 스타일은
셀 배경색으로 가져오지 않습니다.

발행 화면에서 열 정렬을 쓰려면 표를 정렬 가능하게 저장하고 `nabi-note/viewer`의
`attachViewer()`를 연결합니다. 병합된 셀이 있는 표는 열 정렬 대상이 아닙니다.

## CSS 스타일

표는 `.nabi-content table`, 셀은 `.nabi-content :is(th, td)`로 꾸밉니다. 지정한 배경색이
덮이지 않도록 줄무늬와 머리글 배경은 색이 없는 셀에만 적용합니다.

```css
.article-body table { inline-size: 100%; border-collapse: collapse; }
.article-body :is(th, td) { padding: .6rem .75rem; border: 1px solid var(--nabi-line); }
.article-body th { font-weight: 700; }
.article-body th:not([data-nabi-cell-color]) { background: var(--nabi-soft); }
.article-body tr:nth-child(even) td:not([data-nabi-cell-color]) {
  background: color-mix(in srgb, var(--nabi-soft) 45%, transparent);
}
```

셀 배경색 자체는 `--nabi-cell-yellow`처럼 색 이름이 붙은 CSS 변수로 바꿉니다. 아래 CSS는
패키지 CSS 뒤에 불러오고, `table-note` 클래스와 현재 테마의 `data-nabi-theme` 값을 편집기의
`.nabi` 또는 게시 화면의 `.nabi-content` 요소에 직접 지정합니다.

```css
.table-note:is(.nabi, .nabi-content)[data-nabi-theme="light"] {
  --nabi-cell-cyan: #e2f4f7;
}
.table-note:is(.nabi, .nabi-content)[data-nabi-theme="dark"] {
  --nabi-cell-cyan: #183b43;
}
```

viewer를 연결했다면 `.nabi-sort` 버튼은 남겨 두세요. 셀에 `position`이나 오른쪽 padding을
강제로 덮어쓰면 정렬 버튼과 겹칠 수 있습니다.
