import {
  contextBridge,
  ipcRenderer,
  webUtils,
  type IpcRendererEvent,
} from 'electron';

import type {
  CutrailBridge,
  ExistingExportClipsSnapshot,
  ExportProgressPayload,
  StartupWindowMode,
  UpdateDialogState,
} from '../shared/contracts.ts';

const resolveMediaUrl = (inputPath: string): string => {
  if (inputPath.length === 0) {
    return '';
  }

  return `cutrail-media://local/${encodeURIComponent(inputPath)}`;
};

const subscribeToChannel = <TPayload>(
  channel: string,
  listener: (payload: TPayload) => void,
): (() => void) => {
  if (typeof listener !== 'function') {
    throw new TypeError('listener must be a function');
  }

  const wrappedListener = (_event: IpcRendererEvent, payload: unknown) => {
    listener(payload as TPayload);
  };

  ipcRenderer.on(channel, wrappedListener);

  return () => {
    ipcRenderer.removeListener(channel, wrappedListener);
  };
};

export const cutrailBridge: CutrailBridge = {
  getRuntimeInfo: () => ({
    electron: process.versions.electron,
    chrome: process.versions.chrome,
    node: process.versions.node,
  }),
  getAppMetadata: () => ipcRenderer.invoke('cutrail:get-app-metadata'),
  closeWindow: () => ipcRenderer.invoke('cutrail:window-control', 'close'),
  minimizeWindow: () => ipcRenderer.invoke('cutrail:window-control', 'minimize'),
  toggleWindowMaximize: () => ipcRenderer.invoke('cutrail:window-control', 'maximize'),
  exitWindowFullscreen: () => ipcRenderer.invoke('cutrail:window-control', 'exit-fullscreen'),
  getWindowFullscreenState: () => ipcRenderer.invoke('cutrail:get-window-fullscreen-state'),
  openAboutWindow: () => ipcRenderer.invoke('cutrail:open-about-window'),
  openDiagnosticsWindow: () => ipcRenderer.invoke('cutrail:open-diagnostics-window'),
  openLibraryWindow: () => ipcRenderer.invoke('cutrail:open-library-window'),
  openLicensesWindow: () => ipcRenderer.invoke('cutrail:open-licenses-window'),
  openOptionsWindow: () => ipcRenderer.invoke('cutrail:open-options-window'),
  getWindowDecorationMenuPreference: () => ipcRenderer.invoke('cutrail:get-window-decoration-menu-preference'),
  setWindowDecorationMenuPreference: (
    enabled: Parameters<CutrailBridge['setWindowDecorationMenuPreference']>[0],
  ) => ipcRenderer.invoke('cutrail:set-window-decoration-menu-preference', enabled),
  getWindowMenuModel: () => ipcRenderer.invoke('cutrail:get-window-menu-model'),
  invokeWindowMenuAction: (actionId: Parameters<CutrailBridge['invokeWindowMenuAction']>[0]) => ipcRenderer.invoke('cutrail:invoke-window-menu-action', actionId),
  getStartupWindowMode: () => ipcRenderer.invoke('cutrail:get-startup-window-mode'),
  setStartupWindowMode: (mode: Parameters<CutrailBridge['setStartupWindowMode']>[0]) => ipcRenderer.invoke('cutrail:set-startup-window-mode', mode),
  getFfmpegResolutionMode: () => ipcRenderer.invoke('cutrail:get-ffmpeg-resolution-mode'),
  setFfmpegResolutionMode: (mode: Parameters<CutrailBridge['setFfmpegResolutionMode']>[0]) => ipcRenderer.invoke('cutrail:set-ffmpeg-resolution-mode', mode),
  getFfprobeResolutionMode: () => ipcRenderer.invoke('cutrail:get-ffprobe-resolution-mode'),
  setFfprobeResolutionMode: (mode: Parameters<CutrailBridge['setFfprobeResolutionMode']>[0]) => ipcRenderer.invoke('cutrail:set-ffprobe-resolution-mode', mode),
  getSourceDirectory: () => ipcRenderer.invoke('cutrail:get-source-directory'),
  getOutputDirectory: () => ipcRenderer.invoke('cutrail:get-output-directory'),
  getVideoLibrary: () => ipcRenderer.invoke('cutrail:get-video-library'),
  getSourceAudioTracks: (payload: Parameters<CutrailBridge['getSourceAudioTracks']>[0]) => ipcRenderer.invoke('cutrail:get-source-audio-tracks', payload),
  getSourceAudioTrackWaveform: (payload: Parameters<CutrailBridge['getSourceAudioTrackWaveform']>[0]) => ipcRenderer.invoke('cutrail:get-source-audio-track-waveform', payload),
  getFfmpegDiagnostics: () => ipcRenderer.invoke('cutrail:get-ffmpeg-diagnostics'),
  getFfprobeDiagnostics: () => ipcRenderer.invoke('cutrail:get-ffprobe-diagnostics'),
  getThirdPartyNotices: () => ipcRenderer.invoke('cutrail:get-third-party-notices'),
  getUpdateDialogState: () => ipcRenderer.invoke('cutrail:get-update-dialog-state'),
  getDefaultTrimMode: () => ipcRenderer.invoke('cutrail:get-default-trim-mode'),
  getHideDefaultAudioTrackWhenMultiple: () => ipcRenderer.invoke('cutrail:get-hide-default-audio-track-when-multiple'),
  getThemePrimaryColor: () => ipcRenderer.invoke('cutrail:get-theme-primary-color'),
  getPathForFile: (file: Parameters<CutrailBridge['getPathForFile']>[0]) => {
    if (!file) {
      return null;
    }

    try {
      const resolvedPath = webUtils.getPathForFile(file);

      return typeof resolvedPath === 'string' && resolvedPath.length > 0 ? resolvedPath : null;
    } catch {
      return null;
    }
  },
  deleteClipRangeOutputs: (payload: Parameters<CutrailBridge['deleteClipRangeOutputs']>[0]) => ipcRenderer.invoke('cutrail:delete-clip-range-outputs', payload),
  onExistingExportClipsUpdated: (listener: Parameters<CutrailBridge['onExistingExportClipsUpdated']>[0]) => subscribeToChannel<ExistingExportClipsSnapshot>(
    'cutrail:existing-export-clips-updated',
    listener,
  ),
  syncExistingExportClips: (payload: Parameters<CutrailBridge['syncExistingExportClips']>[0]) => ipcRenderer.invoke('cutrail:sync-existing-export-clips', payload),
  openVideoEditor: (payload: Parameters<CutrailBridge['openVideoEditor']>[0]) => ipcRenderer.invoke('cutrail:open-video-editor', payload),
  selectSourceVideo: () => ipcRenderer.invoke('cutrail:select-source-video'),
  selectSourceDirectory: () => ipcRenderer.invoke('cutrail:select-source-directory'),
  selectOutputDirectory: () => ipcRenderer.invoke('cutrail:select-output-directory'),
  setDefaultTrimMode: (trimMode: Parameters<CutrailBridge['setDefaultTrimMode']>[0]) => ipcRenderer.invoke('cutrail:set-default-trim-mode', trimMode),
  setHideDefaultAudioTrackWhenMultiple: (value: Parameters<CutrailBridge['setHideDefaultAudioTrackWhenMultiple']>[0]) => ipcRenderer.invoke('cutrail:set-hide-default-audio-track-when-multiple', value),
  setThemePrimaryColor: (color: Parameters<CutrailBridge['setThemePrimaryColor']>[0]) => ipcRenderer.invoke('cutrail:set-theme-primary-color', color),
  resolveMediaUrl,
  checkFfmpeg: () => ipcRenderer.invoke('cutrail:check-ffmpeg'),
  checkFfprobe: () => ipcRenderer.invoke('cutrail:check-ffprobe'),
  createExportPlan: (payload: Parameters<CutrailBridge['createExportPlan']>[0]) => ipcRenderer.invoke('cutrail:create-export-plan', payload),
  runExportPlan: (payload: Parameters<CutrailBridge['runExportPlan']>[0]) => ipcRenderer.invoke('cutrail:run-export-plan', payload),
  startFileDrag: (payload: Parameters<CutrailBridge['startFileDrag']>[0]) => ipcRenderer.send('cutrail:start-file-drag', payload),
  copyClipFile: (filePath: Parameters<CutrailBridge['copyClipFile']>[0]) => ipcRenderer.invoke('cutrail:clip-file-action', {
    action: 'copy-file',
    filePath,
  }),
  copyClipPath: (filePath: Parameters<CutrailBridge['copyClipPath']>[0]) => ipcRenderer.invoke('cutrail:clip-file-action', {
    action: 'copy-path',
    filePath,
  }),
  revealClip: (filePath: Parameters<CutrailBridge['revealClip']>[0]) => ipcRenderer.invoke('cutrail:clip-file-action', {
    action: 'reveal',
    filePath,
  }),
  submitUpdateDialogAction: (action: Parameters<CutrailBridge['submitUpdateDialogAction']>[0]) => ipcRenderer.invoke('cutrail:submit-update-dialog-action', action),
  onSourceVideoSelected: (listener: Parameters<CutrailBridge['onSourceVideoSelected']>[0]) => subscribeToChannel<string>('cutrail:source-video-selected', listener),
  onDefaultTrimModeUpdated: (listener: Parameters<CutrailBridge['onDefaultTrimModeUpdated']>[0]) => subscribeToChannel('cutrail:default-trim-mode-updated', listener),
  onFfmpegResolutionModeUpdated: (listener: Parameters<CutrailBridge['onFfmpegResolutionModeUpdated']>[0]) => subscribeToChannel('cutrail:ffmpeg-resolution-mode-updated', listener),
  onFfprobeResolutionModeUpdated: (listener: Parameters<CutrailBridge['onFfprobeResolutionModeUpdated']>[0]) => subscribeToChannel('cutrail:ffprobe-resolution-mode-updated', listener),
  onHideDefaultAudioTrackWhenMultipleUpdated: (listener: Parameters<CutrailBridge['onHideDefaultAudioTrackWhenMultipleUpdated']>[0]) => subscribeToChannel<boolean>('cutrail:hide-default-audio-track-when-multiple-updated', listener),
  onThemePrimaryColorUpdated: (listener: Parameters<CutrailBridge['onThemePrimaryColorUpdated']>[0]) => subscribeToChannel('cutrail:theme-primary-color-updated', listener),
  onStartupWindowModeUpdated: (listener: Parameters<CutrailBridge['onStartupWindowModeUpdated']>[0]) => subscribeToChannel<StartupWindowMode>('cutrail:startup-window-mode-updated', listener),
  onSourceDirectoryUpdated: (listener: Parameters<CutrailBridge['onSourceDirectoryUpdated']>[0]) => subscribeToChannel<string>('cutrail:source-directory-updated', listener),
  onOutputDirectoryUpdated: (listener: Parameters<CutrailBridge['onOutputDirectoryUpdated']>[0]) => subscribeToChannel<string>('cutrail:output-directory-updated', listener),
  onWindowDecorationMenuPreferenceUpdated: (
    listener: Parameters<CutrailBridge['onWindowDecorationMenuPreferenceUpdated']>[0],
  ) => subscribeToChannel(
    'cutrail:window-decoration-menu-preference-updated',
    listener,
  ),
  onWindowFullscreenStateUpdated: (
    listener: Parameters<CutrailBridge['onWindowFullscreenStateUpdated']>[0],
  ) => subscribeToChannel('cutrail:window-fullscreen-state-updated', listener),
  onExportProgress: (listener: Parameters<CutrailBridge['onExportProgress']>[0]) => subscribeToChannel<ExportProgressPayload>('cutrail:export-progress', listener),
  onUpdateDialogState: (listener: Parameters<CutrailBridge['onUpdateDialogState']>[0]) => subscribeToChannel<UpdateDialogState>('cutrail:update-dialog-state', listener),
};

export const exposeCutrailBridge = (): void => {
  contextBridge.exposeInMainWorld('cutrail', cutrailBridge);
};
