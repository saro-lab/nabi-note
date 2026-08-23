// 내장 IO 필터 셋 — `.nabi` · `.html` · `.md`. 셋이 한 자리에 모여 있는 것이 요점이다:
// 붙여넣기 후보의 순서(html → md → 맨 글자)와 저장 형식의 순서(nabi → html → md)가 여기
// 한 곳에서 읽힌다.
//
// **이 층은 DOM 을 모른다.** html 을 읽어야 하는 두 문(paste·read)은 파서를 주입받는다 —
// 브라우저는 `html/parse.ts` 의 `parseNodes` 를, 그물은 제 손 토크나이저를 준다. 안 주면
// html 필터는 조용히 잠든다(머리 없는 환경에서 후보가 안 뜰 뿐, 글은 맨 글자로 붙는다).
import { $toJson, type ElementNode, type SchemaEnv } from '../schema/index.js';
import { fragmentOf, importDoc, type ImportOptions, type ParseNode } from '../html/index.js';
import { textCandidate } from './candidates.js';
import type { IoFilter, PasteCandidate } from './contract.js';
import { NABI_FILE_EXTENSION, readNabiFile, writeNabiFile } from './file.js';
import {
  HTML_ICON,
  HTML_LABEL,
  MARKDOWN_ICON,
  MARKDOWN_LABEL,
  NABI_ICON,
  NABI_LABEL,
  NHTML_FILE_EXTENSION,
} from './marks.js';
import { parseMarkdown, type MdEnv } from './md/parse.js';
import { smellsMarkdown } from './md/sniff.js';

export interface BuiltinOptions {
  readonly env: SchemaEnv;
  readonly claim?: ImportOptions['claim'];
  // html 글자 → 엘리먼트 트리. 없으면 html 필터는 후보도 안 내고 읽지도 않는다.
  readonly parse?: (html: string) => readonly ParseNode[];
  // 레지스트리를 본 md 판정 — 받아 줄 wing 이 없는 문법은 안 선다.
  readonly md: MdEnv;
  readonly allowLocalUrls?: boolean;
}

// md 문법 하나라도 받아 줄 wing 이 있는가 — 하나도 없으면 md 후보는 맨 글자와 같은 값이라
// 판에 같은 줄을 둘 세우는 꼴이 된다.
const MD_WINGS: readonly string[] = ['h', 'code', 'quote', 'ul', 'ol', 'tl', 'hr', 'table', 'a', 'img', 'b', 'i', 's', 'tf'];

const same = (a: unknown, b: unknown): boolean => JSON.stringify(a) === JSON.stringify(b);

export function makeBuiltinFilters(options: BuiltinOptions): readonly IoFilter[] {
  const importOptions = (): ImportOptions => ({
    env: options.env,
    ...(options.claim ? { claim: options.claim } : {}),
    ...(options.allowLocalUrls ? { allowLocalUrls: true } : {}),
  });

  // --- .nabi — 우리 형식. 붙여넣기에는 안 선다(클립보드에 오는 것은 파일이지 글자가 아니다).
  const nabi: IoFilter = {
    id: 'nabi',
    label: NABI_LABEL,
    save: {
      extension: NABI_FILE_EXTENSION,
      mime: 'application/json',
      write: (doc) => writeNabiFile(doc.json()),
    },
    read: (_name, text) => readNabiFile(text),
  };

  // --- html — 남의 편집기·웹페이지에서 오는 길. 클립보드의 `text/html` 이 그 자리다.
  //
  // **저장은 `.nhtml` 로 나간다**(주인 지시 2026-08-23). 담기는 글자는 여전히 html 한 장이고
  // mime 도 `text/html` 이지만, 이름이 "나비가 되읽을 수 있는 html" 이라고 말한다. 읽는 쪽은
  // 넓다 — `.nhtml` 도 `.html` 도 같은 `read` 가 받는다(여는 목록은 surface 가 든다).
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
        // **늦게 판다** — 판에 줄 하나를 세우려고 문서를 다 지을 까닭이 없다.
        build: () => fragmentOf(importDoc(parse(data.html), importOptions())),
      };
      return candidate;
    },
    save: { extension: NHTML_FILE_EXTENSION, mime: 'text/html', write: (doc) => doc.html() },
    read: (_name, text) => {
      const parse = options.parse;
      if (parse === undefined) return null;
      return $toJson(importDoc(parse(text), importOptions()));
    },
  };

  // --- 밖에서 온 `.html` — **읽기만 하는 짝**이다.
  //
  // 저장하는 이름이 `.nhtml` 로 바뀌면서 생긴 자리다: 여는 쪽은 필터의 `save.extension` 으로
  // 이름을 견주므로, 그것 하나만 두면 `.html` 파일이 아무에게도 안 걸린다 — 남의 편집기·웹에서
  // 받아 온 평범한 html 을 못 여는 것은 주인이 막은 길이다("여는 길을 막지 마라").
  // 그래서 **저장 칸이 없는 필터**를 하나 더 세운다: 저장 판에는 안 서고(형식은 여전히 셋),
  // 확장자 문턱도 없이 제 이름 판정만 든다 — `.html` 이 아니면 조용히 다음 필터로 넘긴다.
  // 읽는 몸은 위 필터의 것과 **같은 한 벌**이다(같은 파서·같은 옵션).
  const htmlOpen: IoFilter = {
    id: 'html-open',
    label: HTML_LABEL,
    read: (name, text) => {
      const parse = options.parse;
      if (parse === undefined || !name.toLowerCase().endsWith('.html')) return null;
      return $toJson(importDoc(parse(text), importOptions()));
    },
  };

  // --- .md — 맨 글자에 문법이 섞여 있을 때만 선다.
  const md: IoFilter = {
    id: 'markdown',
    label: MARKDOWN_LABEL,
    paste: (data) => {
      if (data.plain === '' || !smellsMarkdown(data.plain)) return null;
      // 받아 줄 wing 이 하나도 없으면 파서가 문법을 전부 글자로 남긴다 — 맨 글자와 같은 답이다.
      if (!MD_WINGS.some((w) => options.md.has(w))) return null;
      // **여기서만 미리 판다.** "맨 글자와 결과가 같으면 후보를 안 낸다"는 규칙이 파 본 뒤에야
      // 답할 수 있는 물음이라서다. 판 것은 그대로 들고 있다가 build 가 그것을 답한다.
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
      mime: 'text/markdown',
      // 되돌아오지 못하는 것이 있다 — 정렬·드롭캡·병합된 표는 html 로 섞여 나가고 그림 폭은 잃는다.
      lossy: true,
      write: (doc) => doc.md(),
    },
    read: (_name, text) => parseMarkdown(text, options.md),
  };

  // 순서가 곧 판의 순서다 — 저장 형식 셋(nabi·nhtml·md)이 먼저고, 읽기만 하는 짝은 맨 뒤다.
  return [nabi, html, md, htmlOpen];
}
