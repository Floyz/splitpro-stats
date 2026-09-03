import { useMemo } from 'react';

import type { MonthRow, SummaryRow } from '@shared/api-types';

import { useScope } from '../App';
import { useApi } from '../api';
import { ChartCard } from '../components/ChartCard';
import { StatTile } from '../components/StatTile';
import { MonthlyColumns } from '../components/charts/MonthlyColumns';
import { integer, major, money, moneyCompact, moneyMajor, monthLabel } from '../lib/format';

export const OverviewPage = () => {
  const { params, currency } = useScope();
  const summary = useApi<SummaryRow[]>('/summary', params);
  const months = useApi<MonthRow[]>('/spend/by-month', params);

  const row = summary.data?.find((r) => r.currency === currency);
  const points = useMemo(
    () =>
      (months.data ?? [])
        .filter((m) => m.currency === currency)
        .map((m) => ({
          month: m.month,
          share: major(m.share, currency),
          paid: major(m.paid, currency),
        })),
    [months.data, currency],
  );
  const monthCount = points.length;
  const avg = row && monthCount ? Number(BigInt(row.share) / BigInt(monthCount)) : 0;
  const balance = row ? BigInt(row.balance) : 0n;

  return (
    <>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatTile
          label="Your share"
          value={row ? moneyCompact(row.share, currency) : '–'}
          hint={row ? `${integer(row.count)} expenses` : undefined}
        />
        <StatTile
          label="You paid"
          value={row ? moneyCompact(row.paid, currency) : '–'}
          hint="Amounts you fronted"
        />
        <StatTile
          label="Average per month"
          value={row && monthCount ? moneyCompact(avg, currency) : '–'}
          hint={row?.firstMonth ? `since ${monthLabel(row.firstMonth)}` : undefined}
        />
        <StatTile
          label="Net balance"
          value={row ? money(row.balance, currency) : '–'}
          hint={balance > 0n ? 'Others owe you' : balance < 0n ? 'You owe others' : 'Settled up'}
          tone={balance > 0n ? 'positive' : balance < 0n ? 'negative' : 'default'}
        />
      </div>

      <ChartCard
        title={`Monthly spending (${currency})`}
        subtitle="Your share of each expense versus what you paid"
        loading={months.loading}
        empty={0 === points.length}
        table={{
          columns: [
            { key: 'month', header: 'Month', render: (p) => monthLabel(p.month) },
            {
              key: 'share',
              header: 'Your share',
              align: 'right',
              render: (p) => moneyMajor(p.share, currency),
            },
            {
              key: 'paid',
              header: 'You paid',
              align: 'right',
              render: (p) => moneyMajor(p.paid, currency),
            },
          ],
          rows: points,
          rowKey: (p) => p.month,
        }}
      >
        <MonthlyColumns data={points} format={(v) => moneyMajor(v, currency)} />
      </ChartCard>
    </>
  );
};
