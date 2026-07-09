// @ts-check

import {
  contextBridge,
  ipcRenderer,
  webUtils,
} from 'electron';

/**
 * @typedef {{ id?: string, start?: number | string, end?: number | string, duration?: number | string }} ExportRangeLike
 */

/**
 * @typedef {{
 *   id?: string,
 *   inputPath?: string,
 *   outputPath?: string,
 *   range?: ExportRangeLike,
 *   args?: string[]
 * }} ExportJobLike
 */

/**
 * @typedef {{
 *   sourcePath?: string,
 *   outputDirectory?: string,
 *   ranges?: ExportRangeLike[],
 *   extension?: string,
 *   trimMode?: 'fast' | 'accurate'
 * }} CreateExportPlanPayload
 */

/**
 * @typedef {{ jobs?: ExportJobLike[] }} RunExportPlanPayload
 */

/**
 * @typedef {{ filePath?: string }} StartFileDragPayload
 */

/**
 * @typedef {{ sourcePath?: string }} OpenVideoEditorPayload
 */

/**
 * @typedef {{ ok: boolean, method: string, error?: string }} ClipFileActionResult
 */

/**
 * @typedef {{
 *   getRuntimeInfo: () => { electron?: string, chrome?: string, node?: string },
 *   getAppMetadata: () => Promise<{ version: string, copyright: string, attribution: string, license: string }>,
 *   closeWindow: () => Promise<unknown>,
 *   minimizeWindow: () => Promise<unknown>,
 *   toggleWindowMaximize: () => Promise<unknown>,
 *   getOutputDirectory: () => Promise<string | null>,
 *   getFfmpegDiagnostics: () => Promise<unknown>,
 *   getThirdPartyNotices: () => Promise<string>,
 *   getUpdateDialogState: () => Promise<unknown>,
 *   getPathForFile: (file: File | null | undefined) => string | null,
 *   openVideoEditor: (payload?: OpenVideoEditorPayload) => Promise<string | null>,
 *   selectSourceVideo: () => Promise<string | null>,
 *   selectOutputDirectory: () => Promise<string | null>,
 *   resolveMediaUrl: (inputPath: string) => string,
 *   checkFfmpeg: () => Promise<unknown>,
 *   createExportPlan: (payload: CreateExportPlanPayload) => Promise<unknown>,
 *   runExportPlan: (payload: RunExportPlanPayload) => Promise<unknown>,
 *   startFileDrag: (payload: StartFileDragPayload) => void,
 *   copyClipFile: (filePath: string) => Promise<ClipFileActionResult>,
 *   copyClipPath: (filePath: string) => Promise<ClipFileActionResult>,
 *   revealClip: (filePath: string) => Promise<ClipFileActionResult>,
 *   submitUpdateDialogAction: (action: string) => Promise<boolean>,
 *   onSourceVideoSelected: (listener: (payload: unknown) => void) => () => void,
 *   onOutputDirectoryUpdated: (listener: (payload: unknown) => void) => () => void,
 *   onExportProgress: (listener: (payload: unknown) => void) => () => void,
 *   onUpdateDialogState: (listener: (payload: unknown) => void) => () => void
 * }} CutrailBridge
 */

/**
 * @param {string} inputPath
 * @returns {string}
 */
const resolveMediaUrl = (inputPath) => {
  if (typeof inputPath !== 'string' || inputPath.length === 0) {
    return '';
  }

  return `cutrail-media://local/${encodeURIComponent(inputPath)}`;
};

/** @type {CutrailBridge} */
const cutrailBridge = {
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
  getPathForFile: (file) => {
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
  openVideoEditor: (payload) => ipcRenderer.invoke('cutrail:open-video-editor', payload),
  selectSourceVideo: () => ipcRenderer.invoke('cutrail:select-source-video'),
  selectOutputDirectory: () => ipcRenderer.invoke('cutrail:select-output-directory'),
  resolveMediaUrl,
  checkFfmpeg: () => ipcRenderer.invoke('cutrail:check-ffmpeg'),
  createExportPlan: (payload) => ipcRenderer.invoke('cutrail:create-export-plan', payload),
  runExportPlan: (payload) => ipcRenderer.invoke('cutrail:run-export-plan', payload),
  startFileDrag: (payload) => ipcRenderer.send('cutrail:start-file-drag', payload),
  copyClipFile: (filePath) => ipcRenderer.invoke('cutrail:clip-file-action', {
    action: 'copy-file',
    filePath,
  }),
  copyClipPath: (filePath) => ipcRenderer.invoke('cutrail:clip-file-action', {
    action: 'copy-path',
    filePath,
  }),
  revealClip: (filePath) => ipcRenderer.invoke('cutrail:clip-file-action', {
    action: 'reveal',
    filePath,
  }),
  submitUpdateDialogAction: (action) => ipcRenderer.invoke('cutrail:submit-update-dialog-action', action),
  onSourceVideoSelected: (listener) => {
    if (typeof listener !== 'function') {
      throw new TypeError('listener must be a function');
    }

    /** @param {import('electron').IpcRendererEvent} _event @param {unknown} payload */
    const wrappedListener = (_event, payload) => {
      listener(payload);
    };

    ipcRenderer.on('cutrail:source-video-selected', wrappedListener);

    return () => {
      ipcRenderer.removeListener('cutrail:source-video-selected', wrappedListener);
    };
  },
  onOutputDirectoryUpdated: (listener) => {
    if (typeof listener !== 'function') {
      throw new TypeError('listener must be a function');
    }

    /** @param {import('electron').IpcRendererEvent} _event @param {unknown} payload */
    const wrappedListener = (_event, payload) => {
      listener(payload);
    };

    ipcRenderer.on('cutrail:output-directory-updated', wrappedListener);

    return () => {
      ipcRenderer.removeListener('cutrail:output-directory-updated', wrappedListener);
    };
  },
  onExportProgress: (listener) => {
    if (typeof listener !== 'function') {
      throw new TypeError('listener must be a function');
    }

    /** @param {import('electron').IpcRendererEvent} _event @param {unknown} payload */
    const wrappedListener = (_event, payload) => {
      listener(payload);
    };

    ipcRenderer.on('cutrail:export-progress', wrappedListener);

    return () => {
      ipcRenderer.removeListener('cutrail:export-progress', wrappedListener);
    };
  },
  onUpdateDialogState: (listener) => {
    if (typeof listener !== 'function') {
      throw new TypeError('listener must be a function');
    }

    /** @param {import('electron').IpcRendererEvent} _event @param {unknown} payload */
    const wrappedListener = (_event, payload) => {
      listener(payload);
    };

    ipcRenderer.on('cutrail:update-dialog-state', wrappedListener);

    return () => {
      ipcRenderer.removeListener('cutrail:update-dialog-state', wrappedListener);
    };
  },
};

contextBridge.exposeInMainWorld('cutrail', cutrailBridge);
