// 층 계약을 사람이 아니라 기계로 지킨다 — src를 정적으로 훑어 import 방향·DOM 어휘·최상위 상태를 검사한다.
// Enforces layer contracts by machine, not review — statically scans src for import direction, DOM vocabulary, and top-level state.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { done, ok } from './net.js';

const SRC = fileURLToPath(new URL('../src', import.meta.url));

// 아래가 위를 모르는 순서다 — code·style은 서로 다른 두 상위 층에서 함께 쓰이기 때문에 맨 아래에 고정했다.
// Lower layers stay unaware of upper ones — code and style sit lowest since two unrelated upper layers each depend on them.
const ORDER = [
  'style',
  'locale',
  'code',
  'schema',
  'doc',
  'caret',
  'html',
  'io',
  'editor',
  'wing',
  'wings',
  'surface',
  'ui',
  'viewer',
];

// 예외 천장 없음 — html은 schema만 딛으면 되고, 과잉 허용이던 옛 wing 천장은 걷었다.
// No exception ceilings — html only needs schema below it; the old, overly permissive wing ceiling was removed.
const CEILING: Record<string, string> = {};

// 모듈 최상위 가변 상태를 금지하는 층 — 상태는 editor·caret 인스턴스 안에만 산다.
// Layers barred from top-level mutable state — state lives only inside editor/caret instances.
const NO_TOP_LEVEL_STATE = ['schema', 'doc', 'caret', 'editor', 'wing', 'wings'];

// DOM 어휘는 surface 위쪽 층만 쓴다 — html/parse.ts만 예외로, 넘겨받은 el.ownerDocument로 돈다.
// DOM vocabulary is confined to surface and above — html/parse.ts is the sole exception, working via the element it's given (el.ownerDocument), never globals.
const DOM_LAYERS = ['surface', 'ui', 'viewer'];
const DOM_EXEMPT = 'html/parse.ts';

const rank = (layer: string): number => ORDER.indexOf(layer);
const layerOf = (rel: string): string => {
  const parts = rel.split('/');
  return parts.length > 1 ? parts[0]! : '';
};
const wingOf = (rel: string): string => {
  const parts = rel.split('/');
  return parts[0] === 'wings' && parts.length > 2 ? parts[1]! : '';
};
const lineAt = (source: string, index: number): number => source.slice(0, index).split('\n').length;

// --- 소스 훑기 -----------------------------------------------------------------------------
// 주석만 지운 code와 문자열·정규식까지 지운 bare, 두 벌을 낸다 — "document" 같은 문자열이 DOM 사용으로 오인되지 않게.
// Produces two scrubbed variants: code (comments stripped) and bare (strings/regex stripped too) so literal text isn't mistaken for DOM usage.
function scan(source: string): { code: string; bare: string } {
  const code: string[] = [];
  const bare: string[] = [];
  const keep = (ch: string): void => {
    code.push(ch);
    bare.push(ch);
  };
  const blank = (ch: string): void => {
    const filler = ch === '\n' ? '\n' : ' ';
    code.push(filler);
    bare.push(filler);
  };
  const text = (ch: string): void => {
    code.push(ch);
    bare.push(ch === '\n' ? '\n' : ' ');
  };
  // 정규식 시작인지 나눗셈인지 — 직전 의미 있는 글자로 가른다(값이 끝난 자리면 나눗셈).
  // Regex literal vs division — decided by the last meaningful character (a completed value means division).
  const startsRegex = (prev: string): boolean => prev === '' || !/[\w$)\]]/.test(prev);

  const modes: string[] = ['code'];
  const braces: number[] = [0];
  let prev = '';
  let i = 0;
  while (i < source.length) {
    const mode = modes[modes.length - 1]!;
    const ch = source[i]!;
    const next = source[i + 1] ?? '';

    if (mode === 'code') {
      if (ch === '/' && next === '/') {
        while (i < source.length && source[i] !== '\n') blank(source[i++]!);
        continue;
      }
      if (ch === '/' && next === '*') {
        blank(source[i++]!);
        blank(source[i++]!);
        while (i < source.length && !(source[i] === '*' && source[i + 1] === '/')) blank(source[i++]!);
        if (i < source.length) {
          blank(source[i++]!);
          blank(source[i++]!);
        }
        continue;
      }
      if (ch === '/' && startsRegex(prev)) {
        text(source[i++]!);
        let inClass = false;
        while (i < source.length) {
          const c = source[i]!;
          if (c === '\\') {
            text(source[i++]!);
            if (i < source.length) text(source[i++]!);
            continue;
          }
          if (c === '[') inClass = true;
          else if (c === ']') inClass = false;
          else if (c === '/' && !inClass) {
            text(source[i++]!);
            break;
          }
          text(source[i++]!);
        }
        prev = '/';
        continue;
      }
      if (ch === "'" || ch === '"' || ch === '`') {
        keep(ch);
        modes.push(ch === "'" ? 'sq' : ch === '"' ? 'dq' : 'tpl');
        i += 1;
        continue;
      }
      if (ch === '}' && modes.length > 1 && braces[braces.length - 1] === 0) {
        // 템플릿 `${ }`를 닫는 자리 — 바깥 템플릿 모드로 되돌아간다.
        // Closes a template `${ }` — returns to the enclosing template mode.
        keep(ch);
        modes.pop();
        braces.pop();
        prev = '}';
        i += 1;
        continue;
      }
      if (ch === '{') braces[braces.length - 1] += 1;
      if (ch === '}') braces[braces.length - 1] -= 1;
      keep(ch);
      if (ch.trim() !== '') prev = ch;
      i += 1;
      continue;
    }

    // 문자열·템플릿 안
    if (ch === '\\') {
      text(source[i++]!);
      if (i < source.length) text(source[i++]!);
      continue;
    }
    if ((mode === 'sq' && ch === "'") || (mode === 'dq' && ch === '"') || (mode === 'tpl' && ch === '`')) {
      keep(ch);
      modes.pop();
      prev = ch;
      i += 1;
      continue;
    }
    if (mode === 'tpl' && ch === '$' && next === '{') {
      keep(ch);
      keep(next);
      modes.push('code');
      braces.push(0);
      prev = '{';
      i += 2;
      continue;
    }
    text(ch);
    i += 1;
  }
  return { code: code.join(''), bare: bare.join('') };
}

// 정적 import, 동적 import(), 부작용 import 세 형태 모두에서 경로를 뽑는다.
// Extracts specifiers from all three import forms — static, dynamic import(), and side-effect only.
function specifiers(code: string): { spec: string; index: number }[] {
  const found: { spec: string; index: number }[] = [];
  const patterns = [
    /\bfrom\s*['"]([^'"]+)['"]/g,
    /\bimport\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
    /\bimport\s+['"]([^'"]+)['"]/g,
  ];
  for (const pattern of patterns) {
    for (const match of code.matchAll(pattern)) found.push({ spec: match[1]!, index: match.index ?? 0 });
  }
  return found;
}

function walk(dir: string, base: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...walk(full, base));
      continue;
    }
    if (!entry.name.endsWith('.ts') || entry.name.endsWith('.d.ts')) continue;
    out.push(
      full
        .slice(base.length + 1)
        .split(sep)
        .join('/'),
    );
  }
  return out;
}

const files = existsSync(SRC) ? walk(SRC, SRC).sort() : [];
const sources = files.map((rel) => {
  const raw = readFileSync(join(SRC, rel.split('/').join(sep)), 'utf8');
  return { rel, layer: layerOf(rel), wing: wingOf(rel), ...scan(raw) };
});

// --- 규칙 ----------------------------------------------------------------------------------
const wingsToUi: string[] = [];
const siblingWing: string[] = [];
const wrongWay: string[] = [];
const domInHtml: string[] = [];
const topLevelState: string[] = [];

for (const file of sources) {
  for (const { spec, index } of specifiers(file.code)) {
    if (!spec.startsWith('.')) continue;
    const joined = join(dirname(file.rel), spec).split(sep).join('/');
    if (joined.startsWith('..')) continue;
    const target = layerOf(joined);
    const targetWing = wingOf(joined);
    const at = `${file.rel}:${lineAt(file.code, index)} → ${spec}`;

    if (file.layer === 'wings' && target === 'ui') {
      wingsToUi.push(at);
      continue;
    }
    if (
      file.layer === 'wings' &&
      target === 'wings' &&
      file.wing !== '' &&
      targetWing !== '' &&
      file.wing !== targetWing
    ) {
      siblingWing.push(`${at} (${file.wing} → ${targetWing})`);
      continue;
    }
    if (file.layer === '' || target === '' || file.layer === target) continue;
    if (rank(file.layer) < 0 || rank(target) < 0) continue;
    const ceiling = rank(CEILING[file.layer] ?? file.layer);
    if (rank(target) > ceiling) wrongWay.push(`${at} (${file.layer} 이 ${target} 을 부른다)`);
  }

  if (rank(file.layer) >= 0 && !DOM_LAYERS.includes(file.layer) && file.rel !== DOM_EXEMPT) {
    for (const match of file.bare.matchAll(/\b(document|window)\b/g)) {
      domInHtml.push(`${file.rel}:${lineAt(file.bare, match.index ?? 0)} — ${match[1]}`);
    }
  }

  if (NO_TOP_LEVEL_STATE.includes(file.layer)) {
    for (const match of file.bare.matchAll(/^(?:export\s+)?(let|var)\b/gm)) {
      topLevelState.push(`${file.rel}:${lineAt(file.bare, match.index ?? 0)} — ${match[1]}`);
    }
  }
}

ok('wings 가 ui 를 안 부른다', wingsToUi.length === 0, wingsToUi);
ok('wing 이 형제 wing 을 안 부른다 (공용은 wing/ 층)', siblingWing.length === 0, siblingWing);
ok('의존은 아래로만 흐른다', wrongWay.length === 0, wrongWay);
ok(`surface 아래 층에 DOM 어휘가 없다 (${DOM_EXEMPT} 예외)`, domInHtml.length === 0, domInHtml);
ok('schema~wings 층에 모듈 최상위 가변 상태가 없다', topLevelState.length === 0, topLevelState);

done(`boundaries(소스 ${files.length}개)`);
