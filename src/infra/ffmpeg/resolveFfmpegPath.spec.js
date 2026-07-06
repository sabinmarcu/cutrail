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
});
