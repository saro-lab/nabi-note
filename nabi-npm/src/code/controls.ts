import { localeOf, type LocaleText } from '../locale/index.js';

const COPY: LocaleText = {
  en: 'Copy code',
  ko: '코드 복사',
  ja: 'コードをコピー',
  zh: '复制代码',
  hi: 'कोड कॉपी करें',
  es: 'Copiar código',
  ar: 'نسخ الشيفرة',
  fr: 'Copier le code',
  bn: 'কোড কপি করুন',
  pt: 'Copiar código',
  ru: 'Копировать код',
  id: 'Salin kode',
  ur: 'کوڈ کاپی کریں',
  de: 'Code kopieren',
  fa: 'کپی کد',
  mr: 'कोड कॉपी करा',
  vi: 'Sao chép mã',
  te: 'కోడ్‌ను కాపీ చేయండి',
  ha: 'Kwafi lambar shirin',
  tr: 'Kodu kopyala',
  sw: 'Nakili msimbo',
  ta: 'குறியீட்டை நகலெடு',
  th: 'คัดลอกโค้ด',
  it: 'Copia codice',
  pa: 'ਕੋਡ ਕਾਪੀ ਕਰੋ',
  ps: 'کوډ کاپي کړئ',
  yo: 'Da kóòdù kọ',
};
const COPIED: LocaleText = {
  en: 'Code copied',
  ko: '코드를 복사했습니다',
  ja: 'コードをコピーしました',
  zh: '代码已复制',
  hi: 'कोड कॉपी हो गया',
  es: 'Código copiado',
  ar: 'تم نسخ الشيفرة',
  fr: 'Code copié',
  bn: 'কোড কপি হয়েছে',
  pt: 'Código copiado',
  ru: 'Код скопирован',
  id: 'Kode disalin',
  ur: 'کوڈ کاپی ہو گیا',
  de: 'Code kopiert',
  fa: 'کد کپی شد',
  mr: 'कोड कॉपी केला',
  vi: 'Đã sao chép mã',
  te: 'కోడ్ కాపీ అయింది',
  ha: 'An kwafi lambar shirin',
  tr: 'Kod kopyalandı',
  sw: 'Msimbo umenakiliwa',
  ta: 'குறியீடு நகலெடுக்கப்பட்டது',
  th: 'คัดลอกโค้ดแล้ว',
  it: 'Codice copiato',
  pa: 'ਕੋਡ ਕਾਪੀ ਹੋ ਗਿਆ',
  ps: 'کوډ کاپي شو',
  yo: 'A ti da kóòdù kọ',
};
const FAILED: LocaleText = {
  en: 'Copy failed. Please try again.',
  ko: '복사하지 못했습니다. 다시 시도해 주세요.',
  ja: 'コピーできませんでした。もう一度お試しください。',
  zh: '复制失败，请重试。',
  hi: 'कॉपी नहीं हो सका। कृपया फिर से कोशिश करें।',
  es: 'No se pudo copiar. Inténtalo de nuevo.',
  ar: 'تعذر النسخ. يرجى المحاولة مرة أخرى.',
  fr: 'Échec de la copie. Veuillez réessayer.',
  bn: 'কপি করা যায়নি। আবার চেষ্টা করুন।',
  pt: 'Não foi possível copiar. Tente novamente.',
  ru: 'Не удалось скопировать. Попробуйте ещё раз.',
  id: 'Gagal menyalin. Silakan coba lagi.',
  ur: 'کاپی نہیں ہو سکا۔ براہ کرم دوبارہ کوشش کریں۔',
  de: 'Kopieren fehlgeschlagen. Bitte erneut versuchen.',
  fa: 'کپی انجام نشد. لطفاً دوباره تلاش کنید.',
  mr: 'कॉपी करता आले नाही. कृपया पुन्हा प्रयत्न करा.',
  vi: 'Không thể sao chép. Vui lòng thử lại.',
  te: 'కాపీ చేయడం సాధ్యపడలేదు. దయచేసి మళ్లీ ప్రయత్నించండి.',
  ha: 'An kasa kwafi. Da fatan a sake gwadawa.',
  tr: 'Kopyalanamadı. Lütfen tekrar deneyin.',
  sw: 'Imeshindwa kunakili. Tafadhali jaribu tena.',
  ta: 'நகலெடுக்க முடியவில்லை. மீண்டும் முயற்சிக்கவும்.',
  th: 'คัดลอกไม่สำเร็จ โปรดลองอีกครั้ง',
  it: 'Copia non riuscita. Riprova.',
  pa: 'ਕਾਪੀ ਨਹੀਂ ਹੋ ਸਕੀ। ਕਿਰਪਾ ਕਰਕੇ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।',
  ps: 'کاپي کول ناکام شول. مهرباني وکړئ بیا هڅه وکړئ.',
  yo: 'Kò ṣeé da kọ. Jọ̀wọ́ tún gbìyànjú.',
};

export function attachCodeCopy(
  pre: Element,
  source: () => string,
  locale: () => string,
): { refresh(): void; dispose(): void } {
  const owner = pre.ownerDocument;
  const view = owner.defaultView;
  const button = owner.createElement('button');
  button.type = 'button';
  button.className = 'nabi-code-copy';
  button.setAttribute('contenteditable', 'false');
  let state: 'idle' | 'copied' | 'failed' = 'idle';
  let pending = false;
  let disposed = false;
  let timer = 0;
  const refresh = (): void => {
    const text = state === 'copied' ? COPIED : state === 'failed' ? FAILED : COPY;
    const label = text[localeOf(locale())] ?? text['en']!;
    button.setAttribute('aria-label', label);
    button.title = label;
    button.setAttribute('data-copy-state', state);
  };
  const preventSelection = (event: Event): void => event.preventDefault();
  const stopEditing = (event: KeyboardEvent): void => {
    event.stopPropagation();
    if (
      !event.ctrlKey &&
      !event.metaKey &&
      !event.altKey &&
      ((event.key.length === 1 && event.key !== ' ') || event.key === 'Backspace' || event.key === 'Delete')
    ) {
      event.preventDefault();
    }
  };
  const copyFallback = (value: string): void => {
    const active = owner.activeElement as HTMLElement | null;
    const selection = owner.getSelection();
    const ranges = selection
      ? Array.from({ length: selection.rangeCount }, (_, i) => selection.getRangeAt(i).cloneRange())
      : [];
    const field = owner.createElement('textarea');
    field.value = value;
    field.style.cssText = 'position:fixed;inset:0;opacity:0;pointer-events:none';
    owner.body.append(field);
    try {
      field.focus({ preventScroll: true });
      field.select();
      if (!owner.execCommand?.('copy')) throw new Error('Copy failed');
    } finally {
      field.remove();
      active?.focus({ preventScroll: true });
      if (selection) {
        selection.removeAllRanges();
        for (const range of ranges) selection.addRange(range);
      }
    }
  };
  const onClick = async (event: Event): Promise<void> => {
    event.preventDefault();
    event.stopPropagation();
    if (pending || disposed) return;
    pending = true;
    try {
      const value = source();
      if (view?.navigator.clipboard?.writeText) await view.navigator.clipboard.writeText(value);
      else copyFallback(value);
      state = 'copied';
    } catch {
      state = 'failed';
    } finally {
      pending = false;
      if (!disposed) {
        refresh();
        if (timer) view?.clearTimeout(timer);
        timer =
          view?.setTimeout(() => {
            timer = 0;
            state = 'idle';
            refresh();
          }, 1800) ?? 0;
      }
    }
  };
  refresh();
  button.addEventListener('mousedown', preventSelection);
  button.addEventListener('keydown', stopEditing);
  button.addEventListener('click', onClick);
  button.addEventListener('focus', refresh);
  pre.addEventListener('pointerenter', refresh);
  pre.append(button);
  return {
    refresh,
    dispose() {
      disposed = true;
      if (timer) view?.clearTimeout(timer);
      button.removeEventListener('mousedown', preventSelection);
      button.removeEventListener('keydown', stopEditing);
      button.removeEventListener('click', onClick);
      button.removeEventListener('focus', refresh);
      pre.removeEventListener('pointerenter', refresh);
      button.remove();
    },
  };
}
