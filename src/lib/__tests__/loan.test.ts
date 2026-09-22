import { describe, expect, it } from 'vitest';
import { annuityPayment, calculateLoan } from '../loan';

const base = { principal: 100_000_000, annualRate: 0.04, months: 360 };

describe('대출 이자', () => {
  it('원리금균등 월 상환액 (1억, 4%, 30년)', () => {
    expect(Math.round(annuityPayment(100_000_000, 0.04 / 12, 360))).toBe(477_415);
    const r = calculateLoan({ ...base, method: 'annuity' });
    expect(r.firstPayment).toBe(477_415);
    expect(r.schedule[0].interest).toBe(333_333);
    expect(r.schedule).toHaveLength(360);
    expect(r.schedule.at(-1)!.balance).toBe(0);
    expect(r.totalInterest).toBeGreaterThan(71_860_000);
    expect(r.totalInterest).toBeLessThan(71_880_000);
  });

  it('원금균등: 첫 달 원금+이자, 총이자 공식', () => {
    const r = calculateLoan({ ...base, method: 'equalPrincipal' });
    expect(r.firstPayment).toBe(277_778 + 333_333);
    expect(r.schedule.at(-1)!.balance).toBe(0);
    // 총이자 ≈ P × r × (n+1) / 2
    expect(Math.abs(r.totalInterest - 60_166_667)).toBeLessThan(500);
    expect(r.lastPayment).toBeLessThan(r.firstPayment);
  });

  it('만기일시: 매달 이자만, 마지막에 원금', () => {
    const r = calculateLoan({ ...base, months: 12, method: 'bullet' });
    expect(r.schedule[0].payment).toBe(333_333);
    expect(r.lastPayment).toBe(100_000_000 + 333_333);
    expect(r.totalInterest).toBe(333_333 * 12);
  });

  it('총이자 크기: 만기일시 > 원리금균등 > 원금균등', () => {
    const a = calculateLoan({ ...base, method: 'annuity' }).totalInterest;
    const e = calculateLoan({ ...base, method: 'equalPrincipal' }).totalInterest;
    const b = calculateLoan({ ...base, method: 'bullet' }).totalInterest;
    expect(b).toBeGreaterThan(a);
    expect(a).toBeGreaterThan(e);
  });

  it('원금 합계 = 대출금', () => {
    for (const method of ['annuity', 'equalPrincipal', 'bullet'] as const) {
      const r = calculateLoan({ principal: 12_345_678, annualRate: 0.0575, months: 37, method });
      expect(r.schedule.reduce((s, x) => s + x.principal, 0)).toBe(12_345_678);
    }
  });

  it('0% 금리', () => {
    const r = calculateLoan({ principal: 1_200_000, annualRate: 0, months: 12, method: 'annuity' });
    expect(r.firstPayment).toBe(100_000);
    expect(r.totalInterest).toBe(0);
  });

  it('기간 0개월은 빈 스케줄', () => {
    const r = calculateLoan({ ...base, months: 0, method: 'annuity' });
    expect(r.schedule).toHaveLength(0);
    expect(r.totalInterest).toBe(0);
  });
});
