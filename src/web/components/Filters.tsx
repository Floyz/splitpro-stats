import type { MeResponse } from '@shared/api-types';

import { PRESET_LABELS, type Preset, useFilters } from '../lib/filters';

interface Props {
  me: MeResponse | undefined;
  currency: string | undefined;
}

const PRESETS: Preset[] = ['year', '12m', '30d', 'all', 'custom'];

const selectClass =
  'bg-card h-9 rounded-md border px-2 text-sm focus-visible:ring-primary focus-visible:ring-2 focus-visible:outline-none';

/** One row above everything it scopes: date range first, then dimension filters, then currency. */
export const Filters = ({ me, currency }: Props) => {
  const { filters, update } = useFilters();

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        className={selectClass}
        value={filters.preset}
        aria-label="Date range"
        onChange={(e) => update({ range: e.target.value })}
      >
        {PRESETS.map((p) => (
          <option key={p} value={p}>
            {PRESET_LABELS[p]}
          </option>
        ))}
      </select>

      {'custom' === filters.preset ? (
        <>
          <input
            type="date"
            className={selectClass}
            aria-label="From"
            value={filters.from ?? ''}
            onChange={(e) => update({ from: e.target.value })}
          />
          <span className="text-muted-foreground text-sm">to</span>
          <input
            type="date"
            className={selectClass}
            aria-label="To (exclusive)"
            value={filters.to ?? ''}
            onChange={(e) => update({ to: e.target.value })}
          />
        </>
      ) : null}

      <select
        className={selectClass}
        value={filters.groupId ?? ''}
        aria-label="Group"
        onChange={(e) => update({ groupId: e.target.value })}
      >
        <option value="">All groups & friends</option>
        {me?.groups.map((g) => (
          <option key={g.id} value={g.id}>
            {g.name}
            {g.archived ? ' (archived)' : ''}
          </option>
        ))}
      </select>

      {me && me.currencies.length > 1 ? (
        <div
          className="ml-auto flex rounded-md border text-sm"
          role="tablist"
          aria-label="Currency"
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
