# 생활계산기

한국 사용자를 위한 생활 계산기 정적 사이트입니다. 계산기마다 "계산기 + 단계별 해설 + 충실한 설명글 + FAQ"로 구성된 독립 페이지를 제공합니다.

- 스택: Astro 7 (SSG) · TypeScript · Tailwind CSS 4 · Vitest
- 배포: Cloudflare Pages (정적 파일, 서버·DB 없음)
- 프로젝트 규칙: [CLAUDE.md](CLAUDE.md)

## 계산기

| 계산기 | 경로 | 계산 로직 | 테스트 |
| --- | --- | --- | --- |
| 연봉 실수령액 | `/salary/` | `src/lib/salary.ts` | `salary.test.ts` |
| 퇴직금 | `/severance/` | `src/lib/severance.ts` | `severance.test.ts` |
| 주휴수당 | `/weekly-holiday-pay/` | `src/lib/weekly-holiday.ts` | `weekly-holiday.test.ts` |
| 만나이 | `/age/` | `src/lib/age.ts` | `age.test.ts` |
| 대출 이자 | `/loan-interest/` | `src/lib/loan.ts` | `loan.test.ts` |

세율·요율은 모두 `src/data/rates-2026.ts` 한 파일에서 출처와 함께 관리합니다.

## 로컬 개발

Node.js 22.12 이상이 필요합니다(`.node-version` = 24).

```bash
npm install
npm run dev      # http://localhost:4321
npm test         # 단위 테스트
npm run check    # 타입 검사
npm run build    # dist/ 생성
npm run audit    # 빌드 결과 점검 (본문 글자 수, FAQ, 광고 슬롯, 깨진 링크, 메타 태그)
```

## 설정 변경 (`src/config.ts`)

| 항목 | 현재 값 | 변경 시점 |
| --- | --- | --- |
| `SITE.name` | 생활계산기 | 필요 시 |
| `SITE.url` | `https://life-calculator.pages.dev` (임시) | 도메인 구입 후 |
| `SITE.email` | 문의 이메일 | 필요 시 |
| `ADSENSE.client` | `ca-pub-XXXXXXXXXXXXXXXX` (임시) | 애드센스 승인 후 |
| `ADSENSE.slots` | 비어 있음 | 광고 단위 생성 후 |

`SITE.url`을 바꾸면 canonical, Open Graph, sitemap, robots.txt에 자동으로 반영됩니다.
애드센스 ID가 `ca-pub-숫자` 형식일 때만 광고 스크립트가 로드됩니다. 그 전에는 광고 자리만 확보됩니다(CLS 방지).

## 배포 (Cloudflare Pages)

1. Cloudflare 대시보드 → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**
2. GitHub 저장소 `seokkyu98/life_claculator` 선택
3. 빌드 설정
   - Framework preset: **Astro**
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Node 버전: 저장소의 `.node-version`(24)을 자동 인식 (안 되면 환경 변수 `NODE_VERSION=24`)
4. **Save and Deploy** → 이후 `main` 브랜치에 push할 때마다 자동 배포
5. 발급된 `*.pages.dev` 주소가 `SITE.url`과 다르면 `src/config.ts`를 수정하고 push

### 커스텀 도메인 연결

1. Cloudflare에서 도메인 구입(Registrar) → Pages 프로젝트 → **Custom domains** → 도메인 추가
2. `src/config.ts`의 `SITE.url`을 새 도메인으로 바꾸고 push
3. `www` ↔ 루트 도메인 중 하나로 리디렉션(Bulk Redirects 또는 Page Rules)해 중복 URL 방지
4. [Google Search Console](https://search.google.com/search-console)에 도메인 등록 → `sitemap-index.xml` 제출

## 애드센스 신청 전 체크리스트

### 콘텐츠
- [x] 계산기 페이지 5개, 각 본문 1,500자 이상 직접 작성 (`npm run audit`으로 확인)
- [x] 계산기마다 FAQ 5개 이상, 계산 예시 2개, 주의사항
- [x] 계산 결과 단계별 해설
- [x] "2026년 기준, 참고용이며 법적 효력 없음" 안내 (모든 계산기 페이지)
- [ ] 세율 TODO 항목 공식 출처로 확인 (아래 "확인이 필요한 요율" 참고)
- [ ] (권장) 계산기를 8~10개 이상으로 늘려 사이트 규모 확보

### 필수 페이지
- [x] 소개 `/about/`
- [x] 개인정보처리방침 `/privacy/`: 쿠키, Google 애드센스, 광고 쿠키, 맞춤 광고 해제 방법 고지
- [x] 이용약관 `/terms/`
- [x] 문의 `/contact/`: 이메일 링크
- [x] 모든 페이지 푸터에 위 링크

### 기술·SEO
- [x] 페이지별 title, meta description, canonical, Open Graph
- [x] JSON-LD (WebApplication, FAQPage, BreadcrumbList)
- [x] sitemap.xml 자동 생성, robots.txt
- [x] `lang="ko"`, 시맨틱 HTML, 다크 모드, 모바일 우선
- [x] Lighthouse 모바일: 성능·접근성·권장사항·SEO 모두 100점 (2026-09-22 측정)
- [x] 깨진 내부 링크 없음 (`npm run audit`)
- [ ] 커스텀 도메인 연결 (애드센스는 `pages.dev` 같은 하위 도메인보다 자체 도메인에서 승인받기 쉬움)
- [ ] Google Search Console 등록 및 sitemap 제출, 색인 생성 확인
- [ ] 배포 후 1~2주 정도 색인과 자연 유입이 쌓인 뒤 신청 권장

### 애드센스 승인 후
1. `src/config.ts` → `ADSENSE.client`에 게시자 ID 입력
2. 애드센스에서 디스플레이 광고 단위 3개(상단, 본문 중간, 하단)를 만들어 `ADSENSE.slots`에 슬롯 ID 입력
3. `public/ads.txt`의 `pub-XXXXXXXXXXXXXXXX`를 실제 ID로 바꾸고 주석(`#`) 제거
4. push → 배포 후 `https://도메인/ads.txt` 접속 확인
5. EEA·영국 사용자 대상 동의 메시지: 애드센스 **개인정보 보호 및 메시지**에서 Google 인증 CMP 설정

## 확인이 필요한 요율 (TODO)

`src/data/rates-2026.ts`에서 `TODO`로 표시한 항목입니다.

| 항목 | 상태 |
| --- | --- |
| 2026년 건강보험 보수월액 보험료 상한·하한액 | 미확인, 계산에 미적용 (월 급여 약 1억 원 이상일 때만 영향) |

그 밖에 2026년 국민연금 9.5%, 건강보험 7.19%, 장기요양 13.14%, 고용보험 0.9%, 국민연금 기준소득월액 41만~659만 원(2026.7~), 최저임금 10,320원은
검색으로 교차 확인했습니다. 다만 일부 출처 주석은 기관 홈페이지 주소까지만 적혀 있으므로, 각 기관의 공고·보도자료 원문 링크로 바꾸는 것을 권장합니다.

## 소득세 계산 방식 안내

연봉 실수령액 계산기의 소득세는 국세청 근로소득 **간이세액표를 그대로 조회하지 않고**, 같은 원리(근로소득공제 → 인적공제 → 연금·보험료 공제 →
기본세율 → 근로소득세액공제·자녀세액공제·표준세액공제)로 연간 세액을 추정한 뒤 12로 나눕니다. 그래서 실제 원천징수액과 월 수천 원 정도 차이가 날 수 있으며,
페이지 FAQ와 주의사항에 이 점을 안내했습니다.
