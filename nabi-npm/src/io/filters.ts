// 내장 필터 셋(nabi/html/md)이 한 자리에 있어야 붙여넣기·저장의 순서가 한 곳에서 읽힌다.
// DOM은 모른다 — html 파서는 주입받고, 안 주면 필터가 조용히 잠들 뿐 맨 글자로 붙는다.
// The builtin filter set (nabi/html/md) lives together so paste/save ordering reads from one place; DOM-agnostic — the html parser is injected, and without one the filter just stays dormant, falling back to plain text.
import { $toJson, type ElementNode, type SchemaEnv } from '../schema/index.js';
import { fragmentOf, importDoc, type ImportOptions, type ParseNode } from '../html/index.js';
import { textCandidate } from './candidates.js';
import type { IoFilter, PasteCandidate } from './contract.js';
import { NABI_FILE_EXTENSION, readNabiFile, writeNabiFile } from './file.js';
import { HTML_ICON, HTML_LABEL, MARKDOWN_ICON, MARKDOWN_LABEL, NABI_LABEL, NHTML_FILE_EXTENSION } from './marks.js';
import { parseMarkdown, type MdEnv } from './md/parse.js';
import { smellsMarkdown } from './md/sniff.js';

export interface BuiltinOptions {
  readonly env: SchemaEnv;
  readonly claim?: ImportOptions['claim'];
  // 없으면 html 필터는 후보도 안 내고 읽지도 않는다.
  // Without a parser, the html filter offers no candidate and can't read either.
  readonly parse?: (html: string) => readonly ParseNode[];
  // 레지스트리를 본 판정 — 받아 줄 wing이 없는 문법은 안 선다.
  // Checked against the registry — a syntax with no wing to hold it never surfaces.
  readonly md: MdEnv;
  readonly allowLocalUrls?: boolean;
}

// 받아 줄 wing이 하나도 없으면 md 후보는 맨 글자와 같은 값이라 판에 같은 줄이 둘 선다.
// With no wing to accept any md syntax, the candidate would equal plain text and duplicate the row.
const MD_WINGS: readonly string[] = [
  'h',
  'code',
  'quote',
  'ul',
  'ol',
  'tl',
  'hr',
  'table',
  'a',
  'img',
  'b',
  'i',
  's',
  'tf',
];

const same = (a: unknown, b: unknown): boolean => JSON.stringify(a) === JSON.stringify(b);
const BUILTIN_HTML_FILTERS = new WeakSet<IoFilter>();

export function $isBuiltinHtmlFilter(filter: IoFilter): boolean {
  return BUILTIN_HTML_FILTERS.has(filter);
}

export function makeBuiltinFilters(options: BuiltinOptions): readonly IoFilter[] {
  const importOptions = (): ImportOptions => ({
    env: options.env,
    ...(options.claim ? { claim: options.claim } : {}),
    ...(options.allowLocalUrls ? { allowLocalUrls: true } : {}),
  });

  // 붙여넣기에는 안 선다 — 클립보드에 오는 것은 파일이지 글자가 아니다.
  // Never offered on paste — what lands in the clipboard is a file, not text.
  const nabi: IoFilter = {
    id: 'nabi',
    label: NABI_LABEL,
    save: {
      extension: NABI_FILE_EXTENSION,
      canonical: true,
      mime: 'application/json',
      write: (doc) => writeNabiFile(doc.json()),
    },
    read: { extensions: [NABI_FILE_EXTENSION], run: (_name, text) => readNabiFile(text) },
  };

  // 저장은 .nhtml로 나간다(2026-08-23) — 내용은 그대로 html이지만 이름이 "나비가 되읽는 html"임을 말한다.
  // Saves as .nhtml (2026-08-23) — still plain html content, but the name flags it as html nabi can read back.
  const html: IoFilter = {
    id: 'html',
    label: HTML_LABEL,
    paste: (data) => {
      const parse = options.parse;
      if (parse === undefined || data.html === '') return null;
      const candidate: PasteCandidate = {
        id: 'html',
        label: HTML_LABEL,
        icon: HTML_ICON,
        // 늦게 판다 — 판에 줄 하나 세우자고 문서를 다 지을 까닭이 없다.
        // Built lazily — no reason to construct the whole doc just to list a row.
        build: () => fragmentOf(importDoc(parse(data.html), importOptions())),
      };
      return candidate;
    },
    save: { extension: NHTML_FILE_EXTENSION, canonical: false, mime: 'text/html', write: (doc) => doc.html() },
    read: {
      extensions: [NHTML_FILE_EXTENSION, '.html', '.htm', '.xhtml', '.shtml'],
      run: (_name, text) => {
        const parse = options.parse;
        if (parse === undefined) return null;
        return $toJson(importDoc(parse(text), importOptions()));
      },
    },
  };
  BUILTIN_HTML_FILTERS.add(html);

  // 맨 글자에 문법이 섞여 있을 때만 선다.
  // Only offered when the plain text actually smells like markdown.
  const md: IoFilter = {
    id: 'markdown',
    label: MARKDOWN_LABEL,
    paste: (data) => {
      if (data.plain === '' || !smellsMarkdown(data.plain)) return null;
      if (!MD_WINGS.some((w) => options.md.has(w))) return null;
      // 여기서 미리 판다 — "맨 글자와 결과가 같으면 후보 안 냄" 판정은 파 봐야 알 수 있다. build는 이 값을 그대로 돌려준다.
      // Parsed eagerly here, since "skip if it matches plain text" can only be judged after parsing; build just returns this.
      const built = parseMarkdown(data.plain, options.md);
      if (same(built, textCandidate(data.plain, '').build())) return null;
      const candidate: PasteCandidate = {
        id: 'markdown',
        label: MARKDOWN_LABEL,
        icon: MARKDOWN_ICON,
        build: (): readonly ElementNode[] => built,
      };
      return candidate;
    },
    save: {
      extension: '.md',
      canonical: false,
      mime: 'text/markdown',
      // 정렬·드롭캡·병합된 표는 html로 섞여 나가고 그림 폭은 잃는다 — 되돌아오지 못한다.
      // Alignment, drop caps, and merged tables spill out as raw html and lose image width — a lossy round trip.
      lossy: true,
      write: (doc) => doc.md(),
    },
    read: { extensions: ['.md', '.markdown'], run: (_name, text) => parseMarkdown(text, options.md) },
  };

  // 순서가 곧 판의 순서다 — 저장 형식 셋이 먼저, 읽기 전용은 맨 뒤.
  // Array order is display order — the three save formats first, read-only ones last.
  return [nabi, html, md];
}
