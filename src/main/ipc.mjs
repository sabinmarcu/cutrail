// @ts-check

import { registerHandlers } from './ipc/registerHandlers.mjs';
import { selectValidSourceVideo } from './sourceSelection.mjs';

/**
 * @typedef {import('electron').BrowserWindow | null} OptionalBrowserWindow
 */

/**
 * @typedef {{
 *   getPersistedOutputDirectory: () => Promise<string | null>,
 *   openEditorWindow: (sourcePath: string) => boolean,
 *   readThirdPartyNotices: () => Promise<string>,
 *   setPersistedOutputDirectory: (outputDirectory: string) => Promise<void>
 * }} RegisterIpcDeps
 */

/**
 * @param {RegisterIpcDeps} deps
 * @returns {void}
 */
const registerIpcHandlers = ({
  getPersistedOutputDirectory,
  openEditorWindow,
  readThirdPartyNotices,
  setPersistedOutputDirectory,
}) => {
  registerHandlers({
    getPersistedOutputDirectory,
    openEditorWindow,
    readThirdPartyNotices,
    selectValidSourceVideo,
    setPersistedOutputDirectory,
  });
};

export {
  registerIpcHandlers,
};
