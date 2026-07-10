import fs from 'node:fs/promises';
import path from 'node:path';
import { execFile } from 'node:child_process';
import {
  shell,
} from 'electron';

type ClipActionMethod =
  | 'copy-file'
  | 'copy-path'
  | 'show-item-in-folder'
  | 'open-directory'
  | 'dbus-show-items'
  | 'xdg-open-directory'
  | 'none';

type ClipFileActionResult = {
  ok: boolean,
  method: ClipActionMethod,
  error?: string,
};

type OpenPathResult = {
  ok: boolean,
  error: string,
};

/**
 * @param {string} targetPath
 * @returns {Promise<boolean>}
 */
const pathExists = async (targetPath: string): Promise<boolean> => {
  try {
    await fs.access(targetPath);

    return true;
  } catch {
    return false;
  }
};

/**
 * @param {string} targetPath
 * @returns {Promise<OpenPathResult>}
 */
const openPathWithTimeout = async (targetPath: string): Promise<OpenPathResult> => {
  const timeoutResult = new Promise<OpenPathResult>((resolve) => {
    setTimeout(() => {
      resolve({
        ok: false,
        error: 'timeout',
      });
    }, 1500);
  });

  const shellResult: Promise<OpenPathResult> = shell.openPath(targetPath).then((error) => ({
    ok: error.length === 0,
    error,
  }));

  return Promise.race([shellResult, timeoutResult]);
};

/**
 * @param {string} command
 * @param {string[]} commandArguments
 * @param {number} timeoutMs
 * @returns {Promise<{ ok: boolean, error: string }>}
 */
const runCommand = (
  command: string,
  commandArguments: string[],
  timeoutMs: number,
): Promise<{ ok: boolean, error: string }> => new Promise((resolve) => {
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
const tryLinuxRevealFallbacks = async (filePath: string): Promise<ClipFileActionResult | null> => {
  if (process.platform !== 'linux') {
    return null;
  }

  const fileUri = `file://${encodeURI(filePath)}`;

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

  if (dbusResult.ok) {
    return {
      ok: true,
      method: 'dbus-show-items',
    };
  }

  const directoryPath = path.dirname(filePath);

  const xdgOpenResult = await runCommand('xdg-open', [directoryPath], 2000);

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
const revealClipPath = async (filePath: string): Promise<ClipFileActionResult> => {
  if (!(await pathExists(filePath))) {
    return {
      ok: false,
      method: 'none',
      error: 'file-not-found',
    };
  }

  let showItemError = '';

  try {
    shell.showItemInFolder(filePath);
  } catch (error) {
    showItemError = error instanceof Error ? error.message : 'show-item-in-folder-failed';
  }

  const directoryPath = path.dirname(filePath);
  const openDirectoryResult = await openPathWithTimeout(directoryPath);

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
    return linuxFallbackResult;
  }

  const combinedError = [
    errorDetails,
    linuxFallbackResult?.error || '',
  ].filter(Boolean).join(' | ');

  return {
    ok: false,
    method: 'none',
    error: combinedError.length > 0 ? combinedError : 'reveal-failed',
  };
};

export {
  revealClipPath,
};
