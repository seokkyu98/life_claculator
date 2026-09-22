/**
 * 계산기 목록 — 홈 카드, 관련 계산기 링크, 브레드크럼, 검색에 공통으로 사용합니다.
 * 새 계산기를 추가하면 여기에 항목을 추가하세요. (sitemap은 페이지 파일 기준으로 자동 생성)
 */
export type CategoryId = 'labor' | 'finance' | 'date';

export const CATEGORIES: Record<CategoryId, { name: string; description: string }> = {
  labor: { name: '급여·노동', description: '월급, 퇴직금, 주휴수당 등 일하면서 꼭 필요한 계산' },
  finance: { name: '금융', description: '대출 이자와 상환 계획을 미리 확인' },
  date: { name: '날짜·나이', description: '만나이, 날짜 계산 등 생활 속 날짜 계산' },
};

export interface CalculatorMeta {
  slug: string;
  /** H1·카드 제목 */
  title: string;
  /** 한 줄 요약 (H1 아래, 카드 설명) */
  summary: string;
  /** meta description (120~160자 권장) */
  description: string;
  category: CategoryId;
  icon: string;
  /** 검색창 매칭용 키워드 */
  keywords: string[];
  related: string[];
}

export const CALCULATORS: CalculatorMeta[] = [
  {
    slug: 'salary',
    title: '연봉 실수령액 계산기',
    summary: '2026년 4대보험 요율과 소득세를 반영해 매달 통장에 들어오는 월급을 계산합니다.',
    description:
      '2026년 기준 연봉 실수령액 계산기. 국민연금 4.75%, 건강보험 3.595%, 장기요양, 고용보험, 소득세, 지방소득세를 공제한 월 실수령액과 계산 과정을 단계별로 보여드립니다.',
    category: 'labor',
    icon: '💰',
    keywords: ['연봉', '월급', '실수령액', '세후', '4대보험', '소득세', '급여'],
    related: ['severance', 'weekly-holiday-pay', 'loan-interest'],
  },
  {
    slug: 'severance',
    title: '퇴직금 계산기',
    summary: '입사일·퇴사일과 최근 3개월 급여로 법정 퇴직금을 계산합니다.',
    description:
      '퇴직금 계산기. 입사일과 퇴사일, 최근 3개월 임금과 연간 상여금·연차수당을 입력하면 평균임금과 재직일수로 법정 퇴직금을 계산하고 과정을 설명합니다.',
    category: 'labor',
    icon: '📦',
    keywords: ['퇴직금', '평균임금', '퇴사', '재직일수', '퇴직'],
    related: ['salary', 'weekly-holiday-pay', 'age'],
  },
  {
    slug: 'weekly-holiday-pay',
    title: '주휴수당 계산기',
    summary: '시급과 주 근무시간으로 주휴수당과 주급·월급 환산액을 계산합니다.',
    description:
      '2026년 주휴수당 계산기. 최저임금 10,320원 기준, 시급과 주 소정근로시간을 입력하면 주휴수당 발생 여부와 금액, 주휴수당 포함 주급과 월급 환산액을 알려드립니다.',
    category: 'labor',
    icon: '🗓️',
    keywords: ['주휴수당', '시급', '알바', '아르바이트', '최저임금', '주급'],
    related: ['salary', 'severance', 'age'],
  },
  {
    slug: 'age',
    title: '만나이 계산기',
    summary: '생년월일로 만 나이, 세는 나이, 연 나이와 다음 생일까지 남은 날을 계산합니다.',
    description:
      '만나이 계산기. 생년월일과 기준일을 입력하면 만 나이, 연 나이, 세는 나이, 살아온 날수와 다음 생일까지 남은 날을 바로 계산합니다. 2023년 만 나이 통일법 내용도 정리했습니다.',
    category: 'date',
    icon: '🎂',
    keywords: ['만나이', '나이', '생년월일', '연나이', '세는나이', '생일'],
    related: ['severance', 'weekly-holiday-pay', 'loan-interest'],
  },
  {
    slug: 'loan-interest',
    title: '대출 이자 계산기',
    summary: '원리금균등·원금균등·만기일시 상환 방식별 월 상환액과 총이자를 비교합니다.',
    description:
      '대출 이자 계산기. 대출금, 연 이자율, 기간을 입력하면 원리금균등·원금균등·만기일시 상환 방식별 월 납입액, 총이자, 회차별 상환 스케줄을 계산해 비교해 드립니다.',
    category: 'finance',
    icon: '🏦',
    keywords: ['대출', '이자', '원리금균등', '원금균등', '만기일시', '주택담보대출', '상환'],
    related: ['salary', 'severance', 'age'],
  },
];

export function getCalculator(slug: string): CalculatorMeta {
  const calc = CALCULATORS.find((c) => c.slug === slug);
  if (!calc) throw new Error(`Unknown calculator: ${slug}`);
  return calc;
}
