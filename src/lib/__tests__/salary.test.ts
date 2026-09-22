import { describe, expect, it } from 'vitest';
import {
  calculateSalary,
  calculatedIncomeTax,
  childTaxCredit,
  earnedIncomeDeduction,
  earnedIncomeTaxCredit,
} from '../salary';

describe('근로소득공제', () => {
  it('구간별 공제액', () => {
    expect(earnedIncomeDeduction(0)).toBe(0);
    expect(earnedIncomeDeduction(5_000_000)).toBe(3_500_000);
    expect(earnedIncomeDeduction(15_000_000)).toBe(7_500_000);
    expect(earnedIncomeDeduction(50_000_000)).toBe(12_250_000);
    expect(earnedIncomeDeduction(200_000_000)).toBe(16_750_000);
  });
  it('한도 2,000만원', () => {
    expect(earnedIncomeDeduction(1_000_000_000)).toBe(20_000_000);
  });
});

describe('기본세율 산출세액', () => {
  it('누진공제 방식', () => {
    expect(calculatedIncomeTax(0)).toBe(0);
    expect(calculatedIncomeTax(14_000_000)).toBe(840_000);
    expect(calculatedIncomeTax(30_000_000)).toBe(3_240_000);
    expect(calculatedIncomeTax(100_000_000)).toBe(19_560_000);
  });
});

describe('근로소득세액공제', () => {
  it('산출세액 130만원 이하 55%', () => {
    expect(earnedIncomeTaxCredit(500_000, 30_000_000)).toBe(275_000);
  });
  it('총급여 3,300만~7,000만 한도 최소 66만원', () => {
    expect(earnedIncomeTaxCredit(3_240_000, 47_600_000)).toBe(660_000);
  });
  it('총급여 1억2천만 초과 한도 최소 20만원', () => {
    expect(earnedIncomeTaxCredit(10_000_000, 150_000_000)).toBe(200_000);
  });
});

describe('자녀세액공제', () => {
  it('자녀 수별', () => {
    expect(childTaxCredit(0)).toBe(0);
    expect(childTaxCredit(1)).toBe(250_000);
    expect(childTaxCredit(2)).toBe(550_000);
    expect(childTaxCredit(3)).toBe(950_000);
  });
});

describe('연봉 실수령액', () => {
  const base = { monthlyNonTaxable: 200_000, dependents: 1, children: 0 };

  it('연봉 5,000만원 4대보험', () => {
    const r = calculateSalary({ ...base, annualSalary: 50_000_000 });
    expect(r.monthlyGross).toBe(4_166_666);
    expect(r.monthlyTaxable).toBe(3_966_666);
    expect(r.pensionBase).toBe(3_966_000);
    expect(r.nationalPension).toBe(188_380);
    expect(r.healthInsurance).toBe(142_600);
    expect(r.longTermCare).toBe(18_730);
    expect(r.employmentInsurance).toBe(35_690);
  });

  it('실수령액 = 월급 - 공제 합계', () => {
    const r = calculateSalary({ ...base, annualSalary: 50_000_000 });
    const sum =
      r.nationalPension + r.healthInsurance + r.longTermCare + r.employmentInsurance + r.incomeTax + r.localIncomeTax;
    expect(r.totalDeduction).toBe(sum);
    expect(r.monthlyNet).toBe(r.monthlyGross - sum);
    expect(r.localIncomeTax).toBe(Math.floor((r.incomeTax * 0.1) / 10) * 10);
    expect(r.incomeTax).toBeGreaterThan(0);
  });

  it('국민연금 상한 적용', () => {
    const r = calculateSalary({ ...base, annualSalary: 200_000_000 });
    expect(r.pensionBase).toBe(6_590_000);
    expect(r.nationalPension).toBe(313_020);
  });

  it('저소득은 소득세 0원', () => {
    const r = calculateSalary({ ...base, annualSalary: 14_000_000 });
    expect(r.incomeTax).toBe(0);
    expect(r.localIncomeTax).toBe(0);
  });

  it('부양가족·자녀가 많을수록 세금이 줄어듦', () => {
    const one = calculateSalary({ ...base, annualSalary: 60_000_000 });
    const family = calculateSalary({ ...base, annualSalary: 60_000_000, dependents: 4, children: 2 });
    expect(family.incomeTax).toBeLessThan(one.incomeTax);
  });

  it('퇴직금 포함 연봉은 13으로 나눔', () => {
    const r = calculateSalary({ ...base, annualSalary: 52_000_000, includesSeverance: true });
    expect(r.monthlyGross).toBe(4_000_000);
  });

  it('0원·음수 입력 안전 처리', () => {
    const r = calculateSalary({ ...base, annualSalary: 0 });
    expect(r.monthlyNet).toBe(0);
    expect(r.nationalPension).toBe(0);
  });
});
