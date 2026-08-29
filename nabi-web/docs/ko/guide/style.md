---
title: 스타일·로케일
description: 패키지 CSS의 토큰, 다크 모드, 편집 surface의 안전한 범위를 정합니다.
---

# 스타일·로케일

가장 안전한 방법은 패키지 CSS를 한 번 로드하고, 호스트 컨테이너에서 `--nabi-*` 토큰만 바꾸는 것입니다. 편집기 내부 구조를 선택자로 밀어 움직이면 캐럿·IME·클립보드의 전제가 깨질 수 있습니다.

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

## 자주 바꾸는 토큰

| 범주 | 토큰 |
| --- | --- |
| 색 | `--nabi-fg`, `--nabi-bg`, `--nabi-soft`, `--nabi-line`, `--nabi-accent` |
| 레이아웃 | `--nabi-radius`, `--nabi-shadow`, `--nabi-content-min-height` |
| 글꼴 | `--nabi-font`, `--nabi-font-serif`, `--nabi-font-mono`, `--nabi-font-cursive` |
| 모바일·고정 도구 | `--nabi-touch-font-size`, `--nabi-sticky-top`, `--nabi-preview-width` |

## 라이트와 다크

페이지의 `html` 또는 `body`에 `.dark`를 두면 다크 모드가 됩니다. 한 편집기만 고정하려면 `data-nabi-theme="light"` 또는 `data-nabi-theme="dark"`를 사용하세요. 패키지는 시스템 색상 설정을 자동으로 따르지 않고, 호스트가 현재 테마를 결정합니다.

## 로케일

`locale` 옵션은 툴바·안내문·placeholder에 쓰입니다. 지원하지 않는 언어 태그는 `en`으로 정규화됩니다. RTL은 `ar`, `ur`입니다.

```ts
const surface = mountSurface({ nabi, registry, root, locale: 'ko' })
```

## 안전하지 않은 재정의

- 편집 중인 `[data-key]` 노드의 `display`, `white-space`와 생성 콘텐츠를 바꾸지 않습니다.
- `.nabi-editing` 안의 드롭캡에 `::first-letter`를 추가하지 않습니다.
- 객체 wrapper의 pointer 동작을 차단하지 않습니다.
- 조합 중에는 노드를 새로 만들거나 `innerHTML`을 교체하지 않습니다.

이런 스타일은 보기만 바꾸는 것이 아니라 DOM과 선택 위치의 대응을 바꿉니다. 드롭캡은 편집 중 실제 표시 span을 사용하므로 별도 pseudo-element를 추가하지 마세요.
