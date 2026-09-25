import type { LocaleInput } from '../locale/index.js';
import { iconHtml } from '../style/icon.js';
// 표 정렬은 보는 쪽에서만 도는 로직이다(편집기는 안 부른다) — 저장값엔 data-nabi-sortable 표식만 남고, 정렬 방향·열은 순간 상태라 나비트리·undo·어떤 출력에도 안 들어간다.
// Table sort is reader-only logic (the editor never calls this) -- only the data-nabi-sortable marker persists, while which column/direction is sorted is transient state that never enters the NABI TREE, undo history, or any output.
import { localeOf, makeTranslator, type LocaleText } from '../locale/index.js';

// 값 없는 불리언 속성 — 있으면 켜짐이다. 적는 쪽은 호스트(또는 표 wing)이고 읽는 쪽이 이 파일이다
// A valueless boolean attribute; present means on. The host (or table wing) writes it, this file reads it
export const SORTABLE_ATTR = 'data-nabi-sortable';

// 값이 2 이상일 때만 병합이다 — [colspan] 존재만 보면 남아 있던 colspan="1"이 병합 아닌 표의 정렬을 조용히 끈다
// Only a value of 2+ counts as merged; checking for [colspan]'s mere presence would let a leftover colspan="1" silently disable sorting on an unmerged table
export function hasMergedCells(table: Element): boolean {
  return [...table.querySelectorAll('[colspan], [rowspan]')].some(
    (cell) =>
      Number.parseInt(cell.getAttribute('colspan') ?? '1', 10) > 1 ||
      Number.parseInt(cell.getAttribute('rowspan') ?? '1', 10) > 1,
  );
}

// 화살표만으로는 스크린 리더가 읽을 것이 없다 — 이름을 함께 단다
// Arrows alone give a screen reader nothing to read, so a name is attached alongside them
const TEXT = {
  sort: {
    ko: '정렬',
    en: 'Sort',
    ja: '並べ替え',
    zh: '排序',
    de: 'Sortieren',
    fr: 'Trier',
    es: 'Ordenar',
    pt: 'Ordenar',
    ru: 'Сортировка',
    ar: 'فرز',
    hi: 'क्रमबद्ध करें',
    bn: 'সাজান',
    ur: 'ترتیب دیں',
    id: 'Urutkan',
  },
  original: {
    ko: '원본',
    en: 'Original',
    ja: '元の順序',
    zh: '原始顺序',
    de: 'Ursprüngliche Reihenfolge',
    fr: 'Ordre d’origine',
    es: 'Orden original',
    pt: 'Ordem original',
    ru: 'Исходный порядок',
    ar: 'الترتيب الأصلي',
    hi: 'मूल क्रम',
    bn: 'মূল ক্রম',
    ur: 'اصل ترتیب',
    id: 'Urutan asli',
  },
  descending: {
    ko: '내림차순',
    en: 'Descending',
    ja: '降順',
    zh: '降序',
    de: 'Absteigend',
    fr: 'Décroissant',
    es: 'Descendente',
    pt: 'Decrescente',
    ru: 'По убыванию',
    ar: 'تنازلي',
    hi: 'अवरोही',
    bn: 'অবরোহী',
    ur: 'نزولی',
    id: 'Menurun',
  },
  ascending: {
    ko: '오름차순',
    en: 'Ascending',
    ja: '昇順',
    zh: '升序',
    de: 'Aufsteigend',
    fr: 'Croissant',
    es: 'Ascendente',
    pt: 'Crescente',
    ru: 'По возрастанию',
    ar: 'تصاعدي',
    hi: 'आरोही',
    bn: 'আরোহী',
    ur: 'صعودی',
    id: 'Menaik',
  },
} as const satisfies Record<string, LocaleText>;

// 꽉 찬 삼각형 둘 — 표 프로그램 어디서나 쓰는 모양이다. 정렬 안 된 열은 둘 다 연하고, 정렬된 열은 하나만 보여 방향을 가장 크게 말한다
// Two filled triangles, the shape used everywhere in spreadsheet software; an unsorted column shows both faintly, a sorted one shows only one, making the direction the loudest signal
export type SortDirection = 'descending' | 'ascending';

export interface SortState {
  readonly column: number;
  readonly direction: SortDirection;
}

// 세 상태 순환 — 원본 → 내림차순 → 오름차순 → 원본. 다른 열을 누르면 그 열이 내림차순으로 시작하고 이전 열은 원본으로 돌아간다
// A three-state cycle: original -> descending -> ascending -> original. Clicking a different column starts it at descending and resets the previous column to original
export function nextSortState(active: SortState | null, column: number): SortState | null {
  if (active?.column !== column) return { column, direction: 'descending' };
  return active.direction === 'descending' ? { column, direction: 'ascending' } : null;
}

// 좁게 잡는다 — 쉼표는 세 자리 묶음일 때만 숫자고 단위가 붙으면 글자다. 1,23,4를 느슨하게 1234로 읽으면 사용자가 적은 적 없는 값으로 정렬된다
// Deliberately narrow; a comma only counts as a thousands separator, and a unit suffix makes it text. Loosely reading "1,23,4" as 1234 would sort by a value the user never actually wrote
const NUMBER = /^-?(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?$/;

// NUMBER에 맞는 값에만 부른다 — 바로 넘기면 12abc를 12로 삼킨다
// Only called on values matching NUMBER; calling it directly would silently read "12abc" as 12
function toNumber(value: string): number {
  return Number.parseFloat(value.replaceAll(',', ''));
}

// 비교 방식(숫자/글자)은 정렬 한 번에 한 번만 정한다 — 쌍마다 고르면 전이성이 깨진다(10<9는 숫자로, 9<사과·사과<10은 글자로 판정돼 한 바퀴 돈다). 빈 칸은 방향과 무관하게 항상 아래다. 답은 행 순서를 매기는 번호 순열이고, DOM 쪽은 그 순서로 다시 붙이기만 한다
// The comparison mode (numeric vs. text) is decided once per sort, not per pair, or transitivity breaks (10<9 numerically, but 9<apple and apple<10 textually loop back on themselves). Blank cells always sink to the bottom regardless of direction. The result is an index permutation; the DOM side just re-appends rows in that order
export function rankRows(values: readonly string[], direction: SortDirection, locale: string): number[] {
  const filled = values.filter((value) => value !== '');
  const numeric = filled.length > 0 && filled.every((value) => NUMBER.test(value));
  // Intl은 ''나 잘못된 BCP 47 태그를 거부한다 — 정렬은 있으면 좋은 기능이라, 잘못된 lang 값이 표를 통째로 못 쓰게 만들면 안 되고 런타임 기본값으로 낮춰야 한다
  // Intl rejects '' and malformed BCP 47 tags. Sorting is optional reader behavior, so a bad host lang must degrade to the runtime default rather than make a table unusable.
  let collator: Intl.Collator;
  try {
    collator = new Intl.Collator(localeOf(locale), { numeric: true });
  } catch {
    collator = new Intl.Collator(undefined, { numeric: true });
  }

  return values
    .map((_, index) => index)
    .sort((a, b) => {
      const left = values[a] as string;
      const right = values[b] as string;
      if (left === '' || right === '') return left === right ? 0 : left === '' ? 1 : -1;
      const order = numeric ? toNumber(left) - toNumber(right) : collator.compare(left, right);
      return direction === 'ascending' ? order : -order;
    });
}

export interface TableSortOptions {
  readonly locale?: LocaleInput;
  // 어떤 표를 붙일까 — 기본은 표식(data-nabi-sortable)이 달린 표만이다. 'all'은 뿌리 안의 표 전부를 받는다(발행 HTML에 표식을 못 심는 호스트·데모의 길)
  // Which tables to attach to; the default is only tables carrying the marker (data-nabi-sortable). 'all' takes every table under the root, a path for hosts (or demos) that can't embed the marker in their published HTML
  readonly tables?: 'marked' | 'all';
}

function attachOne(table: HTMLTableElement, locale: LocaleInput): (() => void) | null {
  // 표식이 있어도 병합이 보이면 거절한다 — 병합된 행은 묶여 있어 재배열이 격자를 부순다
  // Declines even a marked table if it has merged cells; merged rows are bound together, and reordering them would break the grid
  if (hasMergedCells(table)) return null;

  const rows = [...table.rows];
  const header = rows[0];
  const body = rows.slice(1);
  if (!header || body.length === 0) return null;

  // 붙인 시점의 순서가 원본이다 — 행들이 한 부모 안에 있어야 재배열·복원이 온전하다(흩어진 남의 HTML은 안 받는다)
  // The order at attach time is the original; rows must share one parent for reorder/restore to stay intact (structurally scattered foreign HTML is rejected)
  const parent = body[0]?.parentElement;
  if (!parent || body.some((row) => row.parentElement !== parent)) return null;

  const original = [...body];
  let renderedSequence = [...parent.children];
  const owner = table.ownerDocument;
  const t = makeTranslator(locale);
  const label = (key: keyof typeof TEXT): string => t.pick(TEXT[key], key);

  // 상태는 active 하나뿐이다
  // The only state is `active`
  let active: SortState | null = null;
  const buttons: HTMLButtonElement[] = [];
  const buttonCells = new Map<HTMLButtonElement, HTMLTableCellElement>();
  const buttonClicks = new Map<HTMLButtonElement, () => void>();
  const aria = new Map<HTMLTableCellElement, string | null>();

  const render = (): void => {
    for (const [column, button] of buttons.entries()) {
      const state = active?.column === column ? active.direction : null;
      const name = label(state ?? 'original');
      button.innerHTML = iconHtml(`viewer-sort-${state ?? 'original'}`, `sort-${state ?? 'original'}`);
      button.setAttribute('aria-label', `${label('sort')}: ${name}`);
      button.dataset['nabiTip'] = name;
      button.toggleAttribute('data-nabi-sort-active', state !== null);
      // aria-sort는 제목 칸의 것이다 — "이 열은 정렬된다"를 리더가 알 유일한 자리다
      // aria-sort belongs on the header cell; it's the only place a screen reader learns "this column is sorted"
      const cell = buttonCells.get(button);
      if (!cell) continue;
      if (!aria.has(cell)) aria.set(cell, cell.getAttribute('aria-sort'));
      cell.setAttribute('aria-sort', state ?? 'none');
    }
  };

  const apply = (): void => {
    const order = active
      ? rankRows(
          original.map((row) => row.cells[(active as SortState).column]?.textContent?.trim() ?? ''),
          active.direction,
          t.locale,
        ).map((index) => original[index] as HTMLTableRowElement)
      : original;
    // 제목 행은 손대지 않는다 — 몸통 행만 순서대로 다시 붙인다
    // The header row is untouched; only body rows are re-appended in order
    for (const row of order) parent.append(row);
    renderedSequence = [...parent.children];
  };

  let stopLocale = (): void => {};
  const detach = (): void => {
    stopLocale();
    // 순서·단추·aria를 전부 되돌린다 — 해제 뒤의 DOM은 붙이기 전과 같다
    // Restores order, buttons, and aria all together; the DOM after detach matches before attach
    const current = [...parent.children];
    if (current.length === renderedSequence.length && current.every((node, at) => node === renderedSequence[at])) {
      for (const row of original) parent.append(row);
    }
    for (const button of buttons) {
      const cell = buttonCells.get(button);
      const before = cell ? aria.get(cell) : undefined;
      if (
        cell &&
        cell.getAttribute('aria-sort') === (active?.column === buttons.indexOf(button) ? active.direction : 'none')
      ) {
        if (before === null) cell.removeAttribute('aria-sort');
        else if (before !== undefined) cell.setAttribute('aria-sort', before);
      }
      const click = buttonClicks.get(button);
      if (click) button.removeEventListener('click', click);
      button.remove();
    }
  };

  try {
    for (const [column, cell] of [...header.cells].entries()) {
      const button = owner.createElement('button');
      button.type = 'button';
      button.className = 'nabi-sort';
      const click = (): void => {
        active = nextSortState(active, column);
        apply();
        render();
      };
      button.addEventListener('click', click);
      buttons.push(button);
      buttonCells.set(button, cell);
      buttonClicks.set(button, click);
      cell.append(button);
    }
    render();
    stopLocale = t.onChange?.(render) ?? (() => {});
  } catch (error) {
    detach();
    throw error;
  }
  return detach;
}

// 해제는 원본 행 순서까지 되돌린다 — 정렬된 채 떼면 그 순서가 호스트 DOM에 굳는다
// Detaching restores the original row order too; leaving it sorted would freeze that order into the host's DOM
export function attachTableSort(root: HTMLElement, options: TableSortOptions = {}): () => void {
  const owner = root.ownerDocument;
  const locale = options.locale ?? owner.documentElement.lang ?? '';
  const selector = options.tables === 'all' ? 'table' : `table[${SORTABLE_ATTR}]`;
  const tables = [...(root.matches(selector) ? [root] : []), ...root.querySelectorAll(selector)] as HTMLTableElement[];

  const detachers: (() => void)[] = [];
  try {
    for (const table of tables) {
      const detach = attachOne(table, locale);
      if (detach) detachers.push(detach);
    }
  } catch (error) {
    for (const detach of detachers.reverse()) {
      try {
        detach();
      } catch {
        // 설정 실패를 보존하며 앞선 표들을 기준선으로 되돌린다
        // Preserve the setup failure while returning earlier tables to their baseline.
      }
    }
    throw error;
  }

  return () => {
    for (const detach of detachers) detach();
  };
}
