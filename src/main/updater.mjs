// @ts-check

import {
  app,
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
 * @typedef {{
 *   openUpdateDialog: (state: {
 *     title: string,
 *     subtitle?: string,
 *     message: string,
 *     detail?: string,
 *     actions: Array<{ id: string, label: string, variant?: 'primary' | 'secondary' }>,
 *     cancelAction?: string,
 *     progressPercent?: number,
 *     progressLabel?: string,
 *     showProgress?: boolean,
 *     persistOnActions?: string[]
 *   }, options?: { reuseExistingWindow?: boolean }) => Promise<string>,
 *   updateUpdateDialogState: (patch: {
 *     title?: string,
 *     subtitle?: string,
 *     message?: string,
 *     detail?: string,
 *     actions?: Array<{ id: string, label: string, variant?: 'primary' | 'secondary' }>,
 *     cancelAction?: string,
 *     progressPercent?: number,
 *     progressLabel?: string,
 *     showProgress?: boolean,
 *     persistOnActions?: string[]
 *   }) => boolean
 * }} CreateAppUpdaterDeps
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
      .map((entry) => (typeof entry?.note === 'string' ? entry.note.trim() : ''))
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
 * @param {CreateAppUpdaterDeps} deps
 * @returns {AppUpdater}
 */
const createAppUpdater = ({
  openUpdateDialog,
  updateUpdateDialogState,
}) => {
  const availability = getUpdaterAvailability();

  if (!availability.enabled) {
    return {
      isEnabled: false,
      checkForUpdates: async ({ manual = false } = {}) => {
        if (manual && availability.reason) {
          await openUpdateDialog({
            title: 'Cutrail Updates',
            message: availability.reason,
            actions: [{
              id: 'ok',
              label: 'Close',
              variant: 'primary',
            }],
            cancelAction: 'ok',
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

    const action = await openUpdateDialog({
      title: 'Update Available',
      message: `Cutrail ${version} is available.`,
      detail: releaseNotes,
      showProgress: false,
      progressPercent: 0,
      progressLabel: '0%',
      actions: [
        {
          id: 'download',
          label: 'Download Update',
          variant: 'primary',
        },
        {
          id: 'later',
          label: 'Later',
          variant: 'secondary',
        },
      ],
      persistOnActions: ['download'],
      cancelAction: 'later',
    });

    manualCheckPending = false;

    if (action === 'download' && !isDownloading) {
      isDownloading = true;
      updateUpdateDialogState({
        title: 'Downloading Update',
        subtitle: 'Downloading release package',
        message: 'Downloading update package. You can continue using Cutrail while this completes.',
        showProgress: true,
        progressPercent: 0,
        progressLabel: '0%',
        actions: [
          {
            id: 'later',
            label: 'Later',
            variant: 'secondary',
          },
        ],
        persistOnActions: [],
        cancelAction: 'later',
      });
      void autoUpdater.downloadUpdate();
    }
  });

  autoUpdater.on('download-progress', (progressInfo) => {
    if (!isDownloading) {
      return;
    }

    const rawPercent = typeof progressInfo?.percent === 'number' ? progressInfo.percent : 0;
    const progressPercent = Math.max(0, Math.min(100, Number(rawPercent.toFixed(1))));

    updateUpdateDialogState({
      showProgress: true,
      progressPercent,
      progressLabel: `${progressPercent.toFixed(1)}%`,
    });
  });

  autoUpdater.on('update-not-available', async () => {
    if (!manualCheckPending) {
      return;
    }

    manualCheckPending = false;

    await openUpdateDialog({
      title: 'No Updates Available',
      message: 'Cutrail is already up to date.',
      actions: [{
        id: 'ok',
        label: 'Close',
        variant: 'primary',
      }],
      cancelAction: 'ok',
    });
  });

  autoUpdater.on('error', async (error) => {
    const shouldShowDialog = manualCheckPending;
    manualCheckPending = false;
    isDownloading = false;

    updateUpdateDialogState({
      showProgress: false,
      progressPercent: 0,
      progressLabel: '',
    });

    if (!shouldShowDialog) {
      return;
    }

    await openUpdateDialog({
      title: 'Update Check Failed',
      message: 'Could not check for updates.',
      detail: String(error?.message ?? error),
      actions: [{
        id: 'ok',
        label: 'Close',
        variant: 'primary',
      }],
      cancelAction: 'ok',
    });
  });

  autoUpdater.on('update-downloaded', async () => {
    isDownloading = false;

    const action = await openUpdateDialog({
      title: 'Update Ready',
      subtitle: 'Install update',
      message: 'An update has been downloaded and is ready to install.',
      detail: 'Restart Cutrail now to apply the update.',
      showProgress: false,
      progressPercent: 100,
      progressLabel: '100%',
      actions: [
        {
          id: 'restart',
          label: 'Restart and Install',
          variant: 'primary',
        },
        {
          id: 'later',
          label: 'Later',
          variant: 'secondary',
        },
      ],
      cancelAction: 'later',
    }, { reuseExistingWindow: true });

    if (action === 'restart') {
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
