import { decimalDigits } from './currency.js';

/** Amounts travel over the wire as strings of minor units (BigInt-safe). */
export type Minor = string;

const toBigInt = (value: unknown): bigint => {
  if ('bigint' === typeof value) {
    return value;
  }
  if ('number' === typeof value) {
    return BigInt(Math.trunc(value));
  }
  if ('string' === typeof value && '' !== value) {
    // Postgres SUM(bigint) yields numeric, e.g. "12345" or "-45"; guard against "12.0".
    return BigInt(value.split('.')[0] ?? '0');
  }
  return 0n;
};

/** Normalises a DB value (bigint | numeric string | number | null) to a Minor string. */
export const toMinor = (value: unknown): Minor => toBigInt(value).toString();

/** Converts minor units to a JS number in major units (for charts). Precision loss only past 2^53. */
export const toMajor = (minor: Minor | bigint | number, currency: string): number =>
  Number(toBigInt(minor)) / 10 ** decimalDigits(currency);

export const sumMinor = (values: Array<Minor | bigint>): Minor =>
  values.reduce<bigint>((acc, v) => acc + toBigInt(v), 0n).toString();

/** Formats a value already expressed in major units (e.g. chart data). */
export const formatMajor = (
  value: number,
  currency: string,
  locale = 'en',
  options: { compact?: boolean } = {},
): string => {
  const digits = decimalDigits(currency);

  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: options.compact ? 0 : digits,
      maximumFractionDigits: options.compact ? 1 : digits,
      notation: options.compact ? 'compact' : 'standard',
    }).format(value);
  } catch {
    // Unknown ISO code for Intl: fall back to a plain number with the code.
    return `${value.toFixed(digits)} ${currency}`;
  }
};

/** Formats minor units (BigInt-safe string) as a currency amount. */
export const formatMoney = (
  minor: Minor | bigint | number,
  currency: string,
  locale = 'en',
  options: { compact?: boolean } = {},
): string => formatMajor(toMajor(minor, currency), currency, locale, options);
