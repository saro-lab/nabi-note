// 평범한 .mjs 다 — `@types/node` 는 이 패키지가 안 무는 의존성이고(test/node-env.d.ts 가 그
// 이야기다), .ts 설정이 node 모듈을 물면 그것을 요구하게 된다.
//
// 엔트리는 셋이다(결정 8, 095 에서 ssr 이 늘었다):
//   - `src/index.ts`        → `dist/index.js`        — 코어(`nabi-note`)
//   - `src/ssr.ts`          → `dist/ssr.js`          — 서버 조립(`nabi-note/ssr`)
//   - `src/viewer/index.ts` → `dist/viewer/index.js` — 보는 쪽(`nabi-note/viewer`)
// 나가는 이름이 package.json 의 exports 세 자리와 그대로 맞물린다. 은닉 장치는 따로 없다 —
// `$`·`_` 로 시작하는 이름이 곧 "이건 안쪽 것" 이라는 표시다.
//
// 세 엔트리가 아래층(schema·doc·…)을 함께 쓰므로 splitting 으로 공용 조각을 나눈다 — 코어와
// ssr·viewer 를 한 곳에 함께 실어도 같은 코드가 두 벌 실리지 않는다. **ssr 엔트리의 값은
// 그 반대쪽이다**: 서버에만 싣는 호스트는 `surface`·`ui` 조각을 아예 안 받는다.
//
// 타입 선언(.d.ts)은 tsup 이 아니라 tsc 가 낸다(`tsconfig.build.json`) — tsup 안의
// rollup-plugin-dts 는 TypeScript 7 의 API 로는 안 돈다. 어차피 선언은 컴파일러가 내는 것이
// 가장 정확하다.
//
// CDN 단독 묶음(iife 한 벌)이 셋째 설정이다 — `dist/browser/nabi-note.min.js`, package.json 의
// unpkg·jsdelivr 가 가리키는 그 파일이다. <script> 태그 하나가 곧 설치이고, 코어 엔트리가 내는
// 것 전부가 전역 `NabiNote` 에 걸린다. 여기는 쪼개지 않는다(splitting: false) — CDN 이 무는 것은
// 파일 하나여야 한다.
//
// `clean` 은 어느 설정에도 안 켠다 — 설정 둘이 같은 `dist/` 를 쓰므로 뒤에 도는 쪽이 앞의
// 산출물을 지울 수 있다. 지우는 일은 `npm run build` 의 첫 걸음이 한다.
import { defineConfig } from 'tsup';

export default defineConfig([
  {
    entry: {
      index: 'src/index.ts',
      ssr: 'src/ssr.ts',
      'viewer/index': 'src/viewer/index.ts',
    },
    outDir: 'dist',
    format: ['esm'],
    platform: 'neutral',
    target: 'es2022',
    dts: false,
    sourcemap: true,
    splitting: true,
    treeshake: true,
    clean: false,
  },
  {
    entry: { 'nabi-note.min': 'src/index.ts' },
    outDir: 'dist/browser',
    format: ['iife'],
    globalName: 'NabiNote',
    platform: 'browser',
    target: 'es2022',
    dts: false,
    sourcemap: true,
    splitting: false,
    treeshake: true,
    minify: true,
    clean: false,
    // 기본 iife 확장자는 `.global.js` 다 — 엔트리 이름 그대로 `nabi-note.min.js` 로 낸다.
    outExtension: () => ({ js: '.js' }),
  },
]);
