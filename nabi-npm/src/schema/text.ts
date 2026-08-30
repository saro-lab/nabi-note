export function canonicalTextLines(text: string): readonly string[] {
  return text.replace(/\r\n?/g, '\n').split('\n');
}

export function canonicalTextLength(text: string): number {
  const lines = canonicalTextLines(text);
  return lines.reduce((length, line) => length + line.length, Math.max(0, lines.length - 1));
}
