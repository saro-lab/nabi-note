// 기억은 문서가 한다 — 모듈 전역 집합이 아니다. 붙은 시트의 지문이 <style> 표식으로 남아, 같은 문서에 에디터가 둘 서도 두 번 안 붙는다.
// Tracking lives on the document, not a module-level set — the attached sheet's fingerprint stays as a <style> marker, so two editors on one document never double-inject.
import { sheetKey } from '../style/index.js';
import { acquireStyleSheet, DisposerStack } from '../lifecycle.js';

export * from '../style/index.js';

const MARK = 'data-nabi-sheet';

// 이미 붙은 지문은 건너뛴다. 반환된 함수는 이 호출이 새로 붙인 것만 뗀다.
// Sheets already fingerprinted are skipped. The returned disposer only removes what this call newly attached.
export function injectSheets(owner: Document, sheets: readonly string[]): () => void {
  const releases = new DisposerStack();
  for (const text of new Set(sheets)) {
    releases.add(acquireStyleSheet(owner, text, { name: MARK, value: sheetKey(text) }));
  }
  return () => releases.dispose();
}
