import {
  describe,
  expect,
  it,
} from 'vitest';

import type { ExportClipMetadata } from '../../shared/exportMetadata.ts';
import { buildFastTrimCommand } from './buildFastTrimCommand.ts';

describe('buildFastTrimCommand', () => {
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

  it('builds ffmpeg args for accurate mp4 mode', () => {
    expect(buildFastTrimCommand({
      inputPath: '/videos/input.mp4',
      outputPath: '/clips/output.mp4',
      range: {
        start: 12.5,
        duration: 4,
      },
    })).toEqual([
      '-hide_banner',
      '-loglevel',
      'error',
      '-progress',
      'pipe:2',
      '-nostats',
      '-i',
      '/videos/input.mp4',
      '-ss',
      '12.500',
      '-t',
      '4.000',
      '-map',
      '0:v:0?',
      '-map',
      '0:a?',
      '-c:v',
      'libx264',
      '-preset',
      'veryfast',
      '-crf',
      '18',
      '-pix_fmt',
      'yuv420p',
      '-c:a',
      'aac',
      '-b:a',
      '192k',
      '-movflags',
      '+faststart+use_metadata_tags',
      '-y',
      '/clips/output.mp4',
    ]);
  });

  it('builds ffmpeg args for fast mp4 mode', () => {
    expect(buildFastTrimCommand({
      inputPath: '/videos/input.mp4',
      outputPath: '/clips/output.mp4',
      trimMode: 'fast',
      range: {
        start: 12.5,
        duration: 4,
      },
    })).toEqual([
      '-hide_banner',
      '-loglevel',
      'error',
      '-progress',
      'pipe:2',
      '-nostats',
      '-ss',
      '12.500',
      '-i',
      '/videos/input.mp4',
      '-t',
      '4.000',
      '-map',
      '0:v:0?',
      '-map',
      '0:a?',
      '-c:v',
      'copy',
      '-c:a',
      'aac',
      '-b:a',
      '192k',
      '-movflags',
      '+faststart+use_metadata_tags',
      '-y',
      '/clips/output.mp4',
    ]);
  });

  it('combines selected audio streams into one mixed track for mp4 output', () => {
    expect(buildFastTrimCommand({
      inputPath: '/videos/input.mp4',
      outputPath: '/clips/output.mp4',
      trimMode: 'fast',
      audioStreamIndices: [1, 3],
      range: {
        start: 12.5,
        duration: 4,
      },
    })).toEqual([
      '-hide_banner',
      '-loglevel',
      'error',
      '-progress',
      'pipe:2',
      '-nostats',
      '-ss',
      '12.500',
      '-i',
      '/videos/input.mp4',
      '-t',
      '4.000',
      '-map',
      '0:v:0?',
      '-filter_complex',
      '[0:a:1][0:a:3]amix=inputs=2:duration=longest:dropout_transition=0[aout]',
      '-map',
      '[aout]',
      '-c:v',
      'copy',
      '-c:a',
      'aac',
      '-b:a',
      '192k',
      '-movflags',
      '+faststart+use_metadata_tags',
      '-y',
      '/clips/output.mp4',
    ]);
  });

  it('builds ffmpeg args for stream-copy mode in non-mp4 containers', () => {
    expect(buildFastTrimCommand({
      inputPath: '/videos/input.mkv',
      outputPath: '/clips/output.mkv',
      range: {
        start: 12.5,
        duration: 4,
      },
    })).toEqual([
      '-hide_banner',
      '-loglevel',
      'error',
      '-progress',
      'pipe:2',
      '-nostats',
      '-ss',
      '12.500',
      '-i',
      '/videos/input.mkv',
      '-t',
      '4.000',
      '-map',
      '0:v:0?',
      '-map',
      '0:a?',
      '-map',
      '0:s?',
      '-c',
      'copy',
      '-y',
      '/clips/output.mkv',
    ]);
  });

  it('throws on invalid duration', () => {
    expect(() => buildFastTrimCommand({
      inputPath: '/videos/input.mp4',
      outputPath: '/clips/output.mp4',
      range: {
        start: 0,
        duration: 0,
      },
    })).toThrow('range.duration must be greater than 0');
  });

  it('throws on invalid audio stream indices', () => {
    expect(() => buildFastTrimCommand({
      inputPath: '/videos/input.mp4',
      outputPath: '/clips/output.mp4',
      audioStreamIndices: [-1],
      range: {
        start: 0,
        duration: 2,
      },
    })).toThrow('audioStreamIndices must be an array of non-negative integers');
  });

  it('supports silent exports when all audio tracks are muted', () => {
    expect(buildFastTrimCommand({
      inputPath: '/videos/input.mp4',
      outputPath: '/clips/output.mp4',
      trimMode: 'fast',
      audioStreamIndices: [],
      range: {
        start: 5,
        duration: 2,
      },
    })).toEqual([
      '-hide_banner',
      '-loglevel',
      'error',
      '-progress',
      'pipe:2',
      '-nostats',
      '-ss',
      '5.000',
      '-i',
      '/videos/input.mp4',
      '-t',
      '2.000',
      '-map',
      '0:v:0?',
      '-c:v',
      'copy',
      '-an',
      '-movflags',
      '+faststart+use_metadata_tags',
      '-y',
      '/clips/output.mp4',
    ]);
  });

  it('maps a single selected audio stream without mixing', () => {
    expect(buildFastTrimCommand({
      inputPath: '/videos/input.mkv',
      outputPath: '/clips/output.mkv',
      trimMode: 'fast',
      audioStreamIndices: [2],
      range: {
        start: 5,
        duration: 2,
      },
    })).toEqual([
      '-hide_banner',
      '-loglevel',
      'error',
      '-progress',
      'pipe:2',
      '-nostats',
      '-ss',
      '5.000',
      '-i',
      '/videos/input.mkv',
      '-t',
      '2.000',
      '-map',
      '0:v:0?',
      '-map',
      '0:a:2?',
      '-map',
      '0:s?',
      '-c',
      'copy',
      '-y',
      '/clips/output.mkv',
    ]);
  });

  it('embeds metadata tags when metadata is provided', () => {
    const command = buildFastTrimCommand({
      inputPath: '/videos/input.mp4',
      outputPath: '/clips/output.mp4',
      trimMode: 'fast',
      range: {
        start: 5,
        duration: 2,
      },
      metadata: sampleMetadata,
    });

    expect(command).toContain('-metadata');
    expect(command).toContain('cutrail_app=cutrail');
    expect(command).toContain('cutrail_schema=1');
    expect(command).toContain('cutrail_clip_id=clip_abc123');
    expect(command).toContain('cutrail_source_fp=source_fp_123');
    expect(command.some((value) => value.startsWith('cutrail_export_json={'))).toBe(true);
  });

  it('rejects malformed metadata before building command args', () => {
    expect(() => buildFastTrimCommand({
      inputPath: '/videos/input.mp4',
      outputPath: '/clips/output.mp4',
      trimMode: 'fast',
      range: {
        start: 5,
        duration: 2,
      },
      metadata: {
        ...sampleMetadata,
        schemaVersion: 999,
      } as unknown as typeof sampleMetadata,
    })).toThrow();
  });
});
