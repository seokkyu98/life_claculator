import { describe, expect, it } from 'vitest';
import { addMonths, diffDays, parseDate, toISODate } from '../date';

describe('date', () => {
  it('parseDate 유효성', () => {
    expect(parseDate('2026-02-29')).toBeNull();
    expect(parseDate('2028-02-29')).not.toBeNull();
    expect(parseDate('abc')).toBeNull();
    expect(toISODate(parseDate('2026-09-22')!)).toBe('2026-09-22');
  });
  it('diffDays', () => {
    expect(diffDays(parseDate('2026-01-01')!, parseDate('2027-01-01')!)).toBe(365);
    expect(diffDays(parseDate('2028-01-01')!, parseDate('2029-01-01')!)).toBe(366);
  });
  it('addMonths 말일 보정', () => {
    expect(toISODate(addMonths(parseDate('2026-01-31')!, 1))).toBe('2026-02-28');
    expect(toISODate(addMonths(parseDate('2026-05-31')!, -3))).toBe('2026-02-28');
    expect(toISODate(addMonths(parseDate('2026-10-01')!, -3))).toBe('2026-07-01');
  });
});
