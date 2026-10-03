# 변경 이력

이 프로젝트의 주요 변경 사항을 기록합니다.

[Keep a Changelog](https://keepachangelog.com/ko/1.1.0/) 형식과 [시맨틱 버저닝](https://semver.org/lang/ko/)을 따릅니다.
날짜는 한국 표준시(KST)를 기준으로 합니다.

## [Unreleased]

## [1.1.2] - 2026-10-03

### Fixed

- 문단 앞 공백이 HTML 저장·불러오기와 편집 화면에서 유지되도록 수정했습니다. 제목·중첩 서식·인용문 안의 문단과 드롭캡 앞 공백에도 적용됩니다.

## [1.1.1] - 2026-09-28

### Changed

- 편집기와 웹 UI의 안내·오류 메시지를 정중한 표현으로 다듬고, 모든 지원 언어의 저장소 접근 제한·업로드 대기·입력 안내에 반영했습니다.
- 날개 등록, 빌더 옵션, 값 목록 검증에 사용하는 한국어 오류 메시지를 정중하고 명확한 표현으로 다듬었습니다.

## [1.1.0] - 2026-09-26

### Added

- `createLocale()`로 편집기와 UI의 언어를 실행 중에 함께 변경할 수 있습니다. 본문·실행 취소 및 다시 실행 이력·커서·저장 상태·업로드를 유지하며, 데모의 언어 선택에도 같은 방식을 적용했습니다.
- 모바일 모드의 전환 기준을 CSS 변수 `--nabi-mobile-breakpoint`로 바꿀 수 있습니다.
- CSS 변수로 날개와 미리보기·전체화면·패널·비교·표 정렬의 기본 아이콘을 SVG·WebP·PNG 파일로 교체할 수 있습니다. 기본 아이콘 파일과 밝은/어두운 테마를 함께 제공합니다.
- 미리보기와 전체화면 버튼에 각각 `showPreview`·`showFullscreen` 표시 옵션을 추가했습니다. SSR과 브라우저에서 같은 설정을 사용할 수 있습니다.
- 웹 가이드에 아이콘 테마 문서를 추가하고 공개 AI 문서를 갱신했습니다.

### Changed

- 모바일 모드의 기본 전환 기준을 `40rem` 이하에서 `36rem` 미만으로 바꾸고, 툴바·패널·표 선택 격자에 같은 기준을 적용했습니다.

## [1.0.0] - 2026-08-31

### Added

- 정식 버전을 출시했습니다.

[Unreleased]: https://github.com/saro-lab/nabi-note
[1.1.2]: https://www.npmjs.com/package/nabi-note/v/1.1.2
[1.1.1]: https://www.npmjs.com/package/nabi-note/v/1.1.1
[1.1.0]: https://www.npmjs.com/package/nabi-note/v/1.1.0
[1.0.0]: https://www.npmjs.com/package/nabi-note/v/1.0.0
