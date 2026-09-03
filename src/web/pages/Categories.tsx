import { useMemo } from 'react';

import type { CategoryRow } from '@shared/api-types';
import { type CategorySection, categoryLabel, sectionLabel } from '@shared/categories';

import { useScope } from '../App';
import { useApi } from '../api';
import { ChartCard } from '../components/ChartCard';
import { HBars } from '../components/charts/HBars';
import { integer, major, moneyMajor, percent } from '../lib/format';

export const CategoriesPage = () => {
  const { params, currency } = useScope();
  const categories = useApi<CategoryRow[]>('/spend/by-category', params);

  const rows = useMemo(
    () => (categories.data ?? []).filter((r) => r.currency === currency),
    [categories.data, currency],
  );
  const total = rows.reduce((sum, r) => sum + major(r.share, currency), 0);

  const bySection = useMemo(() => {
    const acc = new Map<CategorySection, { value: number; count: number }>();
    rows.forEach((r) => {
      const section = r.section as CategorySection;
      const cur = acc.get(section) ?? { value: 0, count: 0 };
      acc.set(section, { value: cur.value + major(r.share, currency), count: cur.count + r.count });
    });
    return [...acc.entries()]
      .map(([section, v]) => ({ label: sectionLabel(section), value: v.value, count: v.count }))
      .sort((a, b) => b.value - a.value);
  }, [rows, currency]);

  const byItem = useMemo(
    () =>
      rows
        .map((r) => ({
          label: categoryLabel(r.category),
          value: major(r.share, currency),
          count: r.count,
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 12),
    [rows, currency],
  );

  const format = (v: number) => moneyMajor(v, currency);
  const columns = [
    { key: 'label', header: 'Category', render: (r: { label: string }) => r.label },
    {
      key: 'value',
      header: 'Your share',
      align: 'right' as const,
      render: (r: { value: number }) => format(r.value),
    },
    {
      key: 'pct',
      header: 'Share of total',
      align: 'right' as const,
      render: (r: { value: number }) => percent(r.value, total),
    },
    {
      key: 'count',
      header: 'Expenses',
      align: 'right' as const,
      render: (r: { count: number }) => integer(r.count),
    },
  ];

  return (
    <>
      <ChartCard
        title={`By category (${currency})`}
        subtitle="Your share, grouped by category section"
        loading={categories.loading}
        empty={0 === bySection.length}
        table={{ columns, rows: bySection, rowKey: (r) => r.label }}
      >
        <HBars data={bySection} name="Your share" format={format} />
      </ChartCard>
      <ChartCard
        title="Top sub-categories"
        subtitle="Twelve largest, by your share"
        loading={categories.loading}
        empty={0 === byItem.length}
        table={{ columns, rows: byItem, rowKey: (r) => r.label }}
      >
        <HBars data={byItem} name="Your share" format={format} />
      </ChartCard>
    </>
  );
};
