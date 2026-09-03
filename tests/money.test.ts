import { describe, expect, it } from 'vitest';

import { formatMoney, sumMinor, toMajor, toMinor } from '../src/shared/money';

describe('money', () => {
  it('normalises DB values to minor strings', () => {
    expect(toMinor(1234n)).toBe('1234');
    expect(toMinor('-45')).toBe('-45');
    expect(toMinor('12.0')).toBe('12');
    expect(toMinor(7)).toBe('7');
    expect(toMinor(null)).toBe('0');
  });

  it('converts minor units per currency decimals', () => {
    expect(toMajor('12345', 'EUR')).toBe(123.45); // 2 decimals
    expect(toMajor('12345', 'JPY')).toBe(12345); // 0 decimals
    expect(toMajor('12345', 'KWD')).toBe(12.345); // 3 decimals
    expect(toMajor('12345', 'XXX')).toBe(123.45); // unknown -> 2
  });

  it('sums BigInt-safe', () => {
    expect(sumMinor(['9007199254740993', 1n])).toBe('9007199254740994');
  });

  it('formats with the right precision', () => {
    expect(formatMoney('12345', 'EUR', 'en')).toBe('€123.45');
    expect(formatMoney('12345', 'JPY', 'en')).toBe('¥12,345');
    expect(formatMoney('123456789', 'EUR', 'en', { compact: true })).toBe('€1.2M');
  });
});
