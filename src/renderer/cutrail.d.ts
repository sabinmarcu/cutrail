type ExportRangeLike = {
  id?: string;
  start?: number | string;
  end?: number | string;
  duration?: number | string;
};

type ExportJobLike = {
  id?: string;
  inputPath?: string;
  outputPath?: string;
  range?: ExportRangeLike;
  args?: string[];
};

type CreateExportPlanPayload = {
  sourcePath?: string;
  outputDirectory?: string;
  ranges?: ExportRangeLike[];
  extension?: string;
  trimMode?: 'fast' | 'accurate';
};

type RunExportPlanPayload = {
  jobs?: ExportJobLike[];
};

type StartFileDragPayload = {
  filePath?: string;
};

type OpenVideoEditorPayload = {
  sourcePath?: string;
};

type ClipFileActionResult = {
  ok: boolean;
  method: string;
  error?: string;
};

type DeleteClipRangeOutputsResult = {
  ok: boolean;
  deletedCount: number;
  error?: string;
};

type ExistingExportClip = {
  fileName: string;
  filePath: string;
  sourceName: string;
  trimMode: 'fast' | 'accurate';
  range: {
    start: number;
    end: number;
    duration: number;
  };
  extension: string;
};

type ExistingExportClipsSnapshot = {
  sourcePath: string;
  outputDirectory: string;
  clips: ExistingExportClip[];
};

type CutrailBridge = {
  getRuntimeInfo: () => { electron?: string; chrome?: string; node?: string };
  getAppMetadata: () => Promise<{
    version: string;
    copyright: string;
    attribution: string;
    license: string;
  }>;
  closeWindow: () => Promise<unknown>;
  minimizeWindow: () => Promise<unknown>;
  onExistingExportClipsUpdated: (listener: (payload: ExistingExportClipsSnapshot) => void) => () => void;
  syncExistingExportClips: (payload?: { sourcePath?: string; outputDirectory?: string }) => Promise<boolean>;
  getOutputDirectory: () => Promise<string | null>;
  getFfmpegDiagnostics: () => Promise<any>;
  getThirdPartyNotices: () => Promise<string>;
  getUpdateDialogState: () => Promise<any>;
  getPathForFile: (file: File | null | undefined) => string | null;
  deleteClipRangeOutputs: (payload: { sourcePath?: string; outputDirectory?: string; range?: { start?: number | string; end?: number | string } }) => Promise<DeleteClipRangeOutputsResult>;
  openVideoEditor: (payload?: OpenVideoEditorPayload) => Promise<string | null>;
  selectSourceVideo: () => Promise<string | null>;
  selectOutputDirectory: () => Promise<string | null>;
  resolveMediaUrl: (inputPath: string) => string;
  checkFfmpeg: () => Promise<any>;
  createExportPlan: (payload: CreateExportPlanPayload) => Promise<any>;
  runExportPlan: (payload: RunExportPlanPayload) => Promise<any>;
  startFileDrag: (payload: StartFileDragPayload) => void;
  copyClipFile: (filePath: string) => Promise<ClipFileActionResult>;
  copyClipPath: (filePath: string) => Promise<ClipFileActionResult>;
  revealClip: (filePath: string) => Promise<ClipFileActionResult>;
  submitUpdateDialogAction: (action: string) => Promise<boolean>;
  onSourceVideoSelected: (listener: (payload: any) => void) => () => void;
  onOutputDirectoryUpdated: (listener: (payload: any) => void) => () => void;
  onExportProgress: (listener: (payload: any) => void) => () => void;
  onUpdateDialogState: (listener: (payload: any) => void) => () => void;
};

declare global {
  interface Window {
    cutrail?: CutrailBridge;
  }
}

export {};
