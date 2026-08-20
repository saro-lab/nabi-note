// 코드 토크나이저 — 순수부다. 글자열 하나가 토막 목록이 되고, **토막을 이어 붙이면 원본과
// 정확히 같아야 한다**(규칙은 이 하나다 — 어기면 화면에서 글자가 사라지거나 뒤바뀐다).
//
// 토큰은 트리에 절대 안 산다 — 화면의 span 에만 얹힌다. 그래서 다시 칠해도 `onChange` 가 안
// 울리고, 하이라이터를 갈아 끼워도 문서는 한 글자도 안 변한다 (old 의 교훈 번역).
// 얹는 손은 이웃한 `apply.ts` 다 — 여기는 DOM 을 모른다.
//
// **왜 `code/` 라는 제 층에 사는가** (088): 이 지식을 무는 이가 둘로 갈렸다 — 아래의
// `wings/code`(편집 화면의 색칠)와 맨 위의 `viewer`(발행된 HTML 의 색칠)다. 한쪽에 두면 다른
// 쪽이 층을 거슬러 문다. 그래서 `locale` 옆, 아무것도 안 부르는 맨 아래에 둔다 — 층 차례
// (test/boundaries.test.ts 의 ORDER)에서 둘 모두의 아래다.
//
// 문법 사전을 싣지 않는다(런타임 의존성 0). 대신 언어군 셋(C 계열·마크업·설정값)의 규격만
// 번역해 왔고, 모르는 언어는 글자열·수·주석만 아는 공통 규칙으로 떨어진다. 더 나은 색칠을
// 원하는 호스트는 `CodeHighlighter` 훅으로 자기 하이라이터를 꽂는다.

export interface CodeToken {
  readonly text: string;
  readonly type?: string;
}

// 호스트 훅 — null·undefined 를 답하면 우리 토크나이저가 대신 답한다.
export type CodeHighlighter = (code: string, language: string | null) => readonly CodeToken[] | null | undefined;

// 화면과 저장 HTML 이 함께 쓰는 이름 하나 — 쓰는 이가 둘이면 어긋난다.
export const CODE_TOKEN_ATTR = 'data-nabi-token';

export const CODE_TOKEN_TYPES: readonly string[] = [
  'keyword', 'string', 'number', 'comment', 'function', 'class',
  'variable', 'operator', 'punctuation', 'tag', 'attribute', 'literal', 'regexp', 'meta',
];

// --- 언어군 (old 의 언어 목록에서 이름만 번역) --------------------------------------------------

const C_LIKE = new Set([
  'js', 'jsx', 'javascript', 'ts', 'tsx', 'typescript', 'java', 'c', 'cpp', 'c++', 'csharp', 'cs',
  'go', 'rust', 'rs', 'kotlin', 'swift', 'php', 'scala', 'dart',
]);
const KEYWORDS: Readonly<Record<string, readonly string[]>> = {
  clike: [
    'as', 'async', 'await', 'break', 'case', 'catch', 'class', 'const', 'continue', 'default',
    'delete', 'do', 'else', 'enum', 'export', 'extends', 'finally', 'for', 'from', 'function',
    'if', 'implements', 'import', 'in', 'instanceof', 'interface', 'let', 'new', 'of', 'private',
    'protected', 'public', 'readonly', 'return', 'static', 'super', 'switch', 'this', 'throw',
    'try', 'type', 'typeof', 'var', 'void', 'while', 'yield', 'struct', 'impl', 'fn', 'pub',
    'package', 'func', 'defer', 'go', 'match', 'mut', 'use', 'namespace', 'using',
  ],
  python: [
    'and', 'as', 'assert', 'async', 'await', 'break', 'class', 'continue', 'def', 'del', 'elif',
    'else', 'except', 'finally', 'for', 'from', 'global', 'if', 'import', 'in', 'is', 'lambda',
    'nonlocal', 'not', 'or', 'pass', 'raise', 'return', 'try', 'while', 'with', 'yield',
  ],
  sql: [
    'select', 'from', 'where', 'insert', 'into', 'values', 'update', 'set', 'delete', 'create',
    'table', 'drop', 'alter', 'join', 'left', 'right', 'inner', 'outer', 'on', 'group', 'order',
    'by', 'having', 'limit', 'offset', 'and', 'or', 'not', 'null', 'as', 'distinct', 'union',
  ],
  bash: [
    'if', 'then', 'else', 'elif', 'fi', 'for', 'while', 'do', 'done', 'case', 'esac', 'function',
    'return', 'export', 'local', 'echo', 'cd', 'source', 'set', 'unset',
  ],
};
const LITERALS = new Set(['true', 'false', 'null', 'undefined', 'None', 'True', 'False', 'nil', 'NULL']);

// 언어 → 규칙 갈래. 모르는 이름은 공통 규칙이다.
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
  readonly callIsFunction: boolean;
}

function rulesOf(dialect: CodeDialect): Rules {
  switch (dialect) {
    case 'clike':
      return { lineComment: ['//'], blockComment: ['/*', '*/'], quotes: ['"', "'", '`'], keywords: new Set(KEYWORDS['clike']), callIsFunction: true };
    case 'python':
      return { lineComment: ['#'], blockComment: null, quotes: ['"', "'"], keywords: new Set(KEYWORDS['python']), callIsFunction: true };
    case 'json':
      return { lineComment: [], blockComment: null, quotes: ['"'], keywords: new Set(), callIsFunction: false };
    case 'css':
      return { lineComment: ['//'], blockComment: ['/*', '*/'], quotes: ['"', "'"], keywords: new Set(), callIsFunction: true };
    case 'sql':
      return { lineComment: ['--'], blockComment: ['/*', '*/'], quotes: ["'", '"'], keywords: new Set(KEYWORDS['sql']), callIsFunction: false };
    case 'bash':
      return { lineComment: ['#'], blockComment: null, quotes: ['"', "'"], keywords: new Set(KEYWORDS['bash']), callIsFunction: false };
    default:
      return { lineComment: ['//', '#'], blockComment: ['/*', '*/'], quotes: ['"', "'", '`'], keywords: new Set(), callIsFunction: false };
  }
}

const NAME_START = /[A-Za-z_$]/;
const NAME_PART = /[A-Za-z0-9_$]/;
const DIGIT = /[0-9]/;
const SPACE = /\s/;
const PUNCTUATION = /[{}[\]();,.:]/;
const OPERATOR = /[+\-*/%=<>!&|^~?@#]/;

// 마크업은 태그 안팎이 다른 세상이라 따로 걷는다 — 태그 이름·속성 이름·값만 고르고 나머지는 글이다.
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

    // 주석 — 줄 끝까지, 또는 닫는 표시까지.
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

    // 수 — 16진·소수·지수까지 한 토막으로.
    if (DIGIT.test(ch) || (ch === '.' && DIGIT.test(code[i + 1] ?? ''))) {
      let j = i;
      while (j < code.length && /[0-9a-fA-FxXoObB._+-]/.test(code[j] as string)) {
        // `1-2` 의 빼기가 수에 붙지 않게 — 부호는 지수 뒤에서만 수의 일부다.
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

// 색칠하는 쪽이 **한 줄로 쓰는 문** — 호스트 하이라이터에게 먼저 묻고, 답이 없거나 못 쓸
// 답이면 우리 토크나이저가 답한다. 이 한 줄을 쓰는 이가 둘이라(편집 화면의 `wings/code/paint`,
// 보는 쪽의 `viewer/code-paint`) 여기 한 벌만 둔다 — 두 벌이면 언젠가 갈린다.
//
// 하이라이터가 던지면 **색칠만** 포기한다 — 편집도 읽기도 계속돼야 한다.
export function tokensFor(
  source: string,
  language: string | null,
  highlight?: CodeHighlighter,
): CodeToken[] {
  let answer: readonly CodeToken[] | null | undefined;
  try {
    answer = highlight?.(source, language);
  } catch {
    answer = null;
  }
  return usableTokens(answer ?? tokenize(source, language), source);
}

// 답이 쓸 만한가 — 이어 붙인 것이 원본과 다르면 글자가 사라지거나 뒤바뀐다. 그때는 평문 한 덩이다.
export function usableTokens(answer: readonly CodeToken[] | null | undefined, source: string): CodeToken[] {
  if (!answer || answer.length === 0) return [{ text: source }];
  const joined = answer.reduce((sum, token) => sum + token.text, '');
  if (joined !== source) return [{ text: source }];
  return answer.map((token) =>
    token.type !== undefined && CODE_TOKEN_TYPES.includes(token.type) ? token : { text: token.text },
  );
}
