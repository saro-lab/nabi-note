---
title: CDN·빌드 없는 시작
description: 패키지 설치 없이 NABI NOTE를 연결할 때 확인할 경계입니다.
---

# CDN·빌드 없는 시작

번들러가 없는 페이지에서도 같은 원칙을 지킵니다. CSS를 먼저 읽고, 브라우저용 엔트리로 편집기를 조립하며, 저장은 NABI TREE JSON으로 합니다. 배포 중인 패키지의 정확한 CDN URL과 버전은 릴리스 안내를 사용하세요. 예시에서 `@VERSION`은 고정할 실제 버전으로 바꾸어야 합니다.

```html
<link rel="stylesheet" href="https://cdn.example/npm/nabi-note@VERSION/nabi.css">
<div class="nabi"><div class="nabi-content"></div></div>

<script type="module">
  import { createNabiWith, mountSurface, parseNodes, wings }
    from 'https://cdn.example/npm/nabi-note@VERSION/+esm'

  const { nabi, registry } = createNabiWith(wings().allBasic().build(), {
    parseHtml: parseNodes,
  })
  mountSurface({ nabi, registry, root: document.querySelector('.nabi-content') })
</script>
```

## 운영할 때 유의할 점

| 항목 | 권장 |
| --- | --- |
| 버전 | `latest` 대신 확인한 고정 버전을 사용합니다. |
| CSS | JavaScript보다 먼저 로드합니다. |
| CSP | CDN과 필요한 이미지·업로드 도메인만 허용합니다. |
| 저장 | `getJson()` 결과를 서버에 저장하고 HTML은 다시 생성합니다. |
| 업로드 | 브라우저가 아니라 서버에서 파일과 권한을 검증합니다. |

CDN은 설치 방법만 다를 뿐, `javascript:` URL이나 신뢰하지 않는 HTML을 그대로 화면에 넣어도 된다는 뜻은 아닙니다. 입력과 출력의 규칙은 [NABI TREE와 데이터](/ko/guide/document)를 따르세요.
