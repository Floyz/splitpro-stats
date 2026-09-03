import { type Minor, formatMajor, formatMoney, toMajor } from '@shared/money';

export const locale = 'undefined' === typeof navigator ? 'en' : navigator.language;

export const money = (minor: Minor | bigint | number, currency: string) =>
  formatMoney(minor, currency, locale);

export const moneyCompact = (minor: Minor | bigint | number, currency: string) =>
  formatMoney(minor, currency, locale, { compact: true });

/** For values already in major units (chart points, aggregated client-side). */
export const moneyMajor = (value: number, currency: string) => formatMajor(value, currency, locale);

export const major = (minor: Minor | bigint | number, currency: string) => toMajor(minor, currency);

/** Axis tick for major-unit numbers: 1.2K / 4.5M, no currency symbol (the title names it). */
export const compactNumber = (value: number) =>
  new Intl.NumberFormat(locale, { notation: 'compact', maximumFractionDigits: 1 }).format(value);

export const integer = (value: number) => new Intl.NumberFormat(locale).format(value);

/** "2026-03" -> "Mar 2026" (or short "Mar" when `short`). */
export const monthLabel = (month: string, short = false) => {
  const [y, m] = month.split('-').map(Number);
  if (!y || !m) {
    return month;
  }
  const date = new Date(Date.UTC(y, m - 1, 1));
  return new Intl.DateTimeFormat(locale, {
    month: 'short',
    year: short ? undefined : 'numeric',
    timeZone: 'UTC',
  }).format(date);
};

export const dateLabel = (iso: string) =>
  new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeZone: 'UTC' }).format(new Date(iso));

export const percent = (part: number, total: number) =>
  0 === total ? '' : `${Math.round((part / total) * 100)}%`;
