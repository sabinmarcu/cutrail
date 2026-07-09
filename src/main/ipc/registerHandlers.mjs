// @ts-check

import { registerCheckFfmpegHandler } from './handlers/checkFfmpeg.mjs';
import { registerCreateExportPlanHandler } from './handlers/createExportPlan.mjs';
import { registerGetFfmpegDiagnosticsHandler } from './handlers/getFfmpegDiagnostics.mjs';
import { registerGetOutputDirectoryHandler } from './handlers/getOutputDirectory.mjs';
import { registerGetThirdPartyNoticesHandler } from './handlers/getThirdPartyNotices.mjs';
import { registerGetUpdateDialogStateHandler } from './handlers/getUpdateDialogState.mjs';
import { registerOpenVideoEditorHandler } from './handlers/openVideoEditor.mjs';
import { registerRunExportPlanHandler } from './handlers/runExportPlan.mjs';
import { registerSelectOutputDirectoryHandler } from './handlers/selectOutputDirectory.mjs';
import { registerSelectSourceVideoHandler } from './handlers/selectSourceVideo.mjs';
import { registerSubmitUpdateDialogActionHandler } from './handlers/submitUpdateDialogAction.mjs';
import { registerWindowControlsHandler } from './handlers/windowControls.mjs';

/**
 * @typedef {{
 *   getPersistedOutputDirectory: () => Promise<string | null>,
 *   getUpdateDialogState: (senderWindow: import('electron').BrowserWindow | null) => unknown,
 *   openEditorWindow: (sourcePath: string) => boolean,
 *   readThirdPartyNotices: () => Promise<string>,
 *   selectValidSourceVideo: (parentWindow: import('electron').BrowserWindow | null) => Promise<string | null>,
 *   submitUpdateDialogAction: (senderWindow: import('electron').BrowserWindow | null, action: string) => boolean,
 *   setPersistedOutputDirectory: (outputDirectory: string) => Promise<void>
 * }} HandlerDependencies
 */

/**
 * @param {HandlerDependencies} deps
 * @returns {void}
 */
const registerHandlers = (deps) => {
  registerSelectSourceVideoHandler(deps);
  registerOpenVideoEditorHandler(deps);
  registerSelectOutputDirectoryHandler(deps);
  registerGetOutputDirectoryHandler(deps);
  registerGetFfmpegDiagnosticsHandler();
  registerGetThirdPartyNoticesHandler(deps);
  registerGetUpdateDialogStateHandler(deps);
  registerCreateExportPlanHandler();
  registerCheckFfmpegHandler();
  registerRunExportPlanHandler();
  registerSubmitUpdateDialogActionHandler(deps);
  registerWindowControlsHandler();
};

export {
  registerHandlers,
};
