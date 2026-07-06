import { EventEmitter } from 'node:events';

import {
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import { checkFfmpegAvailability } from './checkFfmpegAvailability';

const createFakeProcess = () => {
  const child = new EventEmitter();
  child.stderr = new EventEmitter();
  child.stdout = new EventEmitter();

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
