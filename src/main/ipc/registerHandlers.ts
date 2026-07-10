import type { BrowserWindow } from 'electron';
import { registerCheckFfmpegHandler } from './handlers/checkFfmpeg.ts';
import { registerClipFileActionsHandler } from './handlers/clipFileActions.ts';
import { registerCreateExportPlanHandler } from './handlers/createExportPlan.ts';
import { registerDeleteClipRangeOutputsHandler } from './handlers/deleteClipRangeOutputs.ts';
import { registerGetAppMetadataHandler } from './handlers/getAppMetadata.ts';
import { registerGetFfmpegDiagnosticsHandler } from './handlers/getFfmpegDiagnostics.ts';
import { registerGetOutputDirectoryHandler } from './handlers/getOutputDirectory.ts';
import { registerGetSourceDirectoryHandler } from './handlers/getSourceDirectory.ts';
import { registerGetThirdPartyNoticesHandler } from './handlers/getThirdPartyNotices.ts';
import { registerGetUpdateDialogStateHandler } from './handlers/getUpdateDialogState.ts';
import { registerGetVideoLibraryHandler } from './handlers/getVideoLibrary.ts';
import { registerOpenLibraryWindowHandler } from './handlers/openLibraryWindow.ts';
import { registerOpenVideoEditorHandler } from './handlers/openVideoEditor.ts';
import { registerSyncExistingExportClipsHandler } from './handlers/syncExistingExportClips.ts';
import { registerStartFileDragHandler } from './handlers/startFileDrag.ts';
import { registerRunExportPlanHandler } from './handlers/runExportPlan.ts';
import { registerSelectOutputDirectoryHandler } from './handlers/selectOutputDirectory.ts';
import { registerSelectSourceDirectoryHandler } from './handlers/selectSourceDirectory.ts';
import { registerSelectSourceVideoHandler } from './handlers/selectSourceVideo.ts';
import { registerSubmitUpdateDialogActionHandler } from './handlers/submitUpdateDialogAction.ts';
import { registerWindowControlsHandler } from './handlers/windowControls.ts';

type HandlerDependencies = {
  getAppMetadata: () => Promise<{
    version: string;
    copyright: string;
    attribution: string;
    license: string;
  }>;
  getPersistedOutputDirectory: () => Promise<string | null>;
  getPersistedSourceDirectory: () => Promise<string | null>;
  getUpdateDialogState: (senderWindow: BrowserWindow | null) => unknown;
  openLibraryWindow: () => boolean;
  openEditorWindow: (sourcePath: string) => boolean;
  readThirdPartyNotices: () => Promise<string>;
  selectValidSourceVideo: (
    parentWindow: BrowserWindow | null,
  ) => Promise<string | null>;
  submitUpdateDialogAction: (
    senderWindow: BrowserWindow | null,
    action: string,
  ) => boolean;
  setPersistedOutputDirectory: (outputDirectory: string) => Promise<void>;
  setPersistedSourceDirectory: (sourceDirectory: string) => Promise<void>;
};

/**
 * @param {HandlerDependencies} deps
 * @returns {void}
 */
const registerHandlers = (deps: HandlerDependencies): void => {
  registerGetAppMetadataHandler(deps);
  registerSelectSourceVideoHandler(deps);
  registerOpenLibraryWindowHandler(deps);
  registerOpenVideoEditorHandler(deps);
  registerSelectSourceDirectoryHandler(deps);
  registerSelectOutputDirectoryHandler(deps);
  registerGetSourceDirectoryHandler(deps);
  registerGetOutputDirectoryHandler(deps);
  registerGetVideoLibraryHandler(deps);
  registerGetFfmpegDiagnosticsHandler();
  registerGetThirdPartyNoticesHandler(deps);
  registerGetUpdateDialogStateHandler(deps);
  registerCreateExportPlanHandler();
  registerDeleteClipRangeOutputsHandler();
  registerSyncExistingExportClipsHandler();
  registerCheckFfmpegHandler();
  registerRunExportPlanHandler();
  registerStartFileDragHandler();
  registerClipFileActionsHandler();
  registerSubmitUpdateDialogActionHandler(deps);
  registerWindowControlsHandler();
};

export {
  registerHandlers,
};
