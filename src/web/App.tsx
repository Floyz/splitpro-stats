import { createContext, useContext, useEffect, useMemo } from 'react';
import { NavLink, Navigate, Route, Routes, useLocation } from 'react-router';

import type { MeResponse } from '@shared/api-types';

import { useApi } from './api';
import { Filters } from './components/Filters';
import { LocaleContext, type TranslationKey, intlLocale, resolveLocale, useT } from './i18n';
import { type Filters as FilterValues, useFilters } from './lib/filters';
import { setFormatLocale } from './lib/format';
import { BalancePage } from './pages/Balance';
import { CategoriesPage } from './pages/Categories';
import { GroupsPage } from './pages/Groups';
import { OverviewPage } from './pages/Overview';
import { PayersPage } from './pages/Payers';
import { TopPage } from './pages/Top';

export interface Scope {
  me: MeResponse | undefined;
  currency: string;
  /** Query params for the API, shared by every page so all numbers agree. */
  params: { from?: string; to?: string; groupId?: number; currency: string };
}

const ScopeContext = createContext<Scope | null>(null);

export const useScope = (): Scope => {
  const scope = useContext(ScopeContext);
  if (!scope) {
    throw new Error('useScope outside <App>');
  }
  return scope;
};

const NAV: Array<{ to: string; key: TranslationKey; end?: boolean }> = [
  { to: '/', key: 'nav.overview', end: true },
  { to: '/categories', key: 'nav.categories' },
  { to: '/groups', key: 'nav.groups' },
  { to: '/payers', key: 'nav.payers' },
  { to: '/balance', key: 'nav.balance' },
  { to: '/top', key: 'nav.top' },
];

const resolveCurrency = (me: MeResponse | undefined, filters: FilterValues): string => {
  if (filters.currency) {
    return filters.currency;
  }
  if (!me) {
    return 'USD';
  }
  return me.currencies.includes(me.user.currency)
    ? me.user.currency
    : (me.currencies[0] ?? me.user.currency);
};

const Shell = ({ me, error }: { me: MeResponse | undefined; error: Error | null }) => {
  const t = useT();
  const { filters } = useFilters();

  const scope = useMemo<Scope>(() => {
    const currency = resolveCurrency(me, filters);
    return {
      me,
      currency,
      params: { from: filters.from, to: filters.to, groupId: filters.groupId, currency },
    };
  }, [me, filters]);

  return (
    <ScopeContext.Provider value={scope}>
      <div className="mx-auto flex min-h-full max-w-5xl flex-col gap-4 px-4 py-4">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <a href="/balances" className="text-muted-foreground hover:text-foreground text-sm">
              {t('header.back')}
            </a>
            <h1 className="text-xl font-semibold">{t('header.title')}</h1>
          </div>
          {me ? (
            <span className="text-muted-foreground text-sm">{me.user.name ?? me.user.email}</span>
          ) : null}
        </header>

        <nav className="flex gap-1 overflow-x-auto border-b">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                [
                  '-mb-px border-b-2 px-3 py-2 text-sm whitespace-nowrap',
                  isActive
                    ? 'border-primary text-foreground font-medium'
                    : 'text-muted-foreground border-transparent',
                ].join(' ')
              }
            >
              {t(item.key)}
            </NavLink>
          ))}
        </nav>

        <Filters me={me} currency={scope.currency} />

        {error ? (
          <p className="text-negative text-sm">
            {t('error.profile')}: {error.message}. {t('error.hint')}
          </p>
        ) : null}

        <main className="flex flex-col gap-4">
          <Routes>
            <Route path="/" element={<OverviewPage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/groups" element={<GroupsPage />} />
            <Route path="/payers" element={<PayersPage />} />
            <Route path="/balance" element={<BalancePage />} />
            <Route path="/top" element={<TopPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </ScopeContext.Provider>
  );
};

export const App = () => {
  const { data: me, error } = useApi<MeResponse>('/me');
  const { search } = useLocation();

  // `?lang=` > SplitPro preference (once /me is loaded) > browser language.
  const locale = useMemo(() => {
    const resolved = resolveLocale(me?.user.preferredLanguage, search, navigator.language);
    // Set synchronously so children formatting in this same render pass use the right locale.
    setFormatLocale(intlLocale(resolved, navigator.language));
    return resolved;
  }, [me?.user.preferredLanguage, search]);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return (
    <LocaleContext.Provider value={locale}>
      <Shell key={locale} me={me} error={error} />
    </LocaleContext.Provider>
  );
};
