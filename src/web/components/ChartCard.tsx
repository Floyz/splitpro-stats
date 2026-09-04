import { type ReactNode, useState } from 'react';

import { useT } from '../i18n';

export interface TableColumn<Row> {
  key: string;
  header: string;
  align?: 'left' | 'right';
  render: (row: Row) => ReactNode;
}

interface ChartCardProps<Row> {
  title: string;
  subtitle?: string;
  loading?: boolean;
  empty?: boolean;
  children: ReactNode;
  /** Table twin of the chart: every value readable without hovering (accessibility). */
  table?: { columns: TableColumn<Row>[]; rows: Row[]; rowKey: (row: Row) => string };
}

export const ChartCard = <Row,>({
  title,
  subtitle,
  loading,
  empty,
  children,
  table,
}: ChartCardProps<Row>) => {
  const t = useT();
  const [view, setView] = useState<'chart' | 'table'>('chart');

  return (
    <section className="bg-card flex flex-col gap-3 rounded-xl border p-4">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-semibold">{title}</h2>
          {subtitle ? <p className="text-muted-foreground text-sm">{subtitle}</p> : null}
        </div>
        {table ? (
          <div className="flex rounded-md border text-xs">
            {(['chart', 'table'] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setView(v)}
                className={[
                  'px-2 py-1',
                  view === v ? 'bg-muted font-medium' : 'text-muted-foreground',
                ].join(' ')}
                aria-pressed={view === v}
              >
                {t('chart' === v ? 'chart.view_chart' : 'chart.view_table')}
              </button>
            ))}
          </div>
        ) : null}
      </header>

      {/* Refetch keeps the frame: previous render at reduced opacity, no skeleton flash. */}
      <div className={['transition-opacity', loading ? 'opacity-50' : ''].join(' ')}>
        {empty && !loading ? (
          <p className="text-muted-foreground py-10 text-center text-sm">{t('chart.no_data')}</p>
        ) : 'table' === view && table ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-muted-foreground border-b text-left">
                  {table.columns.map((col) => (
                    <th
                      key={col.key}
                      className={[
                        'py-1 pr-3 font-medium',
                        'right' === col.align ? 'text-right' : '',
                      ].join(' ')}
                    >
                      {col.header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {table.rows.map((row) => (
                  <tr key={table.rowKey(row)} className="border-b last:border-0">
                    {table.columns.map((col) => (
                      <td
                        key={col.key}
                        className={[
                          'py-1 pr-3',
                          'right' === col.align ? 'tabular text-right' : '',
                        ].join(' ')}
                      >
                        {col.render(row)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          children
        )}
      </div>
    </section>
  );
};
