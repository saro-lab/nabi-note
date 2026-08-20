// URL 화이트리스트 — 밖에서 온 주소가 문서에 박히기 전에 지나는 한 곳 (old 번역).
// DOM 이 필요 없으므로 조립(render)과 들여오기(parse)가 같은 문을 쓴다 — 같은 질문엔 같은 문.

// `javascript:` 나 낯선 스킴은 받지 않는다.
const SAFE_SCHEME = /^https?:$/i;

// `blob:` 은 전부 받지만 `data:` 는 그림만 받는다 — `data:text/html` 은 그림이 아니라 문서를 실어 나른다.
//
// **`svg` 는 뺀다.** SVG 는 스크립트를 품는 유일한 그림 형식이라(`<svg onload=…>`), `data:` 로
// 실려 오면 그림의 얼굴을 한 문서다. 업로드 미리보기가 SVG 를 만들 일이 없으므로 잃는 것이 없다.
const LOCAL_URL = /^(?:blob:|data:image\/(?!svg)[a-z0-9.+-]+[;,])/i;

// 프로토콜 상대 주소 — `//evil.com/x`. 스킴이 없어 상대 경로처럼 보이지만 **호스트가 바뀐다.**
// XSS 는 아니어도 피싱·오픈 리다이렉트이고, 그림이면 문서를 여는 순간 남의 서버로 요청이 나가
// IP 와 Referer 가 샌다. 같은 사이트 상대 경로만 받겠다는 아래 분기의 본뜻이 이것을 거른다.
const PROTOCOL_RELATIVE = /^\/\//;

// `http(s)` 절대 주소와 같은 사이트 상대 경로를 받는다. `allowLocal` 이면 `blob:`·`data:image/…` 도.
// 통과 못 한 것은 null 이다 — "없는 주소"로 다루는 것은 부르는 쪽의 몫이다.
export function safeUrl(raw: string | undefined, allowLocal = false): string | null {
  const value = (raw ?? '').trim();
  if (value === '') return null;
  if (PROTOCOL_RELATIVE.test(value)) return null;

  // 상대 경로 — 스킴이 없으니 그대로 둔다. 콜론이 섞이면 스킴 흉내이므로 거절한다.
  if (/^[./]/.test(value)) return value.includes(':') ? null : value;

  try {
    const url = new URL(value);
    if (SAFE_SCHEME.test(url.protocol)) return url.href;
    // blob:/data: 는 다시 조립하지 않는다 — 원문 그대로여야 가리키는 것이 유지된다.
    // 판정은 `url.protocol` 이 아니라 원문으로 한다 — data: 는 스킴만 봐서는 그림인지 문서인지 모른다.
    return allowLocal && LOCAL_URL.test(value) ? value : null;
  } catch {
    return null;
  }
}

// 유튜브 영상 id — 임베드 주소를 짓는 값이라 모양이 확실할 때만 받는다.
const VIDEO_ID = /^[\w-]{11}$/;

export function videoId(raw: string | undefined): string | null {
  const value = (raw ?? '').trim();
  return VIDEO_ID.test(value) ? value : null;
}

// 임베드 주소 — 쿠키를 안 남기는 쪽으로 짓는다(old 와 같은 자리).
export function embedSrc(id: string): string {
  return `https://www.youtube-nocookie.com/embed/${id}`;
}

// 들여올 때 임베드 주소에서 영상 id 를 되읽는다 — 우리 출력과 흔한 유튜브 주소 몇 모양을 받는다.
const EMBED_PATH = /^\/(?:embed|v|shorts|live)\/([\w-]{11})$/;

export function youtubeId(raw: string | undefined): string | null {
  const value = (raw ?? '').trim();
  if (value === '') return null;
  try {
    const url = new URL(value, 'https://youtube.com');
    if (url.hostname.endsWith('youtu.be')) return videoId(url.pathname.slice(1));
    if (!/(?:^|\.)(?:youtube\.com|youtube-nocookie\.com)$/i.test(url.hostname)) return null;
    if (url.pathname === '/watch') return videoId(url.searchParams.get('v') ?? undefined);
    const matched = EMBED_PATH.exec(url.pathname);
    return matched ? videoId(matched[1]) : null;
  } catch {
    return null;
  }
}
