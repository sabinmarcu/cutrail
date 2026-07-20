import { BrowserWindow } from 'electron';
import { buildWindowOptions } from './windowDefaults.ts';
import { loadRendererWindow } from './windowLoad.ts';
import { createUpdateDialogController } from './updateDialogController.ts';
import { getWindowPlacement } from './windowPlacement.ts';

const getWindowCount = (): number => BrowserWindow.getAllWindows().length;

type WindowManagerCreateInput = {
  appIconPath: string;
  devServerUrl?: string;
  forceNativeWindowDecorations: boolean;
  openDevToolsOnStart: boolean;
  preloadEntry: string;
  rendererEntry: string;
};

type WindowManagerApi = {
  createMainWindow: () => void;
  getUpdateDialogState: (senderWindow: BrowserWindow | null) => unknown;
  getWindowCount: () => number;
  openStartPage: () => boolean;
  openAboutWindow: () => Promise<boolean>;
  openDiagnosticsWindow: () => boolean;
  openEditorWindow: (sourcePath?: string) => boolean;
  openLibraryWindow: () => boolean;
  openLicensesWindow: () => boolean;
  openOptionsWindow: () => boolean;
  openUpdateDialog: ReturnType<typeof createUpdateDialogController>['openUpdateDialog'];
  updateUpdateDialogState: ReturnType<typeof createUpdateDialogController>['updateUpdateDialogState'];
  submitUpdateDialogAction: (senderWindow: BrowserWindow | null, action: string) => boolean;
};

type LoadModeOptions = {
  sourcePath?: string;
  targetWindow: BrowserWindow;
  mode: string;
};

type StandardWindowOptions = {
  height?: number;
  minHeight?: number;
  minWidth?: number;
  mode: string;
  sourcePath?: string;
  title?: string;
  width?: number;
};

const toErrorText = (error: unknown): string => {
  if (error instanceof Error) {
    return error.stack ?? error.message;
  }

  return String(error);
};

const attachWindowDiagnostics = (window: BrowserWindow, mode: string): void => {
  window.webContents.on('did-fail-load', (_event, code, description, validatedUrl) => {
    process.stderr.write(`[window:${mode}] did-fail-load code=${code} description=${description} url=${validatedUrl}\n`);
  });

  window.webContents.on('render-process-gone', (_event, details) => {
    process.stderr.write(`[window:${mode}] render-process-gone reason=${details.reason} exitCode=${details.exitCode}\n`);
  });

  window.webContents.on('preload-error', (_event, preloadPath, error) => {
    process.stderr.write(`[window:${mode}] preload-error path=${preloadPath} error=${toErrorText(error)}\n`);
  });

  window.webContents.on('console-message', (_event, level, message) => {
    if (level >= 2) {
      process.stderr.write(`[window:${mode}] console-message level=${level} message=${message}\n`);
    }
  });
};

type UtilityWindowMode = 'licenses' | 'options' | 'diagnostics' | 'library';

type OpenUtilityWindowOptions = {
  cacheKey: () => BrowserWindow | null;
  mode: UtilityWindowMode;
  title: string;
  size: { width: number; height: number; minWidth: number; minHeight: number };
};

const createWindowManager = ({
  appIconPath,
  devServerUrl,
  forceNativeWindowDecorations,
  openDevToolsOnStart,
  preloadEntry,
  rendererEntry,
}: WindowManagerCreateInput): WindowManagerApi => {
  let aboutWindow: BrowserWindow | null = null;
  let diagnosticsWindow: BrowserWindow | null = null;
  const editorWindows = new Set<BrowserWindow>();
  let libraryWindow: BrowserWindow | null = null;
  let licensesWindow: BrowserWindow | null = null;
  let mainWindow: BrowserWindow | null = null;
  let optionsWindow: BrowserWindow | null = null;

  /**
   * @param {{ sourcePath?: string, targetWindow: BrowserWindow, mode: string }} options
   * @returns {void}
   */
  const loadMode = ({
    sourcePath = '', targetWindow, mode,
  }: LoadModeOptions): void => {
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
  }: StandardWindowOptions): BrowserWindow => {
    const placement = getWindowPlacement({
      width,
      height,
    });

    const next = new BrowserWindow(buildWindowOptions({
      appIconPath,
      forceNativeWindowDecorations,
      height,
      minHeight,
      minWidth,
      preloadEntry,
      title,
      x: placement.x,
      y: placement.y,
      width,
    }));

    attachWindowDiagnostics(next, mode);

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
    *   mode: 'licenses' | 'options' | 'diagnostics' | 'library',
   *   title: string,
   *   size: { width: number, height: number, minWidth: number, minHeight: number }
   * }} options
   * @returns {BrowserWindow}
   */
  const openUtilityWindow = ({
    cacheKey, mode, title, size,
  }: OpenUtilityWindowOptions): BrowserWindow => {
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
      switch (mode) {
        case 'licenses': {
          licensesWindow = null;

          break;
        }
        case 'options': {
          optionsWindow = null;

          break;
        }
        case 'library': {
          libraryWindow = null;

          break;
        }
        default: {
          diagnosticsWindow = null;
        }
      }
    });

    switch (mode) {
      case 'licenses': {
        licensesWindow = next;

        break;
      }
      case 'options': {
        optionsWindow = next;

        break;
      }
      case 'library': {
        libraryWindow = next;

        break;
      }
      default: {
        diagnosticsWindow = next;
      }
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

  /** @returns {boolean} */
  const openLibraryWindow = () => {
    openUtilityWindow({
      cacheKey: () => libraryWindow,
      mode: 'library',
      title: 'Cutrail Library',
      size: {
        width: 1160,
        height: 760,
        minWidth: 900,
        minHeight: 600,
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

  /** @returns {boolean} */
  const openStartPage = () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.focus();

      return true;
    }

    createMainWindow();

    return true;
  };

  return {
    createMainWindow,
    getUpdateDialogState: updateDialogController.getUpdateDialogState,
    getWindowCount,
    openStartPage,
    openAboutWindow,
    openDiagnosticsWindow,
    openEditorWindow,
    openLibraryWindow,
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
