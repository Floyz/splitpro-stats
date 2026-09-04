import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { dateLabel } from '../../lib/format';
import { AXIS_LINE, AXIS_TICK, GRID_STROKE, SERIES, VizTooltip, tickCompact } from './common';

export interface BalancePointMajor {
  day: string;
  balance: number;
}

interface Props {
  data: BalancePointMajor[];
  format: (value: number) => string;
  name: string;
}

/** Single series over time vs a zero baseline: 2px line, 10% area wash, crosshair tooltip. */
export const BalanceLine = ({ data, format, name }: Props) => (
  <ResponsiveContainer width="100%" height={300}>
    <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
      <CartesianGrid stroke={GRID_STROKE} vertical={false} />
      <XAxis
        dataKey="day"
        tickFormatter={(d: string) => dateLabel(d)}
        tick={AXIS_TICK}
        axisLine={AXIS_LINE}
        tickLine={false}
        minTickGap={32}
      />
      <YAxis
        tickFormatter={tickCompact}
        tick={AXIS_TICK}
        axisLine={false}
        tickLine={false}
        width={56}
      />
      <ReferenceLine y={0} stroke="var(--viz-axis)" />
      <Tooltip
        cursor={{ stroke: 'var(--viz-axis)', strokeWidth: 1 }}
        content={<VizTooltip format={format} labelFormat={(d) => dateLabel(d)} />}
      />
      <Area
        type="stepAfter"
        dataKey="balance"
        name={name}
        stroke={SERIES[0]}
        strokeWidth={2}
        fill={SERIES[0]}
        fillOpacity={0.1}
        dot={false}
        activeDot={{ r: 4, stroke: 'var(--card)', strokeWidth: 2 }}
      />
    </AreaChart>
  </ResponsiveContainer>
);
