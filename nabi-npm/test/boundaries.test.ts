// 경계 시험 — 층 계약을 사람의 주의가 아니라 기계가 지킨다 (plan·§6).
// `src/` 의 소스를 정적으로 훑어(실행하지 않는다) import 방향과 금지 어휘를 검사한다.
// 검사 대상이 없으면 통과다 — 층이 하나씩 서는 동안 이 그물이 먼저 자리를 잡고 기다린다.
//
// 여기서 막는 것 다섯:
//   1. `wings/` 가 `ui/` 를 부르는 것 (wing 은 화면 도구를 모른다)
//   2. wing 폴더가 형제 wing 폴더를 부르는 것 (공용은 `wing/` 층에만 둔다)
//   3. surface 아래 층에서 DOM 어휘(document·window) — 조립도 편집 연산도 DOM 없는 값이다
//      (: 서버에서 그대로 돈다). `html/parse.ts` 만 예외이고, wing 이 표면에 손을 대야 할 때는
//      리스너를 직접 달지 않고 `attach` 로 선언한다 — 손잡이(root)는 mount 가 넘겨준다
//   4. schema~wings 층의 모듈 최상위 가변 상태(top-level `let`/`var`) — 인스턴스는 서로 모른다
//   5. 층 의존 방향 — 아래가 위를 모른다
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { done, ok } from './net.js';

const SRC = fileURLToPath(new URL('../src', import.meta.url));

// 의 층 순서. 낮을수록 아래층이고, 아래층은 위층을 모른다.
// `locale`(문자열 사전)은 아무것도 안 부르는 맨 아래에 둔다 — 어느 층이든 말 한 마디는 필요하다.
// `code`(코드 색칠의 지식)도 아무것도 안 부르는 맨 아래다 — **무는 이가 양 끝**이라 그렇다:
// 아래의 `wings/code`(편집 화면의 색칠)와 맨 위의 `viewer`(발행 HTML 의 색칠)가 같은 토크나이저·
// 같은 span 얹기를 쓴다. 둘 중 어느 쪽에 두어도 반대쪽이 층을 거스르므로, 둘 모두의 아래에 세웠다 (088).
// `html` 은 schema 만 딛는 조립층이라 editor 아래에 선다 — editor 의 getHtml 계열이 부른다 (05).
const ORDER = ['locale', 'code', 'schema', 'doc', 'caret', 'html', 'editor', 'wing', 'wings', 'surface', 'ui', 'viewer'];

// 예외 천장은 없다 — 07 결과 계약 타입(HtmlBuilder)은 html 자신이 정의하고 wing 이 그것을
// 잇는 방향이 됐으므로, html 은 제 층 아래(schema)만 딛으면 된다. 낡은 `html: 'wing'` 천장은
// editor 위로의 몰래 import 를 못 잡는 과잉 허용이라 걷었다 (07).
const CEILING: Record<string, string> = {};

// 모듈 최상위 가변 상태를 금지하는 층 — 상태는 editor·caret 인스턴스 안에만 산다.
const NO_TOP_LEVEL_STATE = ['schema', 'doc', 'caret', 'editor', 'wing', 'wings'];

// DOM 어휘가 사는 층 — 표면 위쪽이다. 그 아래에서 허락된 유일한 파일이 들여오기 어댑터다.
//
// `code/apply.ts` 는 요소를 만지면서도 여기 안 든다 — **넘겨받은 요소 하나**만 알고 필요한
// 것은 전부 `el.ownerDocument` 에서 온다(전역 `document`·`window` 를 안 부른다). 이 규칙이
// 그 파일을 맨 아래층에 세우고도 서버에서 죽지 않게 한다 (088).
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
// 주석과 문자열 속을 지우는 작은 스캐너. 두 벌을 낸다:
//   code — 주석만 지운 것. import 문의 경로 문자열이 살아 있어야 하므로.
//   bare — 문자열·정규식 속까지 지운 것. `"document"` 같은 글자가 DOM 사용으로 오인되면 안 되므로.
// 지운 자리는 공백으로 채우고 줄바꿈은 남긴다 — 줄 번호가 원본과 같아진다.
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
  // 정규식 시작인지 나눗셈인지 — 직전 의미 있는 글자로 가른다(값이 끝난 자리면 나눗셈이다).
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
        // 템플릿 `${ }` 를 닫는 자리 — 바깥 템플릿으로 돌아간다.
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

// import·export 가 가리키는 경로를 뽑는다 — 정적 문, 동적 `import`, 부작용 import 셋 다.
function specifiers(code: string): { spec: string; index: number }[] {
  const found: { spec: string; index: number }[] = [];
  const patterns = [/\bfrom\s*['"]([^'"]+)['"]/g, /\bimport\s*\(\s*['"]([^'"]+)['"]\s*\)/g, /\bimport\s+['"]([^'"]+)['"]/g];
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
    out.push(full.slice(base.length + 1).split(sep).join('/'));
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
    if (!spec.startsWith('.')) continue; // 패키지 이름 — 층 규칙 밖이다
    const joined = join(dirname(file.rel), spec).split(sep).join('/');
    if (joined.startsWith('..')) continue; // src 밖 — 여기서 볼 것이 아니다
    const target = layerOf(joined);
    const targetWing = wingOf(joined);
    const at = `${file.rel}:${lineAt(file.code, index)} → ${spec}`;

    if (file.layer === 'wings' && target === 'ui') {
      wingsToUi.push(at);
      continue;
    }
    if (file.layer === 'wings' && target === 'wings' && file.wing !== '' && targetWing !== '' && file.wing !== targetWing) {
      siblingWing.push(`${at} (${file.wing} → ${targetWing})`);
      continue;
    }
    if (file.layer === '' || target === '' || file.layer === target) continue; // 진입점·같은 층은 자유다
    if (rank(file.layer) < 0 || rank(target) < 0) continue; // 층 밖 폴더는 안 본다
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
