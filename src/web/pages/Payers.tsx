import { useMemo } from 'react';

import type { PayerRow } from '@shared/api-types';

import { useScope } from '../App';
import { useApi } from '../api';
import { ChartCard } from '../components/ChartCard';
import { HBars } from '../components/charts/HBars';
import { useT } from '../i18n';
import { integer, major, moneyMajor, percent } from '../lib/format';

export const PayersPage = () => {
  const t = useT();
  const { params, currency, me } = useScope();
  const payers = useApi<PayerRow[]>('/payers', params);
  const youLabel = t('common.you');

  const rows = useMemo(
    () =>
      (payers.data ?? [])
        .filter((r) => r.currency === currency)
        .map((r) => ({
          label: r.payerId === me?.user.id ? `${r.payerName} ${youLabel}` : r.payerName,
          value: major(r.paid, currency),
          count: r.count,
        })),
    [payers.data, currency, me?.user.id, youLabel],
  );
  const total = rows.reduce((sum, r) => sum + r.value, 0);
  const format = (v: number) => moneyMajor(v, currency);

  return (
    <ChartCard
      title={t('payers.title', { currency })}
      subtitle={t('payers.subtitle')}
      loading={payers.loading}
      empty={0 === rows.length}
      table={{
        columns: [
          { key: 'label', header: t('payers.column'), render: (r) => r.label },
          {
            key: 'value',
            header: t('common.paid'),
            align: 'right',
            render: (r) => format(r.value),
          },
          {
            key: 'pct',
            header: t('common.share_of_total'),
            align: 'right',
            render: (r) => percent(r.value, total),
          },
          {
            key: 'count',
            header: t('common.expenses'),
            align: 'right',
            render: (r) => integer(r.count),
          },
        ],
        rows,
        rowKey: (r) => r.label,
      }}
    >
      <HBars data={rows} name={t('common.paid')} format={format} />
    </ChartCard>
  );
};
