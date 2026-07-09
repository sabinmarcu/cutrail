// @ts-check

import { spawn } from 'node:child_process';

import { nativeImage } from 'electron';
import { resolveFfmpegPath } from '../../infra/ffmpeg/resolveFfmpegPath.js';

const DEFAULT_THUMBNAIL_SEEK_SECONDS = 0.5;
const DEFAULT_THUMBNAIL_WIDTH = 256;

/** @type {Map<string, import('electron').NativeImage>} */
const thumbnailCache = new Map();

/** @type {Map<string, Promise<import('electron').NativeImage | null>>} */
const pendingThumbnailCache = new Map();

/**
 * @param {string} filePath
 * @param {{
 *   ffmpegPath?: string,
 *   seekSeconds?: number,
 *   spawnImpl?: typeof spawn,
 *   width?: number,
 * }} [options]
 * @returns {Promise<Buffer | null>}
 */
const extractVideoThumbnailBuffer = (filePath, options = {}) => {
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
    /** @type {Buffer[]} */
    const stdoutChunks = [];
    let settled = false;

    /**
     * @param {Buffer | null} value
     * @returns {void}
     */
    const settle = (value) => {
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
    });

    /** @param {Buffer} chunk */
    child.stdout.on('data', (chunk) => {
      stdoutChunks.push(chunk);
    });

    child.once('error', () => {
      settle(null);
    });

    /** @param {number | null} exitCode */
    child.once('close', (exitCode) => {
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

/**
 * @param {string} filePath
 * @param {string} [ffmpegPath]
 * @returns {Promise<import('electron').NativeImage | null>}
 */
const primeDragThumbnail = (filePath, ffmpegPath) => {
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

/**
 * @param {string} filePath
 * @returns {import('electron').NativeImage | null}
 */
const getCachedDragThumbnail = (filePath) => {
  if (typeof filePath !== 'string' || filePath.trim().length === 0) {
    return null;
  }

  return thumbnailCache.get(filePath) ?? null;
};

export {
  getCachedDragThumbnail,
  primeDragThumbnail,
};
