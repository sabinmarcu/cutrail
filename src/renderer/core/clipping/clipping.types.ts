import type {
  ExistingExportClip as SharedExistingExportClip,
  ExportProgressPayload,
  FfmpegAvailabilityResult,
} from '../../../shared/contracts';

export type {
  ExistingExportClipsSnapshot,
  ExportProgressPayload,
  FfmpegAvailabilityResult,
  RuntimeInfo,
  UpdateDialogAction,
  UpdateDialogState,
} from '../../../shared/contracts';

export type TrimMode = 'fast' | 'accurate';

export type ClipRange = {
  id: string;
  start: number;
  end: number;
};

export type ExistingClip = SharedExistingExportClip;

export type ClipEntry = {
  range: ClipRange;
  existingClips: ExistingClip[];
  currentModeClip: ExistingClip | null;
  isLocked: boolean;
};

export type ExportPlanJob = {
  id: string;
  inputPath: string;
  outputPath: string;
  range: {
    id: string;
    start: number;
    end: number;
    duration: number;
  };
  args: string[];
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

export type ProgressById = Record<string, ExportProgressPayload>;

export type SharedReference<T> = {
  current: T;
};

export type StateSetter<T> = (value: T | ((previous: T) => T)) => void;

export type ClippingStateModel = {
  clipStatusMap: Record<string, string>;
  clipEntries: ClipEntry[];
  currentTime: number;
  duration: number;
  errorMessage: string;
  existingClips: ExistingClip[];
  isPlaying: boolean;
  outputDirectory: string;
  plan: ExportPlan;
  progressById: ProgressById;
  ranges: ClipRange[];
  readyToStart: boolean;
  runResult: ExportRunResult;
  selectedRangeId: string | null;
  setCurrentTime: StateSetter<number>;
  setDuration: StateSetter<number>;
  setErrorMessage: StateSetter<string>;
  setExistingClips: StateSetter<ExistingClip[]>;
  setIsPlaying: StateSetter<boolean>;
  setOutputDirectory: StateSetter<string>;
  setPlan: StateSetter<ExportPlan>;
  setProgressById: StateSetter<ProgressById>;
  setRanges: StateSetter<ClipRange[]>;
  setRunResult: StateSetter<ExportRunResult>;
  setSelectedRangeId: StateSetter<string | null>;
  setSourcePath: StateSetter<string>;
  setTrimMode: StateSetter<TrimMode>;
  sourcePath: string;
  timelineRef: SharedReference<HTMLDivElement | null>;
  trimMode: TrimMode;
  videoRef: SharedReference<HTMLVideoElement | null>;
  videoUrl: string;
};

export type ClippingActions = {
  addRangeAtPlayhead: () => void;
  pausePlayback: () => void;
  removeClip: (range: ClipRange | null | undefined) => Promise<void>;
  removeRange: (id: string) => void;
  resetPlan: () => void;
  setPlaybackTime: (time: number) => void;
  setSelectedRangeId: (rangeId: string | null) => void;
  setTrimMode: (nextTrimMode: TrimMode) => void;
  startExport: () => Promise<void>;
};
