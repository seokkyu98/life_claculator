import { describe, expect, it } from 'vitest';
import { parseDate, toISODate } from '../date';
import { calculateSeverance } from '../severance';

const d = (s: string) => parseDate(s)!;

describe('퇴직금', () => {
  it('3년 근속, 월 300만원', () => {
    const r = calculateSeverance({
      startDate: d('2023-01-01'),
      endDate: d('2026-01-01'),
      wageLast3Months: 9_000_000,
      annualBonus: 0,
      annualLeavePay: 0,
    });
    expect(r.serviceDays).toBe(1096);
    expect(toISODate(r.periodStart)).toBe('2025-10-01');
    expect(toISODate(r.periodEnd)).toBe('2025-12-31');
    expect(r.periodDays).toBe(92);
    expect(r.dailyAverageWage).toBeCloseTo(97_826.087, 2);
    expect(r.severancePay).toBe(Math.floor((9_000_000 / 92) * 30 * (1096 / 365)));
    expect(r.severancePay).toBe(8_812_388);
  });

  it('상여금·연차수당은 3/12 가산', () => {
    const r = calculateSeverance({
      startDate: d('2021-03-02'),
      endDate: d('2026-03-02'),
      wageLast3Months: 12_000_000,
      annualBonus: 4_000_000,
      annualLeavePay: 1_200_000,
    });
    expect(r.bonusPortion).toBe(1_000_000);
    expect(r.leavePortion).toBe(300_000);
    expect(r.totalWage).toBe(13_300_000);
    // 2025-12-02 ~ 2026-03-01 = 90일
    expect(r.periodDays).toBe(90);
  });

  it('1년 미만은 퇴직금 없음', () => {
    const r = calculateSeverance({
      startDate: d('2026-01-01'),
      endDate: d('2026-12-31'),
      wageLast3Months: 9_000_000,
      annualBonus: 0,
      annualLeavePay: 0,
    });
    expect(r.serviceDays).toBe(364);
    expect(r.eligible).toBe(false);
    expect(r.severancePay).toBe(0);
  });

  it('정확히 365일이면 대상', () => {
    const r = calculateSeverance({
      startDate: d('2025-01-01'),
      endDate: d('2026-01-01'),
      wageLast3Months: 9_000_000,
      annualBonus: 0,
      annualLeavePay: 0,
    });
    expect(r.eligible).toBe(true);
  });
});
