---
title: CDN 이용하기
description: 빌드 도구 없이 브라우저용 NABI NOTE를 연결하는 예제입니다.
---

<script setup>
import CdnDemo from '../../.vitepress/ui/CdnDemo.vue'
</script>

# CDN 이용하기

패키지를 설치하기 어려운 정적 페이지에서는 브라우저용 번들과 CSS를 CDN으로 불러올 수 있습니다. 아래 예제는 빌드할 때 패키지 버전을 자동으로 읽어 주소를 만들고, 전역 객체 `NabiNote`로 편집기를 조립합니다.

<CdnDemo />

## NABI NOTE에서 확인할 점

- 배포 코드에서는 CSS와 브라우저용 JavaScript에 같은 고정 버전을 사용합니다. `latest`처럼 버전이 없는 주소는 새 버전이 나온 날 동작이 바뀔 수 있습니다.
- 브라우저 번들은 루트 API를 `window.NabiNote`로 제공합니다. `nabi-note/ssr`, `nabi-note/viewer`, `nabi-note/diff`는 별도의 전역 번들로 제공되지 않습니다.
- 예제의 파일 저장과 로컬 히스토리는 사용자의 브라우저 안에서 동작합니다. 서버 저장이나 계정 동기화가 필요하면 `getJson()` 결과를 애플리케이션 API로 전송합니다.
- 업로드를 추가할 때는 `upload` 날개뿐 아니라 실제 전송 함수와 필요한 이미지 또는 링크 날개를 연결합니다. 파일 검증은 업로드 서버가 담당합니다.
- 브라우저 번들은 HTML parser를 내부에 연결합니다. 따라서 `setHtml()`, HTML 파일 열기, HTML 붙여넣기에 별도 parser 옵션이나 비공개 API가 필요하지 않습니다.

CDN은 불러오는 방식만 다릅니다. 저장 형식과 입력 검증은 npm으로 설치했을 때와 같으므로 [기본 사용법](/ko/guide/getting-started)을 함께 확인하세요.
