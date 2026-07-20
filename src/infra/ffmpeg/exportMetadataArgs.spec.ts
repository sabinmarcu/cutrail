import {
  describe,
  expect,
  it,
} from 'vitest';

import type { ExportClipMetadata } from '../../shared/exportMetadata.ts';
import { buildExportMetadataArguments } from './exportMetadataArgs.ts';

describe('buildExportMetadataArgs', () => {
  const sampleMetadata: ExportClipMetadata = {
    schemaVersion: 1,
    appName: 'cutrail',
    clipId: 'clip_abc123',
    planId: 'plan_abc123',
    sourceFingerprint: 'source_fp_123',
    rangeMs: {
      startMs: 5000,
      endMs: 7000,
      durationMs: 2000,
    },
    trimMode: 'fast' as const,
    selectedAudioTrackIndices: [0],
    mutedAudioTrackIndices: [],
    variantKey: 'trim=fast|selected=0|muted=',
    createdAtMs: 1_700_000_000_000,
  };

  it('builds discovery tags and full export metadata json tag', () => {
    const metadataArguments = buildExportMetadataArguments(sampleMetadata);

    expect(metadataArguments).toContain('-metadata');
    expect(metadataArguments).toContain('cutrail_app=cutrail');
    expect(metadataArguments).toContain('cutrail_schema=1');
    expect(metadataArguments).toContain('cutrail_clip_id=clip_abc123');
    expect(metadataArguments).toContain('cutrail_source_fp=source_fp_123');
    expect(metadataArguments).toContain('cutrail_variant_key=trim=fast|selected=0|muted=');
    expect(metadataArguments.some((value) => value.startsWith('cutrail_export_json={'))).toBe(true);
  });

  it('fails when metadata payload exceeds safe size threshold', () => {
    expect(() => buildExportMetadataArguments({
      ...sampleMetadata,
      variantKey: 'x'.repeat(9000),
    })).toThrow('cutrail_export_json metadata exceeds 8192 bytes');
  });
});
