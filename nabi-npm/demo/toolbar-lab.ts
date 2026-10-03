import {
  allContextTools,
  categories,
  contextCatalog,
  contexts,
  tools,
  wingCatalog,
  type LabTool,
} from './toolbar-lab-catalog.js';

type Context = keyof typeof contexts;
type Category = 'text' | 'paragraph' | 'insert' | 'file';
type PanelState = { kind: 'all' | 'context' | 'detail'; value: string };
type InlineState = { kind: 'size' | 'url'; label: string; value: string };
const get = <T extends HTMLElement = HTMLElement>(id: string): T => document.getElementById(id) as T;
const escape = (value: string): string =>
  value.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]!);
const stage = get('stage');
const workspace = get('workspace');
const top = get('top-chrome');
const panel = get('panel');
const scroller = get('editor-scroll');
const keyboard = get('fake-keyboard');
const keyboardToggle = get<HTMLInputElement>('keyboard-toggle');
const extraTools: LabTool[] = [
  { id: 'undo', wing: '_history', group: 'file', label: '실행 취소', icon: '↶' },
  { id: 'redo', wing: '_history', group: 'file', label: '다시 실행', icon: '↷' },
  { id: 'preview', wing: '_view', group: 'file', label: '미리보기', icon: '◉' },
  { id: 'fullscreen', wing: '_view', group: 'file', label: '전체화면', icon: '⛶' },
  { id: 'previewBoundary', wing: '_site', group: 'structure', label: '미리보기 경계', icon: '⊟' },
  { id: 'removeBoundary', wing: '_site', group: 'structure', label: '미리보기 경계 삭제', icon: '⊖' },
];
const allTools = [...tools, ...extraTools];
const categoryMap: Record<Category, { label: string; groups: string[] }> = {
  text: { label: '글자', groups: ['font', 'emphasis', 'script', 'color', 'link', 'clear'] },
  paragraph: { label: '문단', groups: ['heading', 'align', 'list', 'container'] },
  insert: { label: '삽입', groups: ['structure', 'media'] },
  file: { label: '문서', groups: ['file'] },
};
const contextNames: Record<Context, string> = { text: '본문', table: '표', image: '그림', code: '코드' };
let context: Context = 'text';
let category: Category = 'text';
let panelState: PanelState | null = null;
let inlineState: InlineState | null = null;
let preset = 532;
let mobile = false;
let toastTimer: ReturnType<typeof setTimeout>;
const activeTools = new Set<string>();
const byId = (id: string): LabTool | undefined => [...allTools, ...allContextTools].find((tool) => tool.id === id);
const action = (name: string, icon: string, label: string, css = 'tool-button'): string =>
  `<button type="button" class="${css}" data-action="${name}" aria-label="${escape(label)}" title="${escape(label)}"><span aria-hidden="true">${icon}</span></button>`;
const toolButton = (tool: LabTool): string =>
  `<button type="button" class="tool-button${activeTools.has(tool.id) ? ' is-on' : ''}" data-tool="${escape(tool.id)}" data-wing="${escape(tool.wing)}" aria-label="${escape(tool.label)}" aria-pressed="${activeTools.has(tool.id)}" title="${escape(tool.label)}"><span class="tool-icon" aria-hidden="true">${tool.icon}</span></button>`;

function renderToolbar(): void {
  let content = '';
  if (inlineState?.kind === 'size') {
    content = `${action('back', '←', '빠른 도구로 돌아가기')}<label class="inline-size-label" for="inline-range">${escape(inlineState.label)}</label><input id="inline-range" type="range" min="1" max="5" value="${inlineState.value}" aria-label="${escape(inlineState.label)} 모형" /><output id="inline-output">${inlineState.value}</output>${action('back', '✓', '크기 선택 완료')}`;
  } else if (inlineState?.kind === 'url') {
    content = `${action('back', '←', '빠른 도구로 돌아가기')}<input class="inline-url" type="url" aria-label="${escape(inlineState.label)} 주소 모형" placeholder="${escape(inlineState.label)} 주소 입력" value="${escape(inlineState.value)}" />${action('apply', '✓', '주소 적용 모형')}`;
  } else {
    const ids =
      context === 'text'
        ? ['b', 'i', 'tc', 'fs']
        : context === 'table'
          ? ['context:table:rowBelow', 'context:table:colRight', 'context:table:merge']
          : context === 'image'
            ? ['context:img:width', 'context:img:view']
            : ['context:code:lang', 'context:code:clear'];
    content = `<button type="button" class="tools-trigger" data-action="all" aria-label="모든 도구 열기" aria-expanded="${!!panelState}" title="모든 도구">▦ <span>도구</span></button><div class="quick-tools">${ids
      .map(byId)
      .filter((tool): tool is LabTool => !!tool)
      .map(toolButton)
      .join(
        '',
      )}</div>${context === 'text' ? action('undo', '↶', '실행 취소') : action('context', '•••', `${contextNames[context]}의 모든 보조 도구`) + action('write', 'Aa', '본문 쓰기로 돌아가기')}`;
  }
  top.innerHTML = `<div class="command-bar${inlineState?.kind === 'size' ? ' inline-size' : ''}" role="toolbar" aria-label="${inlineState ? inlineState.label : contextNames[context]} 도구">${content}</div>`;
}

function layout(): void {
  const nextMobile = preset === 390 || window.innerWidth < 700;
  const changedMode = mobile !== nextMobile;
  mobile = nextMobile;
  stage.classList.toggle('is-mobile', mobile);
  stage.style.width = preset ? `${preset}px` : '100%';
  const heightChoice = get<HTMLSelectElement>('screen-height').value;
  const height = heightChoice === 'auto' ? Math.max(280, window.innerHeight - 112) : Number(heightChoice);
  workspace.style.setProperty('--workspace-height', `${height}px`);
  workspace.style.setProperty('--input-height', '300px');
  keyboard.hidden = !(mobile && keyboardToggle.checked && !panelState);
  panel.hidden = !panelState;
  if (changedMode && panelState) renderPanel();
  requestAnimationFrame(() => {
    measure();
    if (mobile) revealSelection(false);
  });
}

function revealSelection(force: boolean): void {
  const target = document.querySelector<HTMLElement>(
    context === 'text' ? '.selection-text' : `[data-target="${context}"]`,
  )!;
  const targetRect = target.getBoundingClientRect();
  const viewRect = scroller.getBoundingClientRect();
  if (force || targetRect.top < viewRect.top || targetRect.top > viewRect.bottom - 40) {
    scroller.scrollTo({ top: scroller.scrollTop + targetRect.top - viewRect.top - 16, behavior: 'instant' });
  }
}

function measure(): void {
  const bodyHeight = Math.round(scroller.clientHeight);
  const occupiedHeight = !panel.hidden && mobile ? panel.offsetHeight : !keyboard.hidden ? keyboard.offsetHeight : 0;
  get('toolbar-metric').textContent = `${top.offsetHeight}px · 항상 한 줄`;
  get('document-metric').textContent = `${bodyHeight}px${panelState && !mobile ? ' · 도구판 일부 겹침' : ''}`;
  get('input-metric').textContent = occupiedHeight
    ? `${occupiedHeight}px · ${panelState ? '도구판' : '키보드 모형'}`
    : panelState
      ? '본문 위에 겹침'
      : '없음';
  get('viewport-readout').textContent = `${stage.clientWidth}px · ${mobile ? '모바일' : 'PC'}`;
  get('stage-status').textContent = panelState
    ? mobile
      ? '키보드 대신 도구판을 보고 있습니다.'
      : '필요할 때만 도구판을 겹쳐 엽니다.'
    : inlineState
      ? `${inlineState.label} 조절도 같은 한 줄을 사용합니다.`
      : `${contextNames[context]} 도구 · ${mobile && keyboardToggle.checked ? '키보드 위 한 줄' : '보조 줄 없음'}`;
}

function render(): void {
  layout();
  renderToolbar();
  renderPanel();
}

function selectContext(next: Context, reveal = true): void {
  context = next;
  panelState = null;
  inlineState = null;
  for (const button of document.querySelectorAll<HTMLElement>('[data-scenario]')) {
    button.classList.toggle('is-active', button.dataset.scenario === context);
    button.setAttribute('aria-pressed', String(button.dataset.scenario === context));
  }
  for (const element of document.querySelectorAll<HTMLElement>('[data-target]'))
    element.classList.toggle('is-selected', element.dataset.target === context);
  render();
  if (reveal) requestAnimationFrame(() => revealSelection(true));
}

function palette(list: LabTool[]): string {
  return [...new Set(list.map((tool) => tool.group))]
    .map(
      (group) =>
        `<div class="palette-group"><h4>${escape(categories.find((item) => item.id === group)?.label ?? contextCatalog[group.replace('context:', '')]?.label ?? '문서')}</h4><div class="palette-grid">${list
          .filter((tool) => tool.group === group)
          .map(
            (tool) =>
              `<button type="button" class="palette-item${activeTools.has(tool.id) ? ' is-on' : ''}" aria-pressed="${activeTools.has(tool.id)}" data-tool="${escape(tool.id)}" data-wing="${escape(tool.wing)}"><span class="tool-icon" aria-hidden="true">${tool.icon}</span><span>${escape(tool.label)}</span></button>`,
          )
          .join('')}</div></div>`,
    )
    .join('');
}

function paletteContent(query = ''): string {
  if (query.trim())
    return (
      palette(
        [...allTools, ...allContextTools].filter((tool) => tool.label.toLowerCase().includes(query.toLowerCase())),
      ) || '<p class="panel-note">일치하는 도구가 없습니다.</p>'
    );
  const list = allTools.filter((tool) => categoryMap[category].groups.includes(tool.group));
  return `${palette(list)}<details class="context-inventory"><summary>이 범주의 모든 보조 도구</summary>${palette(allContextTools.filter((tool) => list.some((main) => main.wing === tool.wing)))}</details>`;
}

function renderPanel(): void {
  if (!panelState) return;
  let title = '모든 도구';
  let body = '';
  const { kind, value } = panelState;
  if (kind === 'all') {
    body = `<div class="panel-tabs" role="group" aria-label="도구 범주">${Object.entries(categoryMap)
      .map(
        ([id, item]) =>
          `<button type="button" data-category="${id}" class="${id === category ? 'is-active' : ''}" aria-pressed="${id === category}">${item.label}</button>`,
      )
      .join(
        '',
      )}</div>${mobile ? '' : '<input class="panel-search" type="search" placeholder="모든 도구에서 검색" aria-label="도구 이름 찾기" />'}<div id="palette-results">${paletteContent()}</div>`;
  } else if (kind === 'context') {
    title = `${contextNames[context]} 보조 도구`;
    body = `${palette(contexts[context].controls)}<button type="button" class="panel-back" data-action="all">전체 도구 보기</button>`;
  } else {
    const tool = byId(value)!;
    title = tool.label;
    if (['tc', 'hl'].includes(tool.wing)) {
      body = `<p class="panel-note">색을 고른 뒤 닫으면 쓰기로 돌아갑니다.</p><div class="swatch-grid">${['#567664', '#d16e5b', '#8570b1', '#d7ac57', '#638ebd', '#b6b9c2'].map((color, index) => `<button type="button" class="color-swatch" style="--swatch:${color}" data-swatch="${color}" aria-label="색상 ${index + 1}"></button>`).join('')}</div>`;
    } else if (['tf', 'h'].includes(tool.wing)) {
      body = `<div class="style-options">${(tool.wing === 'tf' ? ['기본 서체', '명조체', '고정폭', '손글씨'] : ['본문', '제목 1', '제목 2', '제목 3', '제목 4', '제목 5', '제목 6']).map((label) => `<button type="button" data-pick="${label}">${label}</button>`).join('')}</div>`;
    } else if (tool.id === 'context:img:view') {
      body = `<div class="image-view-preview">${document.querySelector('.dummy-image')!.innerHTML}</div>`;
    } else if (tool.wing === 'table') {
      body = `<p class="panel-note">표 삽입과 셀 도구 모형</p>${palette(contexts.table.controls)}`;
    } else if (tool.id === 'context:code:lang') {
      body = `<div class="style-options">${['TypeScript', 'JavaScript', 'HTML', 'CSS', 'Python'].map((label) => `<button type="button" data-pick="${label}">${label}</button>`).join('')}</div>`;
    } else {
      body = `<div class="detail-symbol">${tool.icon}</div><p class="panel-note">${escape(title)} 기능이 열리는 자리입니다. 실제 편집·저장·업로드는 실행하지 않습니다.</p><button type="button" class="demo-apply" data-action="apply">선택 완료</button>`;
    }
    body += '<button type="button" class="panel-back" data-action="all">← 전체 도구</button>';
  }
  get('panel-title').textContent = title;
  get('panel-body').innerHTML = body;
  get('panel-body').scrollTop = 0;
}

function openPanel(kind: PanelState['kind'], value = ''): void {
  inlineState = null;
  panelState = { kind, value };
  render();
  panel.querySelector<HTMLElement>('.panel-close')?.focus({ preventScroll: true });
}

function closePanel(): void {
  panelState = null;
  inlineState = null;
  render();
  top.querySelector<HTMLElement>('button')?.focus({ preventScroll: true });
}

function toast(message: string): void {
  clearTimeout(toastTimer);
  const node = get('toast');
  node.textContent = message;
  node.hidden = false;
  toastTimer = setTimeout(() => {
    node.hidden = true;
  }, 1800);
}

function runTool(tool: LabTool): void {
  if (tool.wing === '_history') {
    runAction(tool.id);
    return;
  }
  if (tool.wing === 'fs' || tool.id === 'context:img:width') {
    panelState = null;
    inlineState = { kind: 'size', label: tool.wing === 'fs' ? '글자 크기' : '그림 너비', value: '3' };
    render();
    get('inline-range').focus({ preventScroll: true });
  } else if (['a', 'img', 'youtube'].includes(tool.wing) && !tool.id.startsWith('context:')) {
    panelState = null;
    inlineState = { kind: 'url', label: tool.label, value: '' };
    if (mobile) keyboardToggle.checked = true;
    render();
    top.querySelector<HTMLInputElement>('input')?.focus({ preventScroll: true });
  } else if (
    ['b', 'i', 'u', 's', 'sup', 'sub', 'align', 'ul', 'ol', 'tl', 'dc', 'clearFormat'].includes(tool.wing) ||
    (tool.id.startsWith('context:') &&
      !['fs', 'img', 'youtube', 'a', 'tc', 'hl'].includes(tool.wing) &&
      tool.id !== 'context:code:lang')
  ) {
    activeTools.has(tool.id) ? activeTools.delete(tool.id) : activeTools.add(tool.id);
    for (const button of document.querySelectorAll<HTMLElement>('[data-tool]'))
      if (button.dataset.tool === tool.id) {
        button.classList.toggle('is-on', activeTools.has(tool.id));
        button.setAttribute('aria-pressed', String(activeTools.has(tool.id)));
      }
    toast(`${tool.label} · 선택 모형`);
  } else openPanel('detail', tool.id);
}

function runAction(name: string): void {
  if (name === 'all' || name === 'context') openPanel(name);
  else if (['close', 'close-panel', 'back'].includes(name)) closePanel();
  else if (name === 'write') selectContext('text');
  else if (name === 'apply') {
    closePanel();
    toast('적용 모형입니다. 본문은 바뀌지 않습니다.');
  } else toast(`${name === 'undo' ? '실행 취소' : '다시 실행'} 모형입니다.`);
}

document.addEventListener('click', (event) => {
  const target = event.target as HTMLElement;
  const widthButton = target.closest<HTMLElement>('[data-width]');
  if (widthButton) {
    preset = Number(widthButton.dataset.width);
    for (const button of document.querySelectorAll<HTMLElement>('[data-width]')) {
      button.classList.toggle('is-active', button === widthButton);
      button.setAttribute('aria-pressed', String(button === widthButton));
    }
    closePanel();
    return;
  }
  const categoryButton = target.closest<HTMLElement>('[data-category]');
  if (categoryButton) {
    category = categoryButton.dataset.category as Category;
    renderPanel();
    panel.querySelector<HTMLElement>(`[data-category="${category}"]`)?.focus({ preventScroll: true });
    return;
  }
  const actionButton = target.closest<HTMLElement>('[data-action]');
  if (actionButton) {
    runAction(actionButton.dataset.action!);
    return;
  }
  const chosen = target.closest<HTMLElement>('[data-tool]');
  if (chosen) {
    const tool = byId(chosen.dataset.tool!);
    if (tool) runTool(tool);
    return;
  }
  const swatch = target.closest<HTMLElement>('[data-swatch]');
  if (swatch) {
    document.querySelector<HTMLElement>('.selection-text')!.style.backgroundColor = `${swatch.dataset.swatch}55`;
    toast('색상 선택 모형 · 닫으면 쓰기로 돌아갑니다.');
    return;
  }
  const pick = target.closest<HTMLElement>('[data-pick]');
  if (pick) {
    toast(`${pick.dataset.pick} 선택 모형`);
    return;
  }
  if (target.closest('[data-mock-link]')) {
    event.preventDefault();
    toast('참고 링크 모형');
    return;
  }
  const scenario = target.closest<HTMLElement>('[data-scenario], [data-target]');
  if (scenario && !target.closest('input, summary, a'))
    selectContext((scenario.dataset.scenario ?? scenario.dataset.target) as Context, !!scenario.dataset.scenario);
  else if (!mobile && panelState && target.closest('#editor-scroll')) closePanel();
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closePanel();
  const target = event.target as HTMLElement;
  if (target.matches('[data-target]') && ['Enter', ' '].includes(event.key)) {
    event.preventDefault();
    selectContext(target.dataset.target as Context, false);
  }
  if (target.matches('.inline-url') && event.key === 'Enter') runAction('apply');
});

panel.addEventListener('input', (event) => {
  const input = event.target as HTMLInputElement;
  if (input.matches('.panel-search')) get('palette-results').innerHTML = paletteContent(input.value);
});
top.addEventListener('input', (event) => {
  const input = event.target as HTMLInputElement;
  if (!inlineState) return;
  inlineState.value = input.value;
  if (input.type === 'range') get('inline-output').textContent = input.value;
});
keyboardToggle.addEventListener('change', layout);
get('screen-height').addEventListener('change', layout);
window.addEventListener('resize', layout);
new ResizeObserver(measure).observe(workspace);
get('wing-count').textContent = `${wingCatalog.length}`;
get('wing-inventory').innerHTML = wingCatalog
  .map((wing) => `<span class="wing-chip">${escape(wing.label)} <small>${escape(wing.id)}</small></span>`)
  .join('');
document.querySelector('.keyboard-rows')!.innerHTML = [
  'ㅂ ㅈ ㄷ ㄱ ㅅ ㅛ ㅕ ㅑ ㅐ ㅔ',
  'ㅁ ㄴ ㅇ ㄹ ㅎ ㅗ ㅓ ㅏ ㅣ',
  '⇧ ㅋ ㅌ ㅊ ㅍ ㅠ ㅜ ㅡ ⌫',
  '123 🌐 space ↵',
]
  .map(
    (row) =>
      `<div class="keyboard-row">${row
        .split(' ')
        .map(
          (key) => `<span class="key${key === 'space' ? ' space-key' : ''}">${key === 'space' ? '간격' : key}</span>`,
        )
        .join('')}</div>`,
  )
  .join('');
render();
