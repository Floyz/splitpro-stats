import type { TopExpenseRow } from '@shared/api-types';
import { categoryLabel } from '@shared/categories';

import { useScope } from '../App';
import { useApi } from '../api';
import { useLocale, useT } from '../i18n';
import { dateLabel, money } from '../lib/format';

export const TopPage = () => {
  const t = useT();
  const locale = useLocale();
  const { params, currency } = useScope();
  const top = useApi<TopExpenseRow[]>('/expenses/top', { ...params, limit: 30 });
  const rows = (top.data ?? []).filter((r) => r.currency === currency);

  return (
    <section className="bg-card rounded-xl border p-4">
      <h2 className="font-semibold">{t('top.title', { currency })}</h2>
      <p className="text-muted-foreground mb-3 text-sm">{t('top.subtitle')}</p>
      <div
        className={['overflow-x-auto transition-opacity', top.loading ? 'opacity-50' : ''].join(
          ' ',
        )}
      >
        {0 === rows.length && !top.loading ? (
          <p className="text-muted-foreground py-10 text-center text-sm">{t('chart.no_data')}</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-muted-foreground border-b text-left">
                <th className="py-1 pr-3 font-medium">{t('common.date')}</th>
                <th className="py-1 pr-3 font-medium">{t('top.expense')}</th>
                <th className="py-1 pr-3 font-medium">{t('categories.column')}</th>
                <th className="py-1 pr-3 font-medium">{t('groups.column')}</th>
                <th className="py-1 pr-3 font-medium">{t('top.paid_by')}</th>
                <th className="py-1 pr-3 text-right font-medium">{t('top.total')}</th>
                <th className="py-1 text-right font-medium">{t('common.your_share')}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b last:border-0">
                  <td className="py-1 pr-3 whitespace-nowrap">{dateLabel(r.expenseDate)}</td>
                  <td className="py-1 pr-3">{r.name}</td>
                  <td className="py-1 pr-3">{categoryLabel(r.category, locale)}</td>
                  <td className="py-1 pr-3">{r.groupName ?? t('common.friends')}</td>
                  <td className="py-1 pr-3">{r.payerName ?? '–'}</td>
                  <td className="tabular py-1 pr-3 text-right">{money(r.amount, currency)}</td>
                  <td className="tabular py-1 text-right font-medium">
                    {money(r.share, currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
};
