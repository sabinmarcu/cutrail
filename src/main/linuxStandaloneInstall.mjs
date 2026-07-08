// @ts-check

import fs from 'node:fs/promises';
import path from 'node:path';
import { dialog } from 'electron';
import {
  getStandalonePaths,
  STANDALONE_NAME,
} from './linuxStandaloneState.mjs';

/**
 * @param {{ appIconPath: string }} options
 * @returns {Promise<void>}
 */
const installStandaloneAppImage = async ({ appIconPath }) => {
  const appImagePath = process.env.APPIMAGE;

  if (!appImagePath) {
    await dialog.showMessageBox({
      type: 'error',
      title: 'Standalone Install Unavailable',
      message: 'This action requires running from an AppImage build.',
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

  const confirm = await dialog.showMessageBox({
    type: 'question',
    title: 'Install Standalone Shortcut',
    message: 'Install this AppImage for the current user?',
    detail: `This copies the current AppImage into ${installDirectory} and adds ${STANDALONE_NAME} to your desktop app menu.`,
    buttons: ['Install', 'Cancel'],
    defaultId: 0,
    cancelId: 1,
  });

  if (confirm.response !== 0) {
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

    await dialog.showMessageBox({
      type: 'info',
      title: 'Standalone Install Complete',
      message: `${STANDALONE_NAME} is now installed for this user.`,
      detail: `Launcher: ${launcherPath}\nDesktop entry: ${desktopEntryPath}`,
    });
  } catch (error) {
    await dialog.showMessageBox({
      type: 'error',
      title: 'Standalone Install Failed',
      message: 'Could not install the standalone AppImage launcher.',
      detail: String(error),
    });
  }
};

/**
 * @returns {Promise<void>}
 */
const uninstallStandaloneAppImage = async () => {
  const {
    desktopEntryPath,
    iconPath,
    installDirectory,
    launcherPath,
  } = getStandalonePaths();

  const confirm = await dialog.showMessageBox({
    type: 'question',
    title: 'Uninstall Standalone Shortcut',
    message: `Remove ${STANDALONE_NAME} from this user account?`,
    detail: 'This removes the standalone launcher, desktop entry, icon, and copied AppImage.',
    buttons: ['Uninstall', 'Cancel'],
    defaultId: 0,
    cancelId: 1,
  });

  if (confirm.response !== 0) {
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

    await dialog.showMessageBox({
      type: 'info',
      title: 'Standalone Uninstall Complete',
      message: `${STANDALONE_NAME} was removed for this user.`,
    });
  } catch (error) {
    await dialog.showMessageBox({
      type: 'error',
      title: 'Standalone Uninstall Failed',
      message: 'Could not uninstall the standalone AppImage launcher.',
      detail: String(error),
    });
  }
};

export {
  installStandaloneAppImage,
  uninstallStandaloneAppImage,
};

export { getStandaloneMenuAction } from './linuxStandaloneState.mjs';
