import type { ArmedState } from '../caret/index.js';
import type { EditEnv } from '../doc/index.js';
import type { NabiDoc } from '../schema/index.js';
import type { Ask, Choose } from './ask.js';
import type { Command } from './commands.js';
import type { Nabi } from './nabi.js';
import type { Toast } from './toast.js';

export interface NabiHost {
  doc(): NabiDoc;
  readonly env: EditEnv;
  readonly armed: ArmedState;
  readonly ask: Ask;
  readonly toast: Toast;
  bindToast(sink: Toast): () => void;
  bindChoose(sink: Choose): () => void;
  readonly toastMs: number;
  readonly toastMax: number;
  bindLocale(locale: string): () => void;
  locale(): string;
  applyRaw(run: Command, name?: string): boolean;
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
