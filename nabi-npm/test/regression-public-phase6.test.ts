import { JSDOM } from 'jsdom';
import { createNabiWith, type AttachHost, type Wing } from '../src/index.js';
import { mountSurface } from '../src/surface/index.js';
import { done, eq, ok } from './net.js';

const dom = new JSDOM('<div id="root"></div>');
const previousParser = globalThis.DOMParser;
globalThis.DOMParser = dom.window.DOMParser;

let attached: AttachHost | null = null;
let disposed = false;
const wing: Wing = {
  w: 'exPhaseSixHost',
  place: 'tool',
  attach: (host) => {
    attached = host;
    host.onDispose(() => {
      disposed = true;
    });
    return () => undefined;
  },
};

try {
  const editor = createNabiWith([wing]);
  const publicKeys = Reflect.ownKeys(editor.nabi).map(String);
  ok(
    'public Nabi facade has no dollar-prefixed capability',
    publicKeys.every((key) => !key.startsWith('$')),
    publicKeys,
  );
  ok(
    'public Nabi facade does not expose document or environment hosts',
    !('$doc' in editor.nabi) && !('$env' in editor.nabi),
  );

  editor.nabi.setHtml('<h2>Hello</h2>');
  eq('browser factory wires the internal DOMParser adapter for setHtml', editor.nabi.getJson(), [
    { w: 'p', a: { h: 2 }, ch: ['Hello'] },
  ]);

  let internalHits = 0;
  const injected = createNabiWith([wing], {
    doc: [{ w: 'p', ch: ['safe'] }],
    parseHtml: () => {
      internalHits += 1;
      return [];
    },
    env: { lumps: new Set(['exPoison']) },
    commands: {
      doPoison: () => {
        internalHits += 1;
        return null;
      },
    },
    builders: {
      p: () => {
        internalHits += 1;
        return 'poison';
      },
    },
    claim: () => {
      internalHits += 1;
      return [{ w: 'p', ch: ['poison'] }];
    },
  } as never);
  injected.nabi.setHtml('<p>clean</p>');
  injected.nabi.applyCommand('doPoison');
  eq(
    'public factory ignores runtime injection of internal options',
    [internalHits, injected.nabi.getHtml(), injected.registry.env.lumps.has('exPoison')],
    [0, '<p>clean</p>', false],
  );

  const root = dom.window.document.getElementById('root') as HTMLElement;
  const surface = mountSurface({ ...editor, root });
  const host = attached as AttachHost | null;
  ok(
    'attach receives explicit narrow document and environment capabilities',
    host !== null && host.doc()[0]?.w === 'p' && !!host.env,
  );
  surface.unmount();
  ok('attach onDispose remains transactional', disposed);
} finally {
  globalThis.DOMParser = previousParser;
  dom.window.close();
}

done('Phase 6 public contract regression');
