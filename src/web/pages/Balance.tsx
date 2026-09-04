import { useMemo } from 'react';

import type { BalancePoint } from '@shared/api-types';

import { useScope } from '../App';
import { useApi } from '../api';
import { ChartCard } from '../components/ChartCard';
import { BalanceLine } from '../components/charts/BalanceLine';
import { useT } from '../i18n';
import { dateLabel, major, moneyMajor } from '../lib/format';

export const BalancePage = () => {
  const t = useT();
  const { params, currency } = useScope();
  // Running balance needs the full history; the date range only windows the display.
  const history = useApi<BalancePoint[]>('/balance/history', { groupId: params.groupId, currency });

  const points = useMemo(() => {
    const all = (history.data ?? [])
      .filter((p) => p.currency === currency)
      .map((p) => ({ day: p.day, balance: major(p.balance, currency) }));
    const from = params.from;
    const to = params.to;
    if (!from && !to) {
      return all;
    }
    // Keep the last point before the window so the line starts at the right level.
    const before = all.filter((p) => from && p.day < from);
    const inside = all.filter((p) => (!from || p.day >= from) && (!to || p.day < to));
    const carry = before.at(-1);
    return carry && from ? [{ ...carry, day: from }, ...inside] : inside;
  }, [history.data, currency, params.from, params.to]);

  const last = points.at(-1);
  const format = (v: number) => moneyMajor(v, currency);
  const subtitle = last
    ? `${t('balance.subtitle')}. ${t('balance.latest', { value: format(last.balance) })}`
    : t('balance.subtitle');

  return (
    <ChartCard
      title={t('balance.title', { currency })}
      subtitle={subtitle}
      loading={history.loading}
      empty={0 === points.length}
      table={{
        columns: [
          { key: 'day', header: t('common.date'), render: (p) => dateLabel(p.day) },
          {
            key: 'balance',
            header: t('common.net_balance'),
            align: 'right',
            render: (p) => format(p.balance),
          },
        ],
        rows: [...points].reverse(),
        rowKey: (p) => p.day,
      }}
    >
      <BalanceLine data={points} format={format} name={t('common.net_balance')} />
    </ChartCard>
  );
};
