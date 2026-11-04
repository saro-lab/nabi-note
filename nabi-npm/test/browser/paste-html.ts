export function pasteHtml(root: Element, html: string): void {
  const data = new DataTransfer();
  data.setData('text/html', html);
  const event = new ClipboardEvent('paste', { bubbles: true, cancelable: true });
  // Firefox는 합성 이벤트 생성자에 넘긴 clipboardData를 무시한다.
  // Firefox ignores clipboardData passed to the synthetic event constructor.
  Object.defineProperty(event, 'clipboardData', { value: data });
  root.dispatchEvent(event);
}
