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

type CutrailBridge = {
  getRuntimeInfo: () => { electron?: string; chrome?: string; node?: string };
  closeWindow: () => Promise<unknown>;
  minimizeWindow: () => Promise<unknown>;
  toggleWindowMaximize: () => Promise<unknown>;
  getOutputDirectory: () => Promise<string | null>;
  getFfmpegDiagnostics: () => Promise<any>;
  getThirdPartyNotices: () => Promise<string>;
  openVideoEditor: () => Promise<string | null>;
  selectSourceVideo: () => Promise<string | null>;
  selectOutputDirectory: () => Promise<string | null>;
  resolveMediaUrl: (inputPath: string) => string;
  checkFfmpeg: () => Promise<any>;
  createExportPlan: (payload: CreateExportPlanPayload) => Promise<any>;
  runExportPlan: (payload: RunExportPlanPayload) => Promise<any>;
  onSourceVideoSelected: (listener: (payload: any) => void) => () => void;
  onOutputDirectoryUpdated: (listener: (payload: any) => void) => () => void;
  onExportProgress: (listener: (payload: any) => void) => () => void;
};

declare global {
  interface Window {
    cutrail?: CutrailBridge;
  }
}

export {};
