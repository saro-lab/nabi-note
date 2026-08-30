export const FALLBACK_LOCALE = 'en';

export function normalizedLocale(raw: string | undefined | null): string {
  if (typeof raw !== 'string') return FALLBACK_LOCALE;
  const head = raw.trim().replace(/_/g, '-').toLowerCase().split('-')[0] ?? '';
  return /^[a-z]{2,3}$/.test(head) ? head : FALLBACK_LOCALE;
}
