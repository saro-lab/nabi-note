// md 조립 — 나비트리가 마크다운 글자열이 되는 자리다. `html/render.ts` 와 뼈대가 같되(문단은
// 코어의 것이라 조립 맵을 안 거치고, 타입 하나의 조립은 wing 이 든다) 두 가지가 다르다:
//
//   1. **폴백이 있다.** md 에 자리가 없는 것 — 밑줄·유튜브·접기·병합된 표·정렬 문단 — 은
//      그 노드만 html 로 떨어진다. 잃는 것보다 섞는 것이 낫다는 답이고, 그래서 md 저장은
//      "html 이 섞인 md" 를 규칙이 아니라 **폴백의 자연스러운 결과**로 낸다.
//   2. **줄이 곧 문법이다.** 블록 사이는 빈 줄 하나이고, 리스트·인용은 자식이 낸 줄에 제
//      줄머리를 다시 붙인다. 그 붙이는 문이 `ctx.children(separator, indent)` 하나다.
//
// 이스케이프는 여기 한 곳뿐이다 — 평문이 md 표식으로 오독되지 않게 막고, 파서의 `\` 처리와
// 짝이 되어 왕복이 닫힌다.
import { renderParagraphHtml, type HtmlOptions } from '../../html/index.js';
import {
  BR,
  P,
  isElement,
  isWrapper,
  type ElementNode,
  type NabiDoc,
  type NabiNode,
  type SchemaEnv,
} from '../../schema/index.js';
import type { MdBuilders, MdContext } from '../contract.js';

export interface MdOptions {
  readonly env: SchemaEnv;
  // 타입별 md 조립 — `registry.mdBuilders` 가 그대로 든다. 안 넘기면 **전부 html 로 떨어진다**
  // (html 조립과 같은 규칙: 등록된 것이 곧 어휘다).
  readonly builders?: MdBuilders;
  // toMd 없는 노드가 떨어지는 자리 — `registry.builders` 를 실은 html 옵션이다.
  readonly html: HtmlOptions;
  // 문서 전체의 줄머리 — 조각을 남의 글 속에 넣을 때만 쓴다. 기본은 빈 글자다.
  readonly indent?: string;
}

// --- 이스케이프 (이 모듈 전용) ------------------------------------------------------------------

// 평문 속에서 md 로 읽힐 수 있는 글자 — 파서의 `\` 목록(PUNCT)의 부분집합이라 되읽으면
// 그대로 돌아온다. `#`·`>`·`-`·번호는 여기 없다: 그것들은 **줄머리에서만** 문법이다(아래 guard).
const ESCAPE = /[\\`*_~[\]<|]/g;

export function escapeMd(text: string): string {
  return text.replace(ESCAPE, (ch) => `\\${ch}`);
}

// 줄머리에서만 문법이 되는 표식 — 자리가 곧 뜻이라 줄 단위로 막는다.
const LINE_MARK = /^([ \t]*)(?:([#>+-])|(\d{1,9})([.)]))/;

const guard = (text: string): string =>
  text
    .split('\n')
    .map((line) =>
      line.replace(LINE_MARK, (_m, pad: string, mark: string | undefined, num: string, dot: string) =>
        mark !== undefined ? `${pad}\\${mark}` : `${pad}${num}\\${dot}`,
      ),
    )
    .join('\n');

// 줄머리 붙이기 — 빈 줄에는 오른쪽 공백을 턴 것을 붙인다(인용의 빈 줄이 `>` 하나가 되는 자리).
const indented = (text: string, indent: string): string =>
  indent === ''
    ? text
    : text
        .split('\n')
        .map((line) => (line === '' ? indent.replace(/[ \t]+$/, '') : indent + line))
        .join('\n');

// --- 조립 --------------------------------------------------------------------------------------

interface Job {
  readonly env: SchemaEnv;
  readonly builders: MdBuilders;
  readonly html: HtmlOptions;
  readonly indent: string;
}

const ALIGNS: ReadonlySet<string> = new Set(['l', 'c', 'r']);

// 블록 급인가 — html 조립의 그 잣대와 같은 하나다. 블록끼리는 separator 로 갈리고 인라인은 잇는다.
function isBlockGrade(w: string, env: SchemaEnv): boolean {
  return w === P || env.lumps.has(w) || env.blockHolders.has(w) || env.inlineHolders.has(w);
}

function joined(nodes: readonly NabiNode[], job: Job, separator: string, indent: string): string {
  const blocks = nodes.some((node) => isElement(node) && isBlockGrade(node.w, job.env));
  const next: Job = indent === '' ? job : { ...job, indent: job.indent + indent };
  const parts: string[] = [];
  for (const node of nodes) {
    const text = renderNode(node, next);
    // md 에 빈 블록은 없다 — 빈 줄만 남기면 앞뒤 블록이 붙어 버린다.
    if (blocks && text === '') continue;
    parts.push(text);
  }
  return indented(parts.join(blocks ? separator : ''), indent);
}

function contextFor(node: ElementNode, job: Job): MdContext {
  return {
    children: (separator = '\n\n', indent = '') => joined(node.ch, job, separator, indent),
    escape: escapeMd,
    html: () => renderParagraphHtml(node, job.html),
    indent: job.indent,
    env: job.env,
  };
}

function renderNode(node: NabiNode, job: Job): string {
  if (!isElement(node)) return escapeMd(node);
  if (node.w === P) return renderParagraph(node, job);
  // 라인은 코어의 것이라 조립 맵을 안 거친다 — md 의 굳은 줄바꿈은 줄 끝 공백 둘이다.
  if (node.w === BR) return '  \n';
  const builder = job.builders[node.w];
  // md 를 모르는 타입 — 그 노드만 html 로 떨어진다(껍데기를 벗기지 않는다: 벗기면 뜻이 사라진다).
  if (!builder) return renderParagraphHtml(node, job.html);
  return builder(node, contextFor(node, job));
}

// 문단 — 코어의 것이라 조립 맵을 안 거친다. 정하는 것은 속성 셋뿐이다: 정렬·드롭캡이면 html,
// 래퍼문단이면 속의 물건이 곧 그 블록, 제목이면 `#` × n, 그 밖에는 글 그대로다.
function renderParagraph(p: ElementNode, job: Job): string {
  const align = p.a?.['a'];
  // 정렬·드롭캡은 md 에 자리가 없다 — 그 문단만 html 로 낸다.
  if ((typeof align === 'string' && ALIGNS.has(align)) || p.a?.['dc'] === 1) {
    return renderParagraphHtml(p, job.html);
  }
  if (isWrapper(p, job.env)) return joined(p.ch, job, '\n\n', '');

  const inner = joined(p.ch, job, '\n\n', '');
  const h = p.a?.['h'];
  if (typeof h === 'number' && Number.isInteger(h) && h >= 1 && h <= 6) {
    const hashes = '#'.repeat(h);
    // 제목 속은 줄머리 표식이 못 되므로 guard 를 안 씌운다 — `#` 뒤는 이미 인라인 자리다.
    return inner === '' ? hashes : `${hashes} ${inner}`;
  }
  return guard(inner);
}

// --- 문 ----------------------------------------------------------------------------------------

export function renderMarkdown(doc: NabiDoc, options: MdOptions): string {
  const job: Job = {
    env: options.env,
    builders: options.builders ?? {},
    html: options.html,
    indent: options.indent ?? '',
  };
  const blocks: string[] = [];
  for (const node of doc) {
    const text = renderNode(node, job);
    if (text !== '') blocks.push(text);
  }
  return indented(blocks.join('\n\n'), job.indent);
}
