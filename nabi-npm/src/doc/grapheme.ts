const EXTEND = /\p{Grapheme_Extend}/u;
const SPACING_MARK = /\p{Mc}/u;
const REGIONAL_INDICATOR = /\p{Regional_Indicator}/u;
const EMOJI_MODIFIER = /\p{Emoji_Modifier}/u;

const Segmenter = Intl.Segmenter;
const SEGMENTER = typeof Segmenter === 'function' ? new Segmenter(undefined, { granularity: 'grapheme' }) : null;

function fallbackBoundaries(text: string): number[] {
  const points = Array.from(text);
  const out = [0];
  let offset = 0;
  let previous = '';
  let regionalRun = 0;
  for (const point of points) {
    if (offset > 0) {
      const regional = REGIONAL_INDICATOR.test(point);
      const previousRegional = REGIONAL_INDICATOR.test(previous);
      const joins =
        point === '\u200d' ||
        previous === '\u200d' ||
        EXTEND.test(point) ||
        SPACING_MARK.test(point) ||
        EMOJI_MODIFIER.test(point) ||
        (regional && previousRegional && regionalRun % 2 === 1);
      if (!joins) out.push(offset);
      regionalRun = regional ? (previousRegional && joins ? regionalRun + 1 : 1) : 0;
    } else {
      regionalRun = REGIONAL_INDICATOR.test(point) ? 1 : 0;
    }
    offset += point.length;
    previous = point;
  }
  if (out[out.length - 1] !== text.length) out.push(text.length);
  return out;
}

export function graphemeBoundaries(text: string): readonly number[] {
  if (!SEGMENTER) return fallbackBoundaries(text);
  const out = [0];
  for (const part of SEGMENTER.segment(text)) {
    if (part.index > 0) out.push(part.index);
  }
  if (out[out.length - 1] !== text.length) out.push(text.length);
  return out;
}

export function snapGraphemeOffset(
  boundaries: readonly number[],
  offset: number,
  bias: 'backward' | 'forward' | 'nearest',
): number {
  let before = boundaries[0] ?? 0;
  for (const boundary of boundaries) {
    if (boundary === offset) return boundary;
    if (boundary > offset) {
      if (bias === 'backward') return before;
      if (bias === 'forward') return boundary;
      return offset - before < boundary - offset ? before : boundary;
    }
    before = boundary;
  }
  return before;
}
