import type { MeResponse } from '@shared/api-types';

import { useT } from '../i18n';
import { PRESET_KEYS, type Preset, useFilters } from '../lib/filters';

interface Props {
  me: MeResponse | undefined;
  currency: string | undefined;
}

const PRESETS: Preset[] = ['year', '12m', '30d', 'all', 'custom'];

const selectClass =
  'bg-card h-9 rounded-md border px-2 text-sm focus-visible:ring-primary focus-visible:ring-2 focus-visible:outline-none';

/** One row above everything it scopes: date range first, then dimension filters, then currency. */
export const Filters = ({ me, currency }: Props) => {
  const t = useT();
  const { filters, update } = useFilters();

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        className={selectClass}
        value={filters.preset}
        aria-label={t('filters.range')}
        onChange={(e) => update({ range: e.target.value })}
      >
        {PRESETS.map((p) => (
          <option key={p} value={p}>
            {t(PRESET_KEYS[p])}
          </option>
        ))}
      </select>

      {'custom' === filters.preset ? (
        <>
          <input
            type="date"
            className={selectClass}
            aria-label={t('filters.from')}
            value={filters.from ?? ''}
            onChange={(e) => update({ from: e.target.value })}
          />
          <span className="text-muted-foreground text-sm">{t('filters.to_word')}</span>
          <input
            type="date"
            className={selectClass}
            aria-label={t('filters.to')}
            value={filters.to ?? ''}
            onChange={(e) => update({ to: e.target.value })}
          />
        </>
      ) : null}

      <select
        className={selectClass}
        value={filters.groupId ?? ''}
        aria-label={t('filters.group')}
        onChange={(e) => update({ groupId: e.target.value })}
      >
        <option value="">{t('filters.all_groups')}</option>
        {me?.groups.map((g) => (
          <option key={g.id} value={g.id}>
            {g.name}
            {g.archived ? ` ${t('filters.archived')}` : ''}
          </option>
        ))}
      </select>

      {me && me.currencies.length > 1 ? (
        <div
          className="ml-auto flex rounded-md border text-sm"
          role="tablist"
          aria-label={t('filters.currency')}
        >
          {me.currencies.map((code) => (
            <button
              key={code}
              type="button"
              role="tab"
              aria-selected={code === currency}
              onClick={() => update({ currency: code })}
              className={[
                'px-3 py-1.5',
                code === currency
                  ? 'bg-primary text-primary-foreground rounded-md'
                  : 'text-muted-foreground',
              ].join(' ')}
            >
              {code}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
};
