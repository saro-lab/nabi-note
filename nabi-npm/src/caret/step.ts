// 걸음(논리) — 문단 경계·래퍼문단 0/1 출입·라인 건너기는 트리가 걷는다 (③).
// 문단 "안"의 화면 줄 걸음(상하)은 표면(09)의 몫이고, 여기는 좌우·문서 순서 걸음이다.
// 나열 규칙: … 앞 문단 끝 → 래퍼.0 → (물건 속 홀더들) → 래퍼.1 → 다음 문단 처음 …
// 문단 사이 자리는 없다. 걸음이 곧 캐럿 자리의 전수 나열이다.
import { isElement, isWrapper, runsOf, type NabiDoc, type NabiNode } from '../schema/index.js';
import {
  holderLength,
  isHolder,
  nodeAt,
  stepAfter,
  stepBefore,
  terminalOf,
  type EditEnv,
  type Position,
} from '../doc/index.js';

// 정거장 — 캐럿이 설 수 있는 자리의 문서 순서 나열.
// 'h' 는 글 홀더(오프셋 0..len), 'w0'/'w1' 은 래퍼문단의 물건 앞/뒤 한 칸씩이다.
interface Stop {
  readonly t: 'h' | 'w0' | 'w1';
  readonly path: readonly number[];
}

function collectStops(doc: NabiDoc, env: EditEnv): Stop[] {
  const out: Stop[] = [];
  const walk = (nodes: readonly NabiNode[], base: readonly number[]): void => {
    nodes.forEach((node, i) => {
      if (!isElement(node)) return;
      const path = [...base, i];
      const kids = node.ch; // isHolder 가드의 좁힘(never)을 피해 미리 잡아 둔다.
      if (isWrapper(node, env)) {
        out.push({ t: 'w0', path });
        // 물건 속의 홀더들(표의 칸, 접기의 제목·문단…)은 앞(0)과 뒤(1) 사이에 선다.
        walk(kids, path);
        out.push({ t: 'w1', path });
        return;
      }
      if (isHolder(node, env)) {
        out.push({ t: 'h', path });
        return; // 글 홀더 속에는 홀더가 없다.
      }
      walk(kids, path); // 컨테이너(표·행·칸·리스트·접기)는 속으로 내려간다.
    });
  };
  walk(doc, []);
  return out;
}

function samePath(a: readonly number[], b: readonly number[]): boolean {
  return a.length === b.length && a.every((v, i) => v === b[i]);
}

// 자리가 앉은 정거장 인덱스 — 래퍼문단은 오프셋으로 w0/w1 을 가른다.
function stopIndexOf(stops: readonly Stop[], doc: NabiDoc, pos: Position, env: EditEnv): number {
  const holder = nodeAt(doc, pos.path);
  if (!holder) return -1;
  const wrapped = isWrapper(holder, env);
  const want: Stop['t'] = wrapped ? (pos.offset <= 0 ? 'w0' : 'w1') : 'h';
  return stops.findIndex((stop) => stop.t === want && samePath(stop.path, pos.path));
}

// 정거장에 "들어서는" 자리 — 앞으로 걸을 땐 처음, 뒤로 걸을 땐 끝이다.
function enterStop(stop: Stop, doc: NabiDoc, env: EditEnv, fromBehind: boolean): Position {
  if (stop.t === 'w0') return { path: stop.path, offset: 0 };
  if (stop.t === 'w1') return { path: stop.path, offset: 1 };
  const holder = nodeAt(doc, stop.path);
  const len = holder ? holderLength(holder, env) : 0;
  return { path: stop.path, offset: fromBehind ? len : 0 };
}

// 한 걸음 앞으로 — 문서 끝이면 제자리다.
export function stepForward(doc: NabiDoc, pos: Position, env: EditEnv): Position {
  const holder = nodeAt(doc, pos.path);
  if (!holder) return pos;
  // 글 홀더 안 — 코드포인트 한 칸(서로게이트 보호), 단말(라인)은 한 칸.
  if (!isWrapper(holder, env)) {
    const len = holderLength(holder, env);
    if (pos.offset < len) {
      const step = stepAfter(runsOf(holder, terminalOf(env)), pos.offset);
      return { path: pos.path, offset: pos.offset + step };
    }
  }
  const stops = collectStops(doc, env);
  const at = stopIndexOf(stops, doc, pos, env);
  if (at < 0) return pos;
  const next = stops[at + 1];
  if (next === undefined) return pos; // 문서 끝
  return enterStop(next, doc, env, false);
}

// 한 걸음 뒤로 — 문서 처음이면 제자리다.
export function stepBackward(doc: NabiDoc, pos: Position, env: EditEnv): Position {
  const holder = nodeAt(doc, pos.path);
  if (!holder) return pos;
  if (!isWrapper(holder, env) && pos.offset > 0) {
    const step = stepBefore(runsOf(holder, terminalOf(env)), pos.offset);
    return { path: pos.path, offset: pos.offset - step };
  }
  const stops = collectStops(doc, env);
  const at = stopIndexOf(stops, doc, pos, env);
  if (at <= 0) return pos; // 문서 처음(또는 어긋난 자리)
  const prev = stops[at - 1] as Stop;
  return enterStop(prev, doc, env, true);
}

// 문서의 처음/끝 자리 — 걸음과 같은 나열에서 나온다. 빈 문서면 null.
export function docStart(doc: NabiDoc, env: EditEnv): Position | null {
  const first = collectStops(doc, env)[0];
  return first === undefined ? null : enterStop(first, doc, env, false);
}

export function docEnd(doc: NabiDoc, env: EditEnv): Position | null {
  const stops = collectStops(doc, env);
  const last = stops[stops.length - 1];
  return last === undefined ? null : enterStop(last, doc, env, true);
}
