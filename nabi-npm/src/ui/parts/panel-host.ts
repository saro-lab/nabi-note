import type { Panel, PanelOptions } from './panel.js';

type Host = (options: PanelOptions) => Panel;
const hosts = new WeakMap<HTMLElement, Host>();

export function registerPanelHost(root: HTMLElement, host: Host): () => void {
  hosts.set(root, host);
  return () => {
    if (hosts.get(root) === host) hosts.delete(root);
  };
}

export function hostedPanel(options: PanelOptions): Panel | null {
  for (let node: HTMLElement | null = options.anchor; node; node = node.parentElement) {
    const host = hosts.get(node);
    if (host) return host(options);
  }
  return null;
}
