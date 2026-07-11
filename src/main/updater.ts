import {
  app,
} from 'electron';
import electronUpdater from 'electron-updater';
import type { UpdateInfo } from 'electron-updater';
import { getAppEnvironment } from '../infra/env.ts';
import { fetchReleaseNotesBundleFromGitHub } from './releaseNotes.ts';
import { normalizeReleaseNotesText } from './releaseNotesFormatting.ts';

const { autoUpdater } = electronUpdater;

type UpdateDialogAction = {
  id: string;
  label: string;
  variant?: 'primary' | 'secondary';
};

type UpdateDialogVersionNotes = {
  version: string;
  notes: string;
};

type UpdateDialogState = {
  title: string;
  subtitle?: string;
  message: string;
  detail?: string;
  latestDetail?: string;
  olderVersionDetails?: UpdateDialogVersionNotes[];
  actions: UpdateDialogAction[];
  cancelAction?: string;
  progressPercent?: number;
  progressLabel?: string;
  showProgress?: boolean;
  persistOnActions?: string[];
};

type AppUpdater = {
  isEnabled: boolean;
  checkForUpdates: (options?: { manual?: boolean }) => Promise<boolean>;
  getDisableReason: () => string | null;
};

type CreateAppUpdaterDeps = {
  openUpdateDialog: (
    state: UpdateDialogState,
    options?: { reuseExistingWindow?: boolean },
  ) => Promise<string>;
  updateUpdateDialogState: (patch: Partial<UpdateDialogState>) => boolean;
};

const formatReleaseNotes = async (updateInfo: UpdateInfo): Promise<{
  latestDetail: string;
  olderVersionDetails: UpdateDialogVersionNotes[];
}> => {
  const { releaseNotes } = updateInfo;

  if (typeof releaseNotes === 'string' && releaseNotes.trim().length > 0) {
    return {
      latestDetail: normalizeReleaseNotesText(releaseNotes),
      olderVersionDetails: [],
    };
  }

  if (Array.isArray(releaseNotes)) {
    const releaseNotesEntries = releaseNotes
      .map((entry) => ({
        version: typeof entry?.version === 'string' ? entry.version.trim() : '',
        notes: typeof entry?.note === 'string' ? normalizeReleaseNotesText(entry.note).trim() : '',
      }))
      .filter((entry) => entry.notes.length > 0);

    if (releaseNotesEntries.length > 0) {
      const latestEntry = releaseNotesEntries[0];
      const olderVersionDetails = releaseNotesEntries
        .slice(1)
        .filter((entry) => entry.version.length > 0)
        .map((entry) => ({
          version: entry.version,
          notes: entry.notes,
        }));

      return {
        latestDetail: latestEntry.notes,
        olderVersionDetails,
      };
    }
  }

  const fallbackBundle = await fetchReleaseNotesBundleFromGitHub(updateInfo.version || '');

  if (fallbackBundle && fallbackBundle.latest.length > 0) {
    return {
      latestDetail: fallbackBundle.latest,
      olderVersionDetails: fallbackBundle.older,
    };
  }

  return {
    latestDetail: 'Release notes are not available for this version.',
    olderVersionDetails: [],
  };
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

  if (process.platform === 'linux' && !getAppEnvironment().appImagePath) {
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
}: CreateAppUpdaterDeps): AppUpdater => {
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

  autoUpdater.on('update-available', async (updateInfo: UpdateInfo) => {
    const version = updateInfo.version || 'a newer version';
    const notes = await formatReleaseNotes(updateInfo);

    const action = await openUpdateDialog({
      title: 'Update Available',
      message: `Cutrail ${version} is available.`,
      detail: notes.latestDetail,
      latestDetail: notes.latestDetail,
      olderVersionDetails: notes.olderVersionDetails,
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
        detail: '',
        latestDetail: '',
        olderVersionDetails: [],
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
      autoUpdater.downloadUpdate();
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
