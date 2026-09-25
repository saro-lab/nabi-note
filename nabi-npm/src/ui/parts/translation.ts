import type { Translator } from '../../locale/index.js';

export class Translations {
  private readonly updates = new Set<() => void>();
  private stop: (() => void) | undefined;
  private disposed = false;

  constructor(private readonly translator: Translator) {}

  add(update: () => void): void {
    if (this.disposed) return;
    update();
    this.updates.add(update);
    this.stop ??= this.translator.onChange?.(() => {
      for (const update of this.updates) update();
    });
  }

  text(node: Node, read: () => string): void {
    this.add(() => {
      node.textContent = read();
    });
  }

  attribute(node: Element, name: string, read: () => string): void {
    this.add(() => node.setAttribute(name, read()));
  }

  button(node: HTMLElement, label: () => string, text?: () => string): void {
    this.attribute(node, 'aria-label', label);
    this.attribute(node, 'data-nabi-tip', label);
    if (text) this.text(node, text);
  }

  clear(): void {
    this.updates.clear();
  }

  dispose(): void {
    this.disposed = true;
    this.stop?.();
    this.stop = undefined;
    this.clear();
  }
}
