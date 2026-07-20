import {
  describe,
  expect,
  it,
} from 'vitest';

import {
  createSourceFingerprint,
  createVariantKey,
} from './exportMetadata.identity.ts';
import { createRangeKey } from './exportMetadata.normalize.ts';

describe('export metadata identity', () => {
  it('produces stable source fingerprint for the same source path', () => {
    const sourcePath = '/videos/source.mp4';

    expect(createSourceFingerprint(sourcePath)).toBe(createSourceFingerprint(sourcePath));
  });

  it('produces distinct variant keys for different track selections', () => {
    const fastTrackSelection = createVariantKey({
      trimMode: 'fast',
      selectedAudioTrackIndices: [0],
      mutedAudioTrackIndices: [],
    });
    const mixedTrackSelection = createVariantKey({
      trimMode: 'fast',
      selectedAudioTrackIndices: [0, 1],
      mutedAudioTrackIndices: [],
    });

    expect(fastTrackSelection).not.toBe(mixedTrackSelection);
  });

  it('keeps millisecond-different ranges as distinct identities', () => {
    const firstRange = createRangeKey({
      startMs: 1000,
      endMs: 2000,
      durationMs: 1000,
    });
    const secondRange = createRangeKey({
      startMs: 1001,
      endMs: 2001,
      durationMs: 1000,
    });

    expect(firstRange).not.toBe(secondRange);
  });
});
