import {
  describe,
  expect,
  it,
} from 'vitest';

import {
  createExportPlanPayloadSchema,
  exportClipMetadataSchema,
} from './exportMetadata.ts';

describe('exportMetadata schemas', () => {
  it('accepts a valid metadata payload', () => {
    const payload = {
      schemaVersion: 1,
      appName: 'cutrail',
      clipId: 'clip_abc123',
      planId: 'plan_123',
      sourceFingerprint: 'fingerprint',
      rangeMs: {
        startMs: 1000,
        endMs: 2500,
        durationMs: 1500,
      },
      trimMode: 'fast',
      selectedAudioTrackIndices: [0],
      mutedAudioTrackIndices: [],
      variantKey: 'trim=fast|selected=0|muted=',
      createdAtMs: 1_700_000_000_000,
    };

    expect(() => exportClipMetadataSchema.parse(payload)).not.toThrow();
  });

  it('rejects metadata payloads with mismatched range duration', () => {
    const payload = {
      schemaVersion: 1,
      appName: 'cutrail',
      clipId: 'clip_abc123',
      planId: 'plan_123',
      sourceFingerprint: 'fingerprint',
      rangeMs: {
        startMs: 1000,
        endMs: 2500,
        durationMs: 1200,
      },
      trimMode: 'fast',
      selectedAudioTrackIndices: [0],
      mutedAudioTrackIndices: [],
      variantKey: 'trim=fast|selected=0|muted=',
      createdAtMs: 1_700_000_000_000,
    };
    const result = exportClipMetadataSchema.safeParse(payload);

    expect(result.success).toBe(false);

    if (result.success) {
      throw new Error('Expected metadata parse to fail');
    }

    expect(result.error.issues[0]?.message).toBe('durationMs must equal endMs - startMs');
  });

  it('rejects invalid create-export-plan IPC payloads', () => {
    const invalidPayload = {
      sourcePath: '/videos/source.mp4',
      outputDirectory: '/clips',
      ranges: [
        {
          start: '5',
          end: 8,
        },
      ],
    };
    const result = createExportPlanPayloadSchema.safeParse(invalidPayload);

    expect(result.success).toBe(false);

    if (result.success) {
      throw new Error('Expected create-export-plan payload parse to fail');
    }

    expect(result.error.issues[0]?.path.join('.')).toBe('ranges.0.start');
  });
});
