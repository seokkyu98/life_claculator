export type RepaymentMethod = 'annuity' | 'equalPrincipal' | 'bullet';

export const METHOD_LABELS: Record<RepaymentMethod, string> = {
  annuity: '원리금균등',
  equalPrincipal: '원금균등',
  bullet: '만기일시',
};

export interface LoanInput {
  principal: number;
  /** 연 이자율 (예: 0.045 = 4.5%) */
  annualRate: number;
  months: number;
  method: RepaymentMethod;
}

export interface LoanRow {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}

export interface LoanResult {
  method: RepaymentMethod;
  schedule: LoanRow[];
  totalInterest: number;
  totalPayment: number;
  firstPayment: number;
  lastPayment: number;
  /** 원리금균등의 이론상 월 상환액 (반올림 전) */
  monthlyRate: number;
}

/** 원리금균등 월 상환액 = P × r × (1+r)^n ÷ ((1+r)^n − 1) */
export function annuityPayment(principal: number, monthlyRate: number, months: number): number {
  if (months <= 0) return 0;
  if (monthlyRate === 0) return principal / months;
  const f = Math.pow(1 + monthlyRate, months);
  return (principal * monthlyRate * f) / (f - 1);
}

/**
 * 대출 상환 스케줄 계산 (월 단위, 원 단위 반올림)
 * 마지막 회차에서 남은 원금을 모두 상환하도록 보정합니다.
 */
export function calculateLoan(input: LoanInput): LoanResult {
  const principal = Math.max(0, Math.round(input.principal));
  const months = Math.max(0, Math.floor(input.months));
  const r = Math.max(0, input.annualRate) / 12;
  const schedule: LoanRow[] = [];

  let balance = principal;
  const fixedPayment = annuityPayment(principal, r, months);
  const fixedPrincipal = months > 0 ? principal / months : 0;

  for (let m = 1; m <= months; m++) {
    const interest = Math.round(balance * r);
    let principalPart: number;
    if (input.method === 'annuity') principalPart = Math.round(fixedPayment) - interest;
    else if (input.method === 'equalPrincipal') principalPart = Math.round(fixedPrincipal);
    else principalPart = 0;

    if (m === months) principalPart = balance;
    principalPart = Math.min(Math.max(0, principalPart), balance);
    balance -= principalPart;
    schedule.push({ month: m, payment: principalPart + interest, principal: principalPart, interest, balance });
  }

  const totalInterest = schedule.reduce((s, row) => s + row.interest, 0);
  return {
    method: input.method,
    schedule,
    totalInterest,
    totalPayment: principal + totalInterest,
    firstPayment: schedule[0]?.payment ?? 0,
    lastPayment: schedule[schedule.length - 1]?.payment ?? 0,
    monthlyRate: r,
  };
}
