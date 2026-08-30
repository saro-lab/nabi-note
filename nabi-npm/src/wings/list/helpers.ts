import { P, type ElementNode } from '../../schema/index.js';
import { caretAt } from '../../caret/index.js';
import type { EditResult } from '../../doc/index.js';
import type { CommandOutcome } from '../../editor/index.js';

export interface Family {
  readonly list: string;
  readonly item: string;
}

export const BULLET: Family = { list: 'ul', item: 'li' };
export const ORDERED: Family = { list: 'ol', item: 'oli' };
export const TASK: Family = { list: 'tl', item: 'tli' };

// 세 가족이 서로를 아는 유일한 자리 — 토글이 리스트를 리스트로 갈아입히기 때문이다(한 파일 안).
export const LIST_TYPES: ReadonlySet<string> = new Set([BULLET.list, ORDERED.list, TASK.list]);

export const emptyParagraph = (): ElementNode => ({ w: P, ch: [] });

export const outcomeOf = (r: EditResult): CommandOutcome => ({ doc: r.doc, selection: caretAt(r.caret) });
