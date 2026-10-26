import { createServer } from 'node:net';

function canListen(port, host) {
  return new Promise((resolve, reject) => {
    const server = createServer();
    server.once('error', (error) => {
      if (error.code === 'EADDRINUSE') resolve(false);
      else if (error.code === 'EAFNOSUPPORT' || error.code === 'EADDRNOTAVAIL') resolve(true);
      else reject(error);
    });
    server.once('listening', () => {
      server.close((error) => error ? reject(error) : resolve(true));
    });
    server.listen(port, host);
  });
}

export async function findAvailablePort(startPort, { host, strictPort = false } = {}) {
  if (!Number.isInteger(startPort) || startPort < 0 || startPort > 65535) {
    throw new RangeError('--port must be an integer between 0 and 65535.');
  }
  if (startPort === 0) return 0;

  // macOS에서는 전체 주소와 루프백이 같은 포트에 함께 연결될 수 있어 둘 다 검사한다.
  // macOS can bind wildcard and loopback addresses to the same port, so check both.
  const hosts = new Set(['127.0.0.1', '::1', '0.0.0.0', '::']);
  if (typeof host === 'string') hosts.add(host);

  for (let port = startPort; port <= 65535; port += 1) {
    let available = true;
    for (const address of hosts) {
      if (!await canListen(port, address)) {
        available = false;
        break;
      }
    }
    if (available) return port;
    if (strictPort) throw new Error(`Port ${port} is already in use.`);
    if (port < 65535) console.log(`Port ${port} is in use, trying ${port + 1}...`);
  }
  throw new Error(`No available ports found between ${startPort} and 65535.`);
}
