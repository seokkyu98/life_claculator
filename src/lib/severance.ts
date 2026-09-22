import { SEVERANCE_RULES } from '../data/rates-2026';
import { addDays, addMonths, diffDays } from './date';

export interface SeveranceInput {
  /** 입사일 */
  startDate: Date;
  /** 퇴직일 (마지막 근무일의 다음 날) */
  endDate: Date;
  /** 퇴직 전 3개월 동안 받은 임금 총액 (기본급 + 각종 수당, 세전) */
  wageLast3Months: number;
  /** 최근 1년간 받은 상여금 총액 */
  annualBonus: number;
  /** 최근 1년간 받은 연차수당 총액 */
  annualLeavePay: number;
}

export interface SeveranceResult {
  /** 재직일수 */
  serviceDays: number;
  eligible: boolean;
  /** 평균임금 산정기간 시작일·종료일(포함) */
  periodStart: Date;
  periodEnd: Date;
  periodDays: number;
  bonusPortion: number;
  leavePortion: number;
  /** 3개월 임금 총액 (상여·연차 가산분 포함) */
  totalWage: number;
  dailyAverageWage: number;
  severancePay: number;
}

/**
 * 법정 퇴직금 = 1일 평균임금 × 30일 × (재직일수 / 365)
 * 1일 평균임금 = (퇴직 전 3개월 임금 + 연간 상여금×3/12 + 연차수당×3/12) ÷ 3개월 총일수
 */
export function calculateSeverance(input: SeveranceInput): SeveranceResult {
  const { startDate, endDate } = input;
  const serviceDays = Math.max(0, diffDays(startDate, endDate));
  const periodStart = addMonths(endDate, -SEVERANCE_RULES.averageWageMonths);
  const periodEnd = addDays(endDate, -1);
  const periodDays = Math.max(1, diffDays(periodStart, endDate));

  const ratio = SEVERANCE_RULES.averageWageMonths / 12;
  const bonusPortion = Math.max(0, input.annualBonus) * ratio;
  const leavePortion = Math.max(0, input.annualLeavePay) * ratio;
  const totalWage = Math.max(0, input.wageLast3Months) + bonusPortion + leavePortion;

  const dailyAverageWage = totalWage / periodDays;
  const eligible = serviceDays >= SEVERANCE_RULES.minServiceDays;
  const severancePay = eligible
    ? Math.floor(dailyAverageWage * SEVERANCE_RULES.daysPerYear * (serviceDays / 365))
    : 0;

  return {
    serviceDays,
    eligible,
    periodStart,
    periodEnd,
    periodDays,
    bonusPortion,
    leavePortion,
    totalWage,
    dailyAverageWage,
    severancePay,
  };
}
