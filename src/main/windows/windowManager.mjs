// @ts-check

import { BrowserWindow } from 'electron';
import { buildWindowOptions } from './windowDefaults.mjs';
import { loadRendererWindow } from './windowLoad.mjs';
import { createUpdateDialogController } from './updateDialogController.mjs';
import { getWindowPlacement } from './windowPlacement.mjs';

/**
 * @typedef {{
 *   appIconPath: string,
 *   devServerUrl?: string,
 *   openDevToolsOnStart: boolean,
 *   preloadEntry: string,
 *   rendererEntry: string
 * }} WindowManagerCreateInput
 */

/**
 * @typedef {{
 *   createMainWindow: () => void,
 *   getUpdateDialogState: (senderWindow: BrowserWindow | null) => unknown,
 *   getWindowCount: () => number,
 *   openAboutWindow: () => Promise<boolean>,
 *   openDiagnosticsWindow: () => boolean,
 *   openEditorWindow: (sourcePath?: string) => boolean,
 *   openLicensesWindow: () => boolean,
 *   openOptionsWindow: () => boolean,
 *   openUpdateDialog: (state: unknown, options?: unknown) => Promise<string>,
 *   updateUpdateDialogState: (patch: unknown) => boolean,
 *   submitUpdateDialogAction: (senderWindow: BrowserWindow | null, action: string) => boolean
 * }} WindowManagerApi
 */

/**
 * @param {WindowManagerCreateInput} input
 * @returns {WindowManagerApi}
 */
const createWindowManager = ({
  appIconPath,
  devServerUrl,
  openDevToolsOnStart,
  preloadEntry,
  rendererEntry,
}) => {
  /** @type {BrowserWindow | null} */
  let aboutWindow = null;
  /** @type {BrowserWindow | null} */
  let diagnosticsWindow = null;
  /** @type {Set<BrowserWindow>} */
  const editorWindows = new Set();
  /** @type {BrowserWindow | null} */
  let licensesWindow = null;
  /** @type {BrowserWindow | null} */
  let mainWindow = null;
  /** @type {BrowserWindow | null} */
  let optionsWindow = null;

  /**
   * @param {{ sourcePath?: string, targetWindow: BrowserWindow, mode: string }} options
   * @returns {void}
   */
  const loadMode = ({
    sourcePath = '', targetWindow, mode,
  }) => {
    loadRendererWindow({
      devServerUrl,
      rendererEntry,
      window: targetWindow,
      mode,
      sourcePath,
    });
  };

  /**
   * @param {{
   *   height: number,
    *   minHeight: number,
    *   minWidth: number,
   *   mode: string,
   *   sourcePath?: string,
   *   title?: string,
   *   width: number
   * }} options
   * @returns {BrowserWindow}
   */
  const createStandardWindow = ({
    height = 720,
    minHeight = 0,
    minWidth = 0,
    mode,
    sourcePath = '',
    title,
    width = 960,
  }) => {
    const placement = getWindowPlacement({
      width,
      height,
    });

    const next = new BrowserWindow(buildWindowOptions({
      appIconPath,
      height,
      minHeight,
      minWidth,
      preloadEntry,
      title,
      x: placement.x,
      y: placement.y,
      width,
    }));

    loadMode({
      targetWindow: next,
      mode,
      sourcePath,
    });

    return next;
  };

  const updateDialogController = createUpdateDialogController({ createStandardWindow });

  /** @returns {Promise<boolean>} */
  const openAboutWindow = async () => {
    if (aboutWindow && !aboutWindow.isDestroyed()) {
      aboutWindow.focus();

      return true;
    }

    aboutWindow = createStandardWindow({
      width: 760,
      height: 560,
      minWidth: 680,
      minHeight: 500,
      mode: 'about',
      title: 'About Cutrail',
    });

    aboutWindow.on('closed', () => {
      aboutWindow = null;
    });

    return true;
  };

  /**
   * @param {{
   *   cacheKey: () => BrowserWindow | null,
   *   mode: 'licenses' | 'options' | 'diagnostics',
   *   title: string,
   *   size: { width: number, height: number, minWidth: number, minHeight: number }
   * }} options
   * @returns {BrowserWindow}
   */
  const openUtilityWindow = ({
    cacheKey, mode, title, size,
  }) => {
    const current = cacheKey();

    if (current && !current.isDestroyed()) {
      current.focus();

      return current;
    }

    const next = createStandardWindow({
      width: size.width,
      height: size.height,
      minWidth: size.minWidth,
      minHeight: size.minHeight,
      mode,
      title,
    });

    next.on('closed', () => {
      if (mode === 'licenses') {
        licensesWindow = null;
      } else if (mode === 'options') {
        optionsWindow = null;
      } else {
        diagnosticsWindow = null;
      }
    });

    if (mode === 'licenses') {
      licensesWindow = next;
    } else if (mode === 'options') {
      optionsWindow = next;
    } else {
      diagnosticsWindow = next;
    }

    return next;
  };

  /** @returns {boolean} */
  const openLicensesWindow = () => {
    openUtilityWindow({
      cacheKey: () => licensesWindow,
      mode: 'licenses',
      title: 'Cutrail Licenses & Notices',
      size: {
        width: 860,
        height: 760,
        minWidth: 720,
        minHeight: 560,
      },
    });

    return true;
  };

  /** @returns {boolean} */
  const openDiagnosticsWindow = () => {
    openUtilityWindow({
      cacheKey: () => diagnosticsWindow,
      mode: 'diagnostics',
      title: 'Cutrail Diagnostics',
      size: {
        width: 860,
        height: 760,
        minWidth: 720,
        minHeight: 560,
      },
    });

    return true;
  };

  /** @returns {boolean} */
  const openOptionsWindow = () => {
    openUtilityWindow({
      cacheKey: () => optionsWindow,
      mode: 'options',
      title: 'Cutrail Options',
      size: {
        width: 760,
        height: 480,
        minWidth: 640,
        minHeight: 360,
      },
    });

    return true;
  };

  /**
   * @param {string} [sourcePath='']
   * @returns {boolean}
   */
  const openEditorWindow = (sourcePath = '') => {
    const nextSourcePath = typeof sourcePath === 'string' ? sourcePath : '';
    const editorWindow = createStandardWindow({
      width: 1280,
      height: 820,
      minWidth: 980,
      minHeight: 620,
      mode: 'editor',
      sourcePath: nextSourcePath,
    });

    editorWindows.add(editorWindow);

    editorWindow.on('closed', () => {
      editorWindows.delete(editorWindow);
    });

    if (openDevToolsOnStart) {
      editorWindow.webContents.openDevTools({ mode: 'detach' });
    }

    return true;
  };

  /** @returns {void} */
  const createMainWindow = () => {
    mainWindow = createStandardWindow({
      width: 720,
      height: 560,
      minWidth: 640,
      minHeight: 420,
      mode: 'app',
    });

    mainWindow.on('closed', () => {
      mainWindow = null;
    });

    if (openDevToolsOnStart) {
      mainWindow.webContents.openDevTools({ mode: 'detach' });
    }
  };

  /** @returns {number} */
  const getWindowCount = () => BrowserWindow.getAllWindows().length;

  return {
    createMainWindow,
    getUpdateDialogState: updateDialogController.getUpdateDialogState,
    getWindowCount,
    openAboutWindow,
    openDiagnosticsWindow,
    openEditorWindow,
    openLicensesWindow,
    openOptionsWindow,
    openUpdateDialog: updateDialogController.openUpdateDialog,
    updateUpdateDialogState: updateDialogController.updateUpdateDialogState,
    submitUpdateDialogAction: updateDialogController.submitUpdateDialogAction,
  };
};

export {
  createWindowManager,
};
