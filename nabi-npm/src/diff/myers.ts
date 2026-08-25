// Myers O(ND) — 의존성 0 규칙 때문에 직접 구현한다 (260825_001 4절 2번).
// 글자 열에도 블록 열에도 같은 걸음이 돈다 — 토큰 배열 하나와 같음 판정 하나가 입력의 전부다.

export interface EditRun {
  readonly op: 'eq' | 'del' | 'ins';
  // a 쪽 시작(eq·del), b 쪽 시작(eq·ins) — 안 쓰는 쪽은 그 시점의 진행 위치다.
  readonly a: number;
  readonly b: number;
  readonly n: number;
}

// 경로 길이 상한 — 이 너머는 "거의 다 다른 두 입력"이라 정밀한 경로의 값이 없다.
// 상한에 걸리면 가운데를 통째 del+ins 로 답한다(공통 앞뒤는 이미 벗겨져 있다).
const MAX_D = 1024;

function runsOf(ops: readonly ('eq' | 'del' | 'ins')[]): EditRun[] {
  const out: EditRun[] = [];
  let a = 0;
  let b = 0;
  let i = 0;
  while (i < ops.length) {
    const op = ops[i] as 'eq' | 'del' | 'ins';
    let n = 0;
    while (i < ops.length && ops[i] === op) {
      n += 1;
      i += 1;
    }
    out.push({ op, a, b, n });
    if (op !== 'ins') a += n;
    if (op !== 'del') b += n;
  }
  return out;
}

export function diffSeq<T>(
  rawA: readonly T[],
  rawB: readonly T[],
  same: (x: T, y: T) => boolean = (x, y) => x === y,
): readonly EditRun[] {
  // 공통 앞·뒤를 먼저 벗긴다 — 문서 비교의 흔한 모양(거의 같은 두 판)이 여기서 다 끝난다.
  let head = 0;
  while (head < rawA.length && head < rawB.length && same(rawA[head] as T, rawB[head] as T)) head += 1;
  let tail = 0;
  while (
    tail < rawA.length - head &&
    tail < rawB.length - head &&
    same(rawA[rawA.length - 1 - tail] as T, rawB[rawB.length - 1 - tail] as T)
  ) {
    tail += 1;
  }
  const a = rawA.slice(head, rawA.length - tail);
  const b = rawB.slice(head, rawB.length - tail);
  const n = a.length;
  const m = b.length;

  const ops: ('eq' | 'del' | 'ins')[] = [];
  for (let i = 0; i < head; i += 1) ops.push('eq');

  if (n + m > 0) {
    // spread push 는 인자 상한에 걸릴 수 있는 크기다 — 하나씩 잇는다.
    for (const op of middleOps(a, b, same)) ops.push(op);
  }

  for (let i = 0; i < tail; i += 1) ops.push('eq');
  return runsOf(ops);
}

function middleOps<T>(a: readonly T[], b: readonly T[], same: (x: T, y: T) => boolean): ('eq' | 'del' | 'ins')[] {
  const n = a.length;
  const m = b.length;
  if (n === 0) return new Array<'ins'>(m).fill('ins');
  if (m === 0) return new Array<'del'>(n).fill('del');

  const max = Math.min(n + m, MAX_D);
  const offset = n + m;
  const v = new Int32Array(2 * (n + m) + 1);
  // 각 d 를 돌기 전의 v 를 남긴다 — 되짚기가 d-1 상태의 v[k±1] 을 본다.
  const trace: Int32Array[] = [];
  let found = -1;

  for (let d = 0; d <= max && found < 0; d += 1) {
    trace.push(v.slice(Math.max(0, offset - d - 1), offset + d + 2));
    for (let k = -d; k <= d; k += 2) {
      let x: number;
      if (k === -d || (k !== d && (v[offset + k - 1] as number) < (v[offset + k + 1] as number))) {
        x = v[offset + k + 1] as number;
      } else {
        x = (v[offset + k - 1] as number) + 1;
      }
      let y = x - k;
      while (x < n && y < m && same(a[x] as T, b[y] as T)) {
        x += 1;
        y += 1;
      }
      v[offset + k] = x;
      if (x >= n && y >= m) {
        found = d;
        break;
      }
    }
  }

  if (found < 0) {
    // 상한 초과 — 가운데 전체가 바뀐 것으로 답한다.
    return [...new Array<'del'>(n).fill('del'), ...new Array<'ins'>(m).fill('ins')];
  }

  const reversed: ('eq' | 'del' | 'ins')[] = [];
  let x = n;
  let y = m;
  for (let d = found; d >= 1; d -= 1) {
    const snap = trace[d] as Int32Array;
    const base = Math.max(0, offset - d - 1);
    const at = (k: number): number => snap[offset + k - base] as number;
    const k = x - y;
    const down = k === -d || (k !== d && at(k - 1) < at(k + 1));
    const prevK = down ? k + 1 : k - 1;
    const prevX = at(prevK);
    const prevY = prevX - prevK;
    const stepX = down ? prevX : prevX + 1;
    while (x > stepX) {
      reversed.push('eq');
      x -= 1;
      y -= 1;
    }
    reversed.push(down ? 'ins' : 'del');
    x = prevX;
    y = prevY;
  }
  while (x > 0) {
    reversed.push('eq');
    x -= 1;
    y -= 1;
  }
  return reversed.reverse();
}
