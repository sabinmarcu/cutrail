import type { WindowMenuModel } from './windowMenu.ts';
import type { ThemePrimaryColorValue } from './themePrimaryColor.ts';
import type {
  ClipClassificationKind,
  ClipIdentityKeys,
  ExportClipMetadata,
} from './exportMetadata.ts';

export type BridgeTrimMode = 'fast' | 'accurate';

export type ExportRangeLike = {
  id?: string;
  start?: number | string;
  end?: number | string;
  duration?: number | string;
};

export type ExportJobLike = {
  id?: string;
  inputPath?: string;
  outputPath?: string;
  range?: ExportRangeLike;
  args?: string[];
};

export type CreateExportPlanPayload = {
  sourcePath?: string;
  outputDirectory?: string;
  ranges?: ExportRangeLike[];
  extension?: string;
  trimMode?: BridgeTrimMode;
  audioStreamIndices?: number[];
  selectedAudioTrackIndices?: number[];
  mutedAudioTrackIndices?: number[];
};

export type GetSourceAudioTracksPayload = {
  sourcePath?: string;
};

export type GetSourceAudioTrackWaveformPayload = {
  sourcePath?: string;
  trackIndex?: number;
};

export type RunExportPlanPayload = {
  jobs?: ExportJobLike[];
};

export type StartFileDragPayload = {
  filePath?: string;
};

export type OpenVideoEditorPayload = {
  sourcePath?: string;
};

export type ClipFileActionResult = {
  ok: boolean;
  method: string;
  error?: string;
};

export type DeleteClipRangeOutputsResult = {
  ok: boolean;
  deletedCount: number;
  error?: string;
};

export type RuntimeInfo = {
  electron?: string;
  chrome?: string;
  node?: string;
};

export type StartupWindowMode = 'splash' | 'library';

export type FfmpegAvailabilityResult = {
  available: boolean;
  path: string;
  source: string;
  code?: string;
  error?: string;
  versionLine?: string;
};

export type ExistingExportClip = {
  fileName: string;
  filePath: string;
  modifiedAtMs: number;
  sourceName: string;
  trimMode: BridgeTrimMode;
  range: {
    start: number;
    end: number;
    duration: number;
  };
  extension: string;
  metadata?: ExportClipMetadata | null;
  metadataPresence?: ClipClassificationKind;
  classificationKind?: ClipClassificationKind;
  identityKeys?: ClipIdentityKeys;
  selectedAudioTrackIndices?: number[];
  mutedAudioTrackIndices?: number[];
};

export type ExistingExportClipsSnapshot = {
  sourcePath: string;
  outputDirectory: string;
  clips: ExistingExportClip[];
};

export type VideoLibraryEntry = {
  fileName: string;
  filePath: string;
  extension: string;
  sizeBytes: number;
  createdAtMs: number;
  modifiedAtMs: number;
  clipCount: number;
};

export type VideoLibrarySnapshot = {
  sourceDirectory: string;
  outputDirectory: string;
  videos: VideoLibraryEntry[];
};

export type SourceAudioTrack = {
  trackIndex: number;
  streamIndex: number;
  label: string;
  isDefault: boolean;
  waveformDataUrl: string | null;
};

export type SourceAudioTrackSnapshot = {
  sourcePath: string;
  tracks: SourceAudioTrack[];
};

export type SourceAudioTrackWaveform = {
  sourcePath: string;
  trackIndex: number;
  waveformDataUrl: string | null;
};

export type ExportPlanJob = {
  id: string;
  inputPath: string;
  outputPath: string;
  range: {
    id: string;
    selectedAudioTrackIndices?: number[];
    mutedAudioTrackIndices?: number[];
    start: number;
    end: number;
    duration: number;
  };
  args: string[];
  metadata: ExportClipMetadata;
  selectedAudioTrackIndices?: number[];
  mutedAudioTrackIndices?: number[];
};

export type ExportPlan = {
  jobs: ExportPlanJob[];
  errors: unknown[];
};

export type ExportRunResultEntry = {
  jobId: string;
  status: string;
  code?: string;
  exitCode?: number | null;
  signal?: string | null;
  stderrSummary?: string;
  error?: string;
  durationMs?: number;
};

export type ExportRunResult = {
  ffmpeg?: FfmpegAvailabilityResult;
  results?: ExportRunResultEntry[];
} | null;

export type ExportProgressPayload = {
  jobId: string;
  processedSeconds: number | null;
  ratio: number | null;
  speed: number | null;
};

export type UpdateDialogAction = {
  id: string;
  label: string;
  variant?: 'primary' | 'secondary';
};

export type UpdateDialogVersionNotes = {
  version: string;
  notes: string;
};

export type UpdateDialogState = {
  title: string;
  subtitle?: string;
  message: string;
  detail?: string;
  latestDetail?: string;
  olderVersionDetails?: UpdateDialogVersionNotes[];
  actions: UpdateDialogAction[];
  cancelAction?: string;
  progressPercent?: number;
  progressLabel?: string;
  showProgress?: boolean;
  persistOnActions?: string[];
};

export type WindowDecorationMenuPreferenceState = {
  configuredEnabled: boolean;
  effectiveEnabled: boolean;
  forcedByEnvironment: boolean;
};

export type CutrailBridge = {
  getRuntimeInfo: () => RuntimeInfo;
  getAppMetadata: () => Promise<{
    version: string;
    copyright: string;
    attribution: string;
    license: string;
  }>;
  closeWindow: () => Promise<unknown>;
  minimizeWindow: () => Promise<unknown>;
  toggleWindowMaximize: () => Promise<unknown>;
  getWindowFullscreenState: () => Promise<boolean>;
  openAboutWindow: () => Promise<boolean>;
  openDiagnosticsWindow: () => Promise<boolean>;
  openLibraryWindow: () => Promise<boolean>;
  openLicensesWindow: () => Promise<boolean>;
  openOptionsWindow: () => Promise<boolean>;
  getWindowDecorationMenuPreference: () => Promise<WindowDecorationMenuPreferenceState>;
  setWindowDecorationMenuPreference: (
    enabled: boolean,
  ) => Promise<WindowDecorationMenuPreferenceState>;
  getWindowMenuModel: () => Promise<WindowMenuModel>;
  invokeWindowMenuAction: (actionId: string) => Promise<boolean>;
  getStartupWindowMode: () => Promise<StartupWindowMode>;
  setStartupWindowMode: (mode: StartupWindowMode) => Promise<StartupWindowMode>;
  getSourceDirectory: () => Promise<string | null>;
  getOutputDirectory: () => Promise<string | null>;
  getVideoLibrary: () => Promise<VideoLibrarySnapshot>;
  getSourceAudioTracks: (
    payload?: GetSourceAudioTracksPayload,
  ) => Promise<SourceAudioTrackSnapshot>;
  getSourceAudioTrackWaveform: (
    payload?: GetSourceAudioTrackWaveformPayload,
  ) => Promise<SourceAudioTrackWaveform>;
  getFfmpegDiagnostics: () => Promise<FfmpegAvailabilityResult>;
  getThirdPartyNotices: () => Promise<string>;
  getUpdateDialogState: () => Promise<UpdateDialogState | null>;
  getHideDefaultAudioTrackWhenMultiple: () => Promise<boolean>;
  getThemePrimaryColor: () => Promise<ThemePrimaryColorValue>;
  getPathForFile: (file: File | null | undefined) => string | null;
  deleteClipRangeOutputs: (payload: {
    sourcePath?: string;
    outputDirectory?: string;
    range?: { start?: number | string; end?: number | string };
  }) => Promise<DeleteClipRangeOutputsResult>;
  onExistingExportClipsUpdated: (
    listener: (payload: ExistingExportClipsSnapshot) => void,
  ) => () => void;
  syncExistingExportClips: (
    payload?: { sourcePath?: string; outputDirectory?: string },
  ) => Promise<boolean>;
  openVideoEditor: (payload?: OpenVideoEditorPayload) => Promise<string | null>;
  selectSourceVideo: () => Promise<string | null>;
  selectSourceDirectory: () => Promise<string | null>;
  selectOutputDirectory: () => Promise<string | null>;
  setHideDefaultAudioTrackWhenMultiple: (value: boolean) => Promise<boolean>;
  setThemePrimaryColor: (color: ThemePrimaryColorValue) => Promise<ThemePrimaryColorValue>;
  resolveMediaUrl: (inputPath: string) => string;
  checkFfmpeg: () => Promise<FfmpegAvailabilityResult>;
  createExportPlan: (payload: CreateExportPlanPayload) => Promise<ExportPlan>;
  runExportPlan: (payload: RunExportPlanPayload) => Promise<ExportRunResult>;
  startFileDrag: (payload: StartFileDragPayload) => void;
  copyClipFile: (filePath: string) => Promise<ClipFileActionResult>;
  copyClipPath: (filePath: string) => Promise<ClipFileActionResult>;
  revealClip: (filePath: string) => Promise<ClipFileActionResult>;
  submitUpdateDialogAction: (action: string) => Promise<boolean>;
  onSourceVideoSelected: (listener: (payload: string) => void) => () => void;
  onHideDefaultAudioTrackWhenMultipleUpdated: (listener: (payload: boolean) => void) => () => void;
  onThemePrimaryColorUpdated: (listener: (payload: ThemePrimaryColorValue) => void) => () => void;
  onStartupWindowModeUpdated: (listener: (payload: StartupWindowMode) => void) => () => void;
  onSourceDirectoryUpdated: (listener: (payload: string) => void) => () => void;
  onOutputDirectoryUpdated: (listener: (payload: string) => void) => () => void;
  onWindowDecorationMenuPreferenceUpdated: (
    listener: (payload: WindowDecorationMenuPreferenceState) => void,
  ) => () => void;
  onWindowFullscreenStateUpdated: (listener: (payload: boolean) => void) => () => void;
  onExportProgress: (listener: (payload: ExportProgressPayload) => void) => () => void;
  onUpdateDialogState: (listener: (payload: UpdateDialogState) => void) => () => void;
};

export {
  type EnrichedExportClipsSnapshot,
  type ExportClipMetadata,
} from './exportMetadata.ts';
