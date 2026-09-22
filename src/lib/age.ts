import { diffDays } from './date';

const ZODIAC = ['원숭이', '닭', '개', '돼지', '쥐', '소', '호랑이', '토끼', '용', '뱀', '말', '양'] as const;

export interface AgeResult {
  /** 만 나이 (법적 나이) */
  internationalAge: number;
  /** 연 나이 = 기준연도 − 출생연도 (병역법·청소년보호법 등) */
  yearAge: number;
  /** 세는 나이 = 연 나이 + 1 */
  koreanAge: number;
  /** 올해 생일이 지났는지 (생일 당일 포함) */
  birthdayPassed: boolean;
  /** 태어난 날부터 기준일까지 일수 (태어난 날 = 1일째) */
  daysLived: number;
  nextBirthday: Date;
  daysUntilNextBirthday: number;
  /** 다음 생일에 되는 만 나이 */
  nextAge: number;
  /** 띠 (양력 출생연도 기준) */
  zodiac: string;
}

function isLeapYear(y: number): boolean {
  return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
}

/**
 * 해당 연도의 생일(나이가 늘어나는 날)
 * 2월 29일생은 평년에 2월 28일로 나이 기간이 만료되어 3월 1일에 한 살 늘어납니다(민법 제160조 제3항).
 */
export function birthdayInYear(birth: Date, year: number): Date {
  const m = birth.getUTCMonth();
  const d = birth.getUTCDate();
  if (m === 1 && d === 29 && !isLeapYear(year)) return new Date(Date.UTC(year, 2, 1));
  return new Date(Date.UTC(year, m, d));
}

/** 만 나이 계산 (날짜는 UTC 자정 기준 Date). 기준일이 출생일보다 앞서면 null */
export function calculateAge(birth: Date, base: Date): AgeResult | null {
  if (base < birth) return null;
  const by = birth.getUTCFullYear();
  const y = base.getUTCFullYear();

  const thisYearBirthday = birthdayInYear(birth, y);
  const birthdayPassed = base >= thisYearBirthday;
  const internationalAge = y - by - (birthdayPassed ? 0 : 1);
  const yearAge = y - by;

  let nextBirthday = birthdayPassed ? birthdayInYear(birth, y + 1) : thisYearBirthday;
  if (diffDays(base, nextBirthday) === 0) nextBirthday = birthdayInYear(birth, y + 1);

  return {
    internationalAge,
    yearAge,
    koreanAge: yearAge + 1,
    birthdayPassed,
    daysLived: diffDays(birth, base) + 1,
    nextBirthday,
    daysUntilNextBirthday: diffDays(base, nextBirthday),
    nextAge: nextBirthday.getUTCFullYear() - by,
    zodiac: ZODIAC[((by % 12) + 12) % 12],
  };
}
