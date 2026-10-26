export { safeUrl } from '../url.js';

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
