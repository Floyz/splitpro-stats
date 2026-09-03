import { useMemo } from 'react';

import type { PayerRow } from '@shared/api-types';

import { useScope } from '../App';
import { useApi } from '../api';
import { ChartCard } from '../components/ChartCard';
import { HBars } from '../components/charts/HBars';
import { integer, major, moneyMajor, percent } from '../lib/format';

export const PayersPage = () => {
  const { params, currency, me } = useScope();
  const payers = useApi<PayerRow[]>('/payers', params);

  const rows = useMemo(
    () =>
      (payers.data ?? [])
        .filter((r) => r.currency === currency)
        .map((r) => ({
          label: r.payerId === me?.user.id ? `${r.payerName} (you)` : r.payerName,
          value: major(r.paid, currency),
          count: r.count,
        })),
    [payers.data, currency, me?.user.id],
  );
  const total = rows.reduce((sum, r) => sum + r.value, 0);
  const format = (v: number) => moneyMajor(v, currency);

  return (
    <ChartCard
      title={`Who pays (${currency})`}
      subtitle="Total amount fronted by each payer, across the expenses you take part in"
      loading={payers.loading}
      empty={0 === rows.length}
      table={{
        columns: [
          { key: 'label', header: 'Payer', render: (r) => r.label },
          { key: 'value', header: 'Paid', align: 'right', render: (r) => format(r.value) },
          {
            key: 'pct',
            header: 'Share of total',
            align: 'right',
            render: (r) => percent(r.value, total),
          },
          { key: 'count', header: 'Expenses', align: 'right', render: (r) => integer(r.count) },
        ],
        rows,
        rowKey: (r) => r.label,
      }}
    >
      <HBars data={rows} name="Paid" format={format} />
    </ChartCard>
  );
};
