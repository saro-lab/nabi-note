export function findAvailablePort(
  startPort: number,
  options?: { host?: string | boolean; strictPort?: boolean },
): Promise<number>;
