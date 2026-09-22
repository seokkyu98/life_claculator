import { MINIMUM_WAGE_2026, WEEKLY_HOLIDAY_PAY_RULES } from '../data/rates-2026';

/** 1개월 평균 주 수 = 365일 ÷ 12개월 ÷ 7일 ≈ 4.345주 */
export const WEEKS_PER_MONTH = 365 / 12 / 7;

export interface WeeklyHolidayInput {
  hourlyWage: number;
  /** 1주 소정근로시간 (연장근로 제외) */
  weeklyHours: number;
}

export interface WeeklyHolidayResult {
  eligible: boolean;
  /** 주휴시간 */
  holidayHours: number;
  holidayPay: number;
  /** 주휴수당 제외 주급 */
  weeklyBasePay: number;
  /** 주휴수당 포함 주급 */
  weeklyTotalPay: number;
  /** 월 환산 유급 시간 (반올림) */
  monthlyHours: number;
  /** 주휴수당 포함 월 환산액 */
  monthlyPay: number;
  /** 주휴수당을 포함해 시급으로 환산한 금액 */
  effectiveHourly: number;
  belowMinimumWage: boolean;
}

/**
 * 주휴수당 = (1주 소정근로시간 ÷ 40) × 8시간 × 시급
 * - 1주 소정근로시간 15시간 이상일 때만 발생, 40시간을 초과해도 주휴시간은 최대 8시간
 */
export function calculateWeeklyHoliday(input: WeeklyHolidayInput): WeeklyHolidayResult {
  const { minWeeklyHours, maxWeeklyHours, fullTimeHolidayHours } = WEEKLY_HOLIDAY_PAY_RULES;
  const hourlyWage = Math.max(0, input.hourlyWage);
  const weeklyHours = Math.max(0, input.weeklyHours);

  const eligible = weeklyHours >= minWeeklyHours;
  const holidayHours = eligible ? (Math.min(weeklyHours, maxWeeklyHours) / maxWeeklyHours) * fullTimeHolidayHours : 0;
  const holidayPay = Math.round(holidayHours * hourlyWage);
  const weeklyBasePay = Math.round(weeklyHours * hourlyWage);
  const weeklyTotalPay = weeklyBasePay + holidayPay;
  const monthlyHours = Math.round((weeklyHours + holidayHours) * WEEKS_PER_MONTH);
  const monthlyPay = monthlyHours * hourlyWage;
  const effectiveHourly = weeklyHours > 0 ? weeklyTotalPay / weeklyHours : 0;

  return {
    eligible,
    holidayHours,
    holidayPay,
    weeklyBasePay,
    weeklyTotalPay,
    monthlyHours,
    monthlyPay,
    effectiveHourly,
    belowMinimumWage: hourlyWage > 0 && hourlyWage < MINIMUM_WAGE_2026.hourly,
  };
}
