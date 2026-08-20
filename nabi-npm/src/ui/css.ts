// 시트 — 코어 시트 하나 + wing 이 들고 온 시트들. 붙이는 문도 하나다.
//
// **중복 금지의 열쇠는 문자열이다** (옛 판의 "가족 수만큼 중복"): 한 가족이 시트 하나를 나눠
// 쓰므로(정렬·드롭캡·제목 셋이 문단 시트 하나, 리스트 셋이 목록 시트 하나) wing 이름으로 세면
// 같은 규칙이 가족 수만큼 실린다. 정직한 열쇠는 내용이다 — 시트가 같은 두 wing 은 정말로
// 한 번만 필요하다.
//
// 기억은 **문서가 한다** — 모듈 전역 집합이 아니다. 붙은 시트의 지문이 `<style>` 의 표식으로
// 남아 있어서, 같은 문서에 에디터가 둘 서도 두 번 안 붙는다 (의 정신).
import type { Registry } from '../wing/index.js';

const MARK = 'data-nabi-sheet';

// 시트 지문 — 짧고 고른 djb2. 비밀이 아니라 "같은 글인가"의 이름표다.
export function sheetKey(text: string): string {
  let hash = 5381;
  for (let i = 0; i < text.length; i += 1) hash = (((hash << 5) + hash) ^ text.charCodeAt(i)) >>> 0;
  return hash.toString(36);
}

// 붙일 시트 목록 — 코어가 맨 앞이고, 그다음이 wing 들이다(같은 무게면 wing 이 이긴다).
// 여기서 이미 **글 단위로 접힌다** — 중복은 화면에 닿기 전에 사라진다.
export function collectSheets(registry: Registry, core: string = CORE_CSS): readonly string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  const add = (text: string | undefined): void => {
    const sheet = text?.trim();
    if (!sheet || seen.has(sheet)) return;
    seen.add(sheet);
    out.push(sheet);
  };
  add(core);
  for (const wing of registry.wings) add(wing.styles);
  return out;
}

// 문서에 붙인다 — 이미 있는 지문은 건너뛴다. 답은 떼는 함수 하나다(이 부름이 새로 붙인 것만 뗀다).
export function injectSheets(owner: Document, sheets: readonly string[]): () => void {
  const mine: HTMLStyleElement[] = [];
  for (const text of sheets) {
    const key = sheetKey(text);
    if (owner.head.querySelector(`style[${MARK}="${key}"]`)) continue;
    const style = owner.createElement('style');
    style.setAttribute(MARK, key);
    style.textContent = text;
    owner.head.append(style);
    mine.push(style);
  }
  return () => {
    for (const style of mine) style.remove();
  };
}

// --- 코어 시트 ---------------------------------------------------------------------------------
// 문단·래퍼·nabi-scroll·에디터 크롬. wing 의 생김새는 그 wing 의 시트가 말한다.
export const CORE_CSS = `
/* 토큰이 서는 자리 — **편집기 뿌리만이 아니다.** 덮개(미리보기·라이트박스)는 \`body\` 의 자식으로
   서므로 \`.nabi\` 로부터의 상속이 닿지 않는다. 여기 이름을 안 적으면 그 층에서 토큰이 아무 값도
   아니게 되고, \`background: var(--nabi-bg)\` 가 투명이 되어 상자가 막 속으로 사라진다.
   홀로 선 보기 뿌리(\`.nabi-content\` 만 걸린 발행 페이지)도 같은 이유로 함께 적는다. */
:is(.nabi, .nabi-scrim, .nabi-content:where(:not(.nabi *))) {
  color-scheme: light;

  --nabi-fg: #1b1b1f; --nabi-bg: #fff; --nabi-muted: #6b6b76; --nabi-line: #e2e2e8;
  --nabi-accent: #3b6fe0; --nabi-on-accent: #fff; --nabi-soft: rgb(0 0 0 / 4.5%);
  --nabi-danger: #d93b3b; --nabi-on-danger: #fff;

  --nabi-radius: 6px; --nabi-radius-sm: 4px; --nabi-radius-xs: 3px;
  /* 층(판·미리보기·라이트박스·기록)이 함께 쓰는 모서리 하나 — 층은 각지게, 모서리를 가진 것은
     층 자신뿐이고 그 **안**의 상자들은 각진 채로 흐른다. */
  --nabi-layer-radius: .25rem;
  --nabi-grid-cell: 1.125rem;
  --nabi-shadow: 0 8px 24px rgb(16 24 40 / 12%);
  --nabi-scrim: rgb(12 14 18 / 72%);
  --nabi-z-sticky: 20;

  /* 글꼴 — 서체(tf) wing 이 고르는 갈래 넷의 실체다.
     **이름이 \`-fallback\` 인 것이 요점이다.** 호스트가 쓰는 이름은 \`--nabi-font\`* 넷이고, 코어는
     그 넷을 **정의하지 않는다** — 쓸 때 \`var(--nabi-font, var(--nabi-font-fallback))\` 로 부른다.
     코어가 \`.nabi\` 에 정의해 버리면 호스트가 \`:root\` 에 얹은 값이 그 아래 자리에서 늘 지는데
     (\`.nabi\` 가 더 가깝다), 그러면 호스트가 글꼴을 못 바꾼다 — 실제로 nabi-web 이 구글 폰트를
     다 받아 놓고도 편집기에는 시스템 글꼴이 나왔다. 대체값으로만 두면 호스트가 어디에 적든 이긴다.

     차례가 이렇게 생긴 까닭 셋:
       ① 브라우저는 **글자마다** 이 줄을 왼쪽부터 훑는다 — "없으면 저것" 이 아니라 글자별
          갈아타기다. 그래서 **라틴을 쥔 것이 앞에 선다**: CJK 글꼴에도 라틴이 들어 있는데 그
          라틴이 못생겨서, 순서가 뒤집히면 영문 전체가 그 얼굴로 나온다.
       ② **진짜 Bold 를 가진 글꼴을 이름으로 불러 앞세운다.** 굵기 700 의 파일이 없으면
          브라우저가 획을 번지게 해 굵은 척을 하는데(가짜 굵게), 한글·한자는 그때 획이 서로
          먹어 뭉개진다. system-ui 하나만 두면 윈도에서 한글이 굴림으로 떨어지는 설정이
          아직 있고 굴림에는 Bold 파일이 없다 — "Malgun Gothic" 이 그 앞을 막는다.
          가짜 굵게를 font-synthesis: none 으로 끄지는 **않는다**: 그러면 굵게가 아예 안
          보여서 "버튼이 고장났다" 가 된다. 뭉갤 일이 없는 글꼴을 앞에 세워 그 자리에 안 간다.
       ③ 이모지 글꼴은 **제네릭 뒤**, 맨 끝이다. 제네릭도 목록의 한 칸이라 거기서 안 멈춘다 —
          앞에 두면 이모지 글꼴이 가진 화살표·괄호 류까지 그쪽으로 새서 글줄이 들쭉해진다. */
  --nabi-font-fallback:
    system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial,
    "Apple SD Gothic Neo", "Malgun Gothic", "Noto Sans KR", "Noto Sans",
    sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji";
  /* 한글 명조는 굵기가 약한 갈래다 — 맥의 AppleMyungjo 도 윈도의 바탕도 Bold 파일이 없다.
     그래서 진짜 Bold 를 가진 나눔명조·Noto Serif KR 을 그 둘보다 **앞**에 세운다. */
  --nabi-font-serif-fallback:
    Georgia, Cambria, "Times New Roman", Times,
    "Nanum Myeongjo", "Noto Serif KR", AppleMyungjo, Batang,
    serif, "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji";
  /* 한글이 monospace 제네릭 **뒤**에 선다 — 고정폭은 라틴에서 나온 개념이라 뒤에 오는 한글
     글꼴은 고정폭이 아니고, 한글이 든 줄만 칸이 어긋난다. 그래도 이 차례가 맞다: 칸이 어긋나는
     것보다 글자가 두부로 나오는 것이 나쁘고, 한글이 든 코드 줄은 대개 주석이다. */
  --nabi-font-mono-fallback:
    ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
    "Liberation Mono", "Roboto Mono", "Noto Sans Mono",
    monospace, "Apple SD Gothic Neo", "Malgun Gothic", "Noto Sans KR",
    "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji";
  /* 넷 중 가장 약한 갈래다 — 안드로이드에는 흘림이 사실상 없고(제네릭이 산세리프로 떨어진다)
     한글 흘림은 어느 플랫폼에도 기본으로 없다. 제대로 하려면 호스트가 웹폰트를 얹어야 한다
     (nabi-web 이 그 견본이다). 코어의 몫은 "안 얹어도 아주 망가지지는 않게" 까지다. */
  --nabi-font-cursive-fallback:
    "Segoe Script", "Bradley Hand", "Snell Roundhand", "Apple Chancery",
    Gungsuh, "Noto Sans KR", cursive;
  --nabi-typeface-base: var(--nabi-font, var(--nabi-font-fallback));

  /* 형광펜 여섯· 글자색 다섯 — **리터럴이 아니라 토큰이다.** 값에는 이름만 살고 색은 여기 있다.
     그래야 다크에서 알파를 낮춰 글자가 안 묻힌다(리터럴이면 두 테마가 같은 색을 쓴다). */
  --nabi-hl-yellow: rgb(250 204 21 / 45%);
  --nabi-hl-green: rgb(74 222 128 / 45%);
  --nabi-hl-cyan: rgb(56 189 248 / 45%);
  --nabi-hl-pink: rgb(244 114 182 / 45%);
  --nabi-hl-purple: rgb(192 132 252 / 45%);
  --nabi-hl-orange: rgb(251 146 60 / 45%);
  --nabi-tc-green: #009e73;
  --nabi-tc-coral: #e05638;
  --nabi-tc-violet: #8b5cf6;
  --nabi-tc-amber: #d97706;
  --nabi-tc-blue: #0284c7;
}

/* 다크는 위 목록 중 **갈리는 것 전부**를 다시 준다 — 하나라도 빠지면 라이트 값이 새어 든다.

   **무엇이 다크인가는 호스트가 말한다 — 시스템 설정을 우리가 먼저 읽지 않는다.**
   길은 둘이다: 호스트 페이지의 \`.dark\` 클래스, 또는 편집기의 \`data-nabi-theme\`.

   한때 \`@media (prefers-color-scheme: dark)\` 도 함께 봤는데 그것이 호스트를 이겼다: 기기가
   다크인 사람이 사이트를 라이트로 바꾸면 사이트만 하얘지고 편집기는 검은 채로 남았다. \`.dark\`
   를 쓰는 페이지(VitePress 가 그렇다)는 **라이트일 때 아무 클래스도 안 단다** — 그래서 "호스트가
   라이트라고 말한 것"과 "호스트가 아무 말도 안 한 것"을 CSS 가 구별할 수 없고, 시스템 설정을
   기본값으로 삼는 순간 호스트의 라이트를 덮어 버린다. 기본은 라이트, 다크는 호스트가 말할 때만. */
:where(html, body).dark :is(.nabi, .nabi-scrim, .nabi-content:where(:not(.nabi *))):not([data-nabi-theme="light"]),
:is(.nabi, .nabi-scrim)[data-nabi-theme="dark"] {
  color-scheme: dark;
  --nabi-fg: #e8e8ee; --nabi-bg: #16161a; --nabi-muted: #9a9aa6; --nabi-line: #2e2e36;
  --nabi-accent: #7ea2ff; --nabi-on-accent: #16161a; --nabi-soft: rgb(255 255 255 / 7%);
  --nabi-danger: #f0616a; --nabi-on-danger: #1a0d0f;
  --nabi-shadow: 0 8px 24px rgb(0 0 0 / 50%);
  --nabi-scrim: rgb(0 0 0 / 78%);
  --nabi-hl-yellow: rgb(250 204 21 / 35%);
  --nabi-hl-green: rgb(74 222 128 / 35%);
  --nabi-hl-cyan: rgb(56 189 248 / 35%);
  --nabi-hl-pink: rgb(244 114 182 / 35%);
  --nabi-hl-purple: rgb(192 132 252 / 35%);
  --nabi-hl-orange: rgb(251 146 60 / 35%);
}
/* 밝게를 **명시**한 쪽이 바깥의 어둠을 이긴다 — 다크 뒤에 서야 되돌린다. */
:where(html, body).light :is(.nabi, .nabi-scrim, .nabi-content:where(:not(.nabi *))):not([data-nabi-theme="dark"]),
:is(.nabi, .nabi-scrim)[data-nabi-theme="light"] {
  color-scheme: light;
  /* \`--nabi-soft\` 는 **색이 아니라 얇은 막이다.** 상황 줄·단추 hover 가 이것을 쓰는데, 편집기가
     제 배경을 안 칠하므로(아래) 불투명한 회색을 두면 그 자리만 페이지에서 도려낸 것처럼 뜬다.
     알파로 두면 페이지가 무슨 색이든 그 위에 살짝 얹혀 "여기가 조금 다른 자리" 만 말한다.
     라이트는 어둡게, 다크는 밝게 — 방향이 반대인 것이 이 한 토큰이 두 테마를 다 사는 길이다. */
  --nabi-fg: #1b1b1f; --nabi-bg: #fff; --nabi-muted: #6b6b76; --nabi-line: #e2e2e8;
  --nabi-accent: #3b6fe0; --nabi-on-accent: #fff; --nabi-soft: rgb(0 0 0 / 4.5%);
  --nabi-danger: #d93b3b; --nabi-on-danger: #fff;
  --nabi-shadow: 0 8px 24px rgb(16 24 40 / 12%);
  --nabi-scrim: rgb(12 14 18 / 72%);
  --nabi-hl-yellow: rgb(250 204 21 / 45%);
  --nabi-hl-green: rgb(74 222 128 / 45%);
  --nabi-hl-cyan: rgb(56 189 248 / 45%);
  --nabi-hl-pink: rgb(244 114 182 / 45%);
  --nabi-hl-purple: rgb(192 132 252 / 45%);
  --nabi-hl-orange: rgb(251 146 60 / 45%);
}

/* **편집기는 제 배경을 안 칠한다.** 사이트의 바탕이 #eee 면 편집기도 #eee 로 보여야 한다
   글을 쓰는 자리는 페이지의 일부이지 페이지 위에 얹힌 카드가 아니다. 그래서 여기서 배경을
   비우고, 페이지가 칠한 것이 그대로 비치게 둔다.
   (\`--nabi-bg\` 는 그대로 산다 — 다만 **막 위에 뜨는 것들**의 몫이다: 붙는 크롬·판·미리보기·
   라이트박스. 그것들은 밑을 가려야 하므로 불투명해야 하고, 페이지 바탕이 흰색·검은색이 아니면
   호스트가 그 토큰 하나를 제 색으로 덮는다.) */
.nabi {
  color: var(--nabi-fg); background: transparent; font-family: var(--nabi-typeface-base);
  /* 업로드 층이 이 상자를 기준으로 앉는다. */
  position: relative;
  display: flex; flex-direction: column; min-height: 0;
}

/* 붙는 툴바 — **툴바 줄과 상황 줄을 함께 묶은 덩어리다.** 둘이 따로 붙으면 상황 줄이 뜰 때
   글이 밀려 화면이 흔들린다. 띠의 위 변이 여기 아랫변이다. */
.nabi-toolbar {
  position: sticky; z-index: var(--nabi-z-sticky);
  inset-block-start: calc(var(--nabi-sticky-top, 0px) + var(--nabi-keyboard-top, 0px));
  /* **아래 선을 안 긋는다.** 상황 줄이 자기 바탕색(옅은 회색)으로 이미 이 덩어리의 끝을 말하고
     있어 선을 더하면 같은 말을 두 번 한다. 상황 줄이 비어 사라진 때에도 배경 대비만으로 갈린다. */
  background: var(--nabi-bg);
  /* **세로 숨은 여기서 준다** — 툴바 줄이 아니라 크롬이. 까닭은 도구 둘(미리보기·전체화면)이
     사는 자리가 호스트마다 다르기 때문이다: 툴바 줄 **안**에 넣는 호스트도 있고 그 **밖**
     (크롬의 자식)에 두는 호스트도 있다. 세로 여백이 줄에 붙어 있으면 밖에 둔 도구만 그만큼
     위로 떠서 단추 줄과 엇갈린다 — 실제로 그렇게 어긋났고, 호스트 마크업으로 그것을 맞추게
     하는 것은 답이 아니다(시트가 못 지키는 약속이 된다). 여백을 한 겹 위로 올리면 둘이 같은
     바닥에서 시작하므로, 도구가 어디에 살든 그룹과 같은 높이에 선다. */
  padding-block: .25rem;
}
/* 상황 줄이 서 있으면 **아랫여백만 거둔다.** 상황 줄은 제 바탕(옅은 회색)으로 이 덩어리의 끝을
   말하는데, 그 밑에 크롬 바탕색이 .25rem 더 남으면 띠가 두 번 끝난다 — 회색 줄이 덩어리의
   마지막 줄이 아니라 흰 띠 위에 얹힌 조각으로 보인다.
   여백을 margin 으로 옮기는 것은 답이 아니다: 이 상자가 하는 일이 **붙어서 밑을 가리는** 것인데
   margin 은 안 칠해지므로 그 틈으로 지나가는 글이 비친다. 그래서 자리를 옮기는 대신, 아래를
   말해 줄 것이 이미 있을 때만 여백을 거둔다.
   윗여백은 그대로 둔다 — 위쪽에는 대신 말해 줄 것이 없다. 상황 줄이 비어 사라지면(hidden) 이
   규칙도 함께 풀려 .25rem 이 돌아오므로, 그때는 툴바 줄과 글 사이가 다시 벌어진다.
   자손으로 찾는다(> 가 아니라) — 상황 줄을 제 껍데기로 한 겹 감싸는 호스트가 있다. */
.nabi-toolbar:has(.nabi-context:not([hidden])) { padding-block-end: 0; }
/* 툴바 줄 — **flex 가 아니다.** flex 면 도구 둘이 한 칸을 차지해서, 화면이 좁아지는 순간
   통째로 다음 줄로 내려간다. 흐름 배치에 두고 도구만 오른쪽으로 띄우면(float) 단추 줄이 그
   둘을 **감싸고** 흐르므로, 좁아져도 도구는 첫 줄 오른쪽에 그대로 남는다.
   도구 상자는 mountViewTools 가 **스스로 세워 맨 앞에 꽂는다** — float 는 자기 뒤에 오는
   줄만 비켜 가게 하므로 순서가 곧 규칙이고, 그것을 호스트에게 시키지 않는다. */
/* relative 는 toast 선반의 닻이다 — 선반이 이 줄의 아랫변에 절대 배치로 붙는다. 상황 줄이 아니라
   여기에 붙는 까닭: toast 자리는 상황 줄의 유무와 무관해야 해서, 떴다 사라지는 줄을 기준으로
   삼을 수 없다. */
/* 좌우만 준다 — 세로는 위 \`.nabi-toolbar\` 가 한 번만 준다(그 주석이 까닭이다). 여기에 세로를
   두면 이 클래스가 겹쳐 붙는 호스트(mountToolbar 가 제 뿌리에도 단다)에서 두 번 걸리고,
   도구가 그 줄 밖에 사는 호스트에서는 도구만 안 걸려 엇갈린다. 겹쳐도 안 어긋나는 것은
   좌우뿐이라 좌우만 남긴다. */
.nabi-toolbar-row { padding: 0 .375rem; position: relative; }
.nabi-toolbar-row::after { content: ""; display: block; clear: both; }
/* 도구 둘(미리보기·전체화면)이 **위치 잡힌 층으로 함께 올라간다** — 안 올리면 손이 안 닿는다.
   까닭: 이 클래스는 호스트가 감싼 줄에도 붙고 mountToolbar 가 제 뿌리에도 단다. 그래서 위의
   relative(toast 닻)가 그 **뿌리 div 까지** 위치 잡힌 요소로 만드는데, 뜬 것(float)은 흐름
   속 블록보다 위에 그려지지만 **위치 잡힌 블록보다는 아래**다. 단추 줄이 도구 위를 덮어(줄
   상자는 원래 도구 자리까지 걸친다 — 비켜 가는 것은 글줄이지 상자가 아니다) 진짜 클릭이 도구
   대신 그 줄에 떨어졌다. 프로그램 클릭(el.click())은 자리를 안 재므로 멀쩡해 보였다.
   z-index 가 함께 있어야 한다: 둘 다 위치만 잡히면 문서 순서가 이기는데, 도구가 **앞**이라
   순서로는 늘 진다. */
.nabi-tools {
  float: inline-end; display: inline-flex; gap: .125rem; margin-inline-start: .75rem;
  position: relative; z-index: 1;
  /* 그룹과 **같은 세로 패딩** — 그래야 도구 단추가 단추 줄의 첫 줄과 같은 높이에 선다.
     단추는 그룹 속에 서고 그룹이 이만큼을 두르는데, 도구는 그룹 밖이라 제가 둘러야 한다.
     아래 .nabi-group 의 padding 과 늘 같은 값이어야 한다 — 갈리면 오른쪽 끝 둘만 엇갈린다. */
  padding-block: .1875rem;
}
/* 그룹 — 줄바꿈이 그룹 안에서도 일어난다. 코드처럼 컨트롤이 열 개 넘는 그룹이 좁은 화면에서
   옆으로 뚫고 나가지 않게. 왼쪽에 선을 긋지 않고 오른쪽 여백만 둔다: 줄이 접혔을 때 줄 맨 앞에
   "앞이 없는데 선만 남는" 모양이 안 생긴다. */
.nabi-group {
  display: inline-flex; vertical-align: middle; flex-wrap: wrap; align-items: center;
  gap: .125rem; padding: .1875rem; border-radius: var(--nabi-radius-sm);
  margin-inline-end: .75rem; min-inline-size: 0; position: relative;
}
.nabi-group[hidden] { display: none; }

.nabi-btn {
  appearance: none; border: 0; background: transparent; color: inherit; cursor: pointer;
  block-size: 1.875rem; min-inline-size: 1.875rem; padding: 0; font: inherit; font-size: .8125rem;
  border-radius: calc(var(--nabi-radius-sm) - .1875rem);
  display: inline-flex; align-items: center; justify-content: center; position: relative;
}
.nabi-btn:hover, .nabi-btn.nabi-kbd { background: var(--nabi-soft); }
/* 눌렀다 뗀 티 — **아무 일도 안 하는 누름에도** 화면이 답한다.
   툴바 단추는 캐럿을 지키려고 mousedown 을 삼키는데(parts/button.ts), 그러면 브라우저의
   :active 도 안 걸려서 누른 티가 아무 데도 안 난다. 마크처럼 눌림이 남는 단추는 그것으로
   알지만, 그 자리에서 조용히 아무 일도 안 하는 단추는 화면이 통째로 조용해 "안 눌리나?" 가
   된다. 짧게 물들었다 스스로 돌아오는 것이 그 답이다 — 상태가 아니라 **응답**이라 눌림
   표시(.on)와 색을 나눠 쓰되 훨씬 짧게 산다. */
@keyframes nabi-tap {
  from { background: color-mix(in srgb, var(--nabi-accent) 26%, transparent); transform: scale(.92); }
  to { background: transparent; transform: scale(1); }
}
.nabi-btn.nabi-tap { animation: nabi-tap 220ms ease-out; }
/* 움직임을 줄이라는 사람에게는 크기만 안 움직이고 물듦은 남는다 — 응답 자체가 사라지면 안 된다. */
@media (prefers-reduced-motion: reduce) {
  @keyframes nabi-tap {
    from { background: color-mix(in srgb, var(--nabi-accent) 26%, transparent); }
    to { background: transparent; }
  }
}
/* **눌린 단추는 옅게 물든다 — 강조색으로 통째 칠하지 않는다.** 통짜 칠은 눌린 것 하나가
   툴바에서 제일 무거운 물건이 되어, 글을 보러 온 눈이 자꾸 그리로 끌린다. 물든 바탕에 강조색
   글자면 "켜져 있다"를 충분히 말하면서 자기 자리를 안 넘는다. 14% 는 문서 사이트의 칩과 같은
   농도다 — 편집기와 그것을 감싼 페이지가 같은 값을 쓴다. */
.nabi-btn.on {
  background: color-mix(in srgb, var(--nabi-accent) 14%, transparent);
  color: var(--nabi-accent);
}
.nabi-btn.on:hover { background: color-mix(in srgb, var(--nabi-accent) 22%, transparent); }
.nabi-btn[hidden] { display: none; }
/* display:inline-flex 가 UA 의 [hidden] 규칙을 이기므로 직접 끈다 — 버튼이 전부 숨은 그룹은
   상자째 사라진다. */
.nabi-group[hidden] { display: none; }
.nabi-btn:disabled { opacity: .4; cursor: default; }
.nabi-btn svg { inline-size: 1rem; block-size: 1rem; }
.nabi-btn.nabi-word { inline-size: auto; padding: 0 .5rem; }
/* 색 견본 — 자기 색이 곧 내용이라, **눌림을 배경으로 말할 수 없다**(제 색에 묻힌다).
   그래서 테두리가 "골랐다"를 맡고, 손이 닿았다는 말은 **크기**가 한다. 둘이 서로 다른 말을
   하므로 hover 와 선택이 안 헷갈린다. */
.nabi-swatch {
  inline-size: 1.25rem; block-size: 1.25rem; min-inline-size: 0; border-radius: var(--nabi-radius-xs);
  border: 1px solid color-mix(in srgb, var(--nabi-line) 70%, transparent);
  transition: transform .1s;
}
.nabi-swatch:hover { transform: scale(1.18); }
/* 눌린 견본 —.on 의 배경 규칙을 덮고 테두리만 강조색으로. */
.nabi-btn.nabi-swatch.on {
  background: inherit; border-color: var(--nabi-accent); border-width: 2px;
}
.nabi-ctx-group:has(.nabi-swatch) { gap: 5px; }

/* 이름표 — 하나의 의사요소만 쓴다. 힌트 배지는 ::before 라 서로 안 싸운다. */
/* 가운데 맞추기는 **좌우 대칭**이라 논리 속성을 쓰면 되레 틀린다 (099, 주인 신고 2026-08-19).
   inset-inline-start: 50% 는 RTL 에서 right: 50% 로 뒤집히는데 translate(-50%) 는 언제나
   왼쪽으로 미는 물리 변환이라, 둘을 섞으면 아랍어에서 툴팁이 단추 밖으로 제 폭만큼 밀려났다
   (실측 86px). 자리 잡는 쪽과 미는 쪽을 **둘 다 물리로** 맞춘다. */
[data-nabi-tip]:hover::after {
  content: attr(data-nabi-tip); position: absolute; inset-block-start: 100%; left: 50%;
  transform: translate(-50%, 4px); background: var(--nabi-fg); color: var(--nabi-bg);
  font-size: 11px; line-height: 1.6; padding: 2px 6px; border-radius: 4px; white-space: nowrap;
  pointer-events: none; z-index: 2;
}
[data-nabi-tip][aria-expanded="true"]::after { content: none; }

/* 힌트 배지 — Shift 연타 동안만. */
.nabi-hinting [data-hint]::before {
  content: attr(data-hint); position: absolute; inset-block-start: -2px; inset-inline-end: -2px;
  background: var(--nabi-accent); color: #fff; font-size: 9px; line-height: 1;
  padding: 2px 3px; border-radius: 3px; pointer-events: none; z-index: 3;
}

/* 피커 — 격자·차림표·주소 상자가 같은 판 위에 선다. */
.nabi-panel {
  position: absolute; z-index: calc(var(--nabi-z-sticky) + 5); background: var(--nabi-bg);
  /* **모서리를 안 깎는다** — 층은 각진 사각형 하나다. 떠 있음은 그림자가 말하고, 어디까지가
     상자인지는 실선 한 줄이 말한다(다크에서는 그림자만으로 눈이 못 짚는다). 라운드까지 더하면
     같은 말을 셋이 한다. 안의 상자들도 각지므로 층 전체가 한 결로 읽힌다. */
  border: 1px solid var(--nabi-line); border-radius: 0; padding: .375rem;
  box-shadow: var(--nabi-shadow);
  /* 판은 **언제나 같은 모습**이다 — 각진 회색 테두리 하나. 열닫을 위해 tabindex 를 달고 포커스를
     받으므로 브라우저가 제 고리(focus ring)를 그릴 수 있는데, 그것이 판을 "고른 것" 처럼 보이게
     한다. 여기서 고를 것은 판이 아니라 그 안의 칸이다 (주인 지시 2026-08-19). */
  outline: none;
  /* 절대 배치 상자는 담은 곳에 남은 폭으로 줄어드는데, 견본판 칸은 자기 값의 크기로 그려진다
     max-content 가 없으면 칸이 눌려 글자가 서로 겹친다. */
  inline-size: max-content; max-inline-size: min(92vw, 30rem);
}
.nabi-grid { display: grid; grid-template-columns: repeat(8, var(--nabi-grid-cell)); gap: .1875rem; }
/* 층 **안**의 상자는 각지다 — 모서리를 가진 것은 층 자신 하나뿐이다. */
.nabi-cell {
  inline-size: var(--nabi-grid-cell); block-size: var(--nabi-grid-cell); box-sizing: border-box;
  padding: 0; border: 1px solid var(--nabi-line); border-radius: 0;
  background: transparent; cursor: pointer;
}
/* 고른 칸은 **채운다** (주인 지시 2026-08-19). 테두리 색으로 말하던 옛 모습은 예순네 칸 가운데
   열몇 개에 선 색이 한꺼번에 들어와 격자가 어지러웠다 — 면 하나면 "여기까지" 가 한눈에 읽힌다.
   색은 강조색을 **바탕에 섞어 낮춘 것**이다: 강조색 그대로는 판에서 제일 무거운 물건이 된다.
   테두리는 투명으로 둔다 — 배경은 테두리 자리까지 칠하므로(border-box) 칸이 **통째로** 찬다. */
.nabi-cell.on {
  border-color: transparent;
  background: color-mix(in srgb, var(--nabi-accent) 32%, var(--nabi-bg));
}
.nabi-readout {
  margin-block-start: .5rem; text-align: center; color: var(--nabi-muted);
  font-size: .75rem; font-variant-numeric: tabular-nums;
}
.nabi-menu { display: flex; flex-wrap: wrap; gap: 2px; max-inline-size: 200px; }
/* 물어보는 판 — **한 줄**이다. 값 하나(주소)를 받자고 뜨는 판이라 위아래로 쌓으면 화면만
   먹는다. 칸은 자기 자리표시로 이름을 말하고, 확인은 그 옆의 글자 단추다. */
.nabi-prompt { display: flex; align-items: center; gap: .375rem; }
.nabi-menu { gap: .1875rem; }
.nabi-prompt .nabi-input { inline-size: 16rem; }
/* 확인 — **칸과 같은 옷을 입되 테두리만 다르다** (084 ⑧, 주인 지시). 여기 서 있던 것은
   강조색으로 꽉 찬 ▶ 단추였는데, 그러면 판에서 제일 무거운 물건이 주소가 아니라 단추가 된다
   — 이 판의 주인공은 사람이 적는 칸이다. 바탕·키·글자 크기·각진 모서리를 \`.nabi-input\` 에서
   그대로 가져오고, "누르는 것" 이라는 말은 테두리 색 하나가 한다.
   폭은 글자만큼이다(\`.nabi-btn\` 의 정사각 최소폭을 푼다) — 나라마다 말 길이가 다르다. */
.nabi-go {
  flex: none; inline-size: auto; min-inline-size: 0; box-sizing: border-box;
  block-size: 1.75rem; padding: 0 .625rem; font: inherit; font-size: .8125rem; white-space: nowrap;
  background: var(--nabi-bg); color: var(--nabi-accent);
  border: 1px solid var(--nabi-accent); border-radius: 0;
}
/* 손이 닿으면 옅게 물든다 — \`.nabi-btn:hover\` 가 이 자리를 덮으므로 여기서 다시 말한다. */
.nabi-go:hover:not(:disabled) { background: color-mix(in srgb, var(--nabi-accent) 12%, transparent); }
/* **잠긴 확인은 잠겨 보인다** — 형식이 안 맞는 동안 눌리지 않는 단추다(\`ok.disabled\`).
   흐리게만 두면 강조색 테두리가 그대로 남아 "누를 수 있는 것" 으로 읽힌다: 색을 통째로
   회색으로 내려야 눌러 보기 전에 잠긴 것이 보인다. 그 옆의 빨간 한 줄이 까닭을 말한다. */
/* **잠긴 확인은 배경을 안 깐다** (주인 지시 2026-08-19) — 회색으로 채우면 그 칸이 판에서 가장
   무거운 물건이 되어, 사람이 적을 칸보다 잠긴 단추가 먼저 눈에 든다. 잠겼다는 말은 글자와
   테두리의 색이 이미 한다. 저장의 확인 단추와 같은 얼굴이 되는 것도 이 값이다. */
.nabi-go:disabled {
  opacity: 1; cursor: default;
  color: var(--nabi-muted); border-color: var(--nabi-line); background: var(--nabi-bg);
}
.nabi-field { display: flex; align-items: center; gap: 6px; }
.nabi-field > span { font-size: 11px; color: var(--nabi-muted); min-inline-size: 44px; }

/* --- 작은 화면의 판 — 버튼을 놓고 **화면 한가운데 90%** 로 선다 (084 ②) ---
   좁은 화면에서는 버튼에 붙는 자리가 답이 아니다: 툴바가 두세 줄로 접히고 단추가 가장자리에
   서니, 어디에 붙여도 판이 화면 밖으로 나가거나 자기가 연 툴바를 덮는다. 붙기를 포기하고
   가운데로 가면 그 다툼이 통째로 사라진다.
   판정을 JS 가 아니라 CSS 로 하는 까닭: 창을 돌리거나 줄이는 것을 따라간다. 판이 열려 있는
   동안 폭이 바뀌어도 다시 열 필요가 없다.

   **폭 기준 40rem 은 표 격자(wings/table/table.ts 의 TABLE_CSS)와 같은 값이어야 한다** —
   거기서 격자가 5×5 로 줄고 칸이 손가락 크기가 되는 그 지점이다. 둘이 어긋나면 격자는
   5×5 인데 판은 아직 버튼에 붙어 있는(또는 그 반대의) 어중간한 화면이 생긴다. */
@media (max-width: 40rem) {
  .nabi-panel {
    /* \`!important\` 인 까닭 하나: 이 두 자리를 parts/panel.ts 가 **인라인 style** 로 박는다
       (버튼 곁에 세우는 그 셈이다). 인라인을 이기는 길은 이것뿐이다. */
    position: fixed !important;
    /* 좌우 5vw 씩 — 폭 90% 와 가운데 맞춤이 이 한 줄로 함께 난다(가로는 옮길 것이 없다).
       남은 5%씩이 "뒤에 페이지가 있다"를 말한다: 꽉 채우면 판이 화면 자체로 읽힌다. */
    inset-inline: 5vw !important;
    /* 가운데는 **보이는 뷰포트의 가운데**다 — 변수를 채우는 손은 panel.ts 이고, 못 재는
       브라우저에서는 창 한가운데(50%)가 그대로 답이다. */
    inset-block-start: var(--nabi-panel-mid, 50%) !important;
    transform: translateY(-50%);
    /* 두 변이 자리를 다 정했으니 폭은 그 사이를 채운다 — 기본의 max-content·30rem 상한이
       살아 있으면 판이 90% 를 안 쓰고 제 내용 폭으로 쪼그라든다. */
    inline-size: auto; max-inline-size: none;
    /* dvh 를 모르는 브라우저에는 vh 가 남는다 — 두 줄인 까닭이 그것이다. */
    max-block-size: 90vh;
    max-block-size: var(--nabi-panel-room, 90dvh);
    overflow: auto;
    /* 뒤를 옅게 덮는다 — 가운데 뜬 판은 글 위에 겹치므로 뒤가 그대로 읽히면 둘이 섞인다.
       막을 **요소가 아니라 그림자로** 두르는 까닭: 진짜 막을 깔면 그 막이 바깥 클릭을
       삼켜서, 지금 그대로여야 할 "바깥을 누르면 닫힌다"(parts/outside.ts)가 죽는다.
       그림자는 손이 닿지 않으니 누름은 뒤의 페이지로 그대로 지나가고, 판은 지금처럼 닫힌다.
       덮개 부품(parts/scrim.ts)을 안 쓰는 까닭도 같다 — 그쪽은 자기 몫의 닫기·포커스 복원을
       들고 있어 판의 것과 둘이 된다. 여기 필요한 것은 **보이는 막 한 장**뿐이다. */
    box-shadow: var(--nabi-shadow), 0 0 0 100vmax var(--nabi-scrim);
  }
  /* 차림표는 200px 이 아니라 판이 준 폭을 다 쓴다 — 좁은 화면에서 단추가 여러 줄로 접히느니
     한 줄이 넓게 서는 편이 손가락에 낫다. */
  .nabi-menu { max-inline-size: 100%; }
  /* **격자를 든 판만은 제 크기로 선다.** 위의 90% 는 차림표·주소 칸처럼 폭을 쓸수록 나은
     것들을 위한 값인데, 격자는 5×5 로 크기가 정해져 있어 넓힐 것이 없다. 그대로 두면 판은
     90% 인데 격자는 그 앞머리에만 붙어, 판이 한쪽으로 쏠려 보인다(주인 신고 2026-08-19).
     폭을 내용에 맞추고 남는 자리를 좌우로 나눠 가운데 세우면 격자만 한 **네모 한 장**이 뜬다. */
  .nabi-panel:has(> .nabi-grid) { inline-size: fit-content !important; margin-inline: auto; }
  /* 주소 칸도 판을 다 쓴다 — 16rem 으로 못 박아 두면 판만 넓고 칸은 그대로다.
     바탕 폭을 8rem 으로 두는 까닭: 확인 단추가 제 글자만큼 자리를 먹고 남은 것이 칸의 몫인데,
     칸이 무한히 줄 수 있으면 말이 긴 나라에서 칸이 글자 두어 개 폭으로 눌린다. 그 아래로는
     줄이 접히는 편이 낫다 — 접힌 줄은 읽히고, 눌린 칸은 못 쓴다. */
  .nabi-prompt { flex-wrap: wrap; }
  .nabi-prompt .nabi-input { inline-size: auto; flex: 1 1 8rem; }
  /* 틀렸다는 빨간 한 줄은 접힌 판에서 제 줄을 갖는다 — 칸 옆에 끼면 칸이 그만큼 더 줄어든다.
     비어 있을 때는(맞는 값·아직 안 쓴 값) 줄을 안 만든다. */
}
/* 칸과 확인 단추가 **같은 높이**로 나란히 선다 — 둘이 한 줄로 읽히려면 키가 같아야 한다. */
.nabi-input {
  flex: 1 1 auto; min-inline-size: 0; box-sizing: border-box;
  block-size: 1.75rem; font: inherit; font-size: .8125rem; padding: 0 .5rem; color: inherit;
  background: var(--nabi-bg); border: 1px solid var(--nabi-line); border-radius: 0;
}
/* 고르면 **있던 테두리에 색이 든다** — 바깥에 고리를 하나 더 그리지 않는다. 색 견본의 선택
   표시가 잡은 규칙과 같다: 있는 선의 색을 바꿀 뿐, 선을 더하지 않는다. */
.nabi-input:focus, .nabi-input:focus-visible { outline: none; border-color: var(--nabi-accent); }
.nabi-actions { display: flex; justify-content: flex-end; gap: 4px; }

/* 상황 줄 — 캐럿이 든 것들의 손잡이. 비면 줄 자체가 사라진다. */
/* 상황 줄은 **자기 바탕**을 갖는다 — 옅은 회색 한 겹이 툴바 줄과 쓰는 자리를 갈라 준다.
   선이 아니라 면으로 나눈다(툴바 그룹이 상자·테두리 대신 간격으로 나뉘는 것과 같은 결). */
.nabi-context {
  display: flex; flex-wrap: wrap; align-items: center;
  gap: 0 .75rem; padding: .25rem .375rem; min-block-size: 2rem;
  background: var(--nabi-soft);
}
.nabi-context[hidden] { display: none; }
.nabi-ctx-group {
  display: flex; flex-wrap: wrap; align-items: center; gap: .1875rem;
  margin-inline-end: .75rem; min-inline-size: 0; position: relative;
}
/* 글자를 안 가진 그룹 앞에 서는 이름 — 색 줄과 눈금이 무엇의 색·무엇의 눈금인지 말한다.
   컨트롤이 아니라 글이므로 누를 수 없다. */
.nabi-ctx-tag {
  font-size: .75rem; opacity: .62; white-space: nowrap;
  margin-inline-end: .125rem; user-select: none;
}
/* 상황 줄의 컨트롤은 툴바 단추보다 한 치수 작다 — 줄이 하나 더 붙는 자리라 무게를 낮춘다. */
.nabi-context .nabi-btn { block-size: 1.625rem; min-inline-size: 1.625rem; }

/* --- 손가락이 닿는 상황 줄 (084 ⑥) ---
   이 줄은 한 줄로 안 끝난다: 표 속의 제목 문단처럼 그룹이 둘 셋 겹치면 접혀서 **위아래로**
   쌓인다. 데스크톱에서 26px 짜리 단추가 틈 없이 쌓이는 것은 마우스에게 문제가 아니지만,
   손가락에게는 겹쳐 붙은 두 줄이 한 표적이다 — 글자 크기 눈금을 누르려다 위 줄의 단추가
   눌린다.
   그래서 **손가락일 때만** 키운다. 판정을 폭이 아니라 \`pointer: coarse\` 로 먼저 하는 까닭:
   이것은 화면이 좁다는 이야기가 아니라 겨눔이 굵다는 이야기다(태블릿은 넓고도 손가락이다).
   폭 40rem 을 함께 받는 것은 좁힌 창까지 같은 모양으로 보려는 것이고, 이 값은 판·표 격자가
   쓰는 그 지점과 같다.
   숫자 셋이 한 몸이다: 단추 40px + 줄 사이 4px + 줄 높이 44px. 44px 은 손가락 표적 관례이고,
   단추를 그보다 조금 작게 두어 **표적은 관례를 지키되 화면 무게는 안 늘린다** — 남는 4px 은
   이웃 줄과의 틈이라 잘못 눌림을 막는 데 그대로 쓰인다.
   데스크톱은 이 분기 밖이라 값이 하나도 안 바뀐다. */
@media (pointer: coarse), (max-width: 40rem) {
  /* 세로 틈 — 겹쳐 붙은 두 줄을 갈라 놓는 것이 이 값 하나다(가로 틈은 그대로). */
  .nabi-context { gap: .25rem .75rem; }
  /* 접힌 줄 하나의 높이 — 단추는 그룹 속에 서므로 그룹이 표적의 높이를 잡는다.
     **줄바꿈은 그룹 안에서도 일어난다** — 표는 단추가 열 개라 좁은 화면에서 제 안에서 접힌다.
     그때의 줄 사이는 그룹의 세로 gap 이 잡으므로 그것도 함께 벌린다(단추 40 + 틈 4 = 44).
     가로 틈은 그대로 둔다 — 옆으로 벌리면 접히는 줄만 늘어난다. */
  .nabi-ctx-group { min-block-size: 2.75rem; gap: .25rem .1875rem; }
  .nabi-context .nabi-btn { block-size: 2.5rem; min-inline-size: 2.5rem; }
  /* 눈금은 손잡이가 작아 더 어렵다 — 상자를 줄 높이만큼 세워 띠 전체가 손에 닿게 한다. */
  .nabi-context .nabi-range { block-size: 2.5rem; }
}

/* 눈금 슬라이더 — 값이 순서를 갖는 것(글자 크기·서체·폭)의 손잡이다. 칸 여섯이 줄을 여섯 칸
   먹는 자리에서 이것은 하나로 끝난다 — 상황 줄이 한 줄로 남는 까닭. */
/* 눈금 슬라이더 — accent-color 하나로 트랙과 손잡이가 편집기 강조색을 따른다. 브라우저의 기본
   모양을 일부러 그대로 쓴다: 직접 그리면 크롬·사파리·파이어폭스가 저마다 다른 가짜 부품을 요구한다. */
.nabi-range {
  inline-size: 6.5rem; margin: 0 .125rem; accent-color: var(--nabi-accent);
  cursor: pointer; vertical-align: middle;
}
.nabi-range:focus-visible { outline: 2px solid var(--nabi-accent); outline-offset: 2px; }
/* 손잡이가 선 단계의 이름 — 끄는 동안 함께 움직여, 고르는 자리에서 값이 읽힌다. 폭을 잡아 두는
   것은 글자가 바뀔 때마다 뒤의 것들이 밀리지 않게 하려는 것이다. */
/* 손잡이가 선 자리의 값 — 끄는 동안 글자가 바뀌므로 최소 폭을 줘 줄이 안 흔들린다. */
.nabi-ctx-readout {
  font-size: .75rem; opacity: .62; min-inline-size: 3.5rem;
  font-variant-numeric: tabular-nums; white-space: nowrap;
}

/* toast — 편집기가 사람에게 흘리는 한 마디 (ui/toast.ts 가 세운다).
   자리는 툴바 줄 아래의 고정 지점 하나다: 거슬리지 않으면서 읽기 좋은 그 언저리이고, 상황 줄이
   떴다 사라져도 안 움직인다. 흐름 밖(절대 배치)이라 글을 안 민다 — 말이 오간다고 화면이 튀면
   말보다 그 튐이 먼저 읽힌다. */
.nabi-toasts {
  /* 가로 가운데는 물리로 맞춘다 — 툴팁과 같은 까닭이다(099). 논리 속성과 물리 변환을 섞으면
     RTL 에서 말이 화면 한쪽으로 밀려난다. */
  position: absolute; inset-block-start: calc(100% + .375rem); left: 50%;
  transform: translateX(-50%);
  /* 판(+5)보다 위 — 말은 잠깐 서는 것이라 무엇에도 안 가려야 하고, 곧 스스로 걷힌다. */
  z-index: calc(var(--nabi-z-sticky) + 6);
  display: flex; flex-direction: column; align-items: center; gap: .375rem;
  inline-size: max-content; max-inline-size: min(92vw, 30rem);
  /* 선반 자신은 손이 안 닿는다 — 말 사이 틈을 눌렀는데 뒤의 글이 안 눌리면 안 된다. */
  pointer-events: none;
}
.nabi-toast {
  pointer-events: auto; cursor: pointer; user-select: none;
  box-sizing: border-box; max-inline-size: 100%;
  padding: .375rem .75rem; font-size: .8125rem; line-height: 1.5;
  /* \`\\n\` 이 산다 — 여러 줄짜리 안내가 한 덩어리로 접히지 않는다. */
  white-space: pre-wrap; overflow-wrap: break-word;
  color: var(--nabi-fg); background: var(--nabi-bg);
  /* 급의 색은 왼쪽 선 하나가 말한다 — 상자를 통째로 칠하면 글자 대비가 급마다 달라져서,
     라이트·다크마다 급별 글자색을 또 정해야 한다. 선이면 토큰 그대로 두 테마를 다 산다. */
  border: 1px solid var(--nabi-line); border-inline-start: 3px solid var(--nabi-accent);
  border-radius: var(--nabi-layer-radius); box-shadow: var(--nabi-shadow);
  /* 남은 시간 0.5초부터 옅어져 0 에서 걷힌다 — 500ms 는 ui/toast.ts 의 TOAST_FADE_MS 와
     같아야 한다(그보다 짧게 사는 말은 JS 가 duration 을 제 수명으로 줄인다). */
  transition: opacity 500ms linear;
}
.nabi-toast[data-level="warn"] { border-inline-start-color: var(--nabi-tc-amber); }
.nabi-toast[data-level="error"] { border-inline-start-color: var(--nabi-danger); }
.nabi-toast.is-fading { opacity: 0; }

/* 업로드 — 올라가는 중인 것은 아직 문서가 아니라서 트리에 안 들어간다. 그래도 **그 자리에**
   떠야 한다: 파일을 넘겨받던 순간 캐럿이 든 블록 바로 뒤에, 흐름 안의 형제로 선다.

   진행률은 --nabi-per **하나**가 몬다 — 숫자도 격자도 그 하나를 보므로 함께 움직인다. */

/* --nabi-per 를 등록해야 보간된다 — 등록 안 한 커스텀 속성은 transition 이 안 걸려 뚝뚝 끊긴다.
   퍼센트가 아니라 **수**다: blur() 는 길이를 받는데 calc 는 퍼센트를 수로 못 내린다. */
@property --nabi-per { syntax: "<number>"; inherits: true; initial-value: 0; }

.nabi-content nabi-upload {
  --nabi-per: 0;
  /* 격자의 모양값 — 칸이 상속해 간다. --nabi-span 은 upload.ts 의 TILE_SPAN 과 같아야 한다. */
  --nabi-span: 25;
  --nabi-blur-max: 12px;
  /* 미리보기를 못 만든 자리의 차오르는 마스크. 커스텀 속성 안의 var 는 **선언된 곳**에서
     치환되므로, --nabi-per 를 가진 이 엘리먼트에서 조립해야 값이 따라온다. */
  --nabi-wipe: linear-gradient(to right, #000 0 calc(var(--nabi-per) * 1%), rgb(0 0 0 / 25%) calc(var(--nabi-per) * 1% + 10%));

  transition: --nabi-per 140ms linear;
  position: relative;
  display: flex; align-items: center; justify-content: center;
  min-inline-size: 6rem; min-block-size: 6rem; max-inline-size: 100%;
  margin: 0 0 .65em;
  overflow: hidden;
  color: var(--nabi-muted); background: var(--nabi-soft);
  border: 1px dashed var(--nabi-line); border-radius: var(--nabi-radius);
  cursor: progress; user-select: none;
}
/* **완료 후 그림이 앉을 바로 그 자리다.** 폭 60%·가운데 — 넣기의 기본값(wing/ops 의
   LUMP_DEFAULT_WIDTH·LUMP_DEFAULT_ALIGN)과 같은 값이라, 끝나는 순간 크기도 자리도 아무것도
   안 변한다. 올라가는 동안 읽던 줄이 밀리지 않는 것이 이 자리의 요점이다. */
.nabi-content nabi-upload:has(img) {
  inline-size: 60%; max-inline-size: 60%; margin-inline: auto;
  /* 테두리를 아예 없앤다 — 투명해도 1px 은 자리를 먹어서 자리표시자가 완성된 그림보다
     2px 넓었다(59% vs 58%). 재는 사람은 없지만 끝나는 순간 한 번 튄다. */
  background: transparent; border: 0;
}
/* 격자가 붙었다 = 미리보기가 그려졌다 — 그때부터 상자가 그림에 딱 맞을 수 있다. */
.nabi-content nabi-upload:has(img):has(nabi-grid) { min-inline-size: 0; min-block-size: 0; }

/* **상자를 꽉 채운다** — max-inline-size 가 아니라 inline-size 다. 끝난 뒤의 그림은
   [data-nabi-width="60"] 이 폭을 **정해 주는** 것이라, 제 크기가 60% 보다 작은 그림도 그만큼
   늘어난다. 미리보기만 "최대"로 두면 작은 그림이 상자 안에 작게 앉았다가 끝나는 순간 커진다 —
   자리가 흔들리지 않는 것이 이 화면의 요점이다. */
.nabi-content nabi-upload > img {
  display: block; inline-size: 100%; block-size: auto; border-radius: var(--nabi-radius);
}
/* 그림이 아닌 것 — **첨부 링크와 같은 클립 상자**로 선다(link wing 의 a[data-nabi-file] 과
   같은 모양). 한 줄 높이라 타일 판이 들어갈 자리가 없어서, 진행률은 상자 안을 **왼쪽에서
   오른쪽으로** 차오르는 띠 하나가 말한다. 숫자를 만드는 손은 그림 쪽과 똑같다(--nabi-per).

   예전에는 여기에도 그림 한 장(나비 판)을 세워 타일을 붙였다. 그 그림은 올라가는 것이 무엇인지
   말해 주지 못했고, 제 크기가 올라가는 것과 아무 상관이 없어 문단을 밀어냈다. */
.nabi-content nabi-upload[data-nabi-kind="file"] {
  /* 아래 다섯 줄은 link wing 의 a[data-nabi-file] 을 **그대로 베낀 것**이다 — 베낀 것이 요점이다.
     자리표시자와 끝난 뒤의 링크가 같은 상자여야 끝나는 순간 줄이 안 바뀐다. 배경도 안 깐다
     (링크에 배경이 없다) — 이 상자의 배경은 오직 차오르는 띠 하나다. */
  display: inline-flex; align-items: center; gap: .35em;
  inline-size: auto; min-inline-size: 0; min-block-size: 0;
  padding: .1em .5em; margin: 0 0 .65em;
  border: 1px solid var(--nabi-line); border-radius: 4px; overflow: hidden;
  color: var(--nabi-accent); background: transparent;
  /* 차오르는 띠 — 왼쪽에서 오른쪽으로. 경계를 조금 흐려 두면 걸음이 뚝뚝 끊겨 보이지 않는다. */
  background-image: linear-gradient(
    to right,
    color-mix(in srgb, var(--nabi-accent) 24%, transparent) 0 calc(var(--nabi-per) * 1%),
    transparent calc(var(--nabi-per) * 1% + 1.5%)
  );
}
/* 클립만 작다 — 링크의 ::before 와 같은 크기다. 이름은 **줄이지 않는다**: 링크의 글자는 제
   크기로 서므로, 여기서 줄이면 끝나는 순간 글자가 커지며 줄 높이가 2px 튄다. */
.nabi-content nabi-upload[data-nabi-kind="file"] > .nabi-upload-clip { font-size: .9em; }
/* 확장자 배지 — 첨부 링크의 것과 같은 글자다. */
.nabi-content nabi-upload[data-nabi-kind="file"]:not([data-nabi-label=""])::before {
  content: attr(data-nabi-label);
  order: 3; font-size: .75em; color: var(--nabi-muted); letter-spacing: .04em;
}
/* 숫자는 이 상자 안에서는 겹치지 않고 줄 끝에 선다 — 덮을 그림이 없다. */
.nabi-content nabi-upload[data-nabi-kind="file"]::after {
  position: static; order: 4;
  font-size: .8em; color: var(--nabi-muted); text-shadow: none;
}

/* 진행률 숫자 — 미리보기와 격자 **위**에 겹친다. 칠 순서에 맡기지 않고 z-index 를 적는다:
   칸의 backdrop-filter 가 쌓임 맥락을 한 번만 바꿔도 숫자가 그 밑으로 묻힌다. */
.nabi-content nabi-upload::after {
  content: attr(data-nabi-per) "%";
  position: absolute; z-index: 1;
  font-size: 1.1em; font-weight: 700; font-variant-numeric: tabular-nums;
  color: #fff; text-shadow: 0 1px 3px rgb(0 0 0 / 85%);
}
/* 격자가 아직 안 붙은 그림 상자 — 숫자가 가운데를 혼자 쓰지 않게 위로 비켜선다. */
.nabi-content nabi-upload:has(img):not(:has(nabi-grid))::after { inset-block-start: .625rem; }

/* 격자 — 미리보기 위에 정확히 겹친다. 열 수가 인라인인 까닭: 칸에 순위를 매기려면 JS 가 그 수를
   알아야 하는데 auto-fill 은 그 수를 레이아웃에 넘긴다. */
.nabi-content nabi-upload > nabi-grid {
  position: absolute; inset: 0; display: grid;
  grid-template-columns: repeat(var(--nabi-cols), 1fr);
  overflow: hidden; border-radius: var(--nabi-radius); pointer-events: none;
}
/* --nabi-t 는 이 칸의 창이 열리는 지점이고 --nabi-span 만큼 뒤에 닫힌다.
   img 가 아니라 칸에 거는 까닭: img 에 filter 를 걸면 쌓임 맥락이 생겨 backdrop-filter 의
   표본이 바뀐다(자기 자신을 보게 된다). */
.nabi-content nabi-upload nabi-tile {
  --nabi-clear: clamp(0, (var(--nabi-per) - var(--nabi-t)) / var(--nabi-span), 1);
  -webkit-backdrop-filter: blur(calc((1 - var(--nabi-clear)) * var(--nabi-blur-max))) grayscale(calc(1 - var(--nabi-clear)));
  backdrop-filter: blur(calc((1 - var(--nabi-clear)) * var(--nabi-blur-max))) grayscale(calc(1 - var(--nabi-clear)));
}

/* 취소 — 상자 위에 겹쳐 앉는 작은 동그라미. */
.nabi-content nabi-upload > .nabi-upload-stop {
  position: absolute; z-index: 2; inset-block-start: 4px; inset-inline-end: 4px;
  inline-size: 22px; block-size: 22px; padding: 0; border: 0; border-radius: 999px;
  display: inline-flex; align-items: center; justify-content: center;
  font: inherit; font-size: 14px; line-height: 1; cursor: pointer;
  color: var(--nabi-fg); background: color-mix(in srgb, var(--nabi-bg) 70%, transparent);
  -webkit-backdrop-filter: blur(4px); backdrop-filter: blur(4px);
}
/* 첨부 상자에서는 겹치지 않고 줄 끝에 앉는다 — 한 줄 높이라 겹치면 글자를 가린다. */
.nabi-content nabi-upload[data-nabi-kind="file"] > .nabi-upload-stop {
  position: static; order: 5;
  inline-size: 1rem; block-size: 1rem; font-size: .75rem; background: none;
  -webkit-backdrop-filter: none; backdrop-filter: none;
}

/* backdrop-filter 가 없으면 격자가 아무것도 안 그린다 — 그 자리를 미리보기의 마스크가 대신한다. */
@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
  .nabi-content nabi-upload > img {
    -webkit-mask-image: var(--nabi-wipe); mask-image: var(--nabi-wipe);
    filter: grayscale(calc(1 - var(--nabi-per) / 100));
  }
}
/* 블러도 색도 남긴다 — 장식이 아니라 진행 표시다. 움직임만 뺀다. */
@media (prefers-reduced-motion: reduce) {
  .nabi-content nabi-upload { transition: none; }
}

/* 거절 문구의 자리는 이제 없다 — 업로드의 모든 오류는 toast 로 나간다 (084 ⑦).
   알림 자리가 둘이면 어느 쪽을 봐야 하는지부터 배워야 한다. */

/* 잠긴 표면 — 도는 동안은 글이 안 들어간다. */
.nabi-content.nabi-uploading { cursor: progress; }

/* 로컬 기록 판 — 막 위에 선 사각형 하나. 목록·미리보기·지우기가 한 상자에 산다. */
.nabi-history { inline-size: min(46rem, 100%); max-block-size: 100%; display: flex; flex-direction: column; overflow: hidden; }
.nabi-history-head { padding: .75rem 4.5rem .5rem .9rem; }
.nabi-history-title { font-size: .95rem; font-weight: 650; }
/* 모서리에 뜨는 단추 둘 — 머리줄에 안 끼운다(미리보기 카드와 같은 자리). */
.nabi-history-corner {
  position: absolute; inset-block-start: .5rem; inset-inline-end: .5rem; z-index: 1;
  display: inline-flex; gap: .125rem;
}
/* 격자 칸의 기본 최소 폭은 auto 라 줄이 제 내용만큼 부푼다 — minmax(0, 1fr) 이 그 바닥을
   0 으로 내려, 긴 요약이 줄을 밀어 시각·도구를 상자 밖으로 내보내지 못하게 한다. */
.nabi-history-list {
  overflow-y: auto; padding: 0 .5rem .5rem; display: grid; gap: .125rem;
  grid-template-columns: minmax(0, 1fr);
}
.nabi-history-empty { padding: 1.5rem; text-align: center; opacity: .62; font-size: .85rem; }
.nabi-history-row {
  display: flex; align-items: center; gap: .25rem; min-inline-size: 0;
  border-radius: var(--nabi-radius-sm); padding-inline-end: .25rem;
}
/* 줄무늬 — 줄이 길어져도 눈이 한 줄을 잃지 않는다. */
.nabi-history-row:nth-child(odd) { background: color-mix(in srgb, var(--nabi-fg) 4%, transparent); }
.nabi-history-row:hover { background: var(--nabi-soft); }
/* 요약이 줄의 남는 자리를 다 먹고, 시각과 도구 둘은 **줄지 않는다**(flex: none).
   min-inline-size: 0 이 없으면 긴 요약이 줄을 밀어 시각·도구가 상자 밖으로 나간다. */
.nabi-history-open {
  flex: 1; min-inline-size: 0; display: flex; align-items: baseline; gap: .75rem;
  padding: .5rem .6rem; border: 0; background: none; color: inherit; font: inherit;
  text-align: start; cursor: pointer; border-radius: var(--nabi-radius-sm);
}
.nabi-history-open:disabled { cursor: default; }
.nabi-history-summary {
  flex: 1; min-inline-size: 0; font-size: .85rem;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.nabi-history-when { flex: none; text-align: end; font-size: .72rem; opacity: .62; line-height: 1.5; white-space: nowrap; }
/* 시각 둘(고친 때·만든 때) — 마우스를 올리면 이름표가 그 나라 차림의 자세한 시각을 든다.
   이름표는 절대 배치라 **기준이 될 상자**가 있어야 한다: 없으면 판 전체를 기준으로 떠서
   목록과 아무 상관 없는 자리에 뜬다. 목록은 세로로 구르는 상자라 가로로 삐져나가면 잘리므로,
   가운데 정렬 대신 줄 끝에 붙여 안쪽으로 들인다. */
.nabi-history-time, .nabi-history-made { position: relative; }
.nabi-history-when [data-nabi-tip]:hover::after {
  inset-inline-start: auto; inset-inline-end: 0; transform: translateY(4px);
}
.nabi-history-here { color: var(--nabi-accent); opacity: 1; }
.nabi-history-tool { flex: none; block-size: 1.625rem; min-inline-size: 1.625rem; opacity: .62; }
.nabi-history-tool:hover { opacity: 1; }
.nabi-history-preview { padding: 1rem 1.25rem; }

/* 골라진 물건 — **브라우저가 그림·iframe 위에는 선택 하이라이트를 안 그린다.** 그래서 골랐다는
   말을 우리가 한다: 바깥에 두른 점선 고리 하나뿐이다.
   안쪽은 물들이지 않는다 — 그림은 색이 얹히면 원래 색을 못 읽고, 코드·접기처럼 글이 든 물건은
   글자 위에 색이 두 겹(::selection + 물듦)으로 앉아 되레 안 읽힌다. 테두리만으로 충분히 말한다.
   화면 전용 표식이라 출력에는 안 나간다. */
.nabi-content [data-nabi-picked] {
  outline: 2px dashed var(--nabi-accent);
  outline-offset: 2px;
  border-radius: var(--nabi-radius-xs);
}
/* 글 위의 선택도 편집기의 강조색을 따른다 — 브라우저 기본 파랑이 다크에서 글을 삼킨다. */
.nabi-content[contenteditable] ::selection { background: color-mix(in srgb, var(--nabi-accent) 28%, transparent); }
/* 글이 든 물건(코드·접기·인용·표)을 통째로 고르면 브라우저가 안쪽 글줄을 칠한다 — 그 칠을 걷어
   테두리만 남긴다. 캐럿이 안으로 들어가 글을 고르는 것은 이 표식이 없을 때라 안 건드린다.
   **바로 위 줄 뒤에 와야 한다** — 자세함이 같아서 순서가 이긴다. */
.nabi-content [data-nabi-picked]::selection,
.nabi-content [data-nabi-picked] ::selection { background: transparent; }

/* 화면에 들이는 대상은 방금 넣은 블록이지 편집 영역이 아니다 — 그래서 블록에 건다.
   scrollIntoView 는 위에 붙어 있는 툴바를 모르므로, 없으면 새 블록이 그 뒤에 가려 선다. */
.nabi-content > * {
  scroll-margin-block-start: calc(var(--nabi-sticky-top, 0px) + var(--nabi-keyboard-top, 0px) + 3.5rem);
}

/* 쓰는 자리 — 문단이 기본 단위다. */
.nabi-content { padding: 12px 14px; line-height: 1.7; outline: none; overflow-wrap: break-word; }
/* 블록 사이의 숨은 **바깥 여백이 아니라 안쪽 여백**이다 — margin 이면 그 띠가 어느 블록의
   것도 아니어서, 거기 찍힌 점을 브라우저가 통째로 **아래 블록의 0번**으로 셈한다(Chrome 실측:
   앞 블록 바닥에서 2px 인 자리도 그렇다). 오른쪽 끝을 눌렀는데 캐럿이 다음 줄 맨 왼쪽에 서고,
   그 띠를 가로질러 끌면 엉뚱한 데가 잡히던 것이 전부 이것이다.
   padding 이면 그 띠가 **앞 블록의 몸**이라, 브라우저가 제 줄 안에서 x 까지 풀어 준다 —
   줄의 방향(RTL 이면 끝이 왼쪽)도 브라우저가 안다. 우리가 셀 것이 없어진다. */
.nabi-content > * { margin: 0; padding-block-end: .6em; }
.nabi-content > :last-child { padding-block-end: 0; }
/* 빈 편집기의 안내글 — **아무것도 없을 때만** 첫 줄에 흐리게 선다.
   문서가 통째로 빈 모양은 화면에서도 한 모양뿐이다: 받침 br 하나만 든 글 블록 하나
   (html/render 의 받침 규칙 ①). 그래서 트리를 안 보고 그 모양 하나만 겨눈다 — 글자가 한 자
   들어오는 순간 받침이 사라지므로 안내글도 같이 사라진다. **셈도 상태도 없다.**
   제목 태그까지 세는 까닭은 전체선택 삭제다 — 첫 블록이 제목이었으면 빈 줄도 제목으로 남는다
   (제목은 문단의 속성이라 그 자리는 여전히 "아무것도 안 쓴" 자리다).
   말은 시트가 아니라 변수로 온다 — --nabi-placeholder 에 surface 가 적는다(말은 로케일의
   것이고 시트는 모양의 것이다). 안 적혀 있으면 빈 글자열이라 아무것도 안 뜬다.
   pre-line 인 까닭은 여러 줄짜리 안내글이다 — surface 가 줄바꿈을 CSS 의 \A 로 옮겨 적는데,
   보통의 white-space 는 그 줄바꿈을 공백으로 뭉갠다. 잇단 공백은 그대로 뭉갠다(pre-wrap 이
   아닌 까닭).
   자리는 절대 위치다 — 흐름에 끼면 캐럿이 안내글 뒤로 밀려난다. 논리 좌표라 RTL 에서는
   오른쪽에서 시작한다.
   **정렬은 안 따라간다** (text-align: start) — 가운데 정렬한 빈 줄에서 안내글까지 가운데로
   가면 그것이 쓴 글처럼 보인다. 안내글의 자리는 글의 방향이 정하는 것이지 그 줄의 정렬이
   정하는 것이 아니다: LTR 이면 왼쪽, RTL 이면 오른쪽이다. */
.nabi-content.nabi-editing > :is(p, h1, h2, h3, h4, h5, h6):only-child:has(> br:only-child) { position: relative; }
.nabi-content.nabi-editing > :is(p, h1, h2, h3, h4, h5, h6):only-child:has(> br:only-child)::before {
  content: var(--nabi-placeholder, "");
  position: absolute; inset-block-start: 0; inset-inline: 0;
  text-align: start; white-space: pre-line;
  color: var(--nabi-muted); pointer-events: none;
}
.nabi-content [data-nabi-align="l"] { text-align: start; }
.nabi-content [data-nabi-align="c"] { text-align: center; }
.nabi-content [data-nabi-align="r"] { text-align: end; }
/* 물건은 text-align 이 안 옮긴다 — 표는 display:table 이고 겉옷(.nabi-scroll)은 블록이라, 둘 다
   글자가 아니라 **상자**다. 상자는 바깥 여백으로 옮긴다.
   그림·영상은 자기 폭(또는 본디 크기)이 이미 있으므로 폭을 건드리지 않는다 — 블록으로 세우고
   여백만 준다. 여기서 fit-content 를 주면 대체 엘리먼트가 찌그러진다. */
.nabi-content [data-nabi-align] > .nabi-scroll,
.nabi-content [data-nabi-align] > table { inline-size: fit-content; max-inline-size: 100%; }
.nabi-content [data-nabi-align] > :is(img, iframe) { display: block; }
.nabi-content [data-nabi-align="l"] > :is(.nabi-scroll, table, img, iframe) { margin-inline: 0 auto; }
.nabi-content [data-nabi-align="c"] > :is(.nabi-scroll, table, img, iframe) { margin-inline: auto; }
.nabi-content [data-nabi-align="r"] > :is(.nabi-scroll, table, img, iframe) { margin-inline: auto 0; }
/* 드롭캡 — 첫 글자가 **세 줄**을 차지한다.
   셈: 띄운 상자의 키 = font-size × line-height 이고, 본문 한 줄은 1.7em 이다(.nabi-content 의
   line-height). 밀려나는 줄 수는 그 키를 줄 높이로 나눈 **올림**이라, 세 줄을 원하면 상자가
   5.1em 을 **넘지 않아야** 한다.

   딱 5.1em 으로 맞추면 안 된다 — 세 줄의 아래 변과 상자의 아래 변이 같은 자리에 서서, 반올림이
   한 픽셀만 어긋나도 네 줄째가 밀린다(실제로 그랬다). 그래서 3줄 **안쪽**인 4.9em 쯤으로 잡는다:
   5.9 × .83 = 4.897em → 2.88줄이라 세 줄을 밀어내고 네 줄째는 안 건드린다.
   (예전 3em × .8 = 2.4em 은 반대로 두 줄만 밀어냈다.)

   **곱이 같아도 어느 쪽을 키우느냐가 다르다.** line-height 를 키우면 상자 키는 그대로인데 글자가
   작아지고 위아래로 빈자리가 생긴다 — 세 줄을 차지하지만 그 안이 헐렁하다. 그래서 반대로 간다:
   line-height 를 1 아래로 조여 **글자 쪽을 키운다**(5.9em). 세로로 꽉 찬 드롭캡이 이 값이다.
   조이는 것은 위아래뿐이고 가로 사이는 그대로 둔다.

   오른쪽 사이는 두 몫이다: padding 은 띄운 상자 **안**, margin 은 그 **바깥**. 뒤 글자가
   안 달라붙게 하는 자리다(예전 .08em 은 붙어 보였다). 글자가 커졌으니 em 값을 그만큼 줄여
   **실제 폭은 그대로** 둔다 —.14em × 4 과.095em × 5.9 가 같은 폭이다. */
.nabi-content [data-nabi-dropcap="1"]::first-letter {
  float: inline-start;
  font-size: 5.9em; line-height: .83;
  padding-inline-end: .095em; margin-inline-end: .04em;
}
.nabi-content [data-nabi-p] { display: block; }
/* 표의 겉옷 — 넘치면 **표 안**에서 구른다(페이지가 옆으로 밀리지 않는다).
   폭은 표를 껴안는다: 블록 기본값(줄 폭 전부)으로 두면 표 오른쪽의 빈 자리가 전부 겉옷이라,
   거기를 눌러도 표를 누른 것이 된다. 잴 수 있는 자리만 표의 자리다. */
.nabi-scroll { overflow-x: auto; inline-size: fit-content; max-inline-size: 100%; }
/* 고른 표의 점선은 **안쪽**에 두른다 — 겉옷이 넘침을 자르므로 밖으로 2px 나간 고리는 잘려
   한쪽 변만 보였다. 안쪽에 두르면 네 변이 다 산다(표를 감싸는 그 자리 그대로다). */
.nabi-content .nabi-scroll > [data-nabi-picked] { outline-offset: -2px; }

/* 전체화면 — Fullscreen API 가 아니라 클래스 하나다(iframe 안에서도 산다). */
.nabi.is-fullscreen {
  position: fixed; inset: 0; inset-block-end: var(--nabi-keyboard-bottom, 0px);
  z-index: 2147483000; overflow: auto; background: var(--nabi-bg);
}

/* 덮개 — 미리보기·라이트박스가 같은 부품 위에 선다.
   **옅은 블러가 한 줄 들어간다.** 반투명 막만으로는 뒤 페이지의 글자가 그대로 읽혀 앞의 글과
   겹쳐 보인다. 흐리면 뒤가 "배경"이 되고 읽는 자리가 하나로 남는다. 약하게 — 뒤가 무엇이었는지는
   여전히 보여야 한다. */
.nabi-scrim {
  position: fixed; inset: 0; z-index: 2147483100; display: flex; align-items: center;
  justify-content: center; padding: 4vmin; background: var(--nabi-scrim);
  -webkit-backdrop-filter: blur(3px); backdrop-filter: blur(3px);
}
/* 문서 자신의 폭으로 뜨는 사각형 — 라운드를 크게 주지 않는다. 뒤의 막이 이미 페이지와 갈라
   놓고 있어서, 그 위의 큰 라운드는 읽는 단을 위젯처럼 보이게 한다. 실선 한 줄은 남긴다:
   다크에서는 카드와 막의 밝기가 가까워 그림자만으로는 어디까지가 상자인지 눈이 못 짚는다. */
.nabi-card {
  position: relative; background: var(--nabi-bg); color: var(--nabi-fg);
  border: 1px solid var(--nabi-line); border-radius: var(--nabi-radius-xs); box-shadow: var(--nabi-shadow);
  inline-size: var(--nabi-preview-width, 720px); max-inline-size: 100%; max-block-size: 100%;
  overflow: auto; outline: none;
}
/* 카드 위에 겹쳐 앉는 반투명 동그라미 — 제목 줄을 없애고 이것만 남겼다. 줄 하나가 통째로
   사라지니 그 줄의 테두리도 함께 없어지고, 내용이 카드 전체를 그대로 쓴다. */
.nabi-close {
  position: absolute; inset-block-start: 8px; inset-inline-end: 8px; inline-size: 32px; block-size: 32px;
  z-index: 1; border: 0; border-radius: 999px; color: inherit; cursor: pointer;
  display: inline-flex; align-items: center; justify-content: center;
  background: color-mix(in srgb, var(--nabi-bg) 65%, transparent);
  -webkit-backdrop-filter: blur(4px); backdrop-filter: blur(4px);
}
.nabi-close:hover { background: color-mix(in srgb, var(--nabi-soft) 85%, transparent); }
.nabi-lightbox { max-inline-size: 100%; max-block-size: 100%; object-fit: contain; outline: none; }
/* 미리보기의 그림은 **누르면 크게 열린다** — overlay.ts 의 body 클릭 하나가 그 문이다.
   손가락 커서는 그 사실을 말한다. 편집 화면의 같은 말(img wing 의 .nabi-editing img)이 여기까지
   안 온 까닭은 미리보기 본문에 .nabi-editing 이 없기 때문이다 — 거기는 고치는 자리가 아니다.
   그림을 누를 수 있게 만드는 것이 이 파일이므로, 그렇다고 말하는 것도 이 파일의 몫이다. */
.nabi-preview-body img { cursor: pointer; }
`;
