---
title: 링크
description: 안전한 웹 주소를 연결하고 업로드 첨부를 표시합니다.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# 링크

글자를 선택해 주소를 연결합니다. 선택 없이 주소를 입력하면 주소 자체가 링크 글자로 들어가며, `http://` 또는 `https://` 주소를 입력한 뒤 Space나 Enter를 눌러도 링크로 바뀝니다.

링크에는 `http:`, `https:`와 `.` 또는 `/`로 시작하는 같은 사이트 경로만 저장됩니다. `javascript:`나 `//example.com`처럼 출처를 분명히 할 수 없는 주소는 거절됩니다. 업로드가 만든 첨부 링크는 파일 정보까지 함께 저장되며, 일반 링크처럼 직접 만들 수는 없습니다.

<WingDemo path="/wing/inline/link" />

```ts
const selected = wings().use('a').build()
```

## URL 붙여넣기

앞뒤 공백을 제외한 붙여넣기 내용 전체가 올바른 `http://` 또는 `https://` URL이면 즉시 링크로 들어갑니다. 문장 속 URL, 여러 URL이 섞인 글, 상대 경로는 기존 붙여넣기 방식으로 처리합니다. 코드 블록이나 링크 wing이 없는 편집기에서는 텍스트로 유지합니다. 편집기에서 복사한 내부 클립보드 데이터가 있으면 원래 서식을 먼저 보존합니다.

`mountSurface()`의 `onPasteUrl` 콜백으로 링크의 표시 문구를 정할 수 있습니다.

| 인자 | 값 |
| --- | --- |
| `url` | 앞뒤 공백을 제거한 전체 URL |
| `isSameOrigin` | URL의 프로토콜·호스트·포트가 편집기가 있는 문서의 오리진과 같은지 여부 |
| `path` | `/`로 시작하는 경로와 쿼리·해시. 예: `/posts/1?a=2#top` |

```ts
const surface = mountSurface({
  nabi,
  registry,
  root: document.querySelector<HTMLElement>('#editor')!,
  onPasteUrl(url, isSameOrigin, path) {
    if (isSameOrigin && path === '/guide') return 'NABI NOTE'
    return url
  },
})
```

공백뿐이 아닌 문자열을 반환하면 그 문자열을 표시하고, 콜백이 없거나 빈 값·문자열이 아닌 값·오류가 오면 붙여넣은 URL을 그대로 표시합니다. 반환한 문자열은 HTML로 해석하지 않으며 링크 주소는 바꾸지 않습니다.

콜백은 `async` 함수나 Promise도 지원합니다. 응답을 기다리는 동안에는 URL 링크가 바로 들어가며, 나중에 유효한 문구가 도착하면 해당 링크의 표시 문구만 바뀝니다. 그 사이에 링크를 수정하거나 지웠거나, 문서를 새로 불러오거나, surface를 해제했다면 늦게 도착한 결과를 적용하지 않습니다.

## CSS 스타일

일반 링크는 `.nabi-content a`, 첨부 링크는 `.nabi-content a[data-nabi-file]`로 따로 꾸밀 수 있습니다.

```css
.article-body a:not([data-nabi-file]) {
  color: var(--nabi-accent);
  text-decoration-thickness: .08em;
  text-underline-offset: .16em;
}

.article-body a[data-nabi-file] {
  display: inline-flex;
  gap: .35em;
  padding: .25em .55em;
  background: var(--nabi-soft);
}
```

첨부 링크의 `::before`, `::after`는 파일 아이콘과 확장자를 표시하는 데 쓰이므로 `content`를
바꾸거나 지우지 않는 편이 좋습니다.
