---
layout: home
title: NABI NOTE
description: 저장 가능한 문서 모델을 가진 WYSIWYG 에디터
---

<script setup>
import EditorDemo from '../.vitepress/ui/EditorDemo.vue'
</script>

# NABI NOTE

저장 가능한 NABI TREE를 중심으로, 편집·게시·서버 렌더링을 같은 문서 모델에서 이어 주는 WYSIWYG 에디터입니다.

<div class="grid gap-3 sm:grid-cols-2 not-md:mt-6">
  <a class="g-glass rd-box p-5 g-link-hover" href="/ko/guide/getting-started"><strong>처음 시작하기</strong><br><span>설치부터 저장 가능한 첫 편집기까지</span></a>
  <a class="g-glass rd-box p-5 g-link-hover" href="/ko/guide/assemble"><strong>에디터 조립</strong><br><span>surface·toolbar·파일 mount를 책임별로 연결</span></a>
  <a class="g-glass rd-box p-5 g-link-hover" href="/ko/guide/features"><strong>기능 고르기</strong><br><span>필요한 wing을 실제 과업 기준으로 선택</span></a>
  <a class="g-glass rd-box p-5 g-link-hover" href="/ko/guide/rendering"><strong>SSR과 게시</strong><br><span>편집기를 싣지 않고도 읽는 페이지 만들기</span></a>
  <a class="g-glass rd-box p-5 g-link-hover sm:col-span-2" href="/ko/intro/vibe-coding"><strong>AI 바이브 코딩</strong><br><span>코딩 에이전트가 현재 API를 정확하게 읽고 구현하도록 안내</span></a>
</div>

## 직접 써 보기

<EditorDemo />

## 문서 읽는 순서

1. [빠른 시작](/ko/guide/getting-started)에서 JSON 원본과 기본 조립을 익힙니다.
2. [에디터 조립](/ko/guide/assemble)과 [저장·입출력](/ko/guide/storage)으로 실제 화면을 완성합니다.
3. [입력·IME·캐럿](/ko/guide/input), [스타일·로케일](/ko/guide/style)에서 모바일과 WYSIWYG 경계를 확인합니다.
4. [SSR·viewer·diff](/ko/guide/rendering), [커스텀 wing](/ko/guide/extend)으로 배포와 확장을 다룹니다.
5. AI와 함께 구현한다면 [AI 바이브 코딩](/ko/intro/vibe-coding)에서 문서를 전달하는 방법과 검토 기준을 확인합니다.
