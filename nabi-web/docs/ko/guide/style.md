---
title: 스타일과 로케일
description: CSS 토큰과 언어 설정으로 편집기와 게시 화면을 자연스럽게 맞춥니다.
---

# 스타일과 로케일

NABI NOTE는 편집 화면과 게시 화면이 같은 문서 모양을 공유하도록 설계되어 있습니다. 먼저 패키지 CSS를 한 번 불러오고, 필요한 색과 글꼴, 여백만 호스트 컨테이너에서 바꾸는 방식이 가장 안정적입니다.

```ts
import 'nabi-note/nabi.css'
```

```css
.article-editor {
  --nabi-accent: #5b4ee8;
  --nabi-content-min-height: 20rem;
  --nabi-font: Inter, system-ui, sans-serif;
  --nabi-sticky-top: 4rem;
}
```

## 바꿔 쓰기 좋은 값

색은 `--nabi-fg`, `--nabi-bg`, `--nabi-soft`, `--nabi-line`, `--nabi-accent`로 조정합니다. 모서리와 떠 있는 패널의 느낌은 `--nabi-radius`, `--nabi-shadow`로, 본문 높이와 글꼴은 `--nabi-content-min-height`, `--nabi-font`, `--nabi-font-serif`, `--nabi-font-mono`, `--nabi-font-cursive`로 바꿀 수 있습니다.

고정 툴바 아래의 간격은 `--nabi-sticky-top`, 미리보기 폭은 `--nabi-preview-width`, 터치 기기 입력 크기는 `--nabi-touch-font-size`가 맡습니다. 전체 토큰을 다시 선언하기보다 필요한 값만 덮어쓰면 패키지의 다크 모드와 wing 스타일도 함께 유지됩니다.

## 라이트와 다크 모드

기본 모드는 라이트입니다. 페이지의 `html` 또는 `body`에 `.dark` 클래스를 두면 다크 모드가 적용됩니다. 특정 편집기나 diff 화면만 고정하려면 `.nabi` 또는 해당 root에 `data-nabi-theme="light"` 또는 `data-nabi-theme="dark"`를 지정하세요.

패키지는 운영체제의 `prefers-color-scheme`을 자동으로 따르지 않습니다. 사이트가 이미 가진 테마 상태를 호스트에서 NABI NOTE에 전달하는 방식입니다.

## 언어와 방향

`locale`은 툴바 이름, 안내문, 빈 편집기의 placeholder에 쓰입니다. 지원하지 않는 언어 태그는 영어로 정리됩니다. 아랍어와 우르두어처럼 오른쪽에서 왼쪽으로 쓰는 언어는 `locale`을 전달하면 편집 영역의 쓰기 방향도 함께 맞춥니다.

```ts
mountSurface({ nabi, registry, root: content, locale: 'ko' })
```

빈 편집기의 안내문을 직접 정하려면 `placeholder`를 전달합니다. 빈 문자열을 주면 안내문을 숨길 수 있습니다.

```ts
mountSurface({ nabi, registry, root: content, locale: 'ko', placeholder: '내용을 입력하세요.' })
```

## 유의할 점

편집 DOM의 구조를 선택자로 밀어 움직이는 방식은 피하세요. `[data-key]` 편집 노드의 `display`나 `white-space`를 바꾸거나, 편집 텍스트 안에 생성 콘텐츠를 넣고, 객체 wrapper의 포인터 동작을 막으면 캐럿과 입력 매핑이 흔들릴 수 있습니다.

드롭캡은 게시 화면과 편집 화면에서 구현 방식이 다릅니다. 편집 중에는 실제 표시용 span을 사용하므로 `.nabi-editing` 안에서 `::first-letter`를 추가하지 않는 편이 안전합니다. 자세한 이유는 [입력과 캐럿](/ko/guide/input)에서 확인할 수 있습니다.
