// 그물 한 장이 쓰는 최소 도구 — 세고, 어긋난 것만 말하고, 끝에 한 줄로 알린다.
// 러너가 그물 한 장을 프로세스 하나로 돌리므로 이 카운터는 그 한 장의 것이다(그물끼리 안 섞인다).
let passed = 0;
let failed = 0;

// 참이면 조용히 지나가고, 거짓이면 이름과 함께 자세한 줄들을 뱉는다 — 통과한 그물은 흔적이 없다.
export function ok(name: string, condition: boolean, detail?: string | string[]): void {
  if (condition) {
    passed += 1;
    return;
  }
  failed += 1;
  console.error(`  x ${name}`);
  const lines = detail === undefined ? [] : typeof detail === 'string' ? [detail] : detail;
  for (const line of lines) console.error(`      ${line}`);
}

// 값 비교는 JSON 한 모양으로 — 나비트리가 곧 JSON 이라 이 비교가 트리 비교와 같은 말이 된다.
export function eq(name: string, actual: unknown, expected: unknown): void {
  const got = JSON.stringify(actual);
  const want = JSON.stringify(expected);
  ok(name, got === want, got === want ? undefined : [`받은 것: ${got}`, `바란 것: ${want}`]);
}

// 그물 끝에 반드시 부른다 — 실패가 하나라도 있으면 종료 코드로 러너에게 알린다.
export function done(net: string): void {
  console.log(`${net}: ${passed} 통과, ${failed} 실패`);
  if (failed > 0) process.exit(1);
}
