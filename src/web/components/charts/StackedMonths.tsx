import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { monthLabel } from '../../lib/format';
import {
  AXIS_LINE,
  AXIS_TICK,
  BAR_MAX,
  GRID_STROKE,
  SERIES,
  SERIES_OTHER,
  VizTooltip,
  legendFormatter,
  tickCompact,
} from './common';

interface Props {
  /** One object per month; one key per series name. */
  data: Array<Record<string, number | string>>;
  /** Series names in fixed order (the last one may be "Other"). */
  series: string[];
  format: (value: number) => string;
  /** Label of the folded tail series (rendered in the neutral colour). */
  otherLabel: string;
}

/** Part-to-whole over time: stacked columns, 2px surface gap between segments, fixed colour order. */
export const StackedMonths = ({ data, series, format, otherLabel }: Props) => (
  <ResponsiveContainer width="100%" height={300}>
    <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
      <CartesianGrid stroke={GRID_STROKE} vertical={false} />
      <XAxis
        dataKey="month"
        tickFormatter={(m: string) => monthLabel(m, true)}
        tick={AXIS_TICK}
        axisLine={AXIS_LINE}
        tickLine={false}
        minTickGap={16}
      />
      <YAxis
        tickFormatter={tickCompact}
        tick={AXIS_TICK}
        axisLine={false}
        tickLine={false}
        width={48}
      />
      <Tooltip
        cursor={{ fill: 'var(--viz-hover)' }}
        content={<VizTooltip format={format} labelFormat={(m) => monthLabel(m)} />}
      />
      <Legend formatter={legendFormatter} iconType="rect" iconSize={10} />
      {series.map((name, index) => (
        <Bar
          key={name}
          dataKey={name}
          stackId="month"
          fill={otherLabel === name ? SERIES_OTHER : (SERIES[index] ?? SERIES_OTHER)}
          stroke="var(--card)"
          strokeWidth={2}
          maxBarSize={BAR_MAX}
        />
      ))}
    </BarChart>
  </ResponsiveContainer>
);
