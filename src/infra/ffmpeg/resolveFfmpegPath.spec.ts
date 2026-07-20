import {
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import { resolveFfmpegPath } from './resolveFfmpegPath.ts';

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

  it('uses system ffmpeg when auto mode is selected', () => {
    const canExecuteImpl = vi.fn(() => false);
    const canResolveSystemCommandImpl = vi.fn(() => true);

    expect(resolveFfmpegPath({
      env: {},
      bundledPath: '/bundled/ffmpeg',
      resolutionMode: 'auto',
      canExecuteImpl,
      canResolveSystemCommandImpl,
    })).toMatchObject({
      path: 'ffmpeg',
      source: 'SYSTEM_PATH',
    });
  });

  it('uses bundled ffmpeg when bundled mode is selected and bundled binary is executable', () => {
    const canExecuteImpl = vi.fn((candidate) => candidate === '/bundled/ffmpeg');
    const canResolveSystemCommandImpl = vi.fn(() => false);

    expect(resolveFfmpegPath({
      env: {},
      bundledPath: '/bundled/ffmpeg',
      resolutionMode: 'bundled',
      canExecuteImpl,
      canResolveSystemCommandImpl,
    })).toMatchObject({
      path: '/bundled/ffmpeg',
      source: 'BUNDLED',
    });
  });

  it('uses system ffmpeg when local mode is selected', () => {
    const canExecuteImpl = vi.fn(() => true);
    const canResolveSystemCommandImpl = vi.fn(() => true);

    expect(resolveFfmpegPath({
      env: {},
      bundledPath: '/bundled/ffmpeg',
      resolutionMode: 'local',
      canExecuteImpl,
      canResolveSystemCommandImpl,
    })).toMatchObject({
      path: 'ffmpeg',
      source: 'SYSTEM_PATH',
    });
  });

  it('rewrites bundled app.asar ffmpeg path to app.asar.unpacked when executable', () => {
    const bundledAsarPath = '/opt/Cutrail/resources/app.asar/node_modules/@ffmpeg-installer/linux-x64/ffmpeg';
    const bundledUnpackedPath = '/opt/Cutrail/resources/app.asar.unpacked/node_modules/@ffmpeg-installer/linux-x64/ffmpeg';
    const canExecuteImpl = vi.fn((candidate) => candidate === bundledUnpackedPath);
    const canResolveSystemCommandImpl = vi.fn(() => false);

    expect(resolveFfmpegPath({
      env: {},
      bundledPath: bundledAsarPath,
      resolutionMode: 'bundled',
      canExecuteImpl,
      canResolveSystemCommandImpl,
    })).toMatchObject({
      path: bundledUnpackedPath,
      source: 'BUNDLED',
    });
  });

  it('falls back to system path when bundled app.asar.unpacked ffmpeg is unavailable', () => {
    const bundledAsarPath = '/opt/Cutrail/resources/app.asar/node_modules/@ffmpeg-installer/linux-x64/ffmpeg';
    const canExecuteImpl = vi.fn(() => false);
    const canResolveSystemCommandImpl = vi.fn(() => false);

    expect(resolveFfmpegPath({
      env: {},
      bundledPath: bundledAsarPath,
      resolutionMode: 'bundled',
      canExecuteImpl,
      canResolveSystemCommandImpl,
    })).toMatchObject({
      path: 'ffmpeg',
      source: 'SYSTEM_PATH',
    });
  });

  it('falls back to bundled ffmpeg when auto mode cannot resolve system ffmpeg', () => {
    const canExecuteImpl = vi.fn((candidate) => candidate === '/bundled/ffmpeg');
    const canResolveSystemCommandImpl = vi.fn(() => false);

    expect(resolveFfmpegPath({
      env: {},
      bundledPath: '/bundled/ffmpeg',
      resolutionMode: 'auto',
      canExecuteImpl,
      canResolveSystemCommandImpl,
    })).toMatchObject({
      path: '/bundled/ffmpeg',
      source: 'BUNDLED',
    });
  });
});
