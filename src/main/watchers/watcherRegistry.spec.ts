import {
  describe,
  expect,
  it,
} from 'vitest';
import {
  clearWatcherState,
  nextOutputSnapshotRevision,
  nextSourceSnapshotRevision,
  updateOutputSnapshotChangeSummary,
  updateSourceSnapshotChangeSummary,
} from './watcherRegistry.ts';

describe('watcherRegistry', () => {
  it('increments source and output snapshot revisions independently', () => {
    const webContentsId = 10;

    expect(nextSourceSnapshotRevision(webContentsId)).toBe(1);
    expect(nextSourceSnapshotRevision(webContentsId)).toBe(2);
    expect(nextOutputSnapshotRevision(webContentsId)).toBe(1);
    expect(nextOutputSnapshotRevision(webContentsId)).toBe(2);

    clearWatcherState(webContentsId);
  });

  it('computes source snapshot change summary from previous snapshots', () => {
    const webContentsId = 11;

    expect(updateSourceSnapshotChangeSummary(webContentsId, [
      {
        filePath: '/videos/a.mp4',
        fileName: 'a.mp4',
        extension: '.mp4',
        modifiedAtMs: 10,
        clipCount: 1,
        hasMetadataClips: true,
        hasLegacyClips: false,
      },
    ])).toEqual({
      added: 1,
      changed: 0,
      removed: 0,
    });

    expect(updateSourceSnapshotChangeSummary(webContentsId, [
      {
        filePath: '/videos/a.mp4',
        fileName: 'a.mp4',
        extension: '.mp4',
        modifiedAtMs: 20,
        clipCount: 1,
        hasMetadataClips: true,
        hasLegacyClips: false,
      },
      {
        filePath: '/videos/b.mp4',
        fileName: 'b.mp4',
        extension: '.mp4',
        modifiedAtMs: 30,
        clipCount: 0,
        hasMetadataClips: false,
        hasLegacyClips: false,
      },
    ])).toEqual({
      added: 1,
      changed: 1,
      removed: 0,
    });

    expect(updateSourceSnapshotChangeSummary(webContentsId, [
      {
        filePath: '/videos/b.mp4',
        fileName: 'b.mp4',
        extension: '.mp4',
        modifiedAtMs: 30,
        clipCount: 0,
        hasMetadataClips: false,
        hasLegacyClips: false,
      },
    ])).toEqual({
      added: 0,
      changed: 0,
      removed: 1,
    });

    clearWatcherState(webContentsId);
  });

  it('computes output snapshot change summary from previous snapshots', () => {
    const webContentsId = 12;

    expect(updateOutputSnapshotChangeSummary(webContentsId, [
      {
        fileName: 'clip-a.mp4',
        filePath: '/clips/clip-a.mp4',
        modifiedAtMs: 10,
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
          clipId: 'clip_a',
          planId: 'plan_a',
          sourceFingerprint: 'fp_a',
          variantKey: 'variant_a',
          rangeKey: '1000:2000:1000',
        },
        selectedAudioTrackIndices: [0],
        mutedAudioTrackIndices: [],
      },
    ])).toEqual({
      added: 1,
      changed: 0,
      removed: 0,
    });

    expect(updateOutputSnapshotChangeSummary(webContentsId, [
      {
        fileName: 'clip-a.mp4',
        filePath: '/clips/clip-a.mp4',
        modifiedAtMs: 20,
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
          clipId: 'clip_a',
          planId: 'plan_a',
          sourceFingerprint: 'fp_a',
          variantKey: 'variant_a',
          rangeKey: '1000:2000:1000',
        },
        selectedAudioTrackIndices: [0],
        mutedAudioTrackIndices: [],
      },
      {
        fileName: 'clip-b.mp4',
        filePath: '/clips/clip-b.mp4',
        modifiedAtMs: 30,
        sourceName: 'source',
        trimMode: 'accurate',
        range: {
          start: 3,
          end: 4,
          duration: 1,
        },
        extension: 'mp4',
        metadataPresence: 'legacy',
        classificationKind: 'legacy',
        identityKeys: {
          clipId: null,
          planId: null,
          sourceFingerprint: null,
          variantKey: null,
          rangeKey: '3000:4000:1000',
        },
        selectedAudioTrackIndices: [],
        mutedAudioTrackIndices: [],
      },
    ])).toEqual({
      added: 1,
      changed: 1,
      removed: 0,
    });

    expect(updateOutputSnapshotChangeSummary(webContentsId, [
      {
        fileName: 'clip-b.mp4',
        filePath: '/clips/clip-b.mp4',
        modifiedAtMs: 30,
        sourceName: 'source',
        trimMode: 'accurate',
        range: {
          start: 3,
          end: 4,
          duration: 1,
        },
        extension: 'mp4',
        metadataPresence: 'legacy',
        classificationKind: 'legacy',
        identityKeys: {
          clipId: null,
          planId: null,
          sourceFingerprint: null,
          variantKey: null,
          rangeKey: '3000:4000:1000',
        },
        selectedAudioTrackIndices: [],
        mutedAudioTrackIndices: [],
      },
    ])).toEqual({
      added: 0,
      changed: 0,
      removed: 1,
    });

    clearWatcherState(webContentsId);
  });
});
