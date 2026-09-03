import { describe, expect, it } from 'vitest';

import { filterParams, filtersSchema } from '../src/server/filters';
import { presetRange } from '../src/web/lib/filters';

describe('filters', () => {
  it('parses and validates query params', () => {
    const f = filtersSchema.parse({ from: '2026-01-01', groupId: '3', currency: 'EUR' });
    expect(filterParams(42, f)).toEqual([42, '2026-01-01', null, 3, 'EUR']);
    expect(f.limit).toBe(20);
  });

  it('rejects malformed input', () => {
    expect(() => filtersSchema.parse({ from: '01/01/2026' })).toThrow();
    expect(() => filtersSchema.parse({ currency: 'eur' })).toThrow();
    expect(() => filtersSchema.parse({ limit: '500' })).toThrow();
  });

  it('resolves presets to [from, to) windows', () => {
    const now = new Date('2026-09-03T10:00:00Z');
    expect(presetRange('year', now)).toEqual({ from: '2026-01-01', to: '2026-09-04' });
    expect(presetRange('12m', now)).toEqual({ from: '2025-10-01', to: '2026-09-04' });
    expect(presetRange('30d', now)).toEqual({ from: '2026-08-04', to: '2026-09-04' });
    expect(presetRange('all', now)).toEqual({});
  });
});
