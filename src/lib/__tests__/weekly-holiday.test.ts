import { describe, expect, it } from 'vitest';
import { MINIMUM_WAGE_2026 } from '../../data/rates-2026';
import { calculateWeeklyHoliday } from '../weekly-holiday';

const wage = MINIMUM_WAGE_2026.hourly;

describe('주휴수당', () => {
  it('주 40시간 = 8시간분, 월 209시간 = 최저임금 월 환산액', () => {
    const r = calculateWeeklyHoliday({ hourlyWage: wage, weeklyHours: 40 });
    expect(r.holidayHours).toBe(8);
    expect(r.holidayPay).toBe(82_560);
    expect(r.weeklyTotalPay).toBe(495_360);
    expect(r.monthlyHours).toBe(209);
    expect(r.monthlyPay).toBe(MINIMUM_WAGE_2026.monthly);
  });

  it('주 20시간 = 4시간분', () => {
    const r = calculateWeeklyHoliday({ hourlyWage: wage, weeklyHours: 20 });
    expect(r.holidayHours).toBe(4);
    expect(r.holidayPay).toBe(41_280);
    expect(r.weeklyTotalPay).toBe(247_680);
    expect(r.monthlyHours).toBe(104);
  });

  it('주 15시간 경계', () => {
    expect(calculateWeeklyHoliday({ hourlyWage: wage, weeklyHours: 15 }).holidayHours).toBe(3);
    const r = calculateWeeklyHoliday({ hourlyWage: wage, weeklyHours: 14.5 });
    expect(r.eligible).toBe(false);
    expect(r.holidayPay).toBe(0);
  });

  it('40시간 초과해도 최대 8시간', () => {
    expect(calculateWeeklyHoliday({ hourlyWage: wage, weeklyHours: 52 }).holidayHours).toBe(8);
  });

  it('최저임금 미달 감지', () => {
    expect(calculateWeeklyHoliday({ hourlyWage: 10_000, weeklyHours: 20 }).belowMinimumWage).toBe(true);
    expect(calculateWeeklyHoliday({ hourlyWage: wage, weeklyHours: 20 }).belowMinimumWage).toBe(false);
  });

  it('주휴 포함 실질 시급은 20% 높음', () => {
    const r = calculateWeeklyHoliday({ hourlyWage: 10_000, weeklyHours: 20 });
    expect(r.effectiveHourly).toBe(12_000);
  });
});
