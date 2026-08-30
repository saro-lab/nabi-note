// IO 필터 목록을 짓는 자리 **하나**. 붙여넣기(mountSurface)와 저장·열기(mountFile)가 같은
// 목록을 봐야 하므로, 짓는 법이 두 곳에 살면 안 된다 — 한쪽만 고치면 판에 뜬 형식과 실제로
// 저장되는 형식이 갈린다.
//
// 순서는 여기서 못 박는다: **호스트가 이 mount 에 끼운 것 → 레지스트리의 것(호스트 → wing 은
// makeRegistry 가 이미 접었다) → 내장 셋(nabi·html·md)**. 맨 글자 기본값은 필터가 아니라
// 목록의 끝이라 여기 없다(`collectCandidates` 가 늘 세운다).
import { parseNodes, type ParseNode } from '../html/index.js';
import { $assertIoFilter, makeBuiltinFilters, type IoFilter, type MdEnv } from '../io/index.js';
import type { Registry } from '../wing/index.js';

export interface FilterListOptions {
  readonly registry: Registry;
  // 이 mount 에만 끼우는 것 — 맨 앞에 선다.
  readonly extra?: readonly IoFilter[];
  // html 을 읽는 문 — 안 주면 브라우저의 파서다(그물은 제 손 토크나이저를 준다).
  readonly parse?: (html: string) => readonly ParseNode[];
  readonly allowLocalUrls?: boolean;
}

// md 파서가 보는 어휘 — **등록된 것뿐**이다. 판에 뜨는 후보와 실제 결과가 어긋나면 안 되므로
// 받아 줄 wing 이 없는 문법은 아예 안 선다. `h` 는 wing 이름으로, `li`·`td` 는 부품 이름으로
// 등록되므로 둘 다 물어본다. 값 마크(`tf: mono`)는 값까지 물어야 답이 나온다.
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
