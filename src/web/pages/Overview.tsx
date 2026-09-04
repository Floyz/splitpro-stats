import { useMemo } from 'react';

import type { MonthRow, SummaryRow } from '@shared/api-types';

import { useScope } from '../App';
import { useApi } from '../api';
import { ChartCard } from '../components/ChartCard';
import { StatTile } from '../components/StatTile';
import { MonthlyColumns } from '../components/charts/MonthlyColumns';
import { useT } from '../i18n';
import { integer, major, money, moneyCompact, moneyMajor, monthLabel } from '../lib/format';

export const OverviewPage = () => {
  const t = useT();
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
          label={t('common.your_share')}
          value={row ? moneyCompact(row.share, currency) : '–'}
          hint={row ? t('overview.expenses_count', { count: integer(row.count) }) : undefined}
        />
        <StatTile
          label={t('common.you_paid')}
          value={row ? moneyCompact(row.paid, currency) : '–'}
          hint={t('overview.you_paid_hint')}
        />
        <StatTile
          label={t('overview.avg_month')}
          value={row && monthCount ? moneyCompact(avg, currency) : '–'}
          hint={
            row?.firstMonth ? t('overview.since', { month: monthLabel(row.firstMonth) }) : undefined
          }
        />
        <StatTile
          label={t('common.net_balance')}
          value={row ? money(row.balance, currency) : '–'}
          hint={
            balance > 0n
              ? t('overview.owed_to_you')
              : balance < 0n
                ? t('overview.you_owe')
                : t('overview.settled')
          }
          tone={balance > 0n ? 'positive' : balance < 0n ? 'negative' : 'default'}
        />
      </div>

      <ChartCard
        title={t('overview.monthly_title', { currency })}
        subtitle={t('overview.monthly_subtitle')}
        loading={months.loading}
        empty={0 === points.length}
        table={{
          columns: [
            { key: 'month', header: t('common.month'), render: (p) => monthLabel(p.month) },
            {
              key: 'share',
              header: t('common.your_share'),
              align: 'right',
              render: (p) => moneyMajor(p.share, currency),
            },
            {
              key: 'paid',
              header: t('common.you_paid'),
              align: 'right',
              render: (p) => moneyMajor(p.paid, currency),
            },
          ],
          rows: points,
          rowKey: (p) => p.month,
        }}
      >
        <MonthlyColumns
          data={points}
          format={(v) => moneyMajor(v, currency)}
          shareName={t('common.your_share')}
          paidName={t('common.you_paid')}
        />
      </ChartCard>
    </>
  );
};
