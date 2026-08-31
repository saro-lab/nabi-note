// 부수효과로 부르는 시트 import — 번들러가 처리하고, 타입 검사기는 모양 있는 모듈이 아니라는 것만 알면 된다.
// Side-effect stylesheet imports — the bundler handles them, the type checker just needs to know they have no shape.
declare module '*.css';

// 타입 검사기가 알아야 하는 단일 파일 컴포넌트의 모양.
// A single-file component's shape as far as the type checker is concerned.
declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<Record<string, unknown>, Record<string, unknown>, unknown>;
  export default component;
}
