// 그물 전용 초소형 HTML 토크나이저 — `src/html/import.ts` 가 보는 최소 엘리먼트 모양을 짓는다.
// 들여오기의 코어는 DOM 이 아니라 이 모양 위에서 돌기 때문에, 브라우저 없이도 왕복을 잴 수 있다.
// **제품 코드가 아니다** — 우리 조립이 낸 HTML 과 그물이 손으로 적은 HTML 만 읽으면 된다.
import type { ParseNode } from '../src/html/import.js';

interface Draft {
  readonly tag: string;
  readonly attrs: Record<string, string>;
  readonly children: ParseNode[];
}

const VOID: ReadonlySet<string> = new Set([
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr',
]);

// 속이 태그가 아니라 글자인 것들 — 여기까지 태그로 읽으면 스크립트 본문이 트리에 선다.
const RAW: ReadonlySet<string> = new Set(['script', 'style', 'textarea', 'title']);

const NAMED: Readonly<Record<string, string>> = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ',
};

function decode(source: string): string {
  return source.replace(/&(#[xX]?[0-9a-fA-F]+|[a-zA-Z]+);/g, (all, body: string) => {
    if (body.startsWith('#')) {
      const hex = body[1] === 'x' || body[1] === 'X';
      const code = Number.parseInt(hex ? body.slice(2) : body.slice(1), hex ? 16 : 10);
      return Number.isFinite(code) && code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : all;
    }
    return NAMED[body] ?? all;
  });
}

export function tinyHtml(source: string): ParseNode[] {
  const root: Draft = { tag: '#root', attrs: {}, children: [] };
  const stack: Draft[] = [root];
  const top = (): Draft => stack[stack.length - 1] as Draft;
  const pushText = (raw: string): void => {
    if (raw !== '') top().children.push({ kind: 'text', text: decode(raw) });
  };

  let i = 0;
  while (i < source.length) {
    const lt = source.indexOf('<', i);
    if (lt < 0) {
      pushText(source.slice(i));
      break;
    }
    pushText(source.slice(i, lt));

    if (source.startsWith('<!--', lt)) {
      const end = source.indexOf('-->', lt);
      i = end < 0 ? source.length : end + 3;
      continue;
    }
    if (source.startsWith('<!', lt)) {
      const end = source.indexOf('>', lt);
      i = end < 0 ? source.length : end + 1;
      continue;
    }
    if (source.startsWith('</', lt)) {
      const end = source.indexOf('>', lt);
      const tag = source.slice(lt + 2, end < 0 ? source.length : end).trim().toLowerCase();
      for (let k = stack.length - 1; k > 0; k -= 1) {
        if ((stack[k] as Draft).tag === tag) {
          stack.length = k;
          break;
        }
      }
      i = end < 0 ? source.length : end + 1;
      continue;
    }

    const opened = /^<([a-zA-Z][\w:-]*)/.exec(source.slice(lt));
    if (!opened) {
      pushText('<');
      i = lt + 1;
      continue;
    }
    const tag = (opened[1] as string).toLowerCase();
    const attrs: Record<string, string> = {};
    let j = lt + (opened[0] as string).length;
    let selfClose = false;
    while (j < source.length) {
      while (j < source.length && /\s/.test(source[j] as string)) j += 1;
      if (source[j] === '>') {
        j += 1;
        break;
      }
      if (source[j] === '/' && source[j + 1] === '>') {
        selfClose = true;
        j += 2;
        break;
      }
      const attr = /^([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]*)))?/.exec(source.slice(j));
      if (!attr || attr[0] === '') {
        j += 1;
        continue;
      }
      attrs[(attr[1] as string).toLowerCase()] = decode(attr[2] ?? attr[3] ?? attr[4] ?? '');
      j += (attr[0] as string).length;
    }

    const el: Draft = { tag, attrs, children: [] };
    top().children.push({ kind: 'element', tag, attrs, children: el.children });

    if (RAW.has(tag)) {
      const close = source.toLowerCase().indexOf(`</${tag}`, j);
      const end = close < 0 ? source.length : close;
      if (end > j) el.children.push({ kind: 'text', text: source.slice(j, end) });
      if (close < 0) {
        i = source.length;
      } else {
        const gt = source.indexOf('>', close);
        i = gt < 0 ? source.length : gt + 1;
      }
      continue;
    }

    if (!selfClose && !VOID.has(tag)) stack.push(el);
    i = j;
  }

  return root.children;
}
