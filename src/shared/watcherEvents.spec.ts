import {
  describe,
  expect,
  it,
} from 'vitest';
import {
  outputDirectorySnapshotSchema,
  sourceDirectorySnapshotSchema,
  watcherHealthSchema,
} from './watcherEvents.ts';

describe('watcher event schemas', () => {
  it('accepts a valid source snapshot payload', () => {
    const result = sourceDirectorySnapshotSchema.safeParse({
      watcherType: 'source',
      snapshotRevision: 1,
      sourceDirectory: '/videos',
      generatedAtMs: 100,
      videos: [
        {
          filePath: '/videos/source.mp4',
          fileName: 'source.mp4',
          extension: '.mp4',
          modifiedAtMs: 90,
          clipCount: 2,
          hasMetadataClips: true,
          hasLegacyClips: false,
        },
      ],
      changeSummary: {
        added: 1,
        changed: 0,
        removed: 0,
      },
    });

    expect(result.success).toBe(true);
  });

  it('rejects source snapshot payloads with invalid summary counters', () => {
    const result = sourceDirectorySnapshotSchema.safeParse({
      watcherType: 'source',
      snapshotRevision: 1,
      sourceDirectory: '/videos',
      generatedAtMs: 100,
      videos: [],
      changeSummary: {
        added: -1,
        changed: 0,
        removed: 0,
      },
    });

    expect(result.success).toBe(false);
  });

  it('accepts a valid output snapshot payload', () => {
    const result = outputDirectorySnapshotSchema.safeParse({
      watcherType: 'output',
      snapshotRevision: 3,
      sourcePath: '/videos/source.mp4',
      outputDirectory: '/clips',
      generatedAtMs: 100,
      clips: [
        {
          fileName: 'clip.mp4',
          filePath: '/clips/clip.mp4',
          modifiedAtMs: 95,
          sourceName: 'source',
          trimMode: 'fast',
          range: {
            start: 1,
            end: 2,
            duration: 1,
          },
          extension: 'mp4',
          metadataPresence: 'metadata',
          classificationKind: 'metadata',
          identityKeys: {
            clipId: 'clip_1',
            planId: 'plan_1',
            sourceFingerprint: 'fingerprint_1',
            variantKey: 'trim=fast|selected=0|muted=',
            rangeKey: '1000:2000:1000',
          },
          selectedAudioTrackIndices: [0],
          mutedAudioTrackIndices: [],
        },
      ],
      changeSummary: {
        added: 1,
        changed: 0,
        removed: 0,
      },
    });

    expect(result.success).toBe(true);
  });

  it('accepts watcher health updates', () => {
    const result = watcherHealthSchema.safeParse({
      watcherType: 'output',
      state: 'degraded',
      reason: 'snapshot-refresh-failed',
      generatedAtMs: 101,
    });

    expect(result.success).toBe(true);
  });
});
