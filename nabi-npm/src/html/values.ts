// attr 값의 모양 판정 — 조립(render)과 들여오기(parse)가 같은 자를 쓴다 (: 같은 일은 한 벌).
// **값 자체의 화이트리스트(어떤 색이 있는가)는 그 wing 의 몫이고**, 여기서 보는 것은 모양뿐이다:
// 속성 값으로 나가도 되는 글자인가, 숫자면 어느 범위인가. 모양이 아니면 `undefined` — 없는 값이다.
import type { AttrValue } from '../schema/types.js';

export function text(value: AttrValue | undefined): string | undefined {
  return typeof value === 'string' && value !== '' ? value : undefined;
}

// 이름 값(색·크기·서체·언어 아닌 것들) — 시트가 선택자로 고르는 낱말이다.
const NAME_VALUE = /^[a-z][a-z0-9-]{0,15}$/;

export function name(value: AttrValue | undefined): string | undefined {
  const raw = text(value);
  return raw !== undefined && NAME_VALUE.test(raw) ? raw : undefined;
}

// 폭 — 물건 자신의 것이고 단위는 퍼센트다. 표는 폭이 없다(넘치면 횡스크롤).
export function width(value: AttrValue | undefined): string | undefined {
  const raw = typeof value === 'number' ? value : Number(text(value));
  if (!Number.isFinite(raw)) return undefined;
  return String(Math.min(100, Math.max(1, Math.round(raw))));
}

// 칸 병합 — 2 미만은 안 적는다. 기본값이 저장값에 안 남는다.
export function span(value: AttrValue | undefined): string | undefined {
  const raw = typeof value === 'number' ? value : Number(text(value));
  if (!Number.isFinite(raw) || raw < 2) return undefined;
  return String(Math.min(1000, Math.floor(raw)));
}

const LANGUAGE = /^[a-z0-9+#.-]{1,20}$/;

export function language(value: AttrValue | undefined): string | undefined {
  const raw = text(value)?.toLowerCase();
  return raw !== undefined && LANGUAGE.test(raw) ? raw : undefined;
}
