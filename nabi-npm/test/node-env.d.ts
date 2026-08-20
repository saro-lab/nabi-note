// 그물이 쓰는 노드 전역·모듈만 최소로 손으로 적는다 — `@types/node` 는 dev 로도 안 무는
// 의존성이다. 여기 없는 API 를 그물에서 쓰게 되면 그때 한 줄씩 늘린다.
declare const process: { exit(code?: number): never };

declare module 'node:fs' {
  export interface Dirent {
    name: string;
    isDirectory(): boolean;
    isFile(): boolean;
  }
  export function existsSync(path: string): boolean;
  export function readdirSync(path: string, options: { withFileTypes: true }): Dirent[];
  export function readFileSync(path: string, encoding: 'utf8'): string;
}

declare module 'node:path' {
  export function join(...parts: string[]): string;
  export function dirname(path: string): string;
  export const sep: string;
}

declare module 'node:url' {
  export function fileURLToPath(url: string | URL): string;
}
