import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import {
  AXIS_LINE,
  AXIS_TICK,
  BAR_MAX,
  BAR_RADIUS,
  GRID_STROKE,
  SERIES,
  VizTooltip,
  tickCompact,
} from './common';

export interface HBarPoint {
  label: string;
  value: number;
}

interface Props {
  data: HBarPoint[];
  name: string;
  format: (value: number) => string;
}

/** Nominal categories, one series: every bar in slot 1, value at the tip, no legend. */
export const HBars = ({ data, name, format }: Props) => (
  <ResponsiveContainer width="100%" height={Math.max(160, data.length * 34 + 32)}>
    <BarChart data={data} layout="vertical" margin={{ top: 4, right: 72, left: 8, bottom: 0 }}>
      <CartesianGrid stroke={GRID_STROKE} horizontal={false} />
      <XAxis
        type="number"
        tickFormatter={tickCompact}
        tick={AXIS_TICK}
        axisLine={AXIS_LINE}
        tickLine={false}
      />
      <YAxis
        type="category"
        dataKey="label"
        width={120}
        tick={AXIS_TICK}
        axisLine={false}
        tickLine={false}
        interval={0}
      />
      <Tooltip cursor={{ fill: 'var(--viz-hover)' }} content={<VizTooltip format={format} />} />
      <Bar dataKey="value" name={name} fill={SERIES[0]} maxBarSize={BAR_MAX} radius={BAR_RADIUS}>
        <LabelList
          dataKey="value"
          position="right"
          formatter={(v: number) => format(v)}
          style={{ fill: 'var(--viz-muted)', fontSize: 12 }}
        />
      </Bar>
    </BarChart>
  </ResponsiveContainer>
);
