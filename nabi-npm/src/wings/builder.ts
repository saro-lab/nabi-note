// wing 고르기 빌더 — 타입 없는 CDN 사용자가 주 청중이라 다섯 가지 실수를 부른 자리에서 고칠 방법과 함께 죽인다.
// A wing picker for CDN users without types — five kinds of mistakes die right where they're called, with a fix hint.
import type { Wing } from '../wing/index.js';
import { $isBuiltinWing, $markBuiltinAttrOwner } from '../schema/env.js';
import { boldWing, italicWing, strikeWing, subscriptWing, superscriptWing, underlineWing } from './marks/marks.js';
import {
  fontSizeWing,
  highlightWing,
  makeFontSizeWing,
  makeHighlightWing,
  makeTextColorWing,
  makeTypefaceWing,
  textColorWing,
  typefaceWing,
} from './values/values.js';
import { linkWing } from './link/link.js';
import { alignWing, dropCapWing, headingWing } from './attrs/attrs.js';
import { bulletListWing, orderedListWing, taskListWing } from './list/list.js';
import { quoteWing } from './quote/quote.js';
import { detailsWing } from './details/details.js';
import { codeWing } from './code/code.js';
import { dividerWing } from './hr/hr.js';
import { tableWing } from './table/index.js';
import { imageWing, makeImageWing } from './img/img.js';
import { youtubeWing } from './youtube/youtube.js';
import { makeUploadWing, uploadWing } from './upload/upload.js';
import { openFileWing, saveFileWing } from './file/file.js';
import { localHistoryWing } from './local-history/local-history.js';
import { diffWing } from './diff/diff.js';
import { clearFormatWing } from './clear-format/clear-format.js';

// 옵션 값의 모양 — 키 검사 다음 그물이다. 타입이 틀리면(`values: 'sans'`) 조용히 무시 안 되고 여기서 죽는다.
// The shape an option's value must have, checked right after its key — a type mismatch dies here, never fails silently.
type OptionShape = 'list' | 'boolean';

// 공식 wing의 유일한 차례표 — defaultWings·.all()·WingName이 전부 여기서 나온다(wings/index.ts).
// The single source of truth for official wings — defaultWings, .all(), and WingName all derive from this list.
const CATALOG = [
  { w: 'b', wing: boldWing },
  { w: 'i', wing: italicWing },
  { w: 'u', wing: underlineWing },
  { w: 's', wing: strikeWing },
  { w: 'sup', wing: superscriptWing },
  { w: 'sub', wing: subscriptWing },
  { w: 'tf', wing: typefaceWing, make: makeTypefaceWing, takes: { values: 'list' } },
  { w: 'fs', wing: fontSizeWing, make: makeFontSizeWing, takes: { values: 'list' } },
  { w: 'tc', wing: textColorWing, make: makeTextColorWing, takes: { values: 'list' } },
  { w: 'hl', wing: highlightWing, make: makeHighlightWing, takes: { values: 'list' } },
  { w: 'a', wing: linkWing },
  { w: 'h', wing: headingWing },
  { w: 'align', wing: alignWing },
  { w: 'dc', wing: dropCapWing },
  { w: 'ul', wing: bulletListWing },
  { w: 'ol', wing: orderedListWing },
  { w: 'tl', wing: taskListWing },
  { w: 'quote', wing: quoteWing },
  { w: 'details', wing: detailsWing },
  { w: 'code', wing: codeWing },
  { w: 'hr', wing: dividerWing },
  { w: 'table', wing: tableWing },
  { w: 'img', wing: imageWing, make: makeImageWing, takes: { allowLocalUrls: 'boolean' } },
  { w: 'youtube', wing: youtubeWing },
  { w: 'upload', wing: uploadWing, make: makeUploadWing, takes: { allowLocalUrls: 'boolean' } },
  { w: 'save', wing: saveFileWing },
  { w: 'open', wing: openFileWing },
  { w: 'localHistory', wing: localHistoryWing },
  { w: 'diff', wing: diffWing },
  { w: 'clearFormat', wing: clearFormatWing },
] as const;

// --- 타입 — 위의 런타임 목록에서 그대로 뽑는다 --------------------------------------------------

type Catalog = typeof CATALOG;
// 공식 wing 이름의 유니온 — 오타 `.use('bod')`가 컴파일에서 죽고 자동완성이 뜬다.
// The union of official wing names — a typo like `.use('bod')` fails to compile, with autocomplete as a bonus.
export type WingName = Catalog[number]['w'];
type EntryOf<N extends WingName> = Extract<Catalog[number], { readonly w: N }>;
// 옵션 없는 wing은 never — 팩토리 인자 타입을 그대로 비춰서, 못 주는 자리는 타입부터 막는다.
// A wing with no options gets never — mirrors the factory's argument type, so a bad call fails to typecheck.
export type WingUseOptions<N extends WingName> =
  EntryOf<N> extends { readonly make: (options?: infer O) => Wing } ? NonNullable<O> : never;

export interface WingsBuilder {
  // 공식 wing 전부를 빈자리에만 채운다 — `.use(w, options)`로 좁힌 것은 안 씻는다.
  // Fills every official wing into empty slots only — anything narrowed via `.use(w, options)` survives.
  all(): WingsBuilder;
  // wing이 스스로 `basic: true`라 말한 것만 — upload·save·open처럼 빠지는 것은 호스트가 직접 `.use()`한다.
  // Only wings that declare `basic: true` — the excluded ones (upload/save/open) need an explicit `.use()`.
  allBasic(): WingsBuilder;
  // 이미 들어 있으면 옵션만 갈아 끼운다 — 딛는 wing(upload → img·a)은 조용히 함께 끌려온다.
  // Already-present wings just get new options; a dependency (upload → img/a) is pulled in silently.
  use<N extends WingName>(name: N, options?: WingUseOptions<N>): WingsBuilder;
  // 객체로 하나 — 커스텀(`ex`로 시작) 또는 팩토리가 미리 지은 인스턴스. 옵션은 못 얹는다.
  // Add by object — a custom wing (`ex`-prefixed) or a factory-built instance; no options allowed here.
  use(wing: Wing): WingsBuilder;
  // 빼면 남는 목록이 안 성립할 때(의존 wing이 무너질 때) 그 자리에서 던진다 — 자동으로 함께 안 뺀다.
  // Throws immediately if removing this breaks a dependent wing — it never drops dependents automatically.
  drop(name: WingName | (string & {}) | Wing): WingsBuilder;
  // 배열이 필요한 자리의 문 — `createNabiWith`는 빌더를 그대로 받으므로 보통 안 부른다.
  // An escape hatch for callers needing a plain array — `createNabiWith` accepts the builder directly.
  build(): readonly Wing[];
}

// 런타임은 항목을 느슨한 한 모양으로 본다 — 옵션 타입이 wing마다 달라 유니온 그대로는 호출부가 안 선다.
// At runtime, entries are treated as one loose shape — a raw union of option types wouldn't typecheck at the call site, so only the shape is used here (the precise types live above).

interface Entry {
  readonly w: string;
  readonly wing: Wing;
  // 옵션 타입이 wing마다 달라 여기선 모양을 안 적는다 — 부르는 자리에서 한 번 좁힌다.
  // Left untyped here since each wing's option shape differs — the call site narrows it.
  readonly make?: unknown;
  readonly takes?: Readonly<Record<string, OptionShape>>;
}

const ENTRIES: readonly Entry[] = CATALOG;
for (const entry of ENTRIES) $markBuiltinAttrOwner(entry.wing, []);
const NAME_LIST = ENTRIES.map((entry) => entry.w).join('·');

// CDN 사용자가 `console.log(N.wingNames())`로 훑는 문 — 값이 싸서 오류 말에 싣는 것과 같은 뜻이다.
// The door a CDN user checks via `console.log(N.wingNames())` — cheap enough to double as an error hint.
export function wingNames(): readonly WingName[] {
  return CATALOG.map((entry) => entry.w);
}

function die(message: string): never {
  throw new Error(`wings() — ${message}`);
}

// 편집거리 — "혹시 이것?"의 재료. 이름이 서른 개 안짝이라 표 한 줄이면 충분하다.
// Edit distance, feeding the "did you mean?" hint — a plain DP row is enough for ~30 names.
function distance(a: string, b: string): number {
  let row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i += 1) {
    const next = [i];
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      next.push(Math.min((next[j - 1] as number) + 1, (row[j] as number) + 1, (row[j - 1] as number) + cost));
    }
    row = next;
  }
  return row[b.length] as number;
}

// 컴파일러 없는 사람에게 자동완성을 대신하는 한 줄. 앞머리가 겹치면 편집거리보다 그것부터 잡는다.
// Stands in for autocomplete when there's no compiler — a shared prefix wins over raw edit distance.
function suggest(name: string, pool: readonly string[]): string | null {
  const low = name.toLowerCase();
  let best: string | null = null;
  let bestScore = 3; // 편집거리 2까지만 — 그보다 멀면 넘겨짚는 게 더 해롭다
  for (const candidate of pool) {
    const w = candidate.toLowerCase();
    if (w === low) return candidate; // 대소문자만 다르다
    const score = low.startsWith(w) || w.startsWith(low) ? 1 : distance(low, w);
    if (score < bestScore) {
      bestScore = score;
      best = candidate;
    }
  }
  return best;
}

// 이름 곁의 사람 말 — `'b'(굵게·Bold)`. 오류 말이 곧 문서라, 짧은 이름의 낯섦을 여기서 갚는다.
function hintOf(w: string): string {
  const label = ENTRIES.find((entry) => entry.w === w)?.wing.button?.label;
  const words = label ? [label['ko'], label['en']].filter((text): text is string => typeof text === 'string') : [];
  return words.length > 0 ? `'${w}'(${words.join('·')})` : `'${w}'`;
}

function unknownName(name: string): never {
  const guess = suggest(
    name,
    ENTRIES.map((entry) => entry.w),
  );
  const maybe = guess === null ? '' : ` 혹시 ${hintOf(guess)}?`;
  // ex로 시작하면 커스텀을 이름으로 부르려던 것 — 커스텀은 객체로 넣어야 계약이 함께 온다.
  // An `ex`-prefixed name means someone tried to call a custom wing by name — it needs the object instead.
  const custom = name.startsWith('ex') ? ` 커스텀 wing은 객체로 전달해 주세요: .use(${name}).` : '';
  die(`없는 wing: '${name}'.${maybe}${custom} 받는 이름: ${NAME_LIST}`);
}

// 옵션 검사 + 팩토리 호출 — 여기가 제일 조용히 새는 곳이다. `values`를 `value`로 치면 모르는 키는 죽어야 한다.
// Validates options then calls the factory — the quietest place to leak a typo, so an unknown key must die here.
function optioned(entry: Entry, options: object): Wing {
  if (Array.isArray(options) || typeof options !== 'object' || options === null) {
    die(`'${entry.w}' 의 옵션은 객체로 전달해 주세요: .use('${entry.w}', { … })`);
  }
  const takes = entry.takes;
  if (takes === undefined || entry.make === undefined) {
    die(`'${entry.w}' 는 추가 옵션을 지원하지 않습니다 — .use('${entry.w}') 로 호출해 주세요`);
  }
  const keys = Object.keys(takes);
  for (const [key, value] of Object.entries(options)) {
    const shape = takes[key];
    if (shape === undefined) {
      const guess = suggest(key, keys);
      die(
        `'${entry.w}' 가 모르는 옵션: '${key}'.${guess === null ? '' : ` 혹시 '${guess}'?`} 받는 것: ${keys.join('·')}`,
      );
    }
    if (shape === 'boolean' && typeof value !== 'boolean') {
      die(`'${entry.w}' 의 ${key} 는 true/false로 지정해 주세요: { ${key}: true }`);
    }
    if (shape === 'list' && !Array.isArray(value)) {
      die(`'${entry.w}' 의 ${key} 는 배열로 지정해 주세요: { ${key}: ['…'] }`);
    }
  }
  // 키·모양 검사를 다 지났다 — 옵션 타입은 wing마다 달라 여기서 한 번 좁힌다.
  // Past key/shape validation — option types differ per wing, so this cast narrows once.
  const wing = (entry.make as (given: object) => Wing)(options);
  $markBuiltinAttrOwner(wing, []);
  return wing;
}

// `w`가 ex로 시작해야 하는 까닭은 이름 충돌이 아니라 문서 손상이다 — `w`는 저장값에 박혀 남의 글을 못 되돌린다.
// The `ex` prefix guards against corrupting saved documents, not naming clashes — `w` is baked into storage forever.
const EX_SHAPE = /^ex[A-Z0-9][A-Za-z0-9]*$/;

// `allBasic()`의 유일한 잣대 — 선언만 본다. `if (w === 'upload')` 같은 하드코딩은 어디에도 없다.
// The sole test for `allBasic()` — declaration only, never a hardcoded `if (w === 'upload')`.
export function $isBasic(wing: Wing): boolean {
  return wing.basic === true;
}

export function wings(): WingsBuilder {
  // 이름 → 인스턴스. 차례는 이 맵이 아니라 CATALOG가 정한다(안 그러면 툴바 단추 순서가 들쭉날쭉해진다).
  // Name to instance; order comes from CATALOG, not this map, or toolbar buttons would land in call order.
  const official = new Map<string, Wing>();
  // 공식 뒤에, 들어온 차례로 선다 — 공식 차례표엔 커스텀의 자리가 없다.
  // Sits after the official wings, in insertion order — the catalog has no slot for customs.
  const customs = new Map<string, Wing>();

  const has = (w: string): boolean => official.has(w) || customs.has(w);

  // 딛는 wing이 하나도 없으면 조용히 끌어온다 — wing이 선언한 차례의 첫 공식 후보를 쓴다.
  // Silently pulls in a dependency when none is present — the first official candidate the wing declared.
  const pullDeps = (wing: Wing): void => {
    const needs = wing.requiresAnyOf;
    if (needs === undefined || needs.some((n) => has(n))) return;
    for (const n of needs) {
      const dep = ENTRIES.find((entry) => entry.w === n);
      if (dep !== undefined) {
        add(dep.w, dep.wing);
        return;
      }
    }
    // 후보가 전부 커스텀 이름이면 여기서 못 채운다 — 그 어긋남은 등록(makeRegistry)이 잡는다.
  };

  const add = (w: string, wing: Wing): void => {
    official.set(w, wing);
    pullDeps(wing);
  };

  const all = (): WingsBuilder => {
    for (const entry of ENTRIES) {
      if (!official.has(entry.w)) official.set(entry.w, entry.wing);
    }
    return self;
  };

  const allBasic = (): WingsBuilder => {
    for (const entry of ENTRIES) {
      if (!$isBasic(entry.wing)) continue;
      if (!official.has(entry.w)) official.set(entry.w, entry.wing);
    }
    return self;
  };

  const use = (target: WingName | (string & {}) | Wing, options?: object): WingsBuilder => {
    if (typeof target === 'string') {
      const entry = ENTRIES.find((e) => e.w === target);
      if (entry === undefined) unknownName(target);
      if (options !== undefined) {
        // 이미 들어 있어도 옵션이 왔으면 인스턴스를 갈아 끼운다 — "옵션만 얹는다"는 뜻이다.
        // Even if already present, incoming options replace the instance — that's what "just add options" means.
        add(entry.w, optioned(entry, options));
      } else if (!official.has(entry.w)) {
        add(entry.w, entry.wing);
      }
      return self;
    }
    if (typeof target === 'object' && target !== null && typeof target.w === 'string') {
      if (options !== undefined) {
        die(
          `객체에는 옵션을 추가할 수 없습니다. 공식 wing은 이름으로 호출해 주세요(.use('${target.w}', { … })), 커스텀 wing의 옵션은 해당 팩토리에 전달해 주세요`,
        );
      }
      if (ENTRIES.some((entry) => entry.w === target.w)) {
        // 공식 이름을 든 객체는 팩토리로 미리 지은 인스턴스 — 공식 자리(차례 포함)에 앉는다.
        // An object carrying an official name is a pre-built instance — it takes the official slot, order included.
        if (!$isBuiltinWing(target)) die(`'${target.w}' 는 package 공식 wing 인스턴스만 객체로 전달할 수 있습니다`);
        add(target.w, target);
        return self;
      }
      if (!EX_SHAPE.test(target.w)) {
        const fixed = `ex${(target.w[0] ?? '').toUpperCase()}${target.w.slice(1)}`;
        die(`커스텀 wing 의 w 는 ex로 시작해야 합니다: '${target.w}' → '${fixed}'`);
      }
      customs.set(target.w, target);
      pullDeps(target);
      return self;
    }
    die(`use 는 wing 이름(문자열) 또는 wing 객체를 받습니다. 받는 이름: ${NAME_LIST}`);
  };

  const drop = (target: WingName | (string & {}) | Wing): WingsBuilder => {
    const w =
      typeof target === 'string' ? target : typeof target === 'object' && target !== null ? target.w : undefined;
    if (typeof w !== 'string') die('drop 은 wing 이름(문자열) 또는 wing 객체를 받습니다');
    if (!has(w)) {
      // 공식 이름이나 ex 꼴이면 "안 들었다"가 답, 그 밖은 오타다 — 각각 다른 고칠 길을 준다.
      // A known/ex-shaped name just isn't present; anything else is a typo — each gets its own fix hint.
      if (!ENTRIES.some((entry) => entry.w === w) && !EX_SHAPE.test(w)) unknownName(w);
      die(`'${w}' 는 현재 목록에 없습니다 — .all()·.allBasic() 이나 .use() 로 추가한 wing만 제거할 수 있습니다`);
    }
    // makeRegistry도 이걸 잡지만 mount 때라 늦다 — 빌더는 일찍 알려 준다는 값이 있어 여기서도 던진다.
    // makeRegistry catches this too, but only at mount time — the builder's whole point is catching it earlier.
    const rest = [...official.values(), ...customs.values()].filter((wing) => wing.w !== w);
    const present = new Set(rest.map((wing) => wing.w));
    for (const wing of rest) {
      const needs = wing.requiresAnyOf;
      if (needs !== undefined && !needs.some((n) => present.has(n))) {
        die(
          `'${w}' 를 빼면 '${wing.w}' 를 사용할 수 없습니다('${wing.w}' 는 ${needs.join('·')} 중 하나가 필요합니다). 함께 제거하려면 .drop('${wing.w}') 을 먼저 호출해 주세요`,
        );
      }
    }
    if (!official.delete(w)) customs.delete(w);
    return self;
  };

  const build = (): readonly Wing[] => [
    ...ENTRIES.filter((entry) => official.has(entry.w)).map((entry) => official.get(entry.w) as Wing),
    ...customs.values(),
  ];

  const self: WingsBuilder = { all, allBasic, use, drop, build };
  return self;
}

// defaultWings의 원료 — 목록이 wings/index.ts에도 한 번 더 살면 `.all()`과 갈린다.
// Feeds defaultWings — duplicating this list in wings/index.ts would let it drift from `.all()`.
export const $catalogWings: readonly Wing[] = ENTRIES.map((entry) => entry.wing);
