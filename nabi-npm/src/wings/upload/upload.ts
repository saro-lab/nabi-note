// 업로드 upload — 노드를 안 세우는 도구 wing 이다. 자기 마크업이 없다: 올라온 파일은
// 그림이면 `img`(이미지 wing 의 것), 아니면 `a`+`file`(링크 wing 의 첨부)이 된다.
// 그래서 이 wing 은 그 둘 중 하나가 함께 등록돼야 산다 (`requiresAnyOf`).
//
// **배치 하나 = 커맨드 한 번 = undo 한 점.** 진행 중에는 문서를 전혀 안 만진다 — 진행률은
// 트리 밖(mount 부속의 임시 엘리먼트)에 살고, 문서가 바뀌는 순간은 마지막 커밋 하나뿐이다.
//
// **업로드 중 편집 잠금**은 editor 인스턴스의 `$lock` 이 든다 — 이 파일은 순수부라
// 잠그는 손이 아니라 잠긴 뒤에 무엇이 들어오는가만 안다. 배선은 surface 의 mountUpload 다.
import type { AttrValue, ElementNode, NabiNode } from '../../schema/index.js';
import { P } from '../../schema/index.js';
import { ordered } from '../../caret/index.js';
import type { Command } from '../../editor/index.js';
import { safeUrl } from '../../html/url.js';
// 물건의 기본 차림은 공용이다 — 여기서 베끼면 넣는 길마다 다른 "기본" 이 생긴다.
import { LUMP_DEFAULT_ALIGN, LUMP_DEFAULT_WIDTH, type Wing } from '../../wing/index.js';
import type { LocaleText } from '../../locale/index.js';

// --- 파일의 최소 모양 (DOM 의 File 이 그대로 맞는다 — wings 는 DOM 타입을 안 든다) ------------

export interface UploadFile {
  readonly name: string;
  readonly size: number;
  readonly type: string;
}

// 커밋에 실리는 항목 하나 — 호스트가 준 주소와 이름이다.
export interface UploadItem {
  // image = 그림 노드· file = 첨부 링크· text = 평문(주소를 못 믿을 때의 강등)
  readonly kind: 'image' | 'file' | 'text';
  readonly uri: string;
  readonly name: string;
}

// --- 순수 검증 (old 번역 — 규격만) --------------------------------------------------------------

const MB = 1024 * 1024;

// 맨 앞의 `.` 은 확장자가 아니다 (`.gitignore` → '').
export function extensionOf(name: string): string {
  const dot = name.lastIndexOf('.');
  return dot > 0 ? name.slice(dot + 1).trim().toLowerCase() : '';
}

// 첨부 표식에 실리는 값의 모양 — 시트가 이 값으로 배지를 그린다.
const EXTENSION_SHAPE = /^[a-z0-9]{1,8}$/;

export function formatBytes(bytes: number): string {
  if (bytes >= MB) {
    const value = bytes / MB;
    return `${Number.isInteger(value) ? value : value.toFixed(1)}MB`;
  }
  return `${Math.max(1, Math.round(bytes / 1024))}KB`;
}

export interface UploadLimits {
  // 소문자 확장자 목록. 확장자 없는 파일은 `''` 이고, 안 주면 전부 받는다.
  readonly extensions?: readonly string[];
  // 0 이면 제한 없음.
  readonly maxFileSize?: number;
  readonly maxTotalSize?: number;
}

export interface UploadReject {
  readonly code: string;
  readonly file: UploadFile | null;
  readonly max?: string;
}

// 파일별 문제는 그 파일만 뺀다. **총합 초과는 묶음 전체를 거절한다** — 일부만 올려 두면
// 어디까지 올라갔는지 사람이 알 길이 없다 (old 규칙).
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

// 이 파일이 그림인가 — mime 을 먼저 믿고, 없으면 확장자를 본다(브라우저가 모를 때가 있다).
const IMAGE_EXTENSIONS = new Set(['png', 'jpg', 'jpeg', 'gif', 'webp', 'avif', 'bmp', 'svg', 'ico', 'heic', 'heif']);

export function isImageFile(file: UploadFile): boolean {
  if (file.type.startsWith('image/')) return true;
  return file.type === '' && IMAGE_EXTENSIONS.has(extensionOf(file.name));
}

// --- 커밋 — 항목 하나가 블록 하나가 된다 --------------------------------------------------------

export interface CommitOptions {
  readonly allowLocalUrls?: boolean;
}

function blockOf(item: UploadItem, allowLocal: boolean, label: string): ElementNode | null {
  const uri = safeUrl(item.uri, allowLocal);
  const name = item.name.trim();
  // 화이트리스트 밖 주소 — 없는 주소로 친다. 이름이라도 남기는 것이 흔적 없이 사라지는 것보다 낫다.
  if (uri === null) return name === '' ? null : { w: P, ch: [name] };
  if (item.kind === 'text') return { w: P, ch: [name === '' ? uri : name] };
  if (item.kind === 'image') {
    // 파일 이름을 대체 글로 싣지 않는다 — 그림에는 대체 글이 없고, 사람이 자기 컴퓨터에서
    // 붙인 이름이 문서에 박힐 자리도 아니다.
    const a: Record<string, AttrValue> = { src: uri, w: LUMP_DEFAULT_WIDTH };
    // 래퍼문단을 여기서 직접 세운다(감싸기가 한 벌인 것은 그대로다 — 여기 것은 배치라 여러 개다).
    // 넣는 길이 둘(툴바의 그림 넣기·업로드)이라도 **기본값은 하나**다: 폭 60, 가운데.
    // 정렬은 물건이 아니라 래퍼문단이 든다.
    return { w: P, a: { a: LUMP_DEFAULT_ALIGN }, ch: [{ w: 'img', a, ch: [] }] };
  }
  // 첨부 — 표식(`file`)이 있어야 시트가 밑줄 대신 클립 상자를 그린다. 값은 확장자다.
  //
  // **글자는 파일 이름이 아니라 "첨부파일" 이다.** 그래야 올라가는 중의 자리표시자와 끝난 뒤의
  // 링크가 **같은 글자**를 들고, 끝나는 순간 줄이 안 바뀐다 — 이 라운드의 규칙(모양을 유지한 채
  // 효과만 얹는다)이 여기에도 걸린다. 무엇인지는 확장자 배지가 말한다.
  const extension = extensionOf(name);
  const file = EXTENSION_SHAPE.test(extension) ? extension : '';
  return { w: P, ch: [{ w: 'a', a: { href: uri, file }, ch: [label === '' ? uri : label] }] };
}

// args 의 items 를 항목 목록으로 — 모양이 아닌 것은 조용히 걷는다(밖에서 온 값이다).
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

const UPLOAD_NAME: LocaleText = { ko: '파일 업로드', en: 'Upload', ja: 'ファイルをアップロード', zh: '上传文件', de: 'Datei hochladen', fr: 'Téléverser un fichier', es: 'Subir archivo', pt: 'Enviar arquivo', ru: 'Загрузить файл', ar: 'رفع ملف', hi: 'फ़ाइल अपलोड करें', bn: 'ফাইল আপলোড করুন', ur: 'فائل اپ لوڈ کریں', id: 'Unggah berkas' };

const UPLOAD_ICON =
  '<g transform="translate(8 8) scale(1) translate(-8 -8)" stroke-width="1.4">' +
  '<path d="M8 10.5V2.5M5 5.5 8 2.5l3 3M2.75 10v2.5a1 1 0 0 0 1 1h8.5a1 1 0 0 0 1-1V10"/></g>';

export function makeUploadWing(options: CommitOptions = {}): Wing {
  const allowLocal = options.allowLocalUrls === true;

  // 배치 전체가 커맨드 한 번이다 — 되돌리기 한 번에 묶음이 통째로 걷힌다.
  const commitUpload: Command = (doc, sel, args) => {
    const items = itemsArg(args['items']);
    if (items.length === 0) return null;
    // 첨부의 글자는 부르는 쪽이 준다 — 커맨드는 말을 모른다(계약). 안 주면 주소가 글자다.
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
    const empty = anchor !== undefined && anchor.w === P && anchor.ch.length === 0;
    const head = doc.slice(0, empty ? top : top + 1);
    const next = [...head, ...blocks, ...doc.slice(top + 1)];

    // 캐럿은 마지막으로 들어온 블록에 선다 — 래퍼문단이면 물건 뒤(1), 글 문단이면 글 끝.
    const landed = blocks[blocks.length - 1] as ElementNode;
    const index = head.length + blocks.length - 1;
    const inner = landed.ch[0];
    const isLump = typeof inner !== 'string' && inner !== undefined && inner.w === 'img';
    const offset = isLump ? 1 : lengthOfInline(landed.ch);
    const caret = { path: [index], offset };
    return { doc: next, selection: { anchor: caret, focus: caret } };
  };

  return {
    w: 'upload',
    place: 'tool',
    // 파일이 갈 곳이 하나는 있어야 한다 — 그림이면 img, 그 밖은 링크의 첨부다.
    requiresAnyOf: ['img', 'a'],
    commands: { commitUpload },
    button: {
      group: 'media',
      svg: UPLOAD_ICON,
      label: UPLOAD_NAME,
      // 파일 상자를 여는 것은 ui 이고, 고른 파일이 갈 곳은 호스트의 배선(mountUpload)이다.
      action: { kind: 'file' },
    },
  };
}

// 글 문단의 칸 수 — 마크 속 글자까지 센다(단말은 커밋이 안 만든다).
function lengthOfInline(nodes: readonly NabiNode[]): number {
  let total = 0;
  for (const node of nodes) {
    if (typeof node === 'string') total += node.length;
    else total += lengthOfInline(node.ch);
  }
  return total;
}

export const uploadWing: Wing = makeUploadWing();
