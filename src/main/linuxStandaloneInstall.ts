import fs from 'node:fs/promises';
import path from 'node:path';
import { getAppEnvironment } from '../infra/env.ts';
import {
  getStandalonePaths,
  STANDALONE_NAME,
} from './linuxStandaloneState.ts';

type DialogAction = { id: string; label: string; variant?: 'primary' | 'secondary' };

type DialogState = {
  title: string;
  subtitle?: string;
  message: string;
  detail?: string;
  actions: DialogAction[];
  cancelAction?: string;
  persistOnActions?: string[];
};

type DialogDeps = {
  openDialog: (state: DialogState, options?: { reuseExistingWindow?: boolean }) => Promise<string>;
};

type InstallStandaloneOptions = {
  appIconPath: string;
} & DialogDeps;

const installStandaloneAppImage = async ({
  appIconPath,
  openDialog,
}: InstallStandaloneOptions): Promise<void> => {
  const { appImagePath } = getAppEnvironment();

  if (!appImagePath) {
    await openDialog({
      title: 'Standalone Install Unavailable',
      message: 'This action requires running from an AppImage build.',
      actions: [{
        id: 'close',
        label: 'Close',
        variant: 'primary',
      }],
      cancelAction: 'close',
    });
    return;
  }

  const {
    desktopEntryPath,
    iconPath,
    installDirectory,
    installedAppImagePath,
    launcherPath,
  } = getStandalonePaths();

  const confirmAction = await openDialog({
    title: 'Install Standalone Shortcut',
    message: 'Install this AppImage for the current user?',
    detail: `This copies the current AppImage into ${installDirectory} and adds ${STANDALONE_NAME} to your desktop app menu.`,
    actions: [
      {
        id: 'install',
        label: 'Install',
        variant: 'primary',
      },
      {
        id: 'cancel',
        label: 'Cancel',
        variant: 'secondary',
      },
    ],
    persistOnActions: ['install'],
    cancelAction: 'cancel',
  });

  if (confirmAction !== 'install') {
    return;
  }

  const launcherScript = [
    '#!/usr/bin/env sh',
    '# Defensive guard for zsh nounset environments.',
    'set +u 2>/dev/null || true',
    `exec env APPIMAGELAUNCHER_DISABLE=1 DESKTOPINTEGRATION=false "${installedAppImagePath}" "$@"`,
    '',
  ].join('\n');

  const desktopEntry = [
    '[Desktop Entry]',
    'Version=1.0',
    'Type=Application',
    `Name=${STANDALONE_NAME}`,
    'Comment=Desktop video clipping utility for batch range exports',
    `Exec=${launcherPath} %U`,
    'Terminal=false',
    `Icon=${iconPath}`,
    'Categories=Utility;',
    'StartupWMClass=Cutrail',
    '',
  ].join('\n');

  try {
    const iconDirectory = path.dirname(iconPath);
    const binDirectory = path.dirname(launcherPath);
    const desktopDirectory = path.dirname(desktopEntryPath);

    await fs.mkdir(installDirectory, { recursive: true });
    await fs.mkdir(binDirectory, { recursive: true });
    await fs.mkdir(desktopDirectory, { recursive: true });
    await fs.mkdir(iconDirectory, { recursive: true });

    await fs.copyFile(appImagePath, installedAppImagePath);
    await fs.chmod(installedAppImagePath, 0o755);

    await fs.copyFile(appIconPath, iconPath);
    await fs.chmod(iconPath, 0o644);

    await fs.writeFile(launcherPath, launcherScript, 'utf8');
    await fs.chmod(launcherPath, 0o755);

    await fs.writeFile(desktopEntryPath, desktopEntry, 'utf8');
    await fs.chmod(desktopEntryPath, 0o644);

    const postInstallAction = await openDialog({
      title: 'Uninstall Standalone Shortcut',
      message: `${STANDALONE_NAME} is now installed for this user.`,
      detail: `Launcher: ${launcherPath}\nDesktop entry: ${desktopEntryPath}`,
      actions: [
        {
          id: 'uninstall',
          label: 'Uninstall',
          variant: 'primary',
        },
        {
          id: 'close',
          label: 'Close',
          variant: 'secondary',
        },
      ],
      cancelAction: 'close',
    }, { reuseExistingWindow: true });

    if (postInstallAction === 'uninstall') {
      await Promise.all([
        fs.rm(launcherPath, { force: true }),
        fs.rm(desktopEntryPath, { force: true }),
        fs.rm(iconPath, { force: true }),
        fs.rm(installDirectory, {
          recursive: true,
          force: true,
        }),
      ]);

      await openDialog({
        title: 'Standalone Uninstall Complete',
        message: `${STANDALONE_NAME} was removed for this user.`,
        actions: [{
          id: 'close',
          label: 'Close',
          variant: 'primary',
        }],
        cancelAction: 'close',
      }, { reuseExistingWindow: true });
    }
  } catch (error) {
    await openDialog({
      title: 'Standalone Install Failed',
      message: 'Could not install the standalone AppImage launcher.',
      detail: String(error),
      actions: [{
        id: 'close',
        label: 'Close',
        variant: 'primary',
      }],
      cancelAction: 'close',
    });
  }
};

const uninstallStandaloneAppImage = async ({ openDialog }: DialogDeps): Promise<void> => {
  const {
    desktopEntryPath,
    iconPath,
    installDirectory,
    launcherPath,
  } = getStandalonePaths();

  const confirmAction = await openDialog({
    title: 'Uninstall Standalone Shortcut',
    message: `Remove ${STANDALONE_NAME} from this user account?`,
    detail: 'This removes the standalone launcher, desktop entry, icon, and copied AppImage.',
    actions: [
      {
        id: 'uninstall',
        label: 'Uninstall',
        variant: 'primary',
      },
      {
        id: 'cancel',
        label: 'Cancel',
        variant: 'secondary',
      },
    ],
    cancelAction: 'cancel',
  });

  if (confirmAction !== 'uninstall') {
    return;
  }

  try {
    await Promise.all([
      fs.rm(launcherPath, { force: true }),
      fs.rm(desktopEntryPath, { force: true }),
      fs.rm(iconPath, { force: true }),
      fs.rm(installDirectory, {
        recursive: true,
        force: true,
      }),
    ]);

    await openDialog({
      title: 'Standalone Uninstall Complete',
      message: `${STANDALONE_NAME} was removed for this user.`,
      actions: [{
        id: 'close',
        label: 'Close',
        variant: 'primary',
      }],
      cancelAction: 'close',
    });
  } catch (error) {
    await openDialog({
      title: 'Standalone Uninstall Failed',
      message: 'Could not uninstall the standalone AppImage launcher.',
      detail: String(error),
      actions: [{
        id: 'close',
        label: 'Close',
        variant: 'primary',
      }],
      cancelAction: 'close',
    });
  }
};

export {
  installStandaloneAppImage,
  uninstallStandaloneAppImage,
};

export { getStandaloneMenuAction } from './linuxStandaloneState.ts';
