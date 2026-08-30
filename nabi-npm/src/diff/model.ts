// diff 순수 모델 — DOM mount와 fullscreen wing은 각각 `mount.ts`·`wing.ts`에 산다.
//
// 입력은 `setJson`/`setHtml` 이 받는 것과 같은 결의 **데이터 두 개**다(나비트리 JSON 또는 HTML
// 글자열) — 살아있는 `Nabi` 인스턴스가 있어야 도는 게 아니라서, 임의의 두 저장본을 그대로
// 넣을 수 있다. 매칭은 `_id` 를 안 본다(260825_001 4절 1번): 흔한 쓰임이 이미 저장된 과거본과
// 지금 상태의 비교라, 저장된 쪽에 지금 트리로 이어지는 `_id` 계보가 있으리라는 보장이 없다.
//
// `diffDocs`는 블록 매칭 + 글자 단위 diff + 조립 HTML(강조 span 포함)까지 낸다.
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
  // 조립 HTML — changed 블록에는 글자 강조 span(.nabi-diff-del/.nabi-diff-ins)이 이미 입혀져 있다.
  readonly html: string;
  readonly text: string;
  // entries 의 인덱스 — 이 블록이 속한 짝.
  readonly entry: number;
}

export interface DocDiff {
  readonly entries: readonly DiffEntry[];
  readonly before: readonly DiffPaneBlock[];
  readonly after: readonly DiffPaneBlock[];
  // kind !== 'same' 인 entry 인덱스 — 이전/다음 점프의 차례표.
  readonly changes: readonly number[];
}

export type DiffOptions = StoredHtmlOptions;

const jobOf = (registry: Registry, options?: DiffOptions): HtmlOptions => ({
  env: registry.env,
  builders: registry.builders,
  ...(options?.allowLocalUrls ? { allowLocalUrls: true } : {}),
});

// 나비트리 JSON 또는 HTML 글자열 → 내부 트리. 거절 규칙은 setJson/setHtml 과 같다(아니면 null).
// HTML 글자열 갈래는 DOMParser 를 쓰므로 브라우저 전용이다 — 없는 환경에서는 null 로 거절한다.
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
