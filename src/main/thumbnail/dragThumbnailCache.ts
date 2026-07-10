import {
  spawn,
  type ChildProcessWithoutNullStreams,
} from 'node:child_process';

import {
  nativeImage,
  type NativeImage,
} from 'electron';
import { resolveFfmpegPath } from '../../infra/ffmpeg/resolveFfmpegPath.ts';

const DEFAULT_THUMBNAIL_SEEK_SECONDS = 0.5;
const DEFAULT_THUMBNAIL_WIDTH = 256;

type ExtractVideoThumbnailOptions = {
  ffmpegPath?: string;
  seekSeconds?: number;
  spawnImpl?: typeof spawn;
  width?: number;
};

const thumbnailCache = new Map<string, NativeImage>();
const pendingThumbnailCache = new Map<string, Promise<NativeImage | null>>();

const extractVideoThumbnailBuffer = (
  filePath: string,
  options: ExtractVideoThumbnailOptions = {},
): Promise<Buffer | null> => {
  if (typeof filePath !== 'string' || filePath.trim().length === 0) {
    throw new TypeError('filePath must be a non-empty string');
  }

  const {
    ffmpegPath = resolveFfmpegPath().path,
    seekSeconds = DEFAULT_THUMBNAIL_SEEK_SECONDS,
    spawnImpl = spawn,
    width = DEFAULT_THUMBNAIL_WIDTH,
  } = options;

  const nextSeekSeconds = Number.isFinite(seekSeconds) && seekSeconds >= 0
    ? seekSeconds
    : DEFAULT_THUMBNAIL_SEEK_SECONDS;
  const nextWidth = Number.isFinite(width) && width > 0
    ? Math.round(width)
    : DEFAULT_THUMBNAIL_WIDTH;

  return new Promise((resolve) => {
    const stdoutChunks: Buffer[] = [];
    let settled = false;

    const settle = (value: Buffer | null): void => {
      if (settled) {
        return;
      }

      settled = true;
      resolve(value);
    };

    const child = spawnImpl(ffmpegPath, [
      '-hide_banner',
      '-loglevel',
      'error',
      '-ss',
      nextSeekSeconds.toFixed(3),
      '-i',
      filePath,
      '-frames:v',
      '1',
      '-vf',
      `scale=${nextWidth}:-1:force_original_aspect_ratio=decrease`,
      '-f',
      'image2pipe',
      '-vcodec',
      'png',
      'pipe:1',
    ], {
      stdio: ['ignore', 'pipe', 'pipe'],
    }) as unknown as ChildProcessWithoutNullStreams;

    child.stdout.on('data', (chunk: Buffer) => {
      stdoutChunks.push(chunk);
    });

    child.once('error', () => {
      settle(null);
    });

    child.once('close', (exitCode: number | null) => {
      if (exitCode !== 0) {
        settle(null);

        return;
      }

      const buffer = Buffer.concat(stdoutChunks);

      if (buffer.length === 0) {
        settle(null);

        return;
      }

      settle(buffer);
    });
  });
};

const primeDragThumbnail = (
  filePath: string,
  ffmpegPath?: string,
): Promise<NativeImage | null> => {
  if (typeof filePath !== 'string' || filePath.trim().length === 0) {
    return Promise.resolve(null);
  }

  const cached = thumbnailCache.get(filePath);

  if (cached) {
    return Promise.resolve(cached);
  }

  const pending = pendingThumbnailCache.get(filePath);

  if (pending) {
    return pending;
  }

  const next = extractVideoThumbnailBuffer(filePath, {
    ffmpegPath,
  }).then((buffer) => {
    if (!buffer) {
      return null;
    }

    const image = nativeImage.createFromBuffer(buffer);

    if (image.isEmpty()) {
      return null;
    }

    thumbnailCache.set(filePath, image);

    return image;
  }).finally(() => {
    pendingThumbnailCache.delete(filePath);
  });

  pendingThumbnailCache.set(filePath, next);

  return next;
};

const getCachedDragThumbnail = (filePath: string): NativeImage | null => {
  if (typeof filePath !== 'string' || filePath.trim().length === 0) {
    return null;
  }

  return thumbnailCache.get(filePath) ?? null;
};

export {
  getCachedDragThumbnail,
  primeDragThumbnail,
};
