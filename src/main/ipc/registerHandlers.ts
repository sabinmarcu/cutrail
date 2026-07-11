import type { BrowserWindow } from 'electron';
import { registerCheckFfmpegHandler } from './handlers/checkFfmpeg.ts';
import { registerClipFileActionsHandler } from './handlers/clipFileActions.ts';
import { registerCreateExportPlanHandler } from './handlers/createExportPlan.ts';
import { registerDeleteClipRangeOutputsHandler } from './handlers/deleteClipRangeOutputs.ts';
import { registerGetAppMetadataHandler } from './handlers/getAppMetadata.ts';
import { registerGetFfmpegDiagnosticsHandler } from './handlers/getFfmpegDiagnostics.ts';
import { registerGetHideDefaultAudioTrackWhenMultipleHandler } from './handlers/getHideDefaultAudioTrackWhenMultiple.ts';
import { registerGetOutputDirectoryHandler } from './handlers/getOutputDirectory.ts';
import { registerGetThemePrimaryColorHandler } from './handlers/getThemePrimaryColor.ts';
import { registerGetSourceAudioTracksHandler } from './handlers/getSourceAudioTracks.ts';
import { registerGetSourceAudioTrackWaveformHandler } from './handlers/getSourceAudioTrackWaveform.ts';
import { registerGetSourceDirectoryHandler } from './handlers/getSourceDirectory.ts';
import { registerGetStartupWindowModeHandler } from './handlers/getStartupWindowMode.ts';
import { registerGetThirdPartyNoticesHandler } from './handlers/getThirdPartyNotices.ts';
import { registerGetUpdateDialogStateHandler } from './handlers/getUpdateDialogState.ts';
import { registerGetVideoLibraryHandler } from './handlers/getVideoLibrary.ts';
import { registerGetWindowDecorationMenuPreferenceHandler } from './handlers/getWindowDecorationMenuPreference.ts';
import { registerGetWindowMenuModelHandler } from './handlers/getWindowMenuModel.ts';
import { registerInvokeWindowMenuActionHandler } from './handlers/invokeWindowMenuAction.ts';
import { registerOpenAboutWindowHandler } from './handlers/openAboutWindow.ts';
import { registerOpenDiagnosticsWindowHandler } from './handlers/openDiagnosticsWindow.ts';
import { registerOpenLibraryWindowHandler } from './handlers/openLibraryWindow.ts';
import { registerOpenLicensesWindowHandler } from './handlers/openLicensesWindow.ts';
import { registerOpenOptionsWindowHandler } from './handlers/openOptionsWindow.ts';
import { registerOpenVideoEditorHandler } from './handlers/openVideoEditor.ts';
import { registerSyncExistingExportClipsHandler } from './handlers/syncExistingExportClips.ts';
import { registerStartFileDragHandler } from './handlers/startFileDrag.ts';
import { registerRunExportPlanHandler } from './handlers/runExportPlan.ts';
import { registerSelectOutputDirectoryHandler } from './handlers/selectOutputDirectory.ts';
import { registerSelectSourceDirectoryHandler } from './handlers/selectSourceDirectory.ts';
import { registerSelectSourceVideoHandler } from './handlers/selectSourceVideo.ts';
import { registerSetHideDefaultAudioTrackWhenMultipleHandler } from './handlers/setHideDefaultAudioTrackWhenMultiple.ts';
import { registerSetThemePrimaryColorHandler } from './handlers/setThemePrimaryColor.ts';
import { registerSetStartupWindowModeHandler } from './handlers/setStartupWindowMode.ts';
import { registerSetWindowDecorationMenuPreferenceHandler } from './handlers/setWindowDecorationMenuPreference.ts';
import { registerSubmitUpdateDialogActionHandler } from './handlers/submitUpdateDialogAction.ts';
import { registerWindowControlsHandler } from './handlers/windowControls.ts';
import type { WindowDecorationMenuPreferenceState } from '../../shared/contracts.ts';
import type { WindowMenuModel } from '../../shared/windowMenu.ts';
import type { ThemePrimaryColorValue } from '../../shared/themePrimaryColor.ts';

type HandlerDependencies = {
  getAppMetadata: () => Promise<{
    version: string;
    copyright: string;
    attribution: string;
    license: string;
  }>;
  getPersistedOutputDirectory: () => Promise<string | null>;
  getPersistedSourceDirectory: () => Promise<string | null>;
  getPersistedHideDefaultAudioTrackWhenMultiple: () => Promise<boolean>;
  getPersistedThemePrimaryColor: () => Promise<ThemePrimaryColorValue>;
  getPersistedStartupWindowMode: () => Promise<'splash' | 'library'>;
  getWindowDecorationMenuPreference: () => Promise<WindowDecorationMenuPreferenceState>;
  getWindowMenuModel: () => WindowMenuModel;
  invokeWindowMenuAction: (
    actionId: string,
    senderWindow: BrowserWindow | null,
  ) => Promise<boolean>;
  getUpdateDialogState: (senderWindow: BrowserWindow | null) => unknown;
  openAboutWindow: () => Promise<boolean> | boolean;
  openDiagnosticsWindow: () => boolean;
  openLibraryWindow: () => boolean;
  openLicensesWindow: () => boolean;
  openOptionsWindow: () => boolean;
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
  setPersistedHideDefaultAudioTrackWhenMultiple: (value: boolean) => Promise<void>;
  setPersistedThemePrimaryColor: (value: ThemePrimaryColorValue) => Promise<void>;
  setPersistedStartupWindowMode: (startupWindowMode: 'splash' | 'library') => Promise<void>;
  setWindowDecorationMenuPreference: (
    enabled: boolean,
  ) => Promise<WindowDecorationMenuPreferenceState>;
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
  registerGetStartupWindowModeHandler(deps);
  registerGetHideDefaultAudioTrackWhenMultipleHandler(deps);
  registerGetThemePrimaryColorHandler(deps);
  registerGetOutputDirectoryHandler(deps);
  registerGetVideoLibraryHandler(deps);
  registerGetSourceAudioTracksHandler();
  registerGetSourceAudioTrackWaveformHandler();
  registerGetFfmpegDiagnosticsHandler();
  registerGetThirdPartyNoticesHandler(deps);
  registerGetWindowDecorationMenuPreferenceHandler(deps);
  registerGetWindowMenuModelHandler(deps);
  registerGetUpdateDialogStateHandler(deps);
  registerInvokeWindowMenuActionHandler(deps);
  registerOpenAboutWindowHandler(deps);
  registerOpenDiagnosticsWindowHandler(deps);
  registerCreateExportPlanHandler();
  registerOpenLicensesWindowHandler(deps);
  registerOpenOptionsWindowHandler(deps);
  registerDeleteClipRangeOutputsHandler();
  registerSyncExistingExportClipsHandler();
  registerCheckFfmpegHandler();
  registerRunExportPlanHandler();
  registerStartFileDragHandler();
  registerClipFileActionsHandler();
  registerSubmitUpdateDialogActionHandler(deps);
  registerSetHideDefaultAudioTrackWhenMultipleHandler(deps);
  registerSetThemePrimaryColorHandler(deps);
  registerSetStartupWindowModeHandler(deps);
  registerSetWindowDecorationMenuPreferenceHandler(deps);
  registerWindowControlsHandler();
};

export {
  registerHandlers,
};
