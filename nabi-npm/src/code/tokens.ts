// 코드 토크나이저 — 순수부다. 토막을 이어 붙이면 반드시 원본과 같아야 한다(어기면 화면 글자가 사라지거나 뒤바뀐다).
// The pure tokenizer half: joined tokens must exactly equal the source, or characters vanish or shuffle on screen.
// 토큰은 트리에 안 산다 — DOM의 span 에만 얹혀, 다시 칠해도 onChange 가 안 울린다.
// Tokens never live in the tree, only on DOM spans, so repainting never fires onChange.
// 문법 사전 없이 언어군 셋만 흉내 내고, 모르는 언어는 공통 규칙으로 떨어진다. 더 나은 색칠은 CodeHighlighter 훅으로 꽂는다.
// No grammar dictionary is bundled; it approximates three language families and falls back to common rules for the rest — hosts can plug a better highlighter via CodeHighlighter.

export interface CodeToken {
  readonly text: string;
  readonly type?: string;
}

// 호스트 훅 — null·undefined 를 답하면 우리 토크나이저가 대신 답한다.
// A host hook; answering null or undefined falls back to our own tokenizer.
export type CodeHighlighter = (code: string, language: string | null) => readonly CodeToken[] | null | undefined;

// 화면과 저장 HTML 이 함께 쓰는 이름 하나 — 쓰는 이가 둘이면 어긋난다.
// One shared attribute name for both the live DOM and stored HTML; two separate names would drift apart.
export const CODE_TOKEN_ATTR = 'data-nabi-token';

export const CODE_TOKEN_TYPES: readonly string[] = [
  'keyword',
  'string',
  'number',
  'comment',
  'function',
  'class',
  'variable',
  'operator',
  'punctuation',
  'tag',
  'attribute',
  'literal',
  'regexp',
  'meta',
];

// --- 언어군 ---------------------------------------------------------------------------------

const C_LIKE = new Set([
  'js',
  'jsx',
  'javascript',
  'ts',
  'tsx',
  'typescript',
  'java',
  'c',
  'cpp',
  'c++',
  'csharp',
  'cs',
  'go',
  'rust',
  'rs',
  'kotlin',
  'swift',
  'php',
  'scala',
  'dart',
]);
const KEYWORDS: Readonly<Record<string, readonly string[]>> = {
  clike: [
    'as',
    'async',
    'await',
    'break',
    'case',
    'catch',
    'class',
    'const',
    'continue',
    'default',
    'delete',
    'do',
    'else',
    'enum',
    'export',
    'extends',
    'finally',
    'for',
    'from',
    'function',
    'if',
    'implements',
    'import',
    'in',
    'instanceof',
    'interface',
    'let',
    'new',
    'of',
    'private',
    'protected',
    'public',
    'readonly',
    'return',
    'static',
    'super',
    'switch',
    'this',
    'throw',
    'try',
    'type',
    'typeof',
    'var',
    'void',
    'while',
    'yield',
    'struct',
    'impl',
    'fn',
    'pub',
    'package',
    'func',
    'defer',
    'go',
    'match',
    'mut',
    'use',
    'namespace',
    'using',
  ],
  python: [
    'and',
    'as',
    'assert',
    'async',
    'await',
    'break',
    'class',
    'continue',
    'def',
    'del',
    'elif',
    'else',
    'except',
    'finally',
    'for',
    'from',
    'global',
    'if',
    'import',
    'in',
    'is',
    'lambda',
    'nonlocal',
    'not',
    'or',
    'pass',
    'raise',
    'return',
    'try',
    'while',
    'with',
    'yield',
  ],
  sql: [
    'select',
    'from',
    'where',
    'insert',
    'into',
    'values',
    'update',
    'set',
    'delete',
    'create',
    'table',
    'drop',
    'alter',
    'join',
    'left',
    'right',
    'inner',
    'outer',
    'on',
    'group',
    'order',
    'by',
    'having',
    'limit',
    'offset',
    'and',
    'or',
    'not',
    'null',
    'as',
    'distinct',
    'union',
  ],
  bash: [
    'if',
    'then',
    'else',
    'elif',
    'fi',
    'for',
    'while',
    'do',
    'done',
    'case',
    'esac',
    'function',
    'return',
    'export',
    'local',
    'echo',
    'cd',
    'source',
    'set',
    'unset',
  ],
};
const LITERALS = new Set(['true', 'false', 'null', 'undefined', 'None', 'True', 'False', 'nil', 'NULL']);

// 언어 → 규칙 갈래. 모르는 이름은 공통 규칙이다.
// Maps a language name to its rule dialect; an unknown name falls back to the common rules.
export type CodeDialect = 'clike' | 'python' | 'json' | 'css' | 'markup' | 'sql' | 'bash' | 'plain';

export function dialectOf(language: string | null): CodeDialect {
  const lang = (language ?? '').trim().toLowerCase();
  if (lang === '') return 'plain';
  if (C_LIKE.has(lang)) return 'clike';
  if (lang === 'python' || lang === 'py') return 'python';
  if (lang === 'json' || lang === 'jsonc') return 'json';
  if (lang === 'css' || lang === 'scss' || lang === 'less') return 'css';
  if (lang === 'html' || lang === 'xml' || lang === 'svg' || lang === 'vue') return 'markup';
  if (lang === 'sql') return 'sql';
  if (lang === 'bash' || lang === 'sh' || lang === 'shell' || lang === 'zsh') return 'bash';
  return 'plain';
}

// --- 토크나이저 ---------------------------------------------------------------------------------

interface Rules {
  readonly lineComment: readonly string[];
  readonly blockComment: readonly [string, string] | null;
  readonly quotes: readonly string[];
  readonly keywords: ReadonlySet<string>;
  // 이름 뒤에 여는 괄호가 오면 함수로 본다 (C 계열·파이썬).
  // A name followed by an opening paren is treated as a function call (C-like, Python).
  readonly callIsFunction: boolean;
}

function rulesOf(dialect: CodeDialect): Rules {
  switch (dialect) {
    case 'clike':
      return {
        lineComment: ['//'],
        blockComment: ['/*', '*/'],
        quotes: ['"', "'", '`'],
        keywords: new Set(KEYWORDS['clike']),
        callIsFunction: true,
      };
    case 'python':
      return {
        lineComment: ['#'],
        blockComment: null,
        quotes: ['"', "'"],
        keywords: new Set(KEYWORDS['python']),
        callIsFunction: true,
      };
    case 'json':
      return { lineComment: [], blockComment: null, quotes: ['"'], keywords: new Set(), callIsFunction: false };
    case 'css':
      return {
        lineComment: ['//'],
        blockComment: ['/*', '*/'],
        quotes: ['"', "'"],
        keywords: new Set(),
        callIsFunction: true,
      };
    case 'sql':
      return {
        lineComment: ['--'],
        blockComment: ['/*', '*/'],
        quotes: ["'", '"'],
        keywords: new Set(KEYWORDS['sql']),
        callIsFunction: false,
      };
    case 'bash':
      return {
        lineComment: ['#'],
        blockComment: null,
        quotes: ['"', "'"],
        keywords: new Set(KEYWORDS['bash']),
        callIsFunction: false,
      };
    default:
      return {
        lineComment: ['//', '#'],
        blockComment: ['/*', '*/'],
        quotes: ['"', "'", '`'],
        keywords: new Set(),
        callIsFunction: false,
      };
  }
}

const NAME_START = /[A-Za-z_$]/;
const NAME_PART = /[A-Za-z0-9_$]/;
const DIGIT = /[0-9]/;
const SPACE = /\s/;
const PUNCTUATION = /[{}[\]();,.:]/;
const OPERATOR = /[+\-*/%=<>!&|^~?@#]/;

// 마크업은 태그 안팎이 다른 세상이라 따로 걷는다 — 태그 이름·속성 이름·값만 고르고 나머지는 글이다.
// Markup walks separately since inside and outside a tag are different worlds; only tag/attribute names and values get typed, the rest is plain text.
function tokenizeMarkup(code: string): CodeToken[] {
  const out: CodeToken[] = [];
  const push = (text: string, type?: string): void => {
    if (text === '') return;
    const last = out[out.length - 1];
    if (last && last.type === type) out[out.length - 1] = { text: last.text + text, ...(type ? { type } : {}) };
    else out.push(type ? { text, type } : { text });
  };
  let i = 0;
  while (i < code.length) {
    if (code.startsWith('<!--', i)) {
      const end = code.indexOf('-->', i + 4);
      const stop = end === -1 ? code.length : end + 3;
      push(code.slice(i, stop), 'comment');
      i = stop;
      continue;
    }
    if (code[i] === '<') {
      const end = code.indexOf('>', i);
      const stop = end === -1 ? code.length : end + 1;
      const tag = code.slice(i, stop);
      // `<name` 과 닫는 `>` 는 태그, 그 사이의 `name=` 은 속성, 따옴표 안은 값이다.
      // `<name` and the closing `>` are tag tokens; `name=` between them is an attribute, and quoted text is its value.
      const opening = /^<\/?[A-Za-z][\w:-]*/.exec(tag);
      if (opening) {
        push(opening[0], 'tag');
        let rest = tag.slice(opening[0].length);
        const attr = /([A-Za-z_:][\w:.-]*)(\s*=\s*)("[^"]*"|'[^']*'|[^\s>]+)?/g;
        let at = 0;
        for (const match of rest.matchAll(attr)) {
          const index = match.index ?? 0;
          push(rest.slice(at, index));
          push(match[1] as string, 'attribute');
          push(match[2] as string, 'operator');
          if (match[3] !== undefined) push(match[3], 'string');
          at = index + match[0].length;
        }
        rest = rest.slice(at);
        const close = /[/]?>$/.exec(rest);
        if (close) {
          push(rest.slice(0, rest.length - close[0].length));
          push(close[0], 'tag');
        } else push(rest);
      } else push(tag, 'tag');
      i = stop;
      continue;
    }
    const next = code.indexOf('<', i);
    const stop = next === -1 ? code.length : next;
    push(code.slice(i, stop));
    i = stop;
  }
  return out;
}

// 공통 걸음 — 주석·글자열·수·이름·기호를 가른다. 언어별 차이는 Rules 하나에 접혀 있다.
// The common walk splits comments, strings, numbers, names, and symbols; per-language differences fold into a single Rules object.
export function tokenize(code: string, language: string | null = null): CodeToken[] {
  if (code === '') return [];
  const dialect = dialectOf(language);
  if (dialect === 'markup') return tokenizeMarkup(code);
  const rules = rulesOf(dialect);
  const out: CodeToken[] = [];
  const push = (text: string, type?: string): void => {
    if (text === '') return;
    const last = out[out.length - 1];
    if (last && last.type === type) out[out.length - 1] = { text: last.text + text, ...(type ? { type } : {}) };
    else out.push(type ? { text, type } : { text });
  };

  let i = 0;
  while (i < code.length) {
    const ch = code[i] as string;

    const line = rules.lineComment.find((mark) => code.startsWith(mark, i));
    if (line !== undefined) {
      const end = code.indexOf('\n', i);
      const stop = end === -1 ? code.length : end;
      push(code.slice(i, stop), 'comment');
      i = stop;
      continue;
    }
    if (rules.blockComment && code.startsWith(rules.blockComment[0], i)) {
      const end = code.indexOf(rules.blockComment[1], i + rules.blockComment[0].length);
      const stop = end === -1 ? code.length : end + rules.blockComment[1].length;
      push(code.slice(i, stop), 'comment');
      i = stop;
      continue;
    }

    // 글자열 — 닫히지 않은 채 끝나도 남은 전부를 글자열로 삼킨다(짓다 만 줄도 글자가 안 사라진다).
    // A string: even if it never closes, the rest of the input is swallowed as a string, so an unfinished line never loses characters.
    if (rules.quotes.includes(ch)) {
      let j = i + 1;
      while (j < code.length) {
        if (code[j] === '\\') {
          j += 2;
          continue;
        }
        if (code[j] === ch) {
          j += 1;
          break;
        }
        j += 1;
      }
      push(code.slice(i, Math.min(j, code.length)), 'string');
      i = Math.min(j, code.length);
      continue;
    }

    if (SPACE.test(ch)) {
      let j = i;
      while (j < code.length && SPACE.test(code[j] as string)) j += 1;
      push(code.slice(i, j));
      i = j;
      continue;
    }

    if (DIGIT.test(ch) || (ch === '.' && DIGIT.test(code[i + 1] ?? ''))) {
      let j = i;
      while (j < code.length && /[0-9a-fA-FxXoObB._+-]/.test(code[j] as string)) {
        // `1-2` 의 빼기가 수에 붙지 않게 — 부호는 지수 뒤에서만 수의 일부다.
        // Keeps the minus in `1-2` from sticking to the number; a sign is only part of it right after an exponent marker.
        const c = code[j] as string;
        if ((c === '+' || c === '-') && !/[eE]/.test(code[j - 1] ?? '')) break;
        if (c === '.' && !DIGIT.test(code[j + 1] ?? '')) break;
        j += 1;
      }
      push(code.slice(i, j), 'number');
      i = j;
      continue;
    }

    if (NAME_START.test(ch)) {
      let j = i;
      while (j < code.length && NAME_PART.test(code[j] as string)) j += 1;
      const word = code.slice(i, j);
      let type = 'variable';
      if (rules.keywords.has(word) || rules.keywords.has(word.toLowerCase())) type = 'keyword';
      else if (LITERALS.has(word)) type = 'literal';
      else if (/^[A-Z]/.test(word)) type = 'class';
      else if (rules.callIsFunction && /^\s*\(/.test(code.slice(j))) type = 'function';
      // json 은 이름이 곧 값의 이름이라 변수 색을 안 준다 — 맨 글자로 둔다.
      // json names are just key names, not variables, so they get no color and stay plain text.
      push(word, dialect === 'json' && type === 'variable' ? undefined : type);
      i = j;
      continue;
    }

    if (PUNCTUATION.test(ch)) {
      push(ch, 'punctuation');
      i += 1;
      continue;
    }
    if (OPERATOR.test(ch)) {
      let j = i;
      while (j < code.length && OPERATOR.test(code[j] as string)) j += 1;
      push(code.slice(i, j), 'operator');
      i = j;
      continue;
    }
    push(ch);
    i += 1;
  }
  return out;
}

// 색칠 쪽이 쓰는 한 줄 문 — 호스트 하이라이터에게 먼저 묻고, 답이 없거나 못 쓰면 우리 토크나이저가 답한다.
// The single entry point highlighting callers use: asks the host highlighter first, falling back to our tokenizer if it gives no usable answer.
// 하이라이터가 던지면 색칠만 포기한다 — 편집도 읽기도 계속돼야 한다.
// If the highlighter throws, only highlighting is given up; editing and reading must keep working.
export function tokensFor(source: string, language: string | null, highlight?: CodeHighlighter): CodeToken[] {
  let answer: readonly CodeToken[] | null | undefined;
  try {
    answer = highlight?.(source, language);
  } catch {
    answer = null;
  }
  return usableTokens(answer ?? tokenize(source, language), source);
}

// 답이 쓸 만한가 — 이어 붙인 것이 원본과 다르면 글자가 사라지거나 뒤바뀐다. 그때는 평문 한 덩이다.
// Checks whether an answer is usable; if the joined text doesn't match the source, characters would vanish or shuffle, so it falls back to one plain-text token.
export function usableTokens(answer: readonly CodeToken[] | null | undefined, source: string): CodeToken[] {
  if (!answer || answer.length === 0) return [{ text: source }];
  const joined = answer.reduce((sum, token) => sum + token.text, '');
  if (joined !== source) return [{ text: source }];
  return answer.map((token) =>
    token.type !== undefined && CODE_TOKEN_TYPES.includes(token.type) ? token : { text: token.text },
  );
}
