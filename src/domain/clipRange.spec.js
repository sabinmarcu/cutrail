import { describe, expect, it } from 'vitest';

import { normalizeRange } from './clipRange';

describe('normalizeRange', () => {
  it('orders inverted ranges and calculates duration', () => {
    expect(normalizeRange(12, 3)).toEqual({
      start: 3,
      end: 12,
      duration: 9,
    });
  });

  it('clamps negative start values at zero', () => {
    expect(normalizeRange(-4, 6)).toEqual({
      start: 0,
      end: 6,
      duration: 6,
    });
  });
});
