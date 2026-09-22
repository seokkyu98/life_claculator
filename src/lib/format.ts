/** 숫자를 천 단위 콤마 문자열로 */
export function formatNumber(value: number, maxFractionDigits = 0): string {
  if (!Number.isFinite(value)) return '0';
  return value.toLocaleString('ko-KR', { maximumFractionDigits: maxFractionDigits });
}

/** 원 단위 표기 (반올림) */
export function formatWon(value: number): string {
  return `${formatNumber(Math.round(value))}원`;
}

/** 콤마·공백 등이 섞인 문자열을 숫자로 (빈 값/잘못된 값은 0) */
export function parseNumber(input: string | null | undefined): number {
  if (!input) return 0;
  const cleaned = input.replace(/[^\d.-]/g, '');
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}

/** 원 미만 절사 (세금·보험료 계산에서 사용) */
export function floorWon(value: number, unit = 1): number {
  return Math.floor(value / unit) * unit;
}

/** 퍼센트 표기 */
export function formatPercent(rate: number, digits = 3): string {
  return `${Number((rate * 100).toFixed(digits))}%`;
}
