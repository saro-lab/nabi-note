// 조립이 낸 HTML 글자열 위에서 글자 강조를 얹는다 — DOM 없이 돈다.
// Overlays character highlights onto assembled HTML strings, with no DOM involved.
// 읽는 대상이 우리 조립(render.ts)이 낸 HTML 뿐이라 태그는 항상 `<`~`>` 한 구간이고, 오프셋 단위는 서로게이트 안전한 코드포인트다.
// Since the only input is our own render.ts output, a tag is always one `<`~`>` span, and offsets are surrogate-safe code points.
import type { EditRun } from './myers.js';

export interface CharRange {
  readonly start: number;
  readonly end: number;
}

const NAMED: Readonly<Record<string, string>> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
};

// 텍스트 조각 맨 앞의 토큰 하나 — 엔티티 한 덩이 또는 코드포인트 하나(가운데를 가를 수 없다).
// The first token of a text chunk: one whole entity or one code point, never split down the middle.
function tokenAt(source: string, i: number): { readonly src: string; readonly text: string } {
  if (source[i] === '&') {
    const m = /^&(#[xX]?[0-9a-fA-F]+|[a-zA-Z]+);/.exec(source.slice(i, i + 12));
    if (m) {
      const body = m[1] as string;
      if (body.startsWith('#')) {
        const hex = body[1] === 'x' || body[1] === 'X';
        const code = Number.parseInt(hex ? body.slice(2) : body.slice(1), hex ? 16 : 10);
        if (Number.isFinite(code) && code > 0 && code <= 0x10ffff) {
          return { src: m[0], text: String.fromCodePoint(code) };
        }
      } else if (NAMED[body] !== undefined) {
        return { src: m[0], text: NAMED[body] as string };
      }
    }
  }
  const cp = source.codePointAt(i) as number;
  const src = String.fromCodePoint(cp);
  return { src, text: src };
}

// 태그·텍스트 구간을 차례로 부른다. 텍스트는 토큰(코드포인트) 단위로 온다.
// Calls back over tag and text spans in order; text arrives token by token (code point at a time).
function walk(html: string, onTag: (src: string) => void, onToken: (src: string, text: string) => void): void {
  let i = 0;
  while (i < html.length) {
    if (html[i] === '<') {
      const end = html.indexOf('>', i);
      if (end < 0) {
        onTag(html.slice(i));
        return;
      }
      const tag = html.slice(i, end + 1);
      // A real line break is part of the compared text, unlike markup tags.
      // Keep its source intact so painting can wrap it without changing output.
      if (/^<br(?:\s[^>]*)?\s*\/?\s*>$/i.test(tag)) onToken(tag, '\n');
      else onTag(tag);
      i = end + 1;
      continue;
    }
    const token = tokenAt(html, i);
    onToken(token.src, token.text);
    i += token.src.length;
  }
}

// Nabi semantic text extraction from assembled HTML; unlike DOM textContent,
// this deliberately represents a real br as a newline token.
export function htmlText(html: string): string {
  let out = '';
  walk(
    html,
    () => {},
    (_src, text) => {
      out += text;
    },
  );
  return out;
}

// 글자마다 자신을 감싼 HTML 껍데기의 지문을 낸다. 최상위 블록 태그는 제외한다 — 행 배경이 이미 그 변경을 나타내므로, 강조는 실제 서식이 달라진 글자만 가리켜야 한다.
// Fingerprints each character's wrapping HTML shells, excluding the top-level block tag since the row background already marks that change — highlighting should point only at characters whose formatting actually differs.
export function htmlTextFormats(html: string): readonly string[] {
  const formats: string[] = [];
  const stack: string[] = [];
  let format = '';
  const refresh = (): void => {
    format = stack.length > 1 ? stack.slice(1).join('\u001f') : '';
  };
  walk(
    html,
    (src) => {
      if (/^<\/[a-z][a-z0-9]*>$/.test(src)) {
        stack.pop();
        refresh();
        return;
      }
      if (!/^<[a-z][a-z0-9]*(?:\s|>|\/)/.test(src) || src.endsWith('/>')) return;
      stack.push(src);
      refresh();
    },
    (_src, text) => {
      for (const _codePoint of text) formats.push(format);
    },
  );
  return formats;
}

// 코드포인트 구간들에 span 을 입힌다. 구간이 엘리먼트 경계를 걸치면 경계마다 끊어 입으므로 결과는 언제나 올바른 중첩이다.
// Wraps code-point ranges in spans; a range crossing an element boundary is split at that boundary, so nesting always stays valid.
export function paintHtml(html: string, ranges: readonly CharRange[], className: string): string {
  if (ranges.length === 0) return html;
  const open = `<span class="${className}">`;
  const close = '</span>';
  let out = '';
  let pos = 0; // 코드포인트 진행 위치
  let r = 0;
  let painting = false;

  const inside = (): boolean => {
    while (r < ranges.length && pos >= (ranges[r] as CharRange).end) r += 1;
    const range = ranges[r];
    return range !== undefined && pos >= range.start && pos < range.end;
  };
  const setPainting = (want: boolean): void => {
    if (want === painting) return;
    out += want ? open : close;
    painting = want;
  };

  walk(
    html,
    (src) => {
      // 태그를 span 속에 가두지 않는다 — 경계에서 닫고 다시 연다.
      // Tags are never trapped inside a span; painting closes at the boundary and reopens after.
      setPainting(false);
      out += src;
    },
    (src, text) => {
      setPainting(inside());
      out += src;
      pos += [...text].length;
    },
  );
  setPainting(false);
  return out;
}

// del/ins 편집 열 → 양쪽의 바뀐 구간(코드포인트 오프셋).
// Converts del/ins edit runs into changed ranges (code-point offsets) on each side.
export function changedRanges(runs: readonly EditRun[]): { readonly del: CharRange[]; readonly ins: CharRange[] } {
  const del: CharRange[] = [];
  const ins: CharRange[] = [];
  for (const run of runs) {
    if (run.op === 'del') del.push({ start: run.a, end: run.a + run.n });
    if (run.op === 'ins') ins.push({ start: run.b, end: run.b + run.n });
  }
  return { del, ins };
}
