---
title: 날개 알아보기
description: 문서에 필요한 기능을 날개로 고르고 조립하는 방법을 설명합니다.
---

# 날개 알아보기

날개(wing)는 툴바 버튼 하나보다 넓은 기능 단위입니다. 문서에 저장할 어휘, 명령, HTML 변환, 입력 규칙, 화면 선언을 한곳에 묶습니다. 편집기에 등록한 날개만 해당 문서 구조와 동작을 사용할 수 있습니다.

```ts
import { createNabiWith, wings } from 'nabi-note'

const selected = wings()
  .allBasic()
  .drop('youtube')
  .use('upload')

const { nabi, registry } = createNabiWith(selected)
```

`allBasic()`은 별도의 호스트 연결 없이 동작하는 공식 날개를 고릅니다. `use()`로 기능을 더하고 `drop()`으로 뺄 수 있습니다. 필요한 의존성을 끊거나 이름과 옵션을 잘못 쓰면 조립 단계에서 바로 오류가 납니다. 아주 작은 번들이 필요하다면 `boldWing`, `imageWing`처럼 필요한 날개만 배열로 직접 넘길 수도 있습니다.

## 인라인 날개

인라인 날개는 문장 안에서 선택한 글자에 적용됩니다. 굵게, 기울임, 밑줄, 취소선, 첨자, 링크, 형광펜, 글자색이 여기에 속합니다. 각 문서에는 직접 입력해 볼 수 있는 예제와 해당 날개를 선택하는 코드가 있습니다.

[굵게](/ko/wing/inline/bold) · [기울임](/ko/wing/inline/italic) · [밑줄](/ko/wing/inline/underline) · [취소선](/ko/wing/inline/strikethrough) · [윗첨자](/ko/wing/inline/superscript) · [아랫첨자](/ko/wing/inline/subscript) · [링크](/ko/wing/inline/link) · [형광펜](/ko/wing/inline/highlight) · [글자색](/ko/wing/inline/text-color)

## 블록 날개

블록 날개는 문서의 구조를 만듭니다. 제목과 목록처럼 입력 규칙으로 시작할 수 있는 기능도 있고, 표와 이미지처럼 툴바에서 삽입하는 객체도 있습니다.

[제목](/ko/wing/block/heading) · [글머리 목록](/ko/wing/block/bullet-list) · [번호 목록](/ko/wing/block/ordered-list) · [체크리스트](/ko/wing/block/task-list) · [표](/ko/wing/block/table) · [이미지](/ko/wing/block/image) · [유튜브](/ko/wing/block/youtube) · [코드](/ko/wing/block/code) · [접기](/ko/wing/block/details) · [인용](/ko/wing/block/quote) · [구분선](/ko/wing/block/divider)

## 도구 날개

도구 날개는 문단의 모양을 바꾸거나 편집기 바깥 기능과 연결합니다. 정렬과 드롭캡은 문단 속성이고, 서체와 글자 크기는 선택한 글자에 적용되는 마크입니다. 파일 저장, 열기, 로컬 히스토리, 업로드, diff는 날개를 선택한 뒤 해당 mount를 함께 연결해야 합니다.

[정렬](/ko/wing/etc/align) · [드롭캡](/ko/wing/etc/dropcap) · [서체](/ko/wing/etc/typeface) · [글자 크기](/ko/wing/etc/font-size) · [서식 지우기](/ko/wing/etc/clear-format) · [파일 업로드](/ko/wing/etc/upload)

파일 저장과 열기, 로컬 히스토리는 [입출력](/ko/guide/storage)에서 실제 연결 예제로 설명합니다. diff 날개는 [SSR·viewer·diff](/ko/guide/rendering)에서 확인할 수 있습니다.

공식 날개에 없는 문서 어휘가 필요하다면 [커스텀 wing](/ko/guide/extend)에서 가장 작은 확장 방법부터 시작하세요.
