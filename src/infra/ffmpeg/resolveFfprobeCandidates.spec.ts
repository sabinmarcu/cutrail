import {
  describe,
  expect,
  it,
} from 'vitest';

import { resolveFfprobeCandidates } from './resolveFfprobeCandidates.ts';

describe('resolveFfprobeCandidates', () => {
  it('prioritizes system ffprobe, ffmpeg sibling, then bundled ffprobe in auto mode', () => {
    const candidates = resolveFfprobeCandidates();

    expect(candidates[0]).toBe('ffprobe');
    expect(candidates).toContain('ffprobe');
  });
});
