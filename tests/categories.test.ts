import { describe, expect, it } from 'vitest';

import { categoryLabel, resolveCategory } from '../src/shared/categories';

describe('categories', () => {
  it('resolves leaf items to their section', () => {
    expect(resolveCategory('groceries')).toEqual({ section: 'food', item: 'groceries' });
    expect(resolveCategory('taxi')).toEqual({ section: 'travel', item: 'taxi' });
  });

  it('treats a stored section name as "other" of that section', () => {
    expect(resolveCategory('food')).toEqual({ section: 'food', item: 'other' });
    expect(categoryLabel('food')).toBe('Food & Drinks');
  });

  it('falls back to general', () => {
    expect(resolveCategory(null)).toEqual({ section: 'general', item: 'other' });
    expect(resolveCategory('unknown')).toEqual({ section: 'general', item: 'other' });
    expect(categoryLabel('general')).toBe('General');
  });
});
