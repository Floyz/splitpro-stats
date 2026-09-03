import { createContext, useContext, useMemo } from 'react';
import { NavLink, Navigate, Route, Routes } from 'react-router';

import type { MeResponse } from '@shared/api-types';

import { useApi } from './api';
import { Filters } from './components/Filters';
import { type Filters as FilterValues, useFilters } from './lib/filters';
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

const NAV = [
  { to: '/', label: 'Overview', end: true },
  { to: '/categories', label: 'Categories' },
  { to: '/groups', label: 'Groups' },
  { to: '/payers', label: 'Payers' },
  { to: '/balance', label: 'Balance' },
  { to: '/top', label: 'Top expenses' },
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

export const App = () => {
  const { data: me, error } = useApi<MeResponse>('/me');
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
              ← SplitPro
            </a>
            <h1 className="text-xl font-semibold">Statistics</h1>
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
              {item.label}
            </NavLink>
          ))}
        </nav>

        <Filters me={me} currency={scope.currency} />

        {error ? (
          <p className="text-negative text-sm">Could not load your profile: {error.message}</p>
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
