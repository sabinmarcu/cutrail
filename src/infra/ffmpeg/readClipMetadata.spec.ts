import {
  describe,
  expect,
  it,
  vi,
} from 'vitest';

type EventName = 'close' | 'data' | 'error';
type Listener = (...values: unknown[]) => void;

class LocalEmitter {
  #listeners = new Map<EventName, Listener[]>();

  on(event: EventName, listener: Listener): void {
    const current = this.#listeners.get(event) ?? [];
    current.push(listener);
    this.#listeners.set(event, current);
  }

  once(event: EventName, listener: Listener): void {
    const wrapped: Listener = (...values) => {
      this.off(event, wrapped);
      listener(...values);
    };

    this.on(event, wrapped);
  }

  off(event: EventName, listener: Listener): void {
    const current = this.#listeners.get(event) ?? [];
    this.#listeners.set(event, current.filter((item) => item !== listener));
  }

  emit(event: EventName, ...values: unknown[]): void {
    const current = this.#listeners.get(event) ?? [];

    for (const listener of current) {
      listener(...values);
    }
  }
}

type FakeProcess = LocalEmitter & {
  stderr: LocalEmitter;
  stdout: LocalEmitter;
};

const createFakeProcess = (): FakeProcess => {
  const child = new LocalEmitter() as FakeProcess;
  child.stderr = new LocalEmitter();
  child.stdout = new LocalEmitter();

  return child;
};

describe('readClipMetadata', () => {
  it('returns validated metadata from cutrail_export_json tag', async () => {
    vi.resetModules();
    const child = createFakeProcess();
    vi.doMock('node:child_process', () => ({
      spawn: vi.fn(() => {
        setTimeout(() => {
          child.stdout.emit('data', Buffer.from(JSON.stringify({
            format: {
              tags: {
                cutrail_app: 'cutrail',
                cutrail_export_json: JSON.stringify({
                  schemaVersion: 1,
                  appName: 'cutrail',
                  clipId: 'clip_1',
                  planId: 'plan_1',
                  sourceFingerprint: 'fp_1',
                  rangeMs: {
                    startMs: 1000,
                    endMs: 2000,
                    durationMs: 1000,
                  },
                  trimMode: 'fast',
                  selectedAudioTrackIndices: [0],
                  mutedAudioTrackIndices: [],
                  variantKey: 'trim=fast|selected=0|muted=',
                  createdAtMs: 1_700_000_000_000,
                }),
              },
            },
          })));
          child.emit('close', 0);
        }, 0);

        return child;
      }),
    }));

    const { readClipMetadata } = await import('./readClipMetadata.ts');
    const result = await readClipMetadata('/clips/clip.mp4');

    expect(result.hasDiscoveryTags).toBe(true);
    expect(result.metadata?.clipId).toBe('clip_1');
    expect(result.metadataError).toBeNull();
  });

  it('marks metadata as invalid when discovery JSON cannot be parsed', async () => {
    vi.resetModules();
    const child = createFakeProcess();
    vi.doMock('node:child_process', () => ({
      spawn: vi.fn(() => {
        setTimeout(() => {
          child.stdout.emit('data', Buffer.from(JSON.stringify({
            format: {
              tags: {
                cutrail_app: 'cutrail',
                cutrail_export_json: '{not json}',
              },
            },
          })));
          child.emit('close', 0);
        }, 0);

        return child;
      }),
    }));

    const { readClipMetadata } = await import('./readClipMetadata.ts');
    const result = await readClipMetadata('/clips/clip.mp4');

    expect(result.hasDiscoveryTags).toBe(true);
    expect(result.metadata).toBeNull();
    expect(result.metadataError).toBe('invalid-json');
  });

  it('returns no discovery tags for unrelated files', async () => {
    vi.resetModules();
    const child = createFakeProcess();
    vi.doMock('node:child_process', () => ({
      spawn: vi.fn(() => {
        setTimeout(() => {
          child.stdout.emit('data', Buffer.from(JSON.stringify({
            format: {
              tags: {
                encoder: 'Lavf58.24.100',
              },
            },
          })));
          child.emit('close', 0);
        }, 0);

        return child;
      }),
    }));

    const { readClipMetadata } = await import('./readClipMetadata.ts');
    const result = await readClipMetadata('/clips/clip.mp4');

    expect(result.hasDiscoveryTags).toBe(false);
    expect(result.metadata).toBeNull();
    expect(result.metadataError).toBeNull();
  });

  it('reads discovery metadata when ffprobe exposes uppercase tag keys', async () => {
    vi.resetModules();
    const child = createFakeProcess();
    vi.doMock('node:child_process', () => ({
      spawn: vi.fn(() => {
        setTimeout(() => {
          child.stdout.emit('data', Buffer.from(JSON.stringify({
            format: {
              tags: {
                CUTRAIL_APP: 'cutrail',
                CUTRAIL_EXPORT_JSON: JSON.stringify({
                  schemaVersion: 1,
                  appName: 'cutrail',
                  clipId: 'clip_upper',
                  planId: 'plan_upper',
                  sourceFingerprint: 'fp_upper',
                  rangeMs: {
                    startMs: 1000,
                    endMs: 2000,
                    durationMs: 1000,
                  },
                  trimMode: 'fast',
                  selectedAudioTrackIndices: [0],
                  mutedAudioTrackIndices: [],
                  variantKey: 'trim=fast|selected=0|muted=',
                  createdAtMs: 1_700_000_000_000,
                }),
              },
            },
          })));
          child.emit('close', 0);
        }, 0);

        return child;
      }),
    }));

    const { readClipMetadata } = await import('./readClipMetadata.ts');
    const result = await readClipMetadata('/clips/clip-upper.mp4');

    expect(result.hasDiscoveryTags).toBe(true);
    expect(result.metadata?.clipId).toBe('clip_upper');
    expect(result.metadataError).toBeNull();
  });

  it('reads discovery metadata when ffprobe exposes namespaced tag keys', async () => {
    vi.resetModules();
    const child = createFakeProcess();
    vi.doMock('node:child_process', () => ({
      spawn: vi.fn(() => {
        setTimeout(() => {
          child.stdout.emit('data', Buffer.from(JSON.stringify({
            format: {
              tags: {
                'com.apple.quicktime.cutrail_app': 'cutrail',
                'com.apple.quicktime.cutrail_export_json': JSON.stringify({
                  schemaVersion: 1,
                  appName: 'cutrail',
                  clipId: 'clip_ns',
                  planId: 'plan_ns',
                  sourceFingerprint: 'fp_ns',
                  rangeMs: {
                    startMs: 1000,
                    endMs: 2000,
                    durationMs: 1000,
                  },
                  trimMode: 'fast',
                  selectedAudioTrackIndices: [0],
                  mutedAudioTrackIndices: [],
                  variantKey: 'trim=fast|selected=0|muted=',
                  createdAtMs: 1_700_000_000_000,
                }),
              },
            },
          })));
          child.emit('close', 0);
        }, 0);

        return child;
      }),
    }));

    const { readClipMetadata } = await import('./readClipMetadata.ts');
    const result = await readClipMetadata('/clips/clip-ns.mp4');

    expect(result.hasDiscoveryTags).toBe(true);
    expect(result.metadata?.clipId).toBe('clip_ns');
    expect(result.metadataError).toBeNull();
  });
});
