// 알리는 길 — 사람에게 흘리는 한 마디의 계약이다.
// The notification path: the contract for one line surfaced to the person.
// `Ask` 와 같은 길로 호스트가 콜백을 끼우지만, 안 끼우면 core의 기본 toast가 선다(Ask는 기본 침묵이다). 호스트 콜백이 있으면 그쪽이 이기고, 없으면 기본 그릇, 그것도 없으면 침묵.
// A host plugs in a callback the same way as Ask, but leaving it unset here still gets core's default toast (Ask defaults to silence instead); a host callback wins if present, else the default toast, else silence.

// 셋뿐이다 — 성공·실패 같은 결과가 아니라 읽는 사람이 얼마나 긴장해야 하는가의 눈금이다.
// Just three levels — not a result like success/failure, but a scale of how alarmed the reader should be.
export type ToastLevel = 'info' | 'warn' | 'error';

// 부르는 쪽이 시간을 얹을 수 있다(ms) — 안 얹으면 기본(1초, NabiOptions.toastMs)이다.
// The caller may attach a duration (ms); without one it falls back to the default (1s, NabiOptions.toastMs).
export type Toast = (level: ToastLevel, message: string, ms?: number) => void;

// 기본 1초 — 짧은 확인("복사했다" 류)이 기본이고, 읽어야 하는 말은 부르는 쪽이 제 시간을 얹는다.
// Defaults to 1 second, tuned for brief confirmations ("copied") — a message that needs reading gets its own longer duration from the caller.
export const TOAST_MS = 1000;

// 동시에 서는 상한 — 넘치면 남은 시간이 가장 적은 것부터 걷는다.
// The cap on simultaneous toasts; past it, the one with the least time left is evicted first.
export const TOAST_MAX = 3;
