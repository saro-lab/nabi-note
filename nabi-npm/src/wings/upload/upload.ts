// 업로드 upload — 자기 마크업이 없다: 그림은 img, 그 밖은 a+file(첨부)이 되므로 둘 중 하나가 함께 등록돼야 산다.
// Upload has no markup of its own — an uploaded file becomes `img` or an `a`+`file` attachment, so it requires one of those two registered.
//
// 배치 하나 = 커맨드 한 번 = undo 한 점 — 진행 중엔 문서를 안 건드리고, 문서가 바뀌는 순간은 마지막 커밋 하나뿐이다.
// One batch is one command, one undo step — the document stays untouched during progress, changing only at the final commit.
import type { AttrValue, ElementNode, NabiNode } from '../../schema/index.js';
import { P } from '../../schema/index.js';
import { $markBuiltinAttrOwner } from '../../schema/env.js';
import { ordered } from '../../caret/index.js';
import type { Command } from '../../editor/index.js';
import { safeUrl } from '../../html/url.js';
// 물건의 기본 차림은 공용이다 — 여기서 베끼면 넣는 길마다 다른 "기본"이 생긴다.
// Shares the object's default styling rather than copying it — a local copy would drift into a different "default" per insertion path.
import { LUMP_DEFAULT_ALIGN, LUMP_DEFAULT_WIDTH, type Wing } from '../../wing/index.js';
import type { LocaleText } from '../../locale/index.js';

// DOM의 File이 그대로 맞는 최소 모양 — wings는 DOM 타입을 안 든다.
// The minimal shape a DOM File already satisfies — wings never imports DOM types directly.
export interface UploadFile {
  readonly name: string;
  readonly size: number;
  readonly type: string;
}

// 커밋에 실리는 항목 하나 — 호스트가 준 주소와 이름이다.
export interface UploadItem {
  // image = 그림 노드, file = 첨부 링크, text = 평문(주소를 못 믿을 때의 강등)
  readonly kind: 'image' | 'file' | 'text';
  readonly uri: string;
  readonly name: string;
}

const MB = 1024 * 1024;

// 맨 앞의 `.`은 확장자가 아니다 — `.gitignore`는 빈 문자열이 된다.
// A leading dot isn't an extension — `.gitignore` returns an empty string.
export function extensionOf(name: string): string {
  const dot = name.lastIndexOf('.');
  return dot > 0
    ? name
        .slice(dot + 1)
        .trim()
        .toLowerCase()
    : '';
}

const EXTENSION_SHAPE = /^[a-z0-9]{1,8}$/;

export function formatBytes(bytes: number): string {
  if (bytes >= MB) {
    const value = bytes / MB;
    return `${Number.isInteger(value) ? value : value.toFixed(1)}MB`;
  }
  return `${Math.max(1, Math.round(bytes / 1024))}KB`;
}

export interface UploadLimits {
  // 소문자 확장자 목록 — 확장자 없는 파일은 `''`이고, 안 주면 전부 받는다.
  readonly extensions?: readonly string[];
  // 0이면 제한 없음.
  readonly maxFileSize?: number;
  readonly maxTotalSize?: number;
}

export interface UploadReject {
  readonly code: string;
  readonly file: UploadFile | null;
  readonly max?: string;
}

// 파일별 문제는 그 파일만 뺀다 — 총합 초과는 묶음 전체를 거절한다(일부만 올라가면 어디까지인지 알 길이 없다).
// A single file's problem excludes just that file; exceeding the total rejects the whole batch — a partial upload would leave no way to tell how far it got.
export function acceptFiles<T extends UploadFile>(
  files: readonly T[],
  limits: UploadLimits,
  reject?: (problem: UploadReject) => void,
): T[] {
  const allowed = limits.extensions ? new Set(limits.extensions.map((e) => e.trim().toLowerCase())) : null;
  const maxFile = Math.max(0, limits.maxFileSize ?? 10 * MB);
  const maxTotal = Math.max(0, limits.maxTotalSize ?? 10 * MB);
  const passed: T[] = [];

  for (const file of files) {
    if (allowed && !allowed.has(extensionOf(file.name))) {
      reject?.({ code: 'unsupported_type', file });
      continue;
    }
    if (file.size <= 0) {
      reject?.({ code: 'empty_file', file });
      continue;
    }
    if (maxFile > 0 && file.size > maxFile) {
      reject?.({ code: 'file_too_large', file, max: formatBytes(maxFile) });
      continue;
    }
    passed.push(file);
  }

  const total = passed.reduce((sum, file) => sum + file.size, 0);
  if (maxTotal > 0 && total > maxTotal) {
    reject?.({ code: 'total_too_large', file: null, max: formatBytes(maxTotal) });
    return [];
  }
  return passed;
}

// mime을 먼저 믿고, 없으면 확장자를 본다 — 브라우저가 mime을 모를 때가 있다.
// Trusts mime first, falling back to the extension — a browser sometimes just doesn't know the mime type.
const IMAGE_EXTENSIONS = new Set(['png', 'jpg', 'jpeg', 'gif', 'webp', 'avif', 'bmp', 'svg', 'ico', 'heic', 'heif']);

export function isImageFile(file: UploadFile): boolean {
  if (file.type.startsWith('image/')) return true;
  return file.type === '' && IMAGE_EXTENSIONS.has(extensionOf(file.name));
}

export interface CommitOptions {
  readonly allowLocalUrls?: boolean;
}

function blockOf(item: UploadItem, allowLocal: boolean, label: string): ElementNode | null {
  const uri = safeUrl(item.uri, allowLocal);
  const name = item.name.trim();
  // 화이트리스트 밖 주소는 없는 것으로 친다 — 이름이라도 남기는 게 흔적 없이 사라지는 것보다 낫다.
  // A rejected URL is treated as absent — keeping at least the name beats vanishing without a trace.
  if (uri === null) return name === '' ? null : { w: P, ch: [name] };
  if (item.kind === 'text') return { w: P, ch: [name === '' ? uri : name] };
  if (item.kind === 'image') {
    // 파일 이름을 대체 글로 안 싣는다 — 그림엔 대체 글이 없고, 그 자리는 문서에 박힐 값이 아니다.
    // The file name never becomes alt text — images have no alt attr, and it isn't meant to live in the document anyway.
    const a: Record<string, AttrValue> = { src: uri, w: LUMP_DEFAULT_WIDTH };
    // 넣는 길이 둘(툴바·업로드)이라도 기본값은 하나 — 폭 60, 가운데.
    // Two insertion paths (toolbar, upload) share one default — width 60, centered.
    return { w: P, a: { a: LUMP_DEFAULT_ALIGN }, ch: [{ w: 'img', a, ch: [] }] };
  }
  // 글자는 파일 이름이 아니라 "첨부파일" — 올리는 중 자리표시자와 끝난 뒤 링크가 같은 글자를 들어야 줄이 안 바뀐다.
  // The visible text reads "attachment," not the file name — so the in-progress placeholder and the finished link share identical text, and nothing reflows.
  const extension = extensionOf(name);
  const file = EXTENSION_SHAPE.test(extension) ? extension : '';
  return { w: P, ch: [{ w: 'a', a: { href: uri, file }, ch: [label === '' ? uri : label] }] };
}

// args의 items를 항목 목록으로 — 모양이 아닌 것은 조용히 걷는다(밖에서 온 값이다).
// Coerces args' items into a list — malformed entries are silently dropped, since this comes from outside.
function itemsArg(raw: unknown): UploadItem[] {
  if (!Array.isArray(raw)) return [];
  const out: UploadItem[] = [];
  for (const value of raw) {
    if (typeof value !== 'object' || value === null) continue;
    const item = value as Partial<UploadItem>;
    if (typeof item.uri !== 'string' || item.uri === '') continue;
    const kind = item.kind === 'image' || item.kind === 'text' ? item.kind : 'file';
    out.push({ kind, uri: item.uri, name: typeof item.name === 'string' ? item.name : '' });
  }
  return out;
}

const UPLOAD_NAME: LocaleText = {
  ko: '파일 업로드',
  en: 'Upload',
  ja: 'ファイルをアップロード',
  zh: '上传文件',
  de: 'Datei hochladen',
  fr: 'Téléverser un fichier',
  es: 'Subir archivo',
  pt: 'Enviar arquivo',
  ru: 'Загрузить файл',
  ar: 'رفع ملف',
  hi: 'फ़ाइल अपलोड करें',
  bn: 'ফাইল আপলোড করুন',
  ur: 'فائل اپ لوڈ کریں',
  id: 'Unggah berkas',
};

const UPLOAD_ICON = 'upload-upload';

export function makeUploadWing(options: CommitOptions = {}): Wing {
  const allowLocal = options.allowLocalUrls === true;

  // 배치 전체가 커맨드 한 번 — 되돌리기 한 번에 묶음이 통째로 걷힌다.
  // The whole batch is one command — a single undo removes the entire batch.
  const commitUpload: Command = (doc, sel, args) => {
    const items = itemsArg(args['items']);
    if (items.length === 0) return null;
    // 첨부 글자는 부르는 쪽이 준다 — 안 주면 주소가 글자가 된다.
    // The attachment's visible text is supplied by the caller; omitted, the URL itself becomes the text.
    const raw = args['label'];
    const label = typeof raw === 'string' ? raw.trim() : '';
    const blocks = items
      .map((item) => blockOf(item, allowLocal, label))
      .filter((block): block is ElementNode => block !== null);
    if (blocks.length === 0) return null;

    const [, end] = ordered(sel);
    const top = (end.path[0] ?? doc.length - 1) as number;
    const anchor = doc[top];
    // 빈 문단 자리면 그 자리를 쓴다 — 안 그러면 올릴 때마다 빈 줄이 하나씩 남는다.
    // Reuses an empty paragraph in place if one's there, or every upload would leave behind a stray blank line.
    const empty = anchor !== undefined && anchor.w === P && anchor.ch.length === 0;
    const head = doc.slice(0, empty ? top : top + 1);
    const next = [...head, ...blocks, ...doc.slice(top + 1)];

    // 캐럿은 마지막 블록에 선다 — 래퍼문단이면 물건 뒤(1), 글 문단이면 글 끝.
    // The caret lands on the last inserted block — after the object (offset 1) for a wrapper, or at text's end for a plain paragraph.
    const landed = blocks[blocks.length - 1] as ElementNode;
    const index = head.length + blocks.length - 1;
    const inner = landed.ch[0];
    const isLump = typeof inner !== 'string' && inner !== undefined && inner.w === 'img';
    const offset = isLump ? 1 : lengthOfInline(landed.ch);
    const caret = { path: [index], offset };
    return { doc: next, selection: { anchor: caret, focus: caret } };
  };

  const wing: Wing = {
    w: 'upload',
    place: 'tool',
    // 파일이 갈 곳이 하나는 있어야 한다 — 그림이면 img, 그 밖은 링크의 첨부다.
    // A file needs somewhere to land — img for images, the link wing's attachment for everything else.
    requiresAnyOf: ['img', 'a'],
    commands: { commitUpload },
    button: {
      group: 'media',
      icon: UPLOAD_ICON,
      label: UPLOAD_NAME,
      // 파일 상자를 여는 건 ui, 고른 파일이 갈 곳은 호스트의 배선(mountUpload)이다.
      // The file picker is ui's job; where a chosen file goes is up to the host's own wiring (mountUpload).
      action: { kind: 'file' },
    },
  };
  $markBuiltinAttrOwner(wing, []);
  return wing;
}

// 글 문단의 칸 수 — 마크 속 글자까지 센다(단말은 커밋이 안 만든다).
// A text paragraph's length in cells, counting through marks — commit never creates a leaf-object child.
function lengthOfInline(nodes: readonly NabiNode[]): number {
  let total = 0;
  for (const node of nodes) {
    if (typeof node === 'string') total += node.length;
    else total += lengthOfInline(node.ch);
  }
  return total;
}

export const uploadWing: Wing = makeUploadWing();
