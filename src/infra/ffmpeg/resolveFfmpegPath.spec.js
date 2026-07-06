import {
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import { resolveFfmpegPath } from './resolveFfmpegPath';

describe('resolveFfmpegPath', () => {
  it('uses explicit environment override when executable', () => {
    const canExecuteImpl = vi.fn((candidate) => candidate === '/custom/ffmpeg');

    expect(resolveFfmpegPath({
      env: {
        CUTRAIL_FFMPEG_PATH: '/custom/ffmpeg',
      },
      bundledPath: '/bundled/ffmpeg',
      canExecuteImpl,
    })).toMatchObject({
      path: '/custom/ffmpeg',
      source: 'ENV_OVERRIDE',
    });
  });

  it('falls back to system ffmpeg when no executable candidate exists', () => {
    const canExecuteImpl = vi.fn(() => false);

    expect(resolveFfmpegPath({
      env: {},
      bundledPath: '/bundled/ffmpeg',
      canExecuteImpl,
    })).toMatchObject({
      path: 'ffmpeg',
      source: 'SYSTEM_PATH',
    });
  });

  it('uses bundled ffmpeg when no override is set and bundled binary is executable', () => {
    const canExecuteImpl = vi.fn((candidate) => candidate === '/bundled/ffmpeg');

    expect(resolveFfmpegPath({
      env: {},
      bundledPath: '/bundled/ffmpeg',
      canExecuteImpl,
    })).toMatchObject({
      path: '/bundled/ffmpeg',
      source: 'BUNDLED',
    });
  });

  it('rewrites bundled app.asar ffmpeg path to app.asar.unpacked when executable', () => {
    const bundledAsarPath = '/opt/Cutrail/resources/app.asar/node_modules/@ffmpeg-installer/linux-x64/ffmpeg';
    const bundledUnpackedPath = '/opt/Cutrail/resources/app.asar.unpacked/node_modules/@ffmpeg-installer/linux-x64/ffmpeg';
    const canExecuteImpl = vi.fn((candidate) => candidate === bundledUnpackedPath);

    expect(resolveFfmpegPath({
      env: {},
      bundledPath: bundledAsarPath,
      canExecuteImpl,
    })).toMatchObject({
      path: bundledUnpackedPath,
      source: 'BUNDLED',
    });
  });

  it('falls back to system path when bundled app.asar.unpacked ffmpeg is unavailable', () => {
    const bundledAsarPath = '/opt/Cutrail/resources/app.asar/node_modules/@ffmpeg-installer/linux-x64/ffmpeg';
    const canExecuteImpl = vi.fn(() => false);

    expect(resolveFfmpegPath({
      env: {},
      bundledPath: bundledAsarPath,
      canExecuteImpl,
    })).toMatchObject({
      path: 'ffmpeg',
      source: 'SYSTEM_PATH',
    });
  });
});
