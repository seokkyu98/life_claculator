/**
 * 사이트 전역 설정 — 사이트명·도메인·애드센스 ID는 이 파일에서만 수정합니다.
 * 도메인/애드센스 ID는 확정되면 아래 값만 바꾸면 전체(canonical, sitemap, robots, 광고)에 반영됩니다.
 */
export const SITE = {
  name: '생활계산기',
  /** 임시 도메인. Cloudflare에서 도메인 구입 후 교체 (끝에 / 없이) */
  url: 'https://life-calculator.pages.dev',
  description:
    '연봉 실수령액, 퇴직금, 주휴수당, 만나이, 대출 이자까지. 2026년 기준으로 바로 계산하고 계산 과정을 쉽게 설명하는 생활 계산기 모음입니다.',
  email: 'tjrrb1832@gmail.com',
  locale: 'ko_KR',
  /** 기준 연도 — 페이지 안내문과 제목에 사용 */
  baseYear: 2026,
  /** 최종 업데이트(요율 검토) 일자 */
  updatedAt: '2026-09-22',
} as const;

export const ADSENSE = {
  /** 임시 값. 애드센스 승인 후 실제 게시자 ID(ca-pub-로 시작)로 교체 */
  client: 'ca-pub-XXXXXXXXXXXXXXXX',
  /** 광고 단위 슬롯 ID (애드센스에서 광고 단위 생성 후 입력) */
  slots: {
    top: '',
    middle: '',
    bottom: '',
  },
} as const;

/** 실제 게시자 ID가 들어갔을 때만 애드센스 스크립트를 로드 */
export const isAdsenseEnabled = /^ca-pub-\d{10,}$/.test(ADSENSE.client);
