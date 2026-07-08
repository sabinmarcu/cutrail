// @ts-check

import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { app } from 'electron';

const APP_UPDATE_CONFIG_PATH = path.join(process.resourcesPath, 'app-update.yml');
const AUR_STANDALONE_PREFIX = '/opt/cutrail-bin/';
const STANDALONE_NAME = 'Cutrail (standalone)';

/**
 * @returns {{
 *   desktopEntryPath: string,
 *   iconPath: string,
 *   installDirectory: string,
 *   installedAppImagePath: string,
 *   launcherPath: string,
 * }}
 */
const getStandalonePaths = () => {
  const homeDirectory = os.homedir();
  const installDirectory = path.join(homeDirectory, '.local', 'opt', 'cutrail-standalone');

  return {
    desktopEntryPath: path.join(homeDirectory, '.local', 'share', 'applications', 'cutrail-standalone.desktop'),
    iconPath: path.join(homeDirectory, '.local', 'share', 'icons', 'hicolor', '512x512', 'apps', 'cutrail-standalone.png'),
    installDirectory,
    installedAppImagePath: path.join(installDirectory, 'cutrail.AppImage'),
    launcherPath: path.join(homeDirectory, '.local', 'bin', 'cutrail-standalone'),
  };
};

/**
 * @returns {Promise<boolean>}
 */
const hasGitHubReleaseProviderConfig = async () => {
  try {
    const content = await fs.readFile(APP_UPDATE_CONFIG_PATH, 'utf8');
    return content.includes('provider: github')
      && content.includes('owner: sabinmarcu')
      && content.includes('repo: cutrail');
  } catch {
    return false;
  }
};

/**
 * @returns {boolean}
 */
const isPortableAppImageRun = () => {
  const appImagePath = process.env.APPIMAGE;

  return Boolean(appImagePath) && !appImagePath.startsWith(AUR_STANDALONE_PREFIX);
};

/**
 * @param {string} filePath
 * @returns {Promise<boolean>}
 */
const pathExists = async (filePath) => {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
};

/**
 * @returns {Promise<boolean>}
 */
const isStandaloneInstalled = async () => {
  const paths = getStandalonePaths();
  const [hasAppImage, hasLauncher, hasDesktopEntry] = await Promise.all([
    pathExists(paths.installedAppImagePath),
    pathExists(paths.launcherPath),
    pathExists(paths.desktopEntryPath),
  ]);

  return hasAppImage && hasLauncher && hasDesktopEntry;
};

/**
 * @returns {Promise<boolean>}
 */
const canOfferStandaloneInstall = async () => {
  if (process.platform !== 'linux' || !app.isPackaged || !isPortableAppImageRun()) {
    return false;
  }

  return hasGitHubReleaseProviderConfig();
};

/**
 * @returns {Promise<'install' | 'uninstall' | null>}
 */
const getStandaloneMenuAction = async () => {
  if (!await canOfferStandaloneInstall()) {
    return null;
  }

  return (await isStandaloneInstalled()) ? 'uninstall' : 'install';
};

export {
  getStandaloneMenuAction,
  getStandalonePaths,
  STANDALONE_NAME,
};
