// 붙여넣기 후보 모으기 — DOM 도 레지스트리도 모르는 순수 함수 하나다.
//
// 규칙 넷:
//   1. 글자 계열(html·plain)이 하나라도 있으면 파일은 안 본다 — 엑셀에서 온 표는 그림이
//      아니라 표다. 파일만 온 붙여넣기는 여기서 후보 0 을 답하고, 파일 처리기는 부르는 쪽의 일이다.
//   2. 필터를 등록순으로 돌려 후보를 모은다 (호스트 → wing → 내장 순으로 이미 정렬돼 온다).
//   3. 맨 글자 기본값은 **언제나 마지막**이다 — 어느 필터도 못 읽는 글이 갈 곳이 늘 하나는 있다.
//   4. 필터가 배열을 답하면 그 순서대로 펴진다.
import { P, type ElementNode } from '../schema/index.js';
import type { LocaleText } from '../locale/index.js';
import type { IoFilter, PasteCandidate, PasteData } from './contract.js';

export interface CollectOptions {
  // 이미 순서가 정해져 온다.
  readonly filters: readonly IoFilter[];
  readonly textLabel: LocaleText | string;
  // 맨 글자 후보의 그림 — 부르는 쪽이 준다(이 층은 무늬를 안 고른다).
  readonly textIcon?: string;
}

// 맨 글자 후보 — 줄마다 문단 하나. 한 줄뿐이면 `inline` 이라 캐럿에 이어 쓴다.
export function textCandidate(plain: string, label: LocaleText | string, icon?: string): PasteCandidate {
  const lines = plain.split('\n');
  const build = (): readonly ElementNode[] => lines.map((line) => (line === '' ? { w: P, ch: [] } : { w: P, ch: [line] }));
  return {
    id: 'text',
    label,
    build,
    ...(icon === undefined ? {} : { icon }),
    ...(lines.length === 1 ? { inline: true } : {}),
  };
}

export function collectCandidates(data: PasteData, options: CollectOptions): readonly PasteCandidate[] {
  // 글자가 아예 없다 — 파일만 온 붙여넣기다.
  if (data.html === '' && data.plain === '') return [];

  const out: PasteCandidate[] = [];
  for (const filter of options.filters) {
    const taken = filter.paste?.(data);
    if (!taken) continue;
    if (Array.isArray(taken)) out.push(...(taken as readonly PasteCandidate[]));
    else out.push(taken as PasteCandidate);
  }
  // 맨 글자는 `plain` 에서만 판다 — html 뿐인 붙여넣기에 빈 줄 하나를 세우지 않는다.
  if (data.plain !== '') out.push(textCandidate(data.plain, options.textLabel, options.textIcon));
  return out;
}
