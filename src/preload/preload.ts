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
  getOutputDirectory: () => ipcRenderer.invoke('cutrail:get-output-directory'),
  getFfmpegDiagnostics: () => ipcRenderer.invoke('cutrail:get-ffmpeg-diagnostics'),
  getThirdPartyNotices: () => ipcRenderer.invoke('cutrail:get-third-party-notices'),
  getUpdateDialogState: () => ipcRenderer.invoke('cutrail:get-update-dialog-state'),
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
  selectOutputDirectory: () => ipcRenderer.invoke('cutrail:select-output-directory'),
  resolveMediaUrl,
  checkFfmpeg: () => ipcRenderer.invoke('cutrail:check-ffmpeg'),
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
  onOutputDirectoryUpdated: (listener: Parameters<CutrailBridge['onOutputDirectoryUpdated']>[0]) => subscribeToChannel<string>('cutrail:output-directory-updated', listener),
  onExportProgress: (listener: Parameters<CutrailBridge['onExportProgress']>[0]) => subscribeToChannel<ExportProgressPayload>('cutrail:export-progress', listener),
  onUpdateDialogState: (listener: Parameters<CutrailBridge['onUpdateDialogState']>[0]) => subscribeToChannel<UpdateDialogState>('cutrail:update-dialog-state', listener),
};

export const exposeCutrailBridge = (): void => {
  contextBridge.exposeInMainWorld('cutrail', cutrailBridge);
};
