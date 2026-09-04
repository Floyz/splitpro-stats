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
  COLUMN_RADIUS,
  GRID_STROKE,
  SERIES,
  VizTooltip,
  legendFormatter,
  tickCompact,
} from './common';

export interface MonthlyPoint {
  month: string;
  share: number;
  paid: number;
}

interface Props {
  data: MonthlyPoint[];
  format: (value: number) => string;
  shareName: string;
  paidName: string;
}

/** Two series (your share / you paid): grouped columns, legend + tooltip, single axis. */
export const MonthlyColumns = ({ data, format, shareName, paidName }: Props) => (
  <ResponsiveContainer width="100%" height={300}>
    <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} barGap={2}>
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
      <Bar
        dataKey="share"
        name={shareName}
        fill={SERIES[0]}
        maxBarSize={BAR_MAX}
        radius={COLUMN_RADIUS}
      />
      <Bar
        dataKey="paid"
        name={paidName}
        fill={SERIES[1]}
        maxBarSize={BAR_MAX}
        radius={COLUMN_RADIUS}
      />
    </BarChart>
  </ResponsiveContainer>
);
