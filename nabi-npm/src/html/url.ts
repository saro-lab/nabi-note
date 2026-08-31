// 밖에서 온 주소가 문서에 박히기 전에 지나는 한 곳 — render(조립)와 parse(들여오기)가 DOM 없이 같은 문을 쓴다.
// The one gate any outside address passes through before landing in a document; render and parse share it since neither needs a DOM.

const SAFE_SCHEME = /^https?:$/i;

// data:는 그림만 받고 svg는 뺀다 — SVG는 스크립트를 품을 수 있는 유일한 그림 형식이라 data:로 오면 그림 얼굴을 한 문서가 된다.
// data: is accepted only for images, svg excluded — it's the one image format that can carry a script, so over data: it's a document wearing a picture's face.
const LOCAL_URL = /^(?:blob:|data:image\/(?!svg)[a-z0-9.+-]+[;,])/i;

// 스킴이 없어 상대 경로처럼 보이지만 호스트가 바뀐다(`//evil.com/x`) — 같은 사이트 상대 경로만 받는 아래 분기가 이를 거른다.
// Schemeless but host-changing (`//evil.com/x`); the branch below, which accepts only same-site relative paths, filters it out.
const PROTOCOL_RELATIVE = /^\/\//;

// URL parser와 HTML parser가 지우거나 다른 문법으로 해석하는 글자는 주소 문에 들이지 않는다.
const URL_CONTROL = /[\u0000-\u001f\u007f]/;
const HTML_REFERENCE = /&(?:#[0-9]+|#x[0-9a-f]+|[a-z][a-z0-9]+);/i;

function encodedScheme(value: string): boolean {
  const end = value.search(/[/?#]/);
  return HTML_REFERENCE.test(end < 0 ? value : value.slice(0, end));
}

// 통과 못 한 주소는 null이다 — "없는 주소"로 다룰지는 부르는 쪽의 몫이다.
// A rejected address returns null; whether to treat that as "no address" is the caller's call.
export function safeUrl(raw: string | undefined, allowLocal = false): string | null {
  const source = raw ?? '';
  if (URL_CONTROL.test(source) || source.includes('\\')) return null;
  const value = source.trim();
  if (value === '') return null;
  if (PROTOCOL_RELATIVE.test(value)) return null;
  if (encodedScheme(value)) return null;

  // 스킴 없는 상대 경로는 그대로 두되, 콜론이 섞이면 스킴 흉내이므로 거절한다.
  // A scheme-less relative path passes through; a stray colon looks like a scheme impersonation and is rejected.
  if (/^[./]/.test(value)) return value.includes(':') ? null : value;

  try {
    const url = new URL(value);
    if (SAFE_SCHEME.test(url.protocol)) return url.href;
    // blob:/data:는 원문 그대로 돌려준다(다시 조립하면 가리키는 것이 바뀐다) — 판정도 protocol이 아닌 원문으로 한다.
    // blob:/data: pass through verbatim (reassembling would change what they point to); judged against the raw string, not `url.protocol`.
    return allowLocal && LOCAL_URL.test(value) ? value : null;
  } catch {
    return null;
  }
}

const VIDEO_ID = /^[\w-]{11}$/;

export function videoId(raw: string | undefined): string | null {
  const value = (raw ?? '').trim();
  return VIDEO_ID.test(value) ? value : null;
}

// 쿠키를 안 남기는 임베드 도메인을 쓴다.
// Uses the cookie-free embed domain.
export function embedSrc(id: string): string {
  return `https://www.youtube-nocookie.com/embed/${id}`;
}

// 들여올 때 임베드 주소에서 영상 id를 되읽는다 — 우리 출력과 흔한 유튜브 주소 몇 모양을 받는다.
// Reads a video id back out of an embed address on import, accepting our own output plus common YouTube URL shapes.
const EMBED_PATH = /^\/(?:embed|v|shorts|live)\/([\w-]{11})$/;

export function youtubeId(raw: string | undefined): string | null {
  const value = (raw ?? '').trim();
  if (value === '') return null;
  try {
    const url = new URL(value, 'https://youtube.com');
    const host = url.hostname.toLowerCase();
    if (host === 'youtu.be') return videoId(url.pathname.slice(1));
    if (
      !['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtube-nocookie.com', 'www.youtube-nocookie.com'].includes(
        host,
      )
    )
      return null;
    if (url.pathname === '/watch') return videoId(url.searchParams.get('v') ?? undefined);
    const matched = EMBED_PATH.exec(url.pathname);
    return matched ? videoId(matched[1]) : null;
  } catch {
    return null;
  }
}
