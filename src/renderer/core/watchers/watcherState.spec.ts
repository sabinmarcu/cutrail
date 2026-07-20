import {
  describe,
  expect,
  it,
} from 'vitest';
import { isWatcherRevisionAccepted } from './watcherState';

describe('watcherState revision acceptance', () => {
  it('accepts strictly increasing revisions', () => {
    expect(isWatcherRevisionAccepted(-1, 0)).toBe(true);
    expect(isWatcherRevisionAccepted(0, 1)).toBe(true);
    expect(isWatcherRevisionAccepted(4, 5)).toBe(true);
  });

  it('rejects stale and invalid revisions', () => {
    expect(isWatcherRevisionAccepted(5, 5)).toBe(false);
    expect(isWatcherRevisionAccepted(5, 4)).toBe(false);
    expect(isWatcherRevisionAccepted(5, Number.NaN)).toBe(false);
    expect(isWatcherRevisionAccepted(5, 5.25)).toBe(false);
  });
});
