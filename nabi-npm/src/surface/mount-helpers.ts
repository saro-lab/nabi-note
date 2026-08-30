const NBSP = '\u00a0';

export function cssQuoted(value: string): string {
  const escaped = value
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\r\n?|\n/g, '\\A ');
  return `"${escaped}"`;
}

const samePath = (a: readonly number[], b: readonly number[]): boolean =>
  a.length === b.length && a.every((v, i) => v === b[i]);

const sameDomText = (expected: string, actual: string): boolean => {
  if (expected.length !== actual.length) return false;
  for (let i = 0; i < expected.length; i += 1) {
    if (expected[i] !== actual[i] && !(expected[i] === ' ' && actual[i] === NBSP)) return false;
  }
  return true;
};

export interface TextInputHint {
  readonly path: readonly number[];
  readonly before: string;
  readonly start: number;
  readonly end: number;
  readonly data: string;
}
export interface CompositionSpan {
  readonly startId: string;
  readonly endId: string;
  readonly startOffset: number;
  readonly endOffset: number;
  readonly prefix: string;
  readonly suffix: string;
  readonly startText: string;
  readonly endText: string;
  readonly middle: readonly { readonly id: string; readonly text: string }[];
}

export function projectDomEdit(before: string, actual: string, hint?: TextInputHint): string {
  if (hint?.before === before) {
    const prefix = before.slice(0, hint.start),
      suffix = before.slice(hint.end);
    if (actual.length >= prefix.length + suffix.length) {
      const head = actual.slice(0, prefix.length),
        tail = actual.slice(actual.length - suffix.length);
      const inserted = actual.slice(prefix.length, actual.length - suffix.length);
      if (sameDomText(prefix, head) && sameDomText(suffix, tail))
        return prefix + (sameDomText(hint.data, inserted) ? hint.data : inserted) + suffix;
    }
  }
  const max = Math.min(before.length, actual.length);
  let prefix = 0;
  while (prefix < max && before[prefix] === actual[prefix]) prefix += 1;
  let suffix = 0;
  while (suffix < max - prefix && before[before.length - 1 - suffix] === actual[actual.length - 1 - suffix])
    suffix += 1;
  return before.slice(0, prefix) + actual.slice(prefix, actual.length - suffix) + before.slice(before.length - suffix);
}

export { samePath };
