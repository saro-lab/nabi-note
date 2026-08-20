// 표 정렬 — 보는 쪽에서만 도는 로직이다. 편집기는 이 파일을 부르지 않는다.
//
// 저장값에 남는 것은 `data-nabi-sortable` 표식 하나뿐이다 — 어느 열을 어느 방향으로 정렬했는지는
// 보는 쪽의 순간 상태이고, 나비트리에도 undo 이력에도 어느 출력에도 안 들어간다.
//
// import 는 `locale/` 하나뿐이다 — 읽는 페이지가 편집기 무게 없이 이 모듈만 실을 수 있어야 한다
// (그물 test/entry.test.ts 가 그것을 기계로 지킨다).
import { makeTranslator, type LocaleText } from '../locale/index.js';

// 값 없는 불리언 속성 — 있으면 켜짐이다. 적는 쪽은 호스트(또는 표 wing)이고 읽는 쪽이 이 파일이다.
export const SORTABLE_ATTR = 'data-nabi-sortable';

// 값이 2 이상일 때만 병합이다 — `[colspan]` 존재만 보면 남아 있던 `colspan="1"` 이
// 병합 아닌 표의 정렬을 조용히 끈다.
export function hasMergedCells(table: Element): boolean {
  return [...table.querySelectorAll('[colspan], [rowspan]')].some(
    (cell) =>
      Number.parseInt(cell.getAttribute('colspan') ?? '1', 10) > 1 ||
      Number.parseInt(cell.getAttribute('rowspan') ?? '1', 10) > 1,
  );
}

// 화살표만으로는 스크린 리더가 읽을 것이 없다 — 이름을 함께 단다.
const TEXT = {
  sort: { ko: '정렬', en: 'Sort', ja: '並べ替え', zh: '排序', de: 'Sortieren', fr: 'Trier', es: 'Ordenar', pt: 'Ordenar', ru: 'Сортировка', ar: 'فرز', hi: 'क्रमबद्ध करें', bn: 'সাজান', ur: 'ترتیب دیں', id: 'Urutkan' },
  original: { ko: '원본', en: 'Original', ja: '元の順序', zh: '原始顺序', de: 'Ursprüngliche Reihenfolge', fr: 'Ordre d’origine', es: 'Orden original', pt: 'Ordem original', ru: 'Исходный порядок', ar: 'الترتيب الأصلي', hi: 'मूल क्रम', bn: 'মূল ক্রম', ur: 'اصل ترتیب', id: 'Urutan asli' },
  descending: { ko: '내림차순', en: 'Descending', ja: '降順', zh: '降序', de: 'Absteigend', fr: 'Décroissant', es: 'Descendente', pt: 'Decrescente', ru: 'По убыванию', ar: 'تنازلي', hi: 'अवरोही', bn: 'অবরোহী', ur: 'نزولی', id: 'Menurun' },
  ascending: { ko: '오름차순', en: 'Ascending', ja: '昇順', zh: '升序', de: 'Aufsteigend', fr: 'Croissant', es: 'Ascendente', pt: 'Crescente', ru: 'По возрастанию', ar: 'تصاعدي', hi: 'आरोही', bn: 'আরোহী', ur: 'صعودی', id: 'Menaik' },
} as const satisfies Record<string, LocaleText>;

// 꽉 찬 삼각형 둘 — 어느 표 프로그램에서나 쓰는 모양이다. 정렬 안 된 열은 둘 다 연하고
// 정렬된 열은 **하나만** 보인다: 반대쪽의 빈자리가 어느 쪽으로 갔는지를 가장 크게 말한다.
const UP = 'M8 2.9 12 7.4H4Z';
const DOWN = 'M8 13.1 4 8.6h8Z';

const ICONS = {
  original: `<path d="${UP}" opacity="0.38"/><path d="${DOWN}" opacity="0.38"/>`,
  ascending: `<path d="${UP}"/>`,
  descending: `<path d="${DOWN}"/>`,
} as const;

// 이 파일이 쓴 SVG 이지 사용자 입력이 아니다. 선이 아니라 채움이다 — 이만한 삼각형은
// 윤곽선으로 그리면 얼룩으로 읽힌다.
function iconSvg(body: string): string {
  return `<svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">${body}</svg>`;
}

export type SortDirection = 'descending' | 'ascending';

export interface SortState {
  readonly column: number;
  readonly direction: SortDirection;
}

// 세 상태 순환 — 원본 → 내림차순 → 오름차순 → 원본. 다른 열을 누르면 그 열이 내림차순으로
// 시작하고 이전 열은 원본으로 돌아간다.
export function nextSortState(active: SortState | null, column: number): SortState | null {
  if (active?.column !== column) return { column, direction: 'descending' };
  return active.direction === 'descending' ? { column, direction: 'ascending' } : null;
}

// 좁게 잡는다 — 쉼표는 세 자리 묶음일 때만이고 단위가 붙으면 글자다. `1,23,4` 를 느슨하게
// `1234` 로 읽으면 사용자가 적은 적 없는 값으로 정렬된다.
const NUMBER = /^-?(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?$/;

// NUMBER 에 맞는 값에만 부른다 — 바로 넘기면 `12abc` 를 `12` 로 삼킨다.
function toNumber(value: string): number {
  return Number.parseFloat(value.replaceAll(',', ''));
}

// 비교자는 정렬 한 번에 한 번 정한다 — 쌍마다 고르면 전이성이 깨진다 (`10<9`(숫자)
// `9<사과`·`사과<10`(글자)로 한 바퀴 돈다). 빈 칸은 방향과 무관하게 항상 아래다.
// 답은 번호 순열이다 — DOM 절반은 행을 순서대로 다시 붙이기만 한다.
export function rankRows(values: readonly string[], direction: SortDirection, locale: string): number[] {
  const filled = values.filter((value) => value !== '');
  const numeric = filled.length > 0 && filled.every((value) => NUMBER.test(value));
  const collator = new Intl.Collator(locale, { numeric: true });

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
  readonly locale?: string;
  // 어떤 표를 붙일까 — 기본은 표식(`data-nabi-sortable`)이 달린 표만이다. `'all'` 은 뿌리 안의
  // 표 전부를 받는다(발행 HTML 에 표식을 못 심는 호스트·데모의 길).
  readonly tables?: 'marked' | 'all';
}

function attachOne(table: HTMLTableElement, locale: string): (() => void) | null {
  // 표식이 있어도 병합이 보이면 거절한다 — 병합된 행은 묶여 있어 재배열이 격자를 부순다.
  if (hasMergedCells(table)) return null;

  const rows = [...table.rows];
  const header = rows[0];
  const body = rows.slice(1);
  if (!header || body.length === 0) return null;

  // 붙인 시점의 순서가 원본이다. 행들이 한 부모 안에 있어야 재배열·복원이 온전하다
  // 흩어진 남의 HTML 은 받지 않는다.
  const parent = body[0]?.parentElement;
  if (!parent || body.some((row) => row.parentElement !== parent)) return null;

  const original = [...body];
  const owner = table.ownerDocument;
  const t = makeTranslator(locale);
  const label = (key: keyof typeof TEXT): string => t.pick(TEXT[key], key);

  // 상태는 `active` 하나뿐이다.
  let active: SortState | null = null;
  const buttons: HTMLButtonElement[] = [];

  const render = (): void => {
    for (const [column, button] of buttons.entries()) {
      const state = active?.column === column ? active.direction : null;
      const name = label(state ?? 'original');
      button.innerHTML = iconSvg(ICONS[state ?? 'original']);
      button.setAttribute('aria-label', `${label('sort')}: ${name}`);
      button.dataset['nabiTip'] = name;
      button.toggleAttribute('data-nabi-sort-active', state !== null);
      // aria-sort 는 제목 칸의 것이다 — "이 열은 정렬된다" 를 리더가 알 유일한 자리다.
      button.closest('th, td')?.setAttribute('aria-sort', state ?? 'none');
    }
  };

  const apply = (): void => {
    const order = active
      ? rankRows(
          original.map((row) => row.cells[(active as SortState).column]?.textContent?.trim() ?? ''),
          active.direction,
          locale,
        ).map((index) => original[index] as HTMLTableRowElement)
      : original;
    // 제목 행은 손대지 않는다 — 몸통 행만 순서대로 다시 붙인다.
    for (const row of order) parent.append(row);
  };

  for (const [column, cell] of [...header.cells].entries()) {
    const button = owner.createElement('button');
    button.type = 'button';
    button.className = 'nabi-sort';
    button.addEventListener('click', () => {
      active = nextSortState(active, column);
      apply();
      render();
    });
    buttons.push(button);
    cell.append(button);
  }
  render();

  return () => {
    // 순서·단추·aria 를 전부 되돌린다 — 해제 뒤의 DOM 은 붙이기 전과 같다.
    for (const row of original) parent.append(row);
    for (const button of buttons) {
      button.closest('th, td')?.removeAttribute('aria-sort');
      button.remove();
    }
  };
}

// 해제는 원본 행 순서까지 되돌린다 — 정렬된 채 떼면 그 순서가 호스트 DOM 에 굳는다.
export function attachTableSort(root: HTMLElement, options: TableSortOptions = {}): () => void {
  const owner = root.ownerDocument;
  const locale = options.locale ?? owner.documentElement.lang ?? '';
  const selector = options.tables === 'all' ? 'table' : `table[${SORTABLE_ATTR}]`;
  const tables = [
    ...(root.matches(selector) ? [root] : []),
    ...root.querySelectorAll(selector),
  ] as HTMLTableElement[];

  const detachers = tables
    .map((table) => attachOne(table, locale))
    .filter((detach): detach is () => void => detach !== null);

  return () => {
    for (const detach of detachers) detach();
  };
}
