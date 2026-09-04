import { useMemo } from 'react';

import type { GroupMonthRow, GroupRow } from '@shared/api-types';

import { useScope } from '../App';
import { useApi } from '../api';
import { ChartCard } from '../components/ChartCard';
import { HBars } from '../components/charts/HBars';
import { StackedMonths } from '../components/charts/StackedMonths';
import { MAX_SERIES } from '../components/charts/common';
import { useT } from '../i18n';
import { integer, major, moneyMajor, monthLabel, percent } from '../lib/format';

export const GroupsPage = () => {
  const t = useT();
  const { params, currency } = useScope();
  const groups = useApi<GroupRow[]>('/spend/by-group', params);
  const groupMonths = useApi<GroupMonthRow[]>('/spend/by-group-month', params);

  const friendsLabel = t('common.friends');
  const otherLabel = t('common.other');

  const rows = useMemo(
    () =>
      (groups.data ?? [])
        .filter((r) => r.currency === currency)
        .map((r) => ({
          label: r.groupName ?? friendsLabel,
          value: major(r.share, currency),
          count: r.count,
        })),
    [groups.data, currency, friendsLabel],
  );
  const total = rows.reduce((sum, r) => sum + r.value, 0);

  // Colour follows the entity: series order is fixed by overall spend, the tail folds into "Other".
  const { series, data } = useMemo(() => {
    const top = rows.slice(0, MAX_SERIES - 1).map((r) => r.label);
    const hasOther = rows.length > top.length;
    const names = hasOther ? [...top, otherLabel] : top;
    const byMonth = new Map<string, Record<string, number | string>>();
    (groupMonths.data ?? [])
      .filter((r) => r.currency === currency)
      .forEach((r) => {
        const label = r.groupName ?? friendsLabel;
        const key = top.includes(label) ? label : otherLabel;
        const entry = byMonth.get(r.month) ?? { month: r.month };
        entry[key] = Number(entry[key] ?? 0) + major(r.share, currency);
        byMonth.set(r.month, entry);
      });
    const sorted = [...byMonth.values()].sort((a, b) =>
      String(a.month).localeCompare(String(b.month)),
    );
    return { series: names, data: sorted };
  }, [rows, groupMonths.data, currency, friendsLabel, otherLabel]);

  const format = (v: number) => moneyMajor(v, currency);

  return (
    <>
      <ChartCard
        title={t('groups.title', { currency })}
        subtitle={t('groups.subtitle')}
        loading={groups.loading}
        empty={0 === rows.length}
        table={{
          columns: [
            { key: 'label', header: t('groups.column'), render: (r) => r.label },
            {
              key: 'value',
              header: t('common.your_share'),
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
        <HBars data={rows} name={t('common.your_share')} format={format} />
      </ChartCard>
      <ChartCard
        title={t('groups.over_time')}
        subtitle={t('groups.over_time_subtitle')}
        loading={groupMonths.loading}
        empty={0 === data.length}
        table={{
          columns: [
            { key: 'month', header: t('common.month'), render: (r) => monthLabel(String(r.month)) },
            ...series.map((name) => ({
              key: name,
              header: name,
              align: 'right' as const,
              render: (r: Record<string, number | string>) => format(Number(r[name] ?? 0)),
            })),
          ],
          rows: data,
          rowKey: (r) => String(r.month),
        }}
      >
        <StackedMonths data={data} series={series} format={format} otherLabel={otherLabel} />
      </ChartCard>
    </>
  );
};
