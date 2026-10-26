import { parseArgs } from 'node:util';
import { serve } from 'vitepress';
import { findAvailablePort } from './local-port.mjs';

const { values } = parseArgs({
  options: {
    port: { type: 'string', default: '4173' },
    base: { type: 'string' },
    assetsBase: { type: 'string' },
  },
});

let port = Number(values.port);

for (;;) {
  port = await findAvailablePort(port);
  try {
    const app = await serve({ ...values, root: 'docs', port });
    if (port === 0) {
      console.log(`Preview listening on port ${app.server.address().port}.`);
    }
    break;
  } catch (error) {
    if (error.code !== 'EADDRINUSE' || port === 65535) throw error;
    console.log(`Port ${port} is in use, trying ${port + 1}...`);
    port += 1;
  }
}
