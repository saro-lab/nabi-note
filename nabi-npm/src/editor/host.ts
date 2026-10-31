import type { LocaleInput } from '../locale/index.js';
import type { ArmedState } from '../caret/index.js';
import type { EditEnv } from '../doc/index.js';
import type { NabiDoc } from '../schema/index.js';
import type { Ask, Choose } from './ask.js';
import type { Command } from './commands.js';
import type { Nabi } from './nabi.js';
import type { Toast } from './toast.js';

export interface HistoryExtension {
  capture(): unknown;
  restore(value: unknown): void;
  change(before: NabiDoc, after: NabiDoc): unknown;
}

export interface NabiHost {
  doc(): NabiDoc;
  previewHtml(): string;
  readonly env: EditEnv;
  readonly armed: ArmedState;
  readonly ask: Ask;
  readonly toast: Toast;
  reportError(error: unknown): void;
  bindToast(sink: Toast): () => void;
  bindChoose(sink: Choose): () => void;
  // 표면 attach가 상황 줄에 "이 wing의 입력 판을 열어 달라"고 부탁하는 문 — 표면은 ui를 모르므로 ui가 받을 자리를 건다.
  // How a surface attach asks the context row to open this wing's prompt; the surface doesn't know ui, so ui binds the receiving end.
  requestContext(w: string): void;
  bindContextRequest(sink: (w: string) => void): () => void;
  readonly toastMs: number;
  readonly toastMax: number;
  bindLocale(locale: LocaleInput): () => void;
  locale(): string;
  applyRaw(run: Command, name?: string): boolean;
  applyHistory(run: Command, state: unknown): boolean;
  bindHistory(extension: HistoryExtension): () => void;
  markSaved(saved: NabiDoc): void;
  registerCommand(name: string, command: Command): () => void;
  lock(reason: string): () => void;
  lockedBy(): string | null;
}

const hosts = new WeakMap<Nabi, NabiHost>();

export function bindHost(nabi: Nabi, host: NabiHost): void {
  hosts.set(nabi, host);
}

export function hostOf(nabi: Nabi): NabiHost {
  const host = hosts.get(nabi);
  if (!host) throw new TypeError('Nabi instance was not created by this package');
  return host;
}
