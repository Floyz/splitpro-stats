interface StatTileProps {
  label: string;
  value: string;
  hint?: string;
  tone?: 'default' | 'positive' | 'negative';
}

/** Stat tile: label (sentence case) · value (semibold, proportional figures) · optional hint. */
export const StatTile = ({ label, value, hint, tone = 'default' }: StatTileProps) => (
  <div className="bg-card flex min-w-0 flex-col gap-1 rounded-xl border p-4">
    <span className="text-muted-foreground text-sm">{label}</span>
    <span
      className={[
        'truncate text-2xl font-semibold',
        'positive' === tone ? 'text-positive' : 'negative' === tone ? 'text-negative' : '',
      ].join(' ')}
    >
      {value}
    </span>
    {hint ? <span className="text-muted-foreground text-xs">{hint}</span> : null}
  </div>
);
