// html/render.ts와 뼈대는 같지만 md에 자리가 없는 노드(밑줄·유튜브·접기·병합된 표·정렬 문단)는
// 그 노드만 html로 떨어진다(잃는 것보다 섞는 게 낫다) — 이스케이프도 여기 한 곳이라 파서의 `\` 처리와 짝을 이뤄 왕복이 닫힌다.
// Same skeleton as html/render.ts, but a node md can't express (underline, youtube, details, merged table, aligned paragraph) falls back to raw html for just that node — mixing beats losing it. Escaping lives only here, pairing with the parser's `\` handling to close the round trip.
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
  // 안 넘기면 전부 html로 떨어진다 — html 조립과 같은 규칙(등록된 것이 곧 어휘다).
  // Without builders, everything falls back to html — same rule as html assembly: registered is the vocabulary.
  readonly builders?: MdBuilders;
  // toMd 없는 노드가 떨어지는 자리.
  // Where a node with no toMd lands.
  readonly html: HtmlOptions;
  readonly indent?: string;
}

// --- 이스케이프 (이 모듈 전용) ------------------------------------------------------------------

// 파서의 이스케이프 목록(PUNCT)의 부분집합이라 되읽으면 그대로 돌아온다 — 줄머리 전용 문법(#·>·-·번호)은 빼고 guard가 맡는다.
// A subset of the parser's own escape list (PUNCT), so it round-trips; line-start-only syntax (#, >, -, numbers) is excluded and handled by guard instead.
const ESCAPE = /[\\`*_~[\]<|]/g;

export function escapeMd(text: string): string {
  return text.replace(ESCAPE, (ch) => `\\${ch}`);
}

// 자리가 곧 뜻이라 줄 단위로 막는다.
// Position is meaning, so this is guarded line by line.
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

// 빈 줄에는 오른쪽 공백을 턴 것을 붙인다 — 인용의 빈 줄이 `>` 하나가 되는 자리.
// A blank line gets the indent right-trimmed — where a quote's empty line becomes a bare `>`.
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

// html 조립과 같은 잣대 — 블록끼리는 separator로 갈리고 인라인은 그냥 잇는다.
// Same test as html assembly; blocks split on separator, inline just concatenates.
function isBlockGrade(w: string, env: SchemaEnv): boolean {
  return w === P || env.lumps.has(w) || env.blockHolders.has(w) || env.inlineHolders.has(w);
}

function joined(nodes: readonly NabiNode[], job: Job, separator: string, indent: string): string {
  const blocks = nodes.some((node) => isElement(node) && isBlockGrade(node.w, job.env));
  const next: Job = indent === '' ? job : { ...job, indent: job.indent + indent };
  const parts: string[] = [];
  for (const node of nodes) {
    const text = renderNode(node, next);
    // md에 빈 블록은 없다 — 남기면 앞뒤 블록이 붙어 버린다.
    // No empty blocks in md; leaving one would fuse the surrounding blocks together.
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
  // 코어의 것이라 조립 맵을 안 거친다 — md의 굳은 줄바꿈은 줄 끝 공백 둘이다.
  // Core's own node, bypassing the builder map; a hard break in md is a trailing double-space.
  if (node.w === BR) return '  \n';
  const builder = Object.prototype.hasOwnProperty.call(job.builders, node.w) ? job.builders[node.w] : undefined;
  // md를 모르는 타입은 껍데기를 안 벗기고 그 노드만 html로 떨어진다.
  // A type md doesn't know falls back to html for just that node, unpeeled — peeling would lose its meaning.
  if (!builder) return renderParagraphHtml(node, job.html);
  return builder(node, contextFor(node, job));
}

// 속성만으로 갈린다 — 정렬·드롭캡은 html, 래퍼문단은 속의 물건이 곧 블록, 제목은 `#`×n, 나머지는 글 그대로.
// Branches purely on attrs: aligned/drop-cap falls to html, a wrapper paragraph is just its contents, a heading becomes `#`xn, else plain text.
function renderParagraph(p: ElementNode, job: Job): string {
  const align = p.a?.['a'];
  if ((typeof align === 'string' && ALIGNS.has(align)) || p.a?.['dc'] === 1) {
    return renderParagraphHtml(p, job.html);
  }
  if (isWrapper(p, job.env)) return joined(p.ch, job, '\n\n', '');

  const inner = joined(p.ch, job, '\n\n', '');
  const h = p.a?.['h'];
  if (typeof h === 'number' && Number.isInteger(h) && h >= 1 && h <= 6) {
    const hashes = '#'.repeat(h);
    // 제목 뒤는 이미 인라인 자리라 줄머리 표식이 못 되므로 guard를 안 씌운다.
    // A heading's content is already inline territory, so guard (line-start escaping) doesn't apply.
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
