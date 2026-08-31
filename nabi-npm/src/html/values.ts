// render와 parse가 같은 자를 쓰는 attr 값의 모양 판정 — 값 자체의 화이트리스트는 그 wing의 몫이고, 여기는 모양만 본다(모양이 아니면 undefined).
// Shared shape-checking for attr values between render and parse — the value's own whitelist (which colors exist) is the wing's job; a shape mismatch here just returns undefined.
import type { AttrValue } from '../schema/types.js';

export function text(value: AttrValue | undefined): string | undefined {
  return typeof value === 'string' && value !== '' ? value : undefined;
}

// 시트가 선택자로 고르는 낱말(색·크기·서체·언어가 아닌 이름 값).
// A word the stylesheet picks by selector — a name value, not color/size/typeface/language.
const NAME_VALUE = /^[a-z][a-z0-9-]{0,15}$/;

export function name(value: AttrValue | undefined): string | undefined {
  const raw = text(value);
  return raw !== undefined && NAME_VALUE.test(raw) ? raw : undefined;
}

// 물건 자신의 폭, 단위는 퍼센트 — 표는 폭이 없다(넘치면 횡스크롤).
// The object's own width, in percent; a table has none (it scrolls on overflow instead).
export function width(value: AttrValue | undefined): string | undefined {
  const raw = typeof value === 'number' ? value : Number(text(value));
  if (!Number.isFinite(raw)) return undefined;
  return String(Math.min(100, Math.max(1, Math.round(raw))));
}

// 2 미만은 안 적는다 — 기본값이 저장값에 안 남는다.
// Below 2 is omitted entirely, so the default value never gets stored.
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
