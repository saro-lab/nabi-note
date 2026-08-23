---
title: 하이퍼링크
---

# 하이퍼링크

## 설명

`linkWing`(식별자 `a`)은 하이퍼링크(`<a href>`)를 처리하는 인라인 마크 날개입니다.

툴바 버튼을 클릭하면 링크 URL 입력 팝업이 표시됩니다. `http:`, `https:`로 시작하는 안전한 URL만 입력할 수 있으며, `javascript:` 등 악성 스크립트 URL은 XSS 보안 정책에 따라 자동으로 필터링됩니다.

링크 입력 팝업에서는 **링크 URL**과 **표시 텍스트**를 함께 입력할 수 있습니다. 텍스트 필드를 비워두면 URL 자체가 표시 텍스트로 사용됩니다.

## 컨텍스트 툴바에서 링크 수정

커서가 이미 생성된 링크 내부에 위치하면 동적 컨텍스트 툴바에 인라인 텍스트 입력란이 표시되어 즉시 수정할 수 있습니다:

| 입력 필드 | 설명 |
|---|---|
| 링크 주소 (`href`) | 링크의 대상 URL만 수정합니다 (표시 텍스트는 유지) |
| 표시 이름 | 본문에 노출되는 텍스트만 수정합니다 (URL은 유지) |

## 사용 예시

```ts
import { createNabiWith, mountSurface, mountToolbar, mountContextToolbar, linkWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

const { nabi, registry } = createNabiWith([linkWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })
mountContextToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#context')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## 데모

<WingDemo path="/wing/inline/link" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
