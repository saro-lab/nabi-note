// 입력은 나비트리 JSON/HTML 문자열 두 개 — 살아있는 Nabi 인스턴스 없이 임의의 두 저장본을 비교한다
// Inputs are two saved snapshots (NabiDoc JSON or HTML) — no live Nabi instance required
import { $fromJson, $guarded } from '../schema/json.js';
import type { ElementNode, NabiDoc } from '../schema/types.js';
import { parseNodes, renderParagraphHtml, type HtmlOptions } from '../html/index.js';
import { $importDoc } from '../html/import.js';
import type { Registry, StoredHtmlOptions } from '../wing/index.js';
import { matchBlocks, type DiffEntry, type DiffKind, type MatchBlock } from './match.js';
import { htmlText, htmlTextFormats, paintHtml, type CharRange } from './paint.js';

export type { CharRange } from './paint.js';
export type { DiffEntry, DiffKind } from './match.js';

// --- 순수 비교 ---------------------------------------------------------------------------------

export interface DiffPaneBlock {
  readonly html: string;
  readonly text: string;
  readonly entry: number;
}

export interface DocDiff {
  readonly entries: readonly DiffEntry[];
  readonly before: readonly DiffPaneBlock[];
  readonly after: readonly DiffPaneBlock[];
  // kind !== 'same'인 entry 인덱스 — 이전/다음 점프 차례표
  // Indices where kind !== 'same' — the prev/next jump sequence
  readonly changes: readonly number[];
}

export type DiffOptions = StoredHtmlOptions;

const jobOf = (registry: Registry, options?: DiffOptions): HtmlOptions => ({
  env: registry.env,
  builders: registry.builders,
  ...(options?.allowLocalUrls ? { allowLocalUrls: true } : {}),
});

// HTML 문자열 갈래는 DOMParser를 쓰므로 브라우저 전용 — 없으면 null
// The HTML-string branch needs DOMParser, so it's browser-only — null otherwise
function normalizeInput(input: unknown, registry: Registry, options?: DiffOptions): NabiDoc | null {
  return $guarded('diff', null, () => {
    if (typeof input === 'string') {
      if (typeof DOMParser === 'undefined') return null;
      const nodes = parseNodes(input);
      return $importDoc(nodes, {
        env: registry.env,
        ...(options?.allowLocalUrls ? { allowLocalUrls: true } : {}),
        ...(registry.claim ? { claim: registry.claim } : {}),
      });
    }
    return $fromJson(input, registry.env);
  });
}

const DEL_CLASS = 'nabi-diff-del';
const INS_CLASS = 'nabi-diff-ins';

export function diffDocs(before: unknown, after: unknown, registry: Registry, options?: DiffOptions): DocDiff | null {
  const beforeDoc = normalizeInput(before, registry, options);
  const afterDoc = normalizeInput(after, registry, options);
  if (!beforeDoc || !afterDoc) return null;

  return $guarded('diffDocs', null, () => {
    const job = jobOf(registry, options);
    const toBlocks = (doc: NabiDoc): MatchBlock[] =>
      doc.map((block: ElementNode) => {
        const html = renderParagraphHtml(block, job);
        return { key: html, text: htmlText(html), formats: htmlTextFormats(html) };
      });
    const beforeBlocks = toBlocks(beforeDoc);
    const afterBlocks = toBlocks(afterDoc);
    const entries = matchBlocks(beforeBlocks, afterBlocks);

    const beforeViews: DiffPaneBlock[] = new Array(beforeBlocks.length);
    const afterViews: DiffPaneBlock[] = new Array(afterBlocks.length);
    const changes: number[] = [];
    entries.forEach((entry, at) => {
      if (entry.kind !== 'same') changes.push(at);
      if (entry.before !== null) {
        const block = beforeBlocks[entry.before] as MatchBlock;
        const ranges = entry.beforeRanges ?? [];
        beforeViews[entry.before] = {
          html: ranges.length > 0 ? paintHtml(block.key, ranges, DEL_CLASS) : block.key,
          text: block.text,
          entry: at,
        };
      }
      if (entry.after !== null) {
        const block = afterBlocks[entry.after] as MatchBlock;
        const ranges = entry.afterRanges ?? [];
        afterViews[entry.after] = {
          html: ranges.length > 0 ? paintHtml(block.key, ranges, INS_CLASS) : block.key,
          text: block.text,
          entry: at,
        };
      }
    });
    return { entries, before: beforeViews, after: afterViews, changes };
  });
}
