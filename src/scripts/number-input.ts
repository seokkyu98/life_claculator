import { formatNumber, parseNumber } from '../lib/format';

/**
 * data-number 속성이 있는 입력칸에 천 단위 콤마를 자동 적용합니다.
 * data-decimal 속성이 있으면 소수점 입력을 허용합니다.
 */
export function bindNumberInputs(root: ParentNode = document): void {
  root.querySelectorAll<HTMLInputElement>('input[data-number]').forEach((input) => {
    const allowDecimal = input.hasAttribute('data-decimal');
    const reformat = () => {
      const raw = input.value;
      const caretFromEnd = raw.length - (input.selectionStart ?? raw.length);
      let cleaned = raw.replace(allowDecimal ? /[^\d.]/g : /\D/g, '');
      if (allowDecimal) {
        const [int, ...rest] = cleaned.split('.');
        cleaned = rest.length ? `${int}.${rest.join('').slice(0, 3)}` : int;
      }
      if (cleaned === '') {
        input.value = '';
        return;
      }
      const [intPart, decPart] = cleaned.split('.');
      const formatted = formatNumber(parseNumber(intPart)) + (decPart !== undefined ? `.${decPart}` : '');
      input.value = formatted;
      const pos = Math.max(0, formatted.length - caretFromEnd);
      if (document.activeElement === input) input.setSelectionRange(pos, pos);
    };
    input.addEventListener('input', reformat);
    reformat();
  });
}

/** 폼 안의 모든 입력 변경 시 콜백 실행 (입력 즉시 결과 표시) */
export function onFormChange(form: HTMLFormElement, callback: () => void): void {
  form.addEventListener('input', callback);
  form.addEventListener('change', callback);
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    callback();
  });
  callback();
}

export function numberValue(form: HTMLFormElement, name: string): number {
  const el = form.elements.namedItem(name) as HTMLInputElement | null;
  return parseNumber(el?.value);
}

export function stringValue(form: HTMLFormElement, name: string): string {
  const el = form.elements.namedItem(name) as HTMLInputElement | RadioNodeList | null;
  return (el as HTMLInputElement | null)?.value ?? '';
}

export function setText(id: string, text: string): void {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}
