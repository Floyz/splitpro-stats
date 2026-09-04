import { type Minor, formatMajor, formatMoney, toMajor } from '@shared/money';

const browserLanguage = 'undefined' === typeof navigator ? 'en' : navigator.language;

let currentLocale = browserLanguage;

/** Set by the locale provider in App; every formatter below reads it at call time. */
export const setFormatLocale = (tag: string) => {
  currentLocale = tag;
};

export const money = (minor: Minor | bigint | number, currency: string) =>
  formatMoney(minor, currency, currentLocale);

export const moneyCompact = (minor: Minor | bigint | number, currency: string) =>
  formatMoney(minor, currency, currentLocale, { compact: true });

/** For values already in major units (chart points, aggregated client-side). */
export const moneyMajor = (value: number, currency: string) =>
  formatMajor(value, currency, currentLocale);

export const major = (minor: Minor | bigint | number, currency: string) => toMajor(minor, currency);

/** Axis tick for major-unit numbers: 1.2K / 4.5M, no currency symbol (the title names it). */
export const compactNumber = (value: number) =>
  new Intl.NumberFormat(currentLocale, { notation: 'compact', maximumFractionDigits: 1 }).format(
    value,
  );

export const integer = (value: number) => new Intl.NumberFormat(currentLocale).format(value);

/** "2026-03" -> "Mar 2026" (or short "Mar" when `short`). */
export const monthLabel = (month: string, short = false) => {
  const [y, m] = month.split('-').map(Number);
  if (!y || !m) {
    return month;
  }
  const date = new Date(Date.UTC(y, m - 1, 1));
  return new Intl.DateTimeFormat(currentLocale, {
    month: 'short',
    year: short ? undefined : 'numeric',
    timeZone: 'UTC',
  }).format(date);
};

export const dateLabel = (iso: string) =>
  new Intl.DateTimeFormat(currentLocale, { dateStyle: 'medium', timeZone: 'UTC' }).format(
    new Date(iso),
  );

export const percent = (part: number, total: number) =>
  0 === total ? '' : `${Math.round((part / total) * 100)}%`;
