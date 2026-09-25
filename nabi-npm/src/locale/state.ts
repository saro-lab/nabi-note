export interface LocaleSource {
  readonly locale: string;
  onChange(listener: () => void): () => void;
}

export interface LocaleController extends LocaleSource {
  setLocale(locale: string): void;
}

export type LocaleInput = string | LocaleSource;

export function localeValue(value: LocaleInput | null | undefined): string {
  return value !== null && typeof value === 'object' ? value.locale : (value ?? 'en');
}

export function createLocale(initial = 'en'): LocaleController {
  if (typeof initial !== 'string') throw new TypeError('locale must be a string');
  let locale = initial;
  const listeners = new Set<() => void>();
  return {
    get locale() {
      return locale;
    },
    setLocale(next) {
      if (typeof next !== 'string') throw new TypeError('locale must be a string');
      if (next === locale) return;
      locale = next;
      const errors: unknown[] = [];
      for (const listener of [...listeners]) {
        if (!listeners.has(listener)) continue;
        try {
          listener();
        } catch (error) {
          errors.push(error);
        }
      }
      if (errors.length > 0) throw new AggregateError(errors, 'Locale listeners failed');
    },
    onChange(listener) {
      const entry = (): void => listener();
      listeners.add(entry);
      return () => {
        listeners.delete(entry);
      };
    },
  };
}
