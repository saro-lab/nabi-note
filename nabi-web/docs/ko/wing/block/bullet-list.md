---
title: 글머리 목록
---

# 글머리 목록

## 설명

`bulletListWing`(이름 `ul`, 단축키 `L`)은 `<ul>`을 소유합니다. 항목은 `parts`로 함께
데려오므로 `li`를 따로 등록하지 않습니다 — 배열이 아니라 레코드입니다.

```ts
parts: { li: { holds: 'blocks' } }
```

버튼을 누르면 캐럿이 든 블록(또는 선택에 걸친 블록들)을 목록으로 감싸고, 다시
누르면 풀려서 문단으로 돌아옵니다. 다른 목록 단추를 누르면 그 갈래로 갈아입습니다.

줄 앞머리에 하이픈 하나를 치고 스페이스를 눌러도(`- `) 같은 결과입니다. **빈 줄일
필요는 없습니다** — 재는 것은 캐럿 앞의 줄 앞머리뿐이라, `- 뒤에글`에서 스페이스를
쳐도 걸리고 뒤의 글은 그대로 항목 속에 남습니다. 다만 문단의 **첫 줄**에서만 걸립니다.

- `Tab`은 바로 위 형제 항목의 하위로 한 단계 들여씁니다. 첫 항목에는 들어갈 자리가
  없어 아무 일도 안 일어납니다 — 목록 안에서는 `Tab`이 공백을 넣지 않습니다.
- `Shift+Tab`은 부모의 다음 형제로 내어씁니다 — 최상위에서 내어쓰면 목록에서 빠져나와
  문단이 됩니다. 여러 항목에 걸쳐 선택해 두었다면 걸친 항목 전부가 함께 움직입니다.
- **빈 항목에서 Enter를 누르면 내어쓰기입니다** — 최상위였다면 목록이 거기서 끝나고
  캐럿은 그 아래 새 문단에 섭니다. 목록을 끝내는 길이 이것입니다.
- **항목 맨 앞에서 Backspace를 누르면 앞 항목에 합쳐집니다.** 합칠 앞 항목이 없으면
  내어쓰기로 떨어집니다. 항목 맨 끝의 Delete는 반대로 다음 항목을 끌어옵니다.
- 항목 속은 블록이라 문단이 한 겹 들어갑니다. 마크(굵게 등)와 다른 인라인 wing은
  그 문단 안에서 그대로 쓸 수 있습니다.
- 태그가 갖고 있던 `type` 같은 속성은 살아남지 않습니다. 목록 속에 항목이 아닌 것이
  들어오면 버리지 않고 항목 하나로 감싸 줍니다.
- 체크리스트와 태그(`<ul>`)를 나눠 쓰지만 서로 다른 wing입니다 — 표식 속성으로
  갈립니다(`data-nabi-list="task"`가 있으면 체크리스트).

## 중첩은 진짜 마크업입니다

구조가 저장값에 그대로 남습니다. 다만 **항목은 글이 아니라 블록을 품으므로**, 글은
문단 한 겹을 입고 중첩된 목록은 래퍼 문단 속에 섭니다.

```html
<li><p>가</p><div data-nabi-p><ul><li><p>나</p></li></ul></div></li>
```

## 사용 예시

```ts
import { createNabiWith, mountSurface, mountToolbar, bulletListWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// 날개 목록이 갈래 지식·커맨드·조립기를 함께 짓는다 — 그것이 `registry` 다
const { nabi, registry } = createNabiWith([bulletListWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

`li`는 `parts`로 자동으로 따라오므로 배열에 직접 넣지 않습니다.

## 데모

<WingDemo path="/wing/block/bullet-list" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
