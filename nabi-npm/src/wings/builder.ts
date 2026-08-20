// wing 고르기 빌더 (087) — `wings().all().drop('upload').use('tf', { values: [...] })`.
//
// **진짜 청중은 CDN 사용자다.** 타입이 없는 사람을 지켜 주는 것은 런타임에 던지는 말
// 하나뿐이라, 다섯 가지 잘못(이름 오타·모르는 옵션 키·목록 밖 값·`ex` 아닌 커스텀·의존성
// 깨는 drop)이 **부른 그 자리에서, 고칠 방법과 함께** 죽는다. mount 까지 미루면 스택이 나비
// 속을 가리키고, 지금 던지면 사람이 친 그 줄을 가리킨다 — CDN 은 소스맵도 없다.
//
// 아래 CATALOG 가 **공식 wing 의 유일한 차례표**다: `defaultWings` 도, `.all()` 의 답도,
// TS 유니온(`WingName`)도 전부 이 한 목록에서 나온다 — 둘로 적으면 곧 갈린다.
//
// 무게에 대해: 이 빌더는 이름표를 들므로 `defaultWings` 와 같은 무게다(wing 전부가 딸려
// 온다). CDN 묶음은 어차피 통짜라 손해가 없고, npm 으로 몇 개만 쓰는 사람의 가벼운 길은
// 예전 그대로 **배열**이다 — `createNabiWith([boldWing])`. 배열 길은 계속 산다.
import type { Wing } from '../wing/index.js';
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
import { clearFormatWing } from './clear-format/clear-format.js';

// 옵션 값의 모양 — 키 검사 다음의 두 번째 그물이다. `values: 'sans'`(배열 아님)나
// `allowLocalUrls: 'yes'`(불리언 아님)는 조용히 무시되는 대신 여기서 죽는다.
type OptionShape = 'list' | 'boolean';

// 차례표 — `defaultWings` 의 차례가 곧 이 차례다(wings/index.ts 가 여기서 뽑아 간다).
// `make`/`takes` 가 있는 wing 만 `.use(w, options)` 로 옵션을 받는다. 옵션의 **내용** 검사
// (목록 밖 값 따위)는 빌더가 아니라 팩토리의 일이다 — 계약은 하나여야 한다(087 §5).
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
  { w: 'clearFormat', wing: clearFormatWing },
] as const;

// --- 타입 — 위의 런타임 목록에서 그대로 뽑는다 --------------------------------------------------

type Catalog = typeof CATALOG;
// 공식 wing 이름의 유니온 — TS 쪽에서는 `.use('bod')` 가 컴파일에서 죽고 자동완성이 뜬다.
export type WingName = Catalog[number]['w'];
type EntryOf<N extends WingName> = Extract<Catalog[number], { readonly w: N }>;
// 이름별 옵션 타입 — 팩토리의 인자 타입을 그대로 비춘다. 옵션 없는 wing 은 never(못 준다).
export type WingUseOptions<N extends WingName> = EntryOf<N> extends { readonly make: (options?: infer O) => Wing }
  ? NonNullable<O>
  : never;

export interface WingsBuilder {
  // 공식 wing 전부 — 이미 든 것은 그대로 두고 빈자리만 채운다(`.use(w, options)` 로 좁힌
  // 것이 `.all()` 에 씻기면 안 된다). 새 공식 wing 이 늘면 여기로 저절로 들어온다(087 §7-6).
  all(): WingsBuilder;
  // 이름으로 하나 — 이미 들어 있으면 옵션만 얹는(갈아 끼우는) 뜻이다. 딛는 wing 이 있으면
  // (upload → img·a) 조용히 함께 끌어온다 — 더하는 쪽의 자동은 사람이 바란 것을 이루어 준다.
  use<N extends WingName>(name: N, options?: WingUseOptions<N>): WingsBuilder;
  // 객체로 하나 — 커스텀 wing(`w` 가 ex 로 시작해야 한다)과, 팩토리로 미리 지은 인스턴스
  // (`use(makeUploadWing({ allowLocalUrls: true }))`)의 길이다. 옵션은 못 얹는다.
  use(wing: Wing): WingsBuilder;
  // 이미 든 것에서 빼기 — 남는 목록이 성립하지 않으면(딛던 wing 이 무너지면) 그 자리에서
  // 던진다. 자동으로 함께 빼지는 않는다 — 빼는 쪽의 자동은 사람이 안 바란 것까지 지운다.
  drop(name: WingName | (string & {}) | Wing): WingsBuilder;
  // 배열이 필요한 자리의 문 — `createNabiWith` 는 빌더를 그대로 받으므로 보통은 안 부른다.
  build(): readonly Wing[];
}

// --- 런타임 — 항목을 느슨한 한 모양으로 본다 (옵션 타입이 wing 마다 달라 유니온 그대로는
// 호출부가 성립하지 않는다 — 타입은 위에서 뽑았고, 여기서는 모양만 쓴다) ------------------------

interface Entry {
  readonly w: string;
  readonly wing: Wing;
  // 팩토리 — 옵션 타입이 wing 마다 달라 여기서는 모양을 안 적는다(부르는 자리가 한 번 좁힌다).
  readonly make?: unknown;
  readonly takes?: Readonly<Record<string, OptionShape>>;
}

const ENTRIES: readonly Entry[] = CATALOG;
const NAME_LIST = ENTRIES.map((entry) => entry.w).join('·');

// 공식 이름 목록 — CDN 사용자가 `console.log(N.wingNames())` 로 훑는 문. 오류 말에 목록을
// 싣는 것과 같은 뜻이고, 값이 싸다.
export function wingNames(): readonly WingName[] {
  return CATALOG.map((entry) => entry.w);
}

function die(message: string): never {
  throw new Error(`wings() — ${message}`);
}

// 편집거리 — "혹시 이것?" 의 재료다. 이름 서른 개 안짝이라 표 한 줄이면 된다.
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

// "혹시 이것?" — 컴파일러가 없는 사람에게 이 한 줄이 자동완성을 대신한다(087 §검토 A).
// 앞머리가 겹치면 그것부터 잡는다: 'bold' 를 친 사람에게 'b' 는 편집거리로는 멀다.
function suggest(name: string, pool: readonly string[]): string | null {
  const low = name.toLowerCase();
  let best: string | null = null;
  let bestScore = 3; // 편집거리 2 까지만 — 그보다 멀면 넘겨짚는 것이 더 해롭다
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
  const guess = suggest(name, ENTRIES.map((entry) => entry.w));
  const maybe = guess === null ? '' : ` 혹시 ${hintOf(guess)}?`;
  // ex 로 시작하는 글자열 — 커스텀을 이름으로 부르려던 것이다. 커스텀은 객체가 들어와야
  // 계약(조립·커맨드)이 함께 온다.
  const custom = name.startsWith('ex') ? ` 커스텀 wing 은 객체로 넣는다: .use(${name}).` : '';
  die(`없는 wing: '${name}'.${maybe}${custom} 받는 이름: ${NAME_LIST}`);
}

// 옵션 검사 + 팩토리 호출 — 이 자리가 가장 조용히 새는 곳이다. `values` 를 `value` 로 치면
// 빌더는 멀쩡히 돌고 서체 목록만 안 줄어든다: 사람은 "빌더가 안 먹네" 로 결론 내리고 옛
// 12줄로 돌아간다. 모르는 키는 죽어야 한다. 옵션의 **내용**(목록 밖 값)은 팩토리가 던진다.
function optioned(entry: Entry, options: object): Wing {
  if (Array.isArray(options) || typeof options !== 'object' || options === null) {
    die(`'${entry.w}' 의 옵션은 객체다: .use('${entry.w}', { … })`);
  }
  const takes = entry.takes;
  if (takes === undefined || entry.make === undefined) {
    die(`'${entry.w}' 는 받는 옵션이 없다 — .use('${entry.w}') 로 부른다`);
  }
  const keys = Object.keys(takes);
  for (const [key, value] of Object.entries(options)) {
    const shape = takes[key];
    if (shape === undefined) {
      const guess = suggest(key, keys);
      die(`'${entry.w}' 가 모르는 옵션: '${key}'.${guess === null ? '' : ` 혹시 '${guess}'?`} 받는 것: ${keys.join('·')}`);
    }
    if (shape === 'boolean' && typeof value !== 'boolean') {
      die(`'${entry.w}' 의 ${key} 는 true/false 다: { ${key}: true }`);
    }
    if (shape === 'list' && !Array.isArray(value)) {
      die(`'${entry.w}' 의 ${key} 는 배열이다: { ${key}: ['…'] }`);
    }
  }
  // 키·모양을 다 지났다 — 팩토리의 옵션 타입은 wing 마다 달라 여기서 한 번 좁힌다.
  return (entry.make as (given: object) => Wing)(options);
}

// `w` 가 ex 로 시작하는가 — 뒤는 카멜이다(exNote). 까닭은 이름 충돌이 아니라 **문서 손상**이다:
// `w` 는 저장값에 박히므로, 남의 `note` 와 나중의 공식 `note` 가 겹치면 그 사람이 저장해 둔
// 문서가 다른 뜻으로 읽힌다. 코드는 다시 짜면 되지만 남의 글은 못 되돌린다(087 §4).
// 같은 까닭이 커스텀 wing 이 만드는 attr 키에도 한 겹 아래에 그대로 있다 — 그 검사는 다음 판이다.
const EX_SHAPE = /^ex[A-Z0-9]/;

export function wings(): WingsBuilder {
  // 공식 — 이름 → 지금 든 인스턴스. 차례는 이 맵이 아니라 CATALOG 가 정한다(부르는 차례가
  // 차례가 되면 툴바 단추가 사람마다 다른 자리에 선다).
  const official = new Map<string, Wing>();
  // 커스텀 — 공식 뒤에, 들어온 차례로 선다(공식 차례표에 커스텀의 자리는 없다).
  const customs = new Map<string, Wing>();

  const has = (w: string): boolean => official.has(w) || customs.has(w);

  // 더하는 쪽의 자동(087 §검토 C) — 딛는 wing 이 하나도 없으면 조용히 하나 끌어온다.
  // 어느 것을: **wing 이 선언한 차례의 첫 공식 후보**다(upload 의 [img, a]에서 img) —
  // 선언의 차례가 곧 그 wing 의 선호다.
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

  const use = (target: WingName | (string & {}) | Wing, options?: object): WingsBuilder => {
    if (typeof target === 'string') {
      const entry = ENTRIES.find((e) => e.w === target);
      if (entry === undefined) unknownName(target);
      if (options !== undefined) {
        // 옵션이 왔다 — 이미 들어 있어도 **옵션만 얹는** 뜻이라 인스턴스를 갈아 끼운다.
        add(entry.w, optioned(entry, options));
      } else if (!official.has(entry.w)) {
        add(entry.w, entry.wing);
      }
      return self;
    }
    if (typeof target === 'object' && target !== null && typeof target.w === 'string') {
      if (options !== undefined) {
        die(
          `객체에는 옵션을 못 얹는다 — 공식 wing 은 이름으로 부르고(.use('${target.w}', { … })), 커스텀은 저를 지은 팩토리가 옵션을 받는다`,
        );
      }
      if (ENTRIES.some((entry) => entry.w === target.w)) {
        // 공식 이름을 든 객체 — 팩토리로 미리 지은 인스턴스다. 공식 자리(차례 포함)에 앉는다.
        add(target.w, target);
        return self;
      }
      if (!EX_SHAPE.test(target.w)) {
        const fixed = `ex${(target.w[0] ?? '').toUpperCase()}${target.w.slice(1)}`;
        die(`커스텀 wing 의 w 는 ex 로 시작해야 한다: '${target.w}' → '${fixed}'`);
      }
      customs.set(target.w, target);
      pullDeps(target);
      return self;
    }
    die(`use 는 wing 이름(글자열) 또는 wing 객체를 받는다. 받는 이름: ${NAME_LIST}`);
  };

  const drop = (target: WingName | (string & {}) | Wing): WingsBuilder => {
    const w = typeof target === 'string' ? target : typeof target === 'object' && target !== null ? target.w : undefined;
    if (typeof w !== 'string') die('drop 은 wing 이름(글자열) 또는 wing 객체를 받는다');
    if (!has(w)) {
      // 공식 이름이나 ex 꼴이면 "안 들었다" 가 답이고, 그 밖은 오타다 — 각각의 고칠 길을 준다.
      if (!ENTRIES.some((entry) => entry.w === w) && !EX_SHAPE.test(w)) unknownName(w);
      die(`'${w}' 는 지금 목록에 없다 — .all() 이나 .use() 로 든 것만 뺄 수 있다`);
    }
    // 빼기 전에 남는 목록이 성립하는지 본다 — 지금의 makeRegistry 도 잡지만 그건 mount 때다.
    // 빌더를 쓰는 뜻이 "일찍 알려 준다" 인데, 여기서 안 던지면 그 값을 잃는다(087 §검토 C).
    const rest = [...official.values(), ...customs.values()].filter((wing) => wing.w !== w);
    const present = new Set(rest.map((wing) => wing.w));
    for (const wing of rest) {
      const needs = wing.requiresAnyOf;
      if (needs !== undefined && !needs.some((n) => present.has(n))) {
        die(
          `'${w}' 를 빼면 '${wing.w}' 가 설 수 없다('${wing.w}' 는 ${needs.join('·')} 중 하나가 필요하다). 함께 빼려면 .drop('${wing.w}') 을 먼저 부른다`,
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

  const self: WingsBuilder = { all, use, drop, build };
  return self;
}

// defaultWings 의 원료 — wings/index.ts 가 이걸 펴서 내놓는다. 목록이 거기 한 번 더 살면
// `.all()` 과 defaultWings 가 갈린다.
export const $catalogWings: readonly Wing[] = ENTRIES.map((entry) => entry.wing);
