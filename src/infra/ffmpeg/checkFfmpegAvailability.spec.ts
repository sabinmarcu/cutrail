import {
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import { checkFfmpegAvailability } from './checkFfmpegAvailability.ts';

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

describe('checkFfmpegAvailability', () => {
  it('returns available status when ffmpeg -version succeeds', async () => {
    const child = createFakeProcess();

    const spawnImpl = vi.fn(() => {
      setTimeout(() => {
        child.stdout.emit('data', Buffer.from('ffmpeg version n7.0\n'));
        child.emit('close', 0);
      }, 0);

      return child;
    });

    await expect(checkFfmpegAvailability({
      spawnImpl,
      ffmpegPath: '/tmp/fake-ffmpeg',
    })).resolves.toMatchObject({
      available: true,
      path: '/tmp/fake-ffmpeg',
      versionLine: 'ffmpeg version n7.0',
    });
  });

  it('returns unavailable status when ffmpeg cannot be spawned', async () => {
    const child = createFakeProcess();

    const spawnImpl = vi.fn(() => {
      setTimeout(() => {
        child.emit('error', new Error('spawn ENOENT'));
      }, 0);

      return child;
    });

    await expect(checkFfmpegAvailability({
      spawnImpl,
      ffmpegPath: '/tmp/does-not-exist',
    })).resolves.toMatchObject({
      available: false,
      code: 'FFMPEG_NOT_FOUND',
    });
  });
});
