/**
 * 2026년 세율·요율 데이터 (단일 관리 파일)
 *
 * 규칙
 * - 모든 세율·요율은 이 파일에서만 정의하고, 계산 로직은 여기서 import 합니다.
 * - 값마다 출처 URL을 주석으로 남깁니다.
 * - 공식 출처로 확인되지 않은 값은 `// TODO: 공식 출처로 확인 필요` 로 표시합니다.
 * - 최종 검토일: 2026-09-22
 */

/* ------------------------------------------------------------------ */
/* 4대보험 (근로자 부담분)                                              */
/* ------------------------------------------------------------------ */

export const SOCIAL_INSURANCE_2026 = {
  nationalPension: {
    // 출처: 국민연금법 개정(2025.3.20 국회 통과) — 2026년부터 보험료율 9% → 9.5%, 이후 매년 0.5%p 인상
    // https://www.nps.or.kr (국민연금공단 > 보험료)
    // https://www.law.go.kr/법령/국민연금법 (제88조)
    totalRate: 0.095,
    /** 근로자 부담 4.75% (사업주와 절반씩) */
    employeeRate: 0.0475,
    // 출처: 국민연금공단 기준소득월액 상·하한액 (2026.7 ~ 2027.6 적용)
    // https://www.nps.or.kr (국민연금공단 > 기준소득월액 상·하한액 공고)
    // 2026.1~6월은 하한 400,000원 / 상한 6,370,000원
    minBaseMonthly: 410_000,
    maxBaseMonthly: 6_590_000,
  },
  healthInsurance: {
    // 출처: 보건복지부 건강보험정책심의위원회 2026년 건강보험료율 7.19% 의결 (2025.8)
    // https://www.mohw.go.kr (보건복지부 보도자료, 2025.8)
    // https://www.nhis.or.kr (국민건강보험공단 > 보험료)
    totalRate: 0.0719,
    /** 근로자 부담 3.595% */
    employeeRate: 0.03595,
    // TODO: 공식 출처로 확인 필요 — 2026년 직장가입자 보수월액 보험료 상한·하한액(현재 계산에 미적용)
  },
  longTermCare: {
    // 출처: 보건복지부 2026년 장기요양보험료율 — 건강보험료의 13.14% (소득 대비 0.9448%)
    // https://www.mohw.go.kr (보건복지부 보도자료, 2025.8)
    // https://www.longtermcare.or.kr (노인장기요양보험 > 보험료)
    rateOfHealthPremium: 0.1314,
  },
  employmentInsurance: {
    // 출처: 고용보험 및 산업재해보상보험의 보험료징수 등에 관한 법률 시행령 제12조 — 실업급여 보험료율 1.8% (근로자 0.9%)
    // https://www.law.go.kr/법령/고용보험및산업재해보상보험의보험료징수등에관한법률시행령
    // https://www.ei.go.kr (고용보험 > 보험료)
    employeeRate: 0.009,
  },
} as const;

/* ------------------------------------------------------------------ */
/* 근로소득세                                                          */
/* ------------------------------------------------------------------ */

/** 종합소득세 기본세율 (과세표준 상한, 세율, 누진공제) */
// 출처: 국세청 종합소득세 세율 (2023년 귀속 이후 동일, 2026년 변경 없음)
// https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?mi=2227&cntntsId=7667
// https://www.law.go.kr/법령/소득세법 (제55조)
export const INCOME_TAX_BRACKETS_2026: ReadonlyArray<{
  upTo: number;
  rate: number;
  deduction: number;
}> = [
  { upTo: 14_000_000, rate: 0.06, deduction: 0 },
  { upTo: 50_000_000, rate: 0.15, deduction: 1_260_000 },
  { upTo: 88_000_000, rate: 0.24, deduction: 5_760_000 },
  { upTo: 150_000_000, rate: 0.35, deduction: 15_440_000 },
  { upTo: 300_000_000, rate: 0.38, deduction: 19_940_000 },
  { upTo: 500_000_000, rate: 0.4, deduction: 25_940_000 },
  { upTo: 1_000_000_000, rate: 0.42, deduction: 35_940_000 },
  { upTo: Infinity, rate: 0.45, deduction: 65_940_000 },
];

/** 근로소득공제 구간 (총급여 상한, 기본공제액, 초과분 공제율, 구간 시작) */
// 출처: 소득세법 제47조(근로소득공제) — 공제 한도 2,000만원
// https://www.law.go.kr/법령/소득세법 (제47조)
export const EARNED_INCOME_DEDUCTION_2026 = {
  brackets: [
    { upTo: 5_000_000, base: 0, rate: 0.7, from: 0 },
    { upTo: 15_000_000, base: 3_500_000, rate: 0.4, from: 5_000_000 },
    { upTo: 45_000_000, base: 7_500_000, rate: 0.15, from: 15_000_000 },
    { upTo: 100_000_000, base: 12_000_000, rate: 0.05, from: 45_000_000 },
    { upTo: Infinity, base: 14_750_000, rate: 0.02, from: 100_000_000 },
  ],
  max: 20_000_000,
} as const;

/** 인적공제(기본공제) 1인당 */
// 출처: 소득세법 제50조(기본공제) — 1명당 연 150만원
// https://www.law.go.kr/법령/소득세법 (제50조)
export const PERSONAL_DEDUCTION_PER_PERSON = 1_500_000;

/** 근로소득세액공제 */
// 출처: 소득세법 제59조(근로소득세액공제)
// https://www.law.go.kr/법령/소득세법 (제59조)
export const EARNED_INCOME_TAX_CREDIT_2026 = {
  /** 산출세액 130만원 이하: 55% / 초과: 71만5천원 + 초과분 30% */
  threshold: 1_300_000,
  lowRate: 0.55,
  highBase: 715_000,
  highRate: 0.3,
  /** 총급여 구간별 한도 */
  limits: {
    under33m: 740_000, // 총급여 3,300만원 이하
    under70m: { base: 740_000, reduceRate: 0.008, floor: 660_000, from: 33_000_000 }, // 3,300만~7,000만
    under120m: { base: 660_000, reduceRate: 0.5, floor: 500_000, from: 70_000_000 }, // 7,000만~1억2천만
    over120m: { base: 500_000, reduceRate: 0.5, floor: 200_000, from: 120_000_000 }, // 1억2천만 초과
  },
} as const;

/** 표준세액공제 (특별세액공제 미신청 근로자) */
// 출처: 소득세법 제59조의4 제7항 — 근로소득자 연 13만원
// https://www.law.go.kr/법령/소득세법 (제59조의4)
export const STANDARD_TAX_CREDIT = 130_000;

/** 자녀세액공제 (8세 이상 기본공제대상 자녀) */
// 출처: 소득세법 제59조의2 (2025.1.1 이후 개정분) — 1명 25만원, 2명 55만원, 3명 이상 55만원 + 2명 초과 1명당 40만원
// https://www.law.go.kr/법령/소득세법 (제59조의2)
export const CHILD_TAX_CREDIT_2026 = {
  one: 250_000,
  two: 550_000,
  extraPerChild: 400_000,
} as const;

/** 지방소득세 = 소득세의 10% */
// 출처: 지방세법 제103조의3 (개인지방소득세 세율, 근로소득 특별징수분)
// https://www.law.go.kr/법령/지방세법 (제103조의3)
export const LOCAL_INCOME_TAX_RATE = 0.1;

/** 식대 비과세 한도 (월) */
// 출처: 소득세법 시행령 제17조의2 — 식사대 월 20만원 이하 비과세 (2023년 이후)
// https://www.law.go.kr/법령/소득세법시행령 (제17조의2)
export const MEAL_ALLOWANCE_NONTAX_LIMIT = 200_000;

/* ------------------------------------------------------------------ */
/* 노동                                                                */
/* ------------------------------------------------------------------ */

/** 2026년 최저임금 */
// 출처: 2026년 적용 최저임금 시간급 10,320원
// https://www.minimumwage.go.kr/customer/notice/view.do?bultnId=4657
// https://www.moel.go.kr/news/enews/report/enewsView.do?news_seq=18144
export const MINIMUM_WAGE_2026 = {
  hourly: 10_320,
  /** 주 40시간(주휴 포함 월 209시간) 기준 월 환산액 */
  monthly: 2_156_880,
} as const;

/** 주휴수당 요건 */
// 출처: 근로기준법 제55조, 제18조 제3항 — 1주 소정근로시간 15시간 이상 & 소정근로일 개근 시 주 1회 유급휴일
// https://www.law.go.kr/법령/근로기준법 (제55조, 제18조)
export const WEEKLY_HOLIDAY_PAY_RULES = {
  minWeeklyHours: 15,
  /** 주휴시간 계산 시 주 40시간을 상한으로 봄 (1일 8시간) */
  maxWeeklyHours: 40,
  fullTimeHolidayHours: 8,
} as const;

/** 퇴직금 요건 */
// 출처: 근로자퇴직급여 보장법 제4조, 제8조 — 계속근로기간 1년 이상, 주 15시간 이상 근로자에게
//       계속근로기간 1년에 대하여 30일분 이상의 평균임금 지급
// https://www.law.go.kr/법령/근로자퇴직급여보장법 (제4조, 제8조)
// 평균임금 정의: 근로기준법 제2조 제1항 제6호 — 산정사유 발생일 이전 3개월 임금총액 ÷ 그 기간 총일수
export const SEVERANCE_RULES = {
  minServiceDays: 365,
  minWeeklyHours: 15,
  daysPerYear: 30,
  averageWageMonths: 3,
} as const;
