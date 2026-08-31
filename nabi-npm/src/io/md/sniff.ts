// 느슨해도 된다 — 오탐은 붙여넣기 판에서 사람이 거르고, 놓치면 md 후보만 안 뜨고 글은 그대로 붙는다.
// Loose is fine — a false positive gets filtered by the person at the paste panel, a miss just skips the md candidate.
const SIGNALS: readonly RegExp[] = [
  /^ {0,3}#{1,6}[ \t]/m, // 제목
  /^ {0,3}>[ \t]/m, // 인용
  /^ {0,3}[-*+][ \t]/m, // 글머리·체크 목록
  /^ {0,3}\d{1,9}[.)][ \t]/m, // 번호 목록
  /^ {0,3}(?:```|~~~)/m, // 코드 울타리
  /^ {0,3}(?:-{3,}|\*{3,}|_{3,})[ \t]*$/m, // 구분선
  /^ {0,3}\|.*\n {0,3}\|?[ \t]*:?-+/m, // 표 + 구분선
  /!\[[^\]\n]*\]\([^()\s]+\)/, // 그림
  /\[[^\]\n]+\]\([^()\s]+\)/, // 링크
  /\*\*[^*\n]+\*\*/, // 굵게
  /~~[^~\n]+~~/, // 취소선
];

export function smellsMarkdown(text: string): boolean {
  return SIGNALS.some((signal) => signal.test(text));
}
