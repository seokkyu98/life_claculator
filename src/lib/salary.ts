import {
  CHILD_TAX_CREDIT_2026,
  EARNED_INCOME_DEDUCTION_2026,
  EARNED_INCOME_TAX_CREDIT_2026,
  INCOME_TAX_BRACKETS_2026,
  LOCAL_INCOME_TAX_RATE,
  PERSONAL_DEDUCTION_PER_PERSON,
  SOCIAL_INSURANCE_2026,
  STANDARD_TAX_CREDIT,
} from '../data/rates-2026';
import { floorWon } from './format';

export interface SalaryInput {
  /** 연봉(세전) */
  annualSalary: number;
  /** 월 비과세액 (식대 등) */
  monthlyNonTaxable: number;
  /** 부양가족 수 (본인 포함, 최소 1) */
  dependents: number;
  /** 8세 이상 20세 이하 자녀 수 */
  children: number;
  /** 연봉에 퇴직금이 포함된 경우 13으로 나눔 */
  includesSeverance?: boolean;
}

export interface SalaryResult {
  monthlyGross: number;
  monthlyNonTaxable: number;
  monthlyTaxable: number;
  pensionBase: number;
  nationalPension: number;
  healthInsurance: number;
  longTermCare: number;
  employmentInsurance: number;
  incomeTax: number;
  localIncomeTax: number;
  totalDeduction: number;
  monthlyNet: number;
  annualNet: number;
  /** 소득세 추정 과정 (연간 기준) */
  tax: {
    totalSalary: number;
    earnedIncomeDeduction: number;
    earnedIncome: number;
    personalDeduction: number;
    pensionDeduction: number;
    insuranceDeduction: number;
    taxBase: number;
    calculatedTax: number;
    earnedIncomeTaxCredit: number;
    childTaxCredit: number;
    standardTaxCredit: number;
    determinedTax: number;
  };
}

/** 근로소득공제 (소득세법 제47조) */
export function earnedIncomeDeduction(totalSalary: number): number {
  const { brackets, max } = EARNED_INCOME_DEDUCTION_2026;
  if (totalSalary <= 0) return 0;
  const b = brackets.find((x) => totalSalary <= x.upTo) ?? brackets[brackets.length - 1];
  return Math.min(max, Math.floor(b.base + (totalSalary - b.from) * b.rate));
}

/** 종합소득세 기본세율 적용 산출세액 */
export function calculatedIncomeTax(taxBase: number): number {
  if (taxBase <= 0) return 0;
  const b = INCOME_TAX_BRACKETS_2026.find((x) => taxBase <= x.upTo)!;
  return Math.floor(taxBase * b.rate - b.deduction);
}

/** 근로소득세액공제 (소득세법 제59조) — 공제액과 한도 중 작은 값 */
export function earnedIncomeTaxCredit(calculatedTax: number, totalSalary: number): number {
  const c = EARNED_INCOME_TAX_CREDIT_2026;
  const credit =
    calculatedTax <= c.threshold
      ? calculatedTax * c.lowRate
      : c.highBase + (calculatedTax - c.threshold) * c.highRate;

  const { under33m, under70m, under120m, over120m } = c.limits;
  let limit: number;
  if (totalSalary <= under70m.from) limit = under33m;
  else if (totalSalary <= under120m.from)
    limit = Math.max(under70m.floor, under70m.base - (totalSalary - under70m.from) * under70m.reduceRate);
  else if (totalSalary <= over120m.from)
    limit = Math.max(under120m.floor, under120m.base - (totalSalary - under120m.from) * under120m.reduceRate);
  else limit = Math.max(over120m.floor, over120m.base - (totalSalary - over120m.from) * over120m.reduceRate);

  return Math.floor(Math.min(credit, limit));
}

/** 자녀세액공제 (8세 이상 20세 이하 자녀) */
export function childTaxCredit(children: number): number {
  const n = Math.max(0, Math.floor(children));
  if (n === 0) return 0;
  if (n === 1) return CHILD_TAX_CREDIT_2026.one;
  return CHILD_TAX_CREDIT_2026.two + (n - 2) * CHILD_TAX_CREDIT_2026.extraPerChild;
}

/**
 * 연봉 실수령액 계산
 * - 4대보험: 월 과세급여 기준, 10원 미만 절사
 * - 소득세: 연간 총급여로 연말정산 방식 추정 후 12로 나눔(간이세액표와 소폭 차이 가능)
 */
export function calculateSalary(input: SalaryInput): SalaryResult {
  const annual = Math.max(0, input.annualSalary);
  const monthlyGross = Math.floor(annual / (input.includesSeverance ? 13 : 12));
  const monthlyNonTaxable = Math.min(Math.max(0, input.monthlyNonTaxable), monthlyGross);
  const monthlyTaxable = monthlyGross - monthlyNonTaxable;
  const dependents = Math.max(1, Math.floor(input.dependents || 1));

  const { nationalPension: np, healthInsurance: hi, longTermCare: ltc, employmentInsurance: ei } =
    SOCIAL_INSURANCE_2026;

  // 국민연금: 기준소득월액(천원 미만 절사)을 상·하한 범위로 조정
  const pensionBase =
    monthlyTaxable <= 0
      ? 0
      : Math.min(np.maxBaseMonthly, Math.max(np.minBaseMonthly, floorWon(monthlyTaxable, 1000)));
  const nationalPension = floorWon(pensionBase * np.employeeRate, 10);
  const healthInsurance = floorWon(monthlyTaxable * hi.employeeRate, 10);
  const longTermCare = floorWon(healthInsurance * ltc.rateOfHealthPremium, 10);
  const employmentInsurance = floorWon(monthlyTaxable * ei.employeeRate, 10);

  // 소득세 (연간 추정)
  const totalSalary = monthlyTaxable * 12;
  const eid = earnedIncomeDeduction(totalSalary);
  const earnedIncome = totalSalary - eid;
  const personalDeduction = dependents * PERSONAL_DEDUCTION_PER_PERSON;
  const pensionDeduction = nationalPension * 12;
  const insuranceDeduction = (healthInsurance + longTermCare + employmentInsurance) * 12;
  const taxBase = Math.max(0, earnedIncome - personalDeduction - pensionDeduction - insuranceDeduction);
  const calculatedTax = calculatedIncomeTax(taxBase);
  const eitc = earnedIncomeTaxCredit(calculatedTax, totalSalary);
  const afterEitc = calculatedTax - eitc;
  const ctc = Math.min(childTaxCredit(input.children), afterEitc);
  const stc = Math.min(STANDARD_TAX_CREDIT, afterEitc - ctc);
  const determinedTax = Math.max(0, afterEitc - ctc - stc);

  const incomeTax = floorWon(determinedTax / 12, 10);
  const localIncomeTax = floorWon(incomeTax * LOCAL_INCOME_TAX_RATE, 10);

  const totalDeduction =
    nationalPension + healthInsurance + longTermCare + employmentInsurance + incomeTax + localIncomeTax;
  const monthlyNet = monthlyGross - totalDeduction;

  return {
    monthlyGross,
    monthlyNonTaxable,
    monthlyTaxable,
    pensionBase,
    nationalPension,
    healthInsurance,
    longTermCare,
    employmentInsurance,
    incomeTax,
    localIncomeTax,
    totalDeduction,
    monthlyNet,
    annualNet: monthlyNet * 12,
    tax: {
      totalSalary,
      earnedIncomeDeduction: eid,
      earnedIncome,
      personalDeduction,
      pensionDeduction,
      insuranceDeduction,
      taxBase,
      calculatedTax,
      earnedIncomeTaxCredit: eitc,
      childTaxCredit: ctc,
      standardTaxCredit: stc,
      determinedTax,
    },
  };
}
