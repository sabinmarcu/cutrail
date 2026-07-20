import {
  describe,
  expect,
  it,
} from 'vitest';
import { deriveClipEntries } from './clipping.variants';
import type {
  ClipRange,
  ExistingClip,
} from './clipping.types';

const baseRange = (overrides: Partial<ClipRange>): ClipRange => ({
  id: 'range-1',
  start: 10,
  end: 14,
  ...overrides,
});

const baseClip = (overrides: Partial<ExistingClip>): ExistingClip => ({
  fileName: 'clip.mp4',
  filePath: '/tmp/clip.mp4',
  modifiedAtMs: 1,
  sourceName: 'source',
  trimMode: 'fast',
  range: {
    start: 10,
    end: 14,
    duration: 4,
  },
  extension: 'mp4',
  metadata: null,
  metadataPresence: 'legacy',
  classificationKind: 'legacy',
  identityKeys: {
    clipId: null,
    planId: null,
    sourceFingerprint: null,
    variantKey: null,
    rangeKey: null,
  },
  selectedAudioTrackIndices: [],
  mutedAudioTrackIndices: [],
  ...overrides,
});

describe('deriveClipEntries', () => {
  it('keeps millisecond-adjacent exported clips attached to their own ranges', () => {
    const firstRange = baseRange({
      id: 'range-1',
      start: 10.001,
      end: 14.001,
    });
    const secondRange = baseRange({
      id: 'range-2',
      start: 10.999,
      end: 14.999,
    });

    const firstClip = baseClip({
      fileName: 'clip-1.mp4',
      filePath: '/tmp/clip-1.mp4',
      range: {
        start: firstRange.start,
        end: firstRange.end,
        duration: firstRange.end - firstRange.start,
      },
    });
    const secondClip = baseClip({
      fileName: 'clip-2.mp4',
      filePath: '/tmp/clip-2.mp4',
      range: {
        start: secondRange.start,
        end: secondRange.end,
        duration: secondRange.end - secondRange.start,
      },
    });

    const entries = deriveClipEntries({
      clipStatusMap: {},
      defaultTrimMode: 'fast',
      draftClipVariants: [],
      existingClips: [firstClip, secondClip],
      planJobs: new Map(),
      progressById: {},
      ranges: [firstRange, secondRange],
      selectedVariantId: null,
    });

    expect(entries).toHaveLength(2);
    expect(entries[0]?.existingClips).toHaveLength(1);
    expect(entries[0]?.existingClips[0]?.filePath).toBe(firstClip.filePath);
    expect(entries[1]?.existingClips).toHaveLength(1);
    expect(entries[1]?.existingClips[0]?.filePath).toBe(secondClip.filePath);
  });

  it('merges a lone legacy on-disk clip with a lone draft variant in the same range', () => {
    const range = baseRange({
      id: 'range-1',
      start: 0,
      end: 5,
    });

    const legacyClip = baseClip({
      fileName: 'clip-legacy.mp4',
      filePath: '/tmp/clip-legacy.mp4',
      trimMode: 'accurate',
      classificationKind: 'legacy',
      metadataPresence: 'legacy',
      range: {
        start: 0,
        end: 5,
        duration: 5,
      },
      // Legacy clips may not carry identity keys matching draft variant keys.
      identityKeys: {
        clipId: null,
        planId: null,
        sourceFingerprint: null,
        variantKey: null,
        rangeKey: null,
      },
    });

    const entries = deriveClipEntries({
      clipStatusMap: {
        'draft-1': 'DRAFT',
      },
      defaultTrimMode: 'accurate',
      draftClipVariants: [
        {
          id: 'draft-1',
          isEditable: true,
          sourceFilePath: null,
          rangeId: 'range-1',
          trimMode: 'accurate',
          selectedAudioTrackIndices: [2, 3, 4],
          mutedAudioTrackIndices: [],
        },
      ],
      existingClips: [legacyClip],
      planJobs: new Map(),
      progressById: {},
      ranges: [range],
      selectedVariantId: 'draft-1',
    });

    expect(entries).toHaveLength(1);

    const entry = entries[0];

    expect(entry?.variantEntries).toHaveLength(1);
    expect(entry?.variantEntries[0]?.key).toBe('draft-1');
    expect(entry?.variantEntries[0]?.clip?.filePath).toBe('/tmp/clip-legacy.mp4');
    expect(entry?.variantEntries[0]?.status).toBe('legacy');
    expect(entry?.variantEntries[0]?.state).toBe('exported');
    expect(entry?.variantEntries[0]?.isEditable).toBe(false);
  });

  it('keeps draft variants at the top of the variant list', () => {
    const range = baseRange({
      id: 'range-1',
      start: 0,
      end: 5,
    });
    const exportedClip = baseClip({
      fileName: 'clip-exported.mp4',
      filePath: '/tmp/clip-exported.mp4',
      classificationKind: 'metadata',
      metadataPresence: 'metadata',
      identityKeys: {
        clipId: 'clip-1',
        planId: 'plan-1',
        sourceFingerprint: 'src-1',
        variantKey: 'trim=accurate|selected=2,3,4|muted=',
        rangeKey: '0:5000:5000',
      },
      trimMode: 'accurate',
      selectedAudioTrackIndices: [2, 3, 4],
      mutedAudioTrackIndices: [],
      range: {
        start: 0,
        end: 5,
        duration: 5,
      },
    });

    const entries = deriveClipEntries({
      clipStatusMap: {
        'draft-1': 'DRAFT',
      },
      defaultTrimMode: 'fast',
      draftClipVariants: [
        {
          id: 'draft-1',
          isEditable: true,
          sourceFilePath: '/tmp/source-seed.mp4',
          rangeId: 'range-1',
          trimMode: 'fast',
          selectedAudioTrackIndices: [2, 3, 4],
          mutedAudioTrackIndices: [],
        },
      ],
      existingClips: [exportedClip],
      planJobs: new Map(),
      progressById: {},
      ranges: [range],
      selectedVariantId: 'draft-1',
    });

    const [firstVariant, secondVariant] = entries[0]?.variantEntries ?? [];

    expect(firstVariant?.state).toBe('draft');
    expect(firstVariant?.isEditable).toBe(true);
    expect(secondVariant?.state).toBe('exported');
    expect(secondVariant?.isEditable).toBe(false);
  });
});
