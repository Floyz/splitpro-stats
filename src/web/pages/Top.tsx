import type { TopExpenseRow } from '@shared/api-types';
import { categoryLabel } from '@shared/categories';

import { useScope } from '../App';
import { useApi } from '../api';
import { dateLabel, money } from '../lib/format';

export const TopPage = () => {
  const { params, currency } = useScope();
  const top = useApi<TopExpenseRow[]>('/expenses/top', { ...params, limit: 30 });
  const rows = (top.data ?? []).filter((r) => r.currency === currency);

  return (
    <section className="bg-card rounded-xl border p-4">
      <h2 className="font-semibold">Largest expenses ({currency})</h2>
      <p className="text-muted-foreground mb-3 text-sm">Ranked by your share</p>
      <div
        className={['overflow-x-auto transition-opacity', top.loading ? 'opacity-50' : ''].join(
          ' ',
        )}
      >
        {0 === rows.length && !top.loading ? (
          <p className="text-muted-foreground py-10 text-center text-sm">
            No data for this selection.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-muted-foreground border-b text-left">
                <th className="py-1 pr-3 font-medium">Date</th>
                <th className="py-1 pr-3 font-medium">Expense</th>
                <th className="py-1 pr-3 font-medium">Category</th>
                <th className="py-1 pr-3 font-medium">Group</th>
                <th className="py-1 pr-3 font-medium">Paid by</th>
                <th className="py-1 pr-3 text-right font-medium">Total</th>
                <th className="py-1 text-right font-medium">Your share</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b last:border-0">
                  <td className="py-1 pr-3 whitespace-nowrap">{dateLabel(r.expenseDate)}</td>
                  <td className="py-1 pr-3">{r.name}</td>
                  <td className="py-1 pr-3">{categoryLabel(r.category)}</td>
                  <td className="py-1 pr-3">{r.groupName ?? 'Friends'}</td>
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
