import { describe, expect, it } from 'vitest';
import { floorWon, formatNumber, formatPercent, formatWon, parseNumber } from '../format';

describe('format', () => {
  it('천 단위 콤마', () => {
    expect(formatNumber(1234567)).toBe('1,234,567');
    expect(formatWon(1234.6)).toBe('1,235원');
  });
  it('문자열 파싱', () => {
    expect(parseNumber('50,000,000')).toBe(50000000);
    expect(parseNumber('')).toBe(0);
    expect(parseNumber('abc')).toBe(0);
    expect(parseNumber('3.5')).toBe(3.5);
  });
  it('절사', () => {
    expect(floorWon(12345, 10)).toBe(12340);
  });
  it('퍼센트', () => {
    expect(formatPercent(0.03595)).toBe('3.595%');
    expect(formatPercent(0.095)).toBe('9.5%');
  });
});
