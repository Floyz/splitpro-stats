import type { TooltipProps } from 'recharts';

import { compactNumber } from '../../lib/format';

/** Categorical slots in fixed order (never cycled): a 7th+ series folds into "Other". */
export const SERIES = [
  'var(--series-1)',
  'var(--series-2)',
  'var(--series-3)',
  'var(--series-4)',
  'var(--series-5)',
  'var(--series-6)',
] as const;
export const SERIES_OTHER = 'var(--series-other)';
export const MAX_SERIES = SERIES.length;

export const AXIS_TICK = { fill: 'var(--viz-muted)', fontSize: 12 } as const;
export const AXIS_LINE = { stroke: 'var(--viz-axis)' } as const;
export const GRID_STROKE = 'var(--viz-grid)';
export const BAR_MAX = 24;
export const COLUMN_RADIUS: [number, number, number, number] = [4, 4, 0, 0];
export const BAR_RADIUS: [number, number, number, number] = [0, 4, 4, 0];

export const tickCompact = (value: number) => compactNumber(value);

/** Legend text wears text tokens, never the series colour. */
export const legendFormatter = (value: string) => (
  <span className="text-foreground text-xs">{value}</span>
);

interface VizTooltipProps extends TooltipProps<number, string> {
  format: (value: number) => string;
  labelFormat?: (label: string) => string;
}

/** Values lead, labels follow; series keyed by a short line of its colour. */
export const VizTooltip = ({ active, payload, label, format, labelFormat }: VizTooltipProps) => {
  if (!active || !payload?.length) {
    return null;
  }
  return (
    <div className="bg-card rounded-md border px-3 py-2 text-xs shadow-md">
      <div className="text-muted-foreground mb-1">
        {labelFormat ? labelFormat(String(label)) : String(label)}
      </div>
      {payload.map((entry) => (
        <div key={String(entry.dataKey)} className="flex items-center gap-2">
          <span
            className="inline-block h-0.5 w-3 rounded"
            style={{ backgroundColor: entry.color ?? 'var(--series-1)' }}
          />
          <span className="text-foreground font-semibold">{format(Number(entry.value ?? 0))}</span>
          <span className="text-muted-foreground">{entry.name}</span>
        </div>
      ))}
    </div>
  );
};
