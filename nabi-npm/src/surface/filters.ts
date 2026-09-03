// IO 필터 목록을 짓는 단 하나의 자리 — 붙여넣기와 저장·열기가 같은 목록을 봐야 하므로 두 곳에 따로 두면 판과 실제 저장 형식이 갈린다. 순서: 호스트가 이 mount에 끼운 것 → 레지스트리 → 내장 셋(nabi·html·md)
// The single place that builds the IO filter list; paste and save/open must see the same list, or the menu and what actually gets saved would diverge. Order: host-supplied extras -> registry -> built-ins (nabi/html/md)
import { parseNodes, type ParseNode } from '../html/index.js';
import { $assertIoFilter, makeBuiltinFilters, type IoFilter, type MdEnv } from '../io/index.js';
import type { Registry } from '../wing/index.js';

export interface FilterListOptions {
  readonly registry: Registry;
  // 이 mount에만 끼우는 필터 — 목록 맨 앞에 선다
  // Filters scoped to this mount only; they come first in the list
  readonly extra?: readonly IoFilter[];
  // html을 읽는 문 — 안 주면 브라우저 파서다(테스트는 자체 토크나이저를 준다)
  // The HTML parser; defaults to the browser's own, with tests supplying their own tokenizer
  readonly parse?: (html: string) => readonly ParseNode[];
  readonly allowLocalUrls?: boolean;
}

// md 파서는 등록된 문법만 인식한다 — 판의 후보와 실제 결과가 어긋나면 안 되므로 받아 줄 wing이 없는 문법은 안 선다(h는 wing 이름, li·td는 부품 이름으로 등록되므로 둘 다 물어본다)
// The md parser recognizes only registered syntax, since the menu's candidates must match actual results; syntax with no owning wing never fires (h is registered as a wing name, li/td as part names, so both are checked)
export function mdEnvOf(registry: Registry, allowLocalUrls?: boolean): MdEnv {
  return {
    has: (w) => registry.wingOf(w) !== null || registry.ownerOf(w) !== null,
    hasValue: (w, value) => registry.wingOf(w)?.currentValue?.({ w, a: { v: value }, ch: [] }) === value,
    ...(allowLocalUrls ? { allowLocalUrls: true } : {}),
  };
}

export function ioFiltersOf(options: FilterListOptions): readonly IoFilter[] {
  const { registry } = options;
  const extraCount = options.extra?.length ?? 0;
  const filters = [
    ...(options.extra ?? []),
    ...registry.ioFilters,
    ...makeBuiltinFilters({
      env: registry.env,
      ...(registry.claim ? { claim: registry.claim } : {}),
      parse: options.parse ?? parseNodes,
      md: mdEnvOf(registry, options.allowLocalUrls),
      ...(options.allowLocalUrls ? { allowLocalUrls: true } : {}),
    }),
  ];
  const reserved = new Set(['nabi', 'html', 'markdown', 'text']);
  const seen = new Set<string>();
  for (const [index, filter] of filters.entries()) {
    $assertIoFilter(filter);
    if (index < extraCount && reserved.has(filter.id)) {
      throw new Error(`IO filter id "${filter.id}" is reserved by a built-in format`);
    }
    if (seen.has(filter.id)) throw new Error(`IO filter id "${filter.id}" is duplicated`);
    seen.add(filter.id);
  }
  return filters;
}
