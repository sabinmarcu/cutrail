// @ts-check

import {
  app,
  dialog,
} from 'electron';
import electronUpdater from 'electron-updater';
import { fetchReleaseNotesFromGitHub } from './releaseNotes.mjs';

const { autoUpdater } = electronUpdater;

/**
 * @typedef {{
 *   isEnabled: boolean,
 *   checkForUpdates: (options?: { manual?: boolean }) => Promise<boolean>,
 *   getDisableReason: () => string | null,
 * }} AppUpdater
 */

/**
 * @param {import('electron-updater').UpdateInfo} updateInfo
 * @returns {Promise<string>}
 */
const formatReleaseNotes = async (updateInfo) => {
  const { releaseNotes } = updateInfo;

  if (typeof releaseNotes === 'string' && releaseNotes.trim().length > 0) {
    return releaseNotes;
  }

  if (Array.isArray(releaseNotes)) {
    const text = releaseNotes
      .map((entry) => entry?.note ?? '')
      .filter((entry) => entry.trim().length > 0)
      .join('\n\n');

    if (text.length > 0) {
      return text;
    }
  }

  const fallbackReleaseNotes = await fetchReleaseNotesFromGitHub(updateInfo.version || '');

  if (fallbackReleaseNotes) {
    return fallbackReleaseNotes;
  }

  return 'Release notes are not available for this version.';
};

/**
 * @returns {{ enabled: boolean, reason: string | null }}
 */
const getUpdaterAvailability = () => {
  if (!app.isPackaged) {
    return {
      enabled: false,
      reason: 'Update checks are available only in packaged builds.',
    };
  }

  if (process.platform === 'linux' && !process.env.APPIMAGE) {
    return {
      enabled: false,
      reason: 'Self-update is enabled only for AppImage installs on Linux.',
    };
  }

  return {
    enabled: true,
    reason: null,
  };
};

/**
 * @returns {AppUpdater}
 */
const createAppUpdater = () => {
  const availability = getUpdaterAvailability();

  if (!availability.enabled) {
    return {
      isEnabled: false,
      checkForUpdates: async ({ manual = false } = {}) => {
        if (manual && availability.reason) {
          await dialog.showMessageBox({
            type: 'info',
            title: 'Cutrail Updates',
            message: availability.reason,
          });
        }

        return false;
      },
      getDisableReason: () => availability.reason,
    };
  }

  autoUpdater.autoDownload = false;
  autoUpdater.autoInstallOnAppQuit = true;

  let isChecking = false;
  let isDownloading = false;
  let manualCheckPending = false;

  autoUpdater.on('update-available', async (updateInfo) => {
    const version = updateInfo.version || 'a newer version';
    const releaseNotes = await formatReleaseNotes(updateInfo);

    const response = await dialog.showMessageBox({
      type: 'info',
      title: 'Update Available',
      message: `Cutrail ${version} is available.`,
      detail: releaseNotes,
      buttons: ['Download Update', 'Later'],
      defaultId: 0,
      cancelId: 1,
    });

    manualCheckPending = false;

    if (response.response === 0 && !isDownloading) {
      isDownloading = true;
      void autoUpdater.downloadUpdate();
    }
  });

  autoUpdater.on('update-not-available', async () => {
    if (!manualCheckPending) {
      return;
    }

    manualCheckPending = false;

    await dialog.showMessageBox({
      type: 'info',
      title: 'No Updates Available',
      message: 'Cutrail is already up to date.',
    });
  });

  autoUpdater.on('error', async (error) => {
    const shouldShowDialog = manualCheckPending;
    manualCheckPending = false;
    isDownloading = false;

    if (!shouldShowDialog) {
      return;
    }

    await dialog.showMessageBox({
      type: 'error',
      title: 'Update Check Failed',
      message: 'Could not check for updates.',
      detail: String(error?.message ?? error),
    });
  });

  autoUpdater.on('update-downloaded', async () => {
    isDownloading = false;

    const response = await dialog.showMessageBox({
      type: 'info',
      title: 'Update Ready',
      message: 'An update has been downloaded and is ready to install.',
      detail: 'Restart Cutrail now to apply the update.',
      buttons: ['Restart and Install', 'Later'],
      defaultId: 0,
      cancelId: 1,
    });

    if (response.response === 0) {
      autoUpdater.quitAndInstall();
    }
  });

  return {
    isEnabled: true,
    checkForUpdates: async ({ manual = false } = {}) => {
      if (isChecking) {
        return false;
      }

      isChecking = true;
      manualCheckPending = manual;

      try {
        await autoUpdater.checkForUpdates();
        return true;
      } catch {
        return false;
      } finally {
        isChecking = false;
      }
    },
    getDisableReason: () => null,
  };
};

export {
  createAppUpdater,
};
