import { describe, expect, it } from 'vitest';

import { DICTIONARIES, intlLocale, resolveLocale, translate } from '../src/web/i18n';

describe('i18n', () => {
  it('has the same keys in every locale', () => {
    const en = Object.keys(DICTIONARIES.en).sort();
    const fr = Object.keys(DICTIONARIES.fr).sort();
    expect(fr).toEqual(en);
    Object.values(DICTIONARIES.fr).forEach((value) => expect(value.trim()).not.toBe(''));
  });

  it('interpolates variables', () => {
    expect(translate('en', 'overview.since', { month: 'Mar 2026' })).toBe('since Mar 2026');
    expect(translate('fr', 'overview.monthly_title', { currency: 'EUR' })).toBe(
      'Dépenses mensuelles (EUR)',
    );
  });

  it('resolves the locale by priority: ?lang, preference, browser', () => {
    expect(resolveLocale('fr', '?lang=en', 'fr-FR')).toBe('en');
    expect(resolveLocale('fr', '', 'en-US')).toBe('fr');
    expect(resolveLocale('pt-PT', '', 'fr-CA')).toBe('fr');
    expect(resolveLocale('', '', 'de-DE')).toBe('en');
    expect(resolveLocale(undefined, '?lang=xx', undefined)).toBe('en');
  });

  it('maps to an Intl tag', () => {
    expect(intlLocale('fr', 'en-US')).toBe('fr-FR');
    expect(intlLocale('fr', 'fr-CA')).toBe('fr-CA');
    expect(intlLocale('en', 'fr-FR')).toBe('en');
    expect(intlLocale('en', 'en-GB')).toBe('en-GB');
  });
});
