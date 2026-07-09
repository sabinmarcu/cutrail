// @ts-check

import fs from 'node:fs/promises';
import path from 'node:path';
import { execFile } from 'node:child_process';
import {
  shell,
} from 'electron';

/**
 * @typedef {'copy-file' | 'copy-path' | 'show-item-in-folder' | 'open-directory' | 'dbus-show-items' | 'xdg-open-directory' | 'none'} ClipActionMethod
 */

/**
 * @typedef {{ ok: boolean, method: ClipActionMethod, error?: string }} ClipFileActionResult
 */

/**
 * @typedef {{ ok: boolean, error: string }} OpenPathResult
 */

/**
 * @param {string} targetPath
 * @returns {Promise<boolean>}
 */
const pathExists = async (targetPath) => {
  try {
    await fs.access(targetPath);

    return true;
  } catch {
    return false;
  }
};

/**
 * @param {string} targetPath
 * @param {'directory'} targetKind
 * @returns {Promise<OpenPathResult>}
 */
const openPathWithTimeout = async (targetPath, targetKind) => {
  // eslint-disable-next-line no-console
  console.log('[cutrail:reveal] open-path-start', {
    targetKind,
    targetPath,
  });

  const timeoutResult = new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        ok: false,
        error: 'timeout',
      });
    }, 1500);
  });

  const shellResult = shell.openPath(targetPath).then((error) => ({
    ok: error.length === 0,
    error,
  }));

  const result = /** @type {OpenPathResult} */ (await Promise.race([shellResult, timeoutResult]));

  // eslint-disable-next-line no-console
  console.log('[cutrail:reveal] open-path-finish', {
    targetKind,
    targetPath,
    ok: result.ok,
    error: result.error,
  });

  return result;
};

/**
 * @param {string} command
 * @param {string[]} commandArguments
 * @param {number} timeoutMs
 * @returns {Promise<{ ok: boolean, error: string }>}
 */
const runCommand = (command, commandArguments, timeoutMs) => new Promise((resolve) => {
  const child = execFile(command, commandArguments, {
    timeout: timeoutMs,
  }, (error) => {
    if (!error) {
      resolve({
        ok: true,
        error: '',
      });
      return;
    }

    const timedOut = 'killed' in error && error.killed;

    resolve({
      ok: false,
      error: timedOut ? 'timeout' : (error.message || 'command-failed'),
    });
  });

  child.on('error', (error) => {
    resolve({
      ok: false,
      error: error.message || 'spawn-failed',
    });
  });
});

/**
 * @param {string} filePath
 * @returns {Promise<ClipFileActionResult | null>}
 */
const tryLinuxRevealFallbacks = async (filePath) => {
  if (process.platform !== 'linux') {
    return null;
  }

  const fileUri = `file://${encodeURI(filePath)}`;

  // eslint-disable-next-line no-console
  console.log('[cutrail:reveal] dbus-show-items-start', { fileUri });

  const dbusResult = await runCommand('dbus-send', [
    '--session',
    '--dest=org.freedesktop.FileManager1',
    '--type=method_call',
    '--print-reply',
    '/org/freedesktop/FileManager1',
    'org.freedesktop.FileManager1.ShowItems',
    `array:string:${fileUri}`,
    'string:',
  ], 2000);

  // eslint-disable-next-line no-console
  console.log('[cutrail:reveal] dbus-show-items-finish', dbusResult);

  if (dbusResult.ok) {
    return {
      ok: true,
      method: 'dbus-show-items',
    };
  }

  const directoryPath = path.dirname(filePath);

  // eslint-disable-next-line no-console
  console.log('[cutrail:reveal] xdg-open-start', { directoryPath });

  const xdgOpenResult = await runCommand('xdg-open', [directoryPath], 2000);

  // eslint-disable-next-line no-console
  console.log('[cutrail:reveal] xdg-open-finish', xdgOpenResult);

  if (xdgOpenResult.ok) {
    return {
      ok: true,
      method: 'xdg-open-directory',
    };
  }

  return {
    ok: false,
    method: 'none',
    error: `dbus-send:${dbusResult.error} | xdg-open:${xdgOpenResult.error}`,
  };
};

/**
 * @param {string} filePath
 * @returns {Promise<ClipFileActionResult>}
 */
const revealClipPath = async (filePath) => {
  // eslint-disable-next-line no-console
  console.log('[cutrail:reveal] start', { filePath });

  if (!(await pathExists(filePath))) {
    // eslint-disable-next-line no-console
    console.warn('[cutrail:reveal] missing-file', { filePath });

    return {
      ok: false,
      method: 'none',
      error: 'file-not-found',
    };
  }

  let showItemError = '';

  try {
    shell.showItemInFolder(filePath);

    // eslint-disable-next-line no-console
    console.log('[cutrail:reveal] show-item-in-folder-dispatched', { filePath });
  } catch (error) {
    showItemError = error instanceof Error ? error.message : 'show-item-in-folder-failed';

    // eslint-disable-next-line no-console
    console.warn('[cutrail:reveal] show-item-in-folder-failed', {
      filePath,
      details: showItemError,
    });
  }

  const directoryPath = path.dirname(filePath);
  const openDirectoryResult = await openPathWithTimeout(directoryPath, 'directory');

  // eslint-disable-next-line no-console
  console.log('[cutrail:reveal] open-directory-result', {
    filePath,
    directoryPath,
    ok: openDirectoryResult.ok,
    details: openDirectoryResult.ok ? directoryPath : openDirectoryResult.error,
  });

  if (openDirectoryResult.ok) {
    return {
      ok: true,
      method: 'open-directory',
    };
  }

  const errorDetails = [
    showItemError.length > 0 ? `showItemInFolder:${showItemError}` : '',
    openDirectoryResult.error.length > 0 ? `openPath(directory):${openDirectoryResult.error}` : '',
  ].filter(Boolean).join(' | ');

  const linuxFallbackResult = await tryLinuxRevealFallbacks(filePath);

  if (linuxFallbackResult?.ok) {
    // eslint-disable-next-line no-console
    console.log('[cutrail:reveal] linux-fallback-success', linuxFallbackResult);

    return linuxFallbackResult;
  }

  const combinedError = [
    errorDetails,
    linuxFallbackResult?.error || '',
  ].filter(Boolean).join(' | ');

  // eslint-disable-next-line no-console
  console.error('[cutrail:reveal] failed', {
    filePath,
    details: combinedError.length > 0 ? combinedError : 'reveal-failed',
  });

  return {
    ok: false,
    method: 'none',
    error: combinedError.length > 0 ? combinedError : 'reveal-failed',
  };
};

export {
  revealClipPath,
};
