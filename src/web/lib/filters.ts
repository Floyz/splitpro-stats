import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router';

import type { TranslationKey } from '../i18n';

export type Preset = 'year' | '12m' | '30d' | 'all' | 'custom';

export interface Filters {
  preset: Preset;
  from?: string;
  to?: string;
  groupId?: number;
  currency?: string;
}

const iso = (d: Date) => d.toISOString().slice(0, 10);

/** Resolves a preset to an inclusive `from` / exclusive `to` pair (UTC dates). */
export const presetRange = (preset: Preset, now = new Date()): { from?: string; to?: string } => {
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const tomorrow = new Date(today);
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);

  switch (preset) {
    case 'year':
      return { from: `${today.getUTCFullYear()}-01-01`, to: iso(tomorrow) };
    case '12m': {
      const from = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() - 11, 1));
      return { from: iso(from), to: iso(tomorrow) };
    }
    case '30d': {
      const from = new Date(today);
      from.setUTCDate(from.getUTCDate() - 30);
      return { from: iso(from), to: iso(tomorrow) };
    }
    default:
      return {};
  }
};

export const PRESET_KEYS: Record<Preset, TranslationKey> = {
  year: 'preset.year',
  '12m': 'preset.12m',
  '30d': 'preset.30d',
  all: 'preset.all',
  custom: 'preset.custom',
};

/** Filters live in the URL so `/stats?groupId=3` deep links from SplitPro work. */
export const useFilters = () => {
  const [params, setParams] = useSearchParams();

  const filters = useMemo<Filters>(() => {
    const preset = (params.get('range') as Preset | null) ?? '12m';
    const groupId = Number(params.get('groupId'));
    const custom = 'custom' === preset;
    const range = custom
      ? { from: params.get('from') ?? undefined, to: params.get('to') ?? undefined }
      : presetRange(preset);
    return {
      preset,
      ...range,
      groupId: Number.isInteger(groupId) && groupId > 0 ? groupId : undefined,
      currency: params.get('currency') ?? undefined,
    };
  }, [params]);

  const update = useCallback(
    (
      patch: Partial<Record<'range' | 'from' | 'to' | 'groupId' | 'currency', string | undefined>>,
    ) => {
      const next = new URLSearchParams(params);
      Object.entries(patch).forEach(([key, value]) => {
        if (value) {
          next.set(key, value);
        } else {
          next.delete(key);
        }
      });
      setParams(next, { replace: true });
    },
    [params, setParams],
  );

  return { filters, update };
};
