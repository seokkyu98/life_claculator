import { describe, expect, it } from 'vitest';
import { calculateAge } from '../age';
import { parseDate, toISODate } from '../date';

const d = (s: string) => parseDate(s)!;

describe('만나이', () => {
  it('생일 전', () => {
    const r = calculateAge(d('1995-10-15'), d('2026-09-22'))!;
    expect(r.internationalAge).toBe(30);
    expect(r.yearAge).toBe(31);
    expect(r.koreanAge).toBe(32);
    expect(r.birthdayPassed).toBe(false);
    expect(toISODate(r.nextBirthday)).toBe('2026-10-15');
    expect(r.daysUntilNextBirthday).toBe(23);
    expect(r.nextAge).toBe(31);
    expect(r.zodiac).toBe('돼지');
  });

  it('생일 당일에 한 살 증가', () => {
    const r = calculateAge(d('1995-09-22'), d('2026-09-22'))!;
    expect(r.internationalAge).toBe(31);
    expect(r.birthdayPassed).toBe(true);
    expect(toISODate(r.nextBirthday)).toBe('2027-09-22');
    expect(r.daysUntilNextBirthday).toBe(365);
  });

  it('생일 다음 날', () => {
    const r = calculateAge(d('2000-01-01'), d('2026-01-02'))!;
    expect(r.internationalAge).toBe(26);
    expect(r.zodiac).toBe('용');
  });

  it('2월 29일생은 평년 3월 1일에 한 살', () => {
    expect(calculateAge(d('2004-02-29'), d('2026-02-28'))!.internationalAge).toBe(21);
    expect(calculateAge(d('2004-02-29'), d('2026-03-01'))!.internationalAge).toBe(22);
    expect(calculateAge(d('2004-02-29'), d('2028-02-29'))!.internationalAge).toBe(24);
  });

  it('살아온 날수: 태어난 날이 1일째', () => {
    expect(calculateAge(d('2026-09-22'), d('2026-09-22'))!.daysLived).toBe(1);
    expect(calculateAge(d('2026-01-01'), d('2026-12-31'))!.daysLived).toBe(365);
  });

  it('기준일이 출생일보다 앞서면 null', () => {
    expect(calculateAge(d('2026-09-22'), d('2026-01-01'))).toBeNull();
  });

  it('신생아', () => {
    const r = calculateAge(d('2026-03-01'), d('2026-09-22'))!;
    expect(r.internationalAge).toBe(0);
    expect(r.koreanAge).toBe(1);
  });
});
