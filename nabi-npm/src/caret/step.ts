// 걸음(논리) — 좌우·문서 순서 걸음. 위아래 화면 줄 걸음은 표면(surface)의 몫이다.
// Logical stepping (left/right, document order); up/down screen-line stepping belongs to the surface layer.
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

// 정거장 — 캐럿이 설 수 있는 자리의 문서 순서 나열. 'h'는 글 홀더, 'w0'/'w1'은 래퍼문단의 물건 앞/뒤다.
// A stop is a caret-eligible position in document order: 'h' is a text holder, 'w0'/'w1' flank a wrapper's object.
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
      // isHolder 가드가 node.ch 를 never 로 좁히는 걸 피해 여기서 미리 잡아 둔다.
      // Captured here to dodge isHolder's type guard narrowing node.ch to never.
      const kids = node.ch;
      if (isWrapper(node, env)) {
        out.push({ t: 'w0', path });
        walk(kids, path);
        out.push({ t: 'w1', path });
        return;
      }
      if (isHolder(node, env)) {
        out.push({ t: 'h', path });
        return;
      }
      walk(kids, path);
    });
  };
  walk(doc, []);
  return out;
}

function samePath(a: readonly number[], b: readonly number[]): boolean {
  return a.length === b.length && a.every((v, i) => v === b[i]);
}

// 래퍼문단은 오프셋으로 w0/w1 을 갈라, 자리가 앉은 정거장 인덱스를 찾는다.
// For a wrapper paragraph, the offset splits w0 from w1 when locating its stop index.
function stopIndexOf(stops: readonly Stop[], doc: NabiDoc, pos: Position, env: EditEnv): number {
  const holder = nodeAt(doc, pos.path);
  if (!holder) return -1;
  const wrapped = isWrapper(holder, env);
  const want: Stop['t'] = wrapped ? (pos.offset <= 0 ? 'w0' : 'w1') : 'h';
  return stops.findIndex((stop) => stop.t === want && samePath(stop.path, pos.path));
}

// 정거장에 "들어서는" 자리 — 앞으로 걸을 땐 처음, 뒤로 걸을 땐 끝이다.
// The position when "entering" a stop: its start when stepping forward, its end when stepping backward.
function enterStop(stop: Stop, doc: NabiDoc, env: EditEnv, fromBehind: boolean): Position {
  if (stop.t === 'w0') return { path: stop.path, offset: 0 };
  if (stop.t === 'w1') return { path: stop.path, offset: 1 };
  const holder = nodeAt(doc, stop.path);
  const len = holder ? holderLength(holder, env) : 0;
  return { path: stop.path, offset: fromBehind ? len : 0 };
}

export function stepForward(doc: NabiDoc, pos: Position, env: EditEnv): Position {
  const holder = nodeAt(doc, pos.path);
  if (!holder) return pos;
  // 글 홀더 안에서는 코드포인트 한 칸씩(서로게이트 보호), 단말(라인)은 한 칸씩 건넌다.
  // Within a text holder this steps one code point at a time (surrogate-safe); a terminal (line) is one step.
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
  if (next === undefined) return pos;
  return enterStop(next, doc, env, false);
}

export function stepBackward(doc: NabiDoc, pos: Position, env: EditEnv): Position {
  const holder = nodeAt(doc, pos.path);
  if (!holder) return pos;
  if (!isWrapper(holder, env) && pos.offset > 0) {
    const step = stepBefore(runsOf(holder, terminalOf(env)), pos.offset);
    return { path: pos.path, offset: pos.offset - step };
  }
  const stops = collectStops(doc, env);
  const at = stopIndexOf(stops, doc, pos, env);
  if (at <= 0) return pos;
  const prev = stops[at - 1] as Stop;
  return enterStop(prev, doc, env, true);
}

// 문서의 처음/끝 자리 — 걸음과 같은 나열에서 나온다. 빈 문서면 null.
// The document's first/last position, from the same enumeration stepping uses; null for an empty doc.
export function docStart(doc: NabiDoc, env: EditEnv): Position | null {
  const first = collectStops(doc, env)[0];
  return first === undefined ? null : enterStop(first, doc, env, false);
}

export function docEnd(doc: NabiDoc, env: EditEnv): Position | null {
  const stops = collectStops(doc, env);
  const last = stops[stops.length - 1];
  return last === undefined ? null : enterStop(last, doc, env, true);
}
