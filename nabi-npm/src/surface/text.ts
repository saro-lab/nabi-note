// 문단 글의 평문 뷰 — 되맞추기(diff)·오토포맷이 같은 자로 잰다. 단말(라인·물건)은 '\n' 한 칸이다.
// '\n' 은 글자로 못 들어오는 값이라(브라우저 텍스트 노드의 개행은 되맞추기 전에 정리된다) 충돌이 없다.
import { runsOf, type ElementNode, type Terminal } from '../schema/index.js';

export function holderTextOf(holder: ElementNode, terminal: Terminal): string {
  let out = '';
  for (const run of runsOf(holder, terminal)) out += run.kind === 'text' ? run.text : '\n';
  return out;
}

// 브라우저가 고친 글과 트리 글의 차이 한 구간 — 같으면 null.
export interface TextChange {
  readonly start: number;
  readonly removedEnd: number;
  readonly inserted: string;
}

// 앞뒤 공통을 걷어낸 나머지가 곧 편집이다 — 타이핑·IME 확정은 언제나 이 모양(한 구간)이다.
export function diffPlain(before: string, after: string): TextChange | null {
  if (before === after) return null;
  const max = Math.min(before.length, after.length);
  let p = 0;
  while (p < max && before[p] === after[p]) p += 1;
  let s = 0;
  while (s < max - p && before[before.length - 1 - s] === after[after.length - 1 - s]) s += 1;
  return { start: p, removedEnd: before.length - s, inserted: after.slice(p, after.length - s) };
}
