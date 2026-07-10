import {
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import { runFfmpegJob } from './runFfmpegJob.ts';

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

describe('runFfmpegJob', () => {
  it('returns completed results and publishes progress updates', async () => {
    const child = createFakeProcess();
    const onProgress = vi.fn();

    const spawnImpl = vi.fn(() => {
      setTimeout(() => {
        child.stderr.emit('data', Buffer.from('frame=1 time=00:00:02.00 speed=1.20x\r'));
        child.emit('close', 0, null);
      }, 0);

      return child;
    });

    const result = await runFfmpegJob({
      jobId: 'job-1',
      args: ['-version'],
      totalDuration: 4,
      onProgress,
      spawnImpl,
    });

    expect(result.status).toBe('COMPLETED');
    expect(result.code).toBe('OK');
    expect(onProgress).toHaveBeenCalledWith({
      jobId: 'job-1',
      processedSeconds: 2,
      ratio: 0.5,
      speed: 1.2,
    });
    expect(onProgress).toHaveBeenCalledWith({
      jobId: 'job-1',
      processedSeconds: 4,
      ratio: 1,
      speed: null,
    });
  });

  it('returns failed result when ffmpeg exits non-zero', async () => {
    const child = createFakeProcess();

    const spawnImpl = vi.fn(() => {
      setTimeout(() => {
        child.stderr.emit('data', Buffer.from('error: invalid timestamps\n'));
        child.emit('close', 1, null);
      }, 0);

      return child;
    });

    const result = await runFfmpegJob({
      jobId: 'job-2',
      args: ['-version'],
      spawnImpl,
    });

    expect(result).toMatchObject({
      status: 'FAILED',
      code: 'FFMPEG_PROCESS_FAILED',
      exitCode: 1,
    });
    expect(result.stderrSummary).toContain('invalid timestamps');
  });

  it('returns failed result when spawn emits an error', async () => {
    const child = createFakeProcess();

    const spawnImpl = vi.fn(() => {
      setTimeout(() => {
        child.emit('error', new Error('spawn ffmpeg ENOENT'));
      }, 0);

      return child;
    });

    const result = await runFfmpegJob({
      jobId: 'job-3',
      args: ['-version'],
      spawnImpl,
    });

    expect(result).toMatchObject({
      status: 'FAILED',
      code: 'FFMPEG_SPAWN_ERROR',
      error: 'spawn ffmpeg ENOENT',
    });
  });
});
