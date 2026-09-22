# 생활계산기 프로젝트 규칙

한국 사용자용 생활 계산기 정적 사이트. 목표는 구글 검색 유입과 애드센스 승인.

## 스택·명령어
- Astro 7 (SSG) + TypeScript(strict) + Tailwind CSS 4 (`@tailwindcss/vite`) + Vitest
- 배포: Cloudflare Pages (빌드 명령 `npm run build`, 출력 `dist/`). 외부 DB·서버 사용 금지
- `npm run dev` / `npm run build` / `npm test` / `npm run check`
- Windows 환경: Node는 winget으로 설치됨. 셸에서 `node`가 안 잡히면 새 터미널을 열 것

## 폴더 구조
- `src/config.ts` — 사이트명·도메인·이메일·애드센스 ID. **사이트 설정은 여기서만**
- `src/data/rates-2026.ts` — **모든 세율·요율의 단일 출처**. 값마다 출처 URL 주석 필수
- `src/data/calculators.ts` — 계산기 목록(홈 카드·관련 링크·검색·푸터가 여기서 생성)
- `src/lib/*.ts` — 순수 계산 함수 (DOM 접근 금지). 테스트는 `src/lib/__tests__/*.test.ts`
- `src/scripts/number-input.ts` — 콤마 입력·즉시 계산 헬퍼
- `src/layouts/CalculatorLayout.astro` — 계산기 페이지 공통 틀 (SEO/JSON-LD/광고/FAQ/관련링크 포함)
- `src/pages/<slug>.astro` — 계산기 페이지 1개 = 파일 1개

## 세율·요율 규칙 (중요)
- 계산 로직에 숫자 요율을 하드코딩하지 말고 반드시 `rates-2026.ts`에서 import
- 새 값은 공식 출처(법령정보센터, 국세청, 고용노동부, 공단 등) URL을 주석으로 단다
- 확실하지 않은 값은 추측 금지 → `// TODO: 공식 출처로 확인 필요` 표시 후 사용자에게 목록 보고
- 요율 검토 시 `SITE.updatedAt`도 갱신

## 계산기 추가 절차
1. `src/lib/<name>.ts` 계산 함수 + `src/lib/__tests__/<name>.test.ts` 테스트 먼저 작성 → `npm test` 통과
2. 필요한 요율은 `rates-2026.ts`에 출처와 함께 추가
3. `src/data/calculators.ts`에 항목 추가 (related 3개 = 관련 계산기 내부 링크)
4. `src/pages/<slug>.astro` 작성 — `CalculatorLayout` 사용, 아래 페이지 구성 준수
5. `npm run build` 통과 확인 (sitemap은 자동 생성) → 커밋·푸시

## 계산기 페이지 구성 (필수)
1. H1 + 한 줄 요약 (calculators.ts의 title/summary) + "2026년 기준, 참고용이며 법적 효력 없음" 안내(`Disclaimer`, 레이아웃에 포함)
2. 계산기 UI: 모바일 우선, 입력 즉시 결과(`onFormChange`), 금액 입력은 `data-number`로 천 단위 콤마
3. 결과 해설: 계산 과정을 단계별로 표시
4. 본문 설명글 **1,500자 이상** (개념, 계산 공식, 예시 2개, 주의사항). 직접 작성, 타 사이트 복제 금지
5. FAQ 5개 이상 (`faqs` prop → FAQPage JSON-LD 자동 생성)
6. 관련 계산기 링크 3개 (레이아웃이 `related`로 자동 생성)
7. 광고 3곳(상단·본문 중간·하단)은 레이아웃이 자동 배치. 본문은 default slot(전반)과 `slot="more"`(후반)로 나눠 중간 광고가 본문 가운데 오게 한다

## SEO·품질
- 페이지별 title/description/canonical/OG는 BaseLayout이 처리. description은 120~160자
- JSON-LD: 계산기 페이지는 WebApplication + FAQPage + BreadcrumbList
- 시맨틱 HTML, `lang="ko"`, 이미지 alt, 라벨 연결(`label for`), 다크모드(`dark:` 클래스) 지원
- Lighthouse 모바일 성능·접근성·SEO 90점 이상 유지. 클라이언트 JS는 최소화(프레임워크 없이 바닐라 TS)
- 광고 영역은 `.ad-slot`의 min-height로 CLS 방지 — 높이 제거 금지

## Git
- 원격: https://github.com/seokkyu98/life_claculator.git (main 브랜치)
- 작업 단위(계산기 1개, 기능 1개)마다 테스트·빌드 통과 후 커밋하고 **항상 push**까지 완료
