import { useMemo } from 'react';

import type { CategoryRow } from '@shared/api-types';
import { type CategorySection, categoryLabel, sectionLabel } from '@shared/categories';

import { useScope } from '../App';
import { useApi } from '../api';
import { ChartCard } from '../components/ChartCard';
import { HBars } from '../components/charts/HBars';
import { useLocale, useT } from '../i18n';
import { integer, major, moneyMajor, percent } from '../lib/format';

export const CategoriesPage = () => {
  const t = useT();
  const locale = useLocale();
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
      .map(([section, v]) => ({
        label: sectionLabel(section, locale),
        value: v.value,
        count: v.count,
      }))
      .sort((a, b) => b.value - a.value);
  }, [rows, currency, locale]);

  const byItem = useMemo(
    () =>
      rows
        .map((r) => ({
          label: categoryLabel(r.category, locale),
          value: major(r.share, currency),
          count: r.count,
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 12),
    [rows, currency, locale],
  );

  const format = (v: number) => moneyMajor(v, currency);
  const columns = [
    { key: 'label', header: t('categories.column'), render: (r: { label: string }) => r.label },
    {
      key: 'value',
      header: t('common.your_share'),
      align: 'right' as const,
      render: (r: { value: number }) => format(r.value),
    },
    {
      key: 'pct',
      header: t('common.share_of_total'),
      align: 'right' as const,
      render: (r: { value: number }) => percent(r.value, total),
    },
    {
      key: 'count',
      header: t('common.expenses'),
      align: 'right' as const,
      render: (r: { count: number }) => integer(r.count),
    },
  ];

  return (
    <>
      <ChartCard
        title={t('categories.title', { currency })}
        subtitle={t('categories.subtitle')}
        loading={categories.loading}
        empty={0 === bySection.length}
        table={{ columns, rows: bySection, rowKey: (r) => r.label }}
      >
        <HBars data={bySection} name={t('common.your_share')} format={format} />
      </ChartCard>
      <ChartCard
        title={t('categories.top_title')}
        subtitle={t('categories.top_subtitle')}
        loading={categories.loading}
        empty={0 === byItem.length}
        table={{ columns, rows: byItem, rowKey: (r) => r.label }}
      >
        <HBars data={byItem} name={t('common.your_share')} format={format} />
      </ChartCard>
    </>
  );
};
