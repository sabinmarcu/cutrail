// @ts-check

import { registerHandlers } from './ipc/registerHandlers.mjs';
import { selectValidSourceVideo } from './sourceSelection.mjs';

/**
 * @typedef {import('electron').BrowserWindow | null} OptionalBrowserWindow
 */

/**
 * @typedef {{
 *   getPersistedOutputDirectory: () => Promise<string | null>,
 *   getUpdateDialogState: (senderWindow: OptionalBrowserWindow) => unknown,
 *   openEditorWindow: (sourcePath: string) => boolean,
 *   readThirdPartyNotices: () => Promise<string>,
 *   submitUpdateDialogAction: (senderWindow: OptionalBrowserWindow, action: string) => boolean,
 *   setPersistedOutputDirectory: (outputDirectory: string) => Promise<void>
 * }} RegisterIpcDeps
 */

/**
 * @param {RegisterIpcDeps} deps
 * @returns {void}
 */
const registerIpcHandlers = ({
  getPersistedOutputDirectory,
  getUpdateDialogState,
  openEditorWindow,
  readThirdPartyNotices,
  submitUpdateDialogAction,
  setPersistedOutputDirectory,
}) => {
  registerHandlers({
    getPersistedOutputDirectory,
    getUpdateDialogState,
    openEditorWindow,
    readThirdPartyNotices,
    selectValidSourceVideo,
    submitUpdateDialogAction,
    setPersistedOutputDirectory,
  });
};

export {
  registerIpcHandlers,
};
