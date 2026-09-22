/** 날짜 유틸 — 시간대 영향을 피하기 위해 모두 UTC 자정 기준으로 다룹니다. */
const DAY = 86_400_000;

/** 'YYYY-MM-DD' → UTC Date (잘못된 값은 null) */
export function parseDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!m) return null;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const date = new Date(Date.UTC(y, mo - 1, d));
  if (date.getUTCFullYear() !== y || date.getUTCMonth() !== mo - 1 || date.getUTCDate() !== d) return null;
  return date;
}

export function toISODate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** b - a 일수 */
export function diffDays(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / DAY);
}

export function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * DAY);
}

/** n개월 더하기 (말일 보정: 1/31 + 1개월 = 2/28 또는 2/29) */
export function addMonths(date: Date, months: number): Date {
  const y = date.getUTCFullYear();
  const m = date.getUTCMonth() + months;
  const target = new Date(Date.UTC(y, m, 1));
  const lastDay = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)).getUTCDate();
  target.setUTCDate(Math.min(date.getUTCDate(), lastDay));
  return target;
}

/** 오늘 날짜 (로컬 기준) → UTC 자정 Date */
export function today(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
}

export function formatKoreanDate(date: Date): string {
  return `${date.getUTCFullYear()}년 ${date.getUTCMonth() + 1}월 ${date.getUTCDate()}일`;
}
