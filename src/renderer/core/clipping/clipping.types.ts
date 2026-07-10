import type {
  ExistingExportClip as SharedExistingExportClip,
  ExportProgressPayload,
  FfmpegAvailabilityResult,
  SourceAudioTrack as SharedSourceAudioTrack,
} from '../../../shared/contracts';

export type {
  ExistingExportClipsSnapshot,
  ExportProgressPayload,
  FfmpegAvailabilityResult,
  RuntimeInfo,
  SourceAudioTrackSnapshot,
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
export type SourceAudioTrack = SharedSourceAudioTrack;

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

export type PlaybackSeekRequest = {
  revision: number;
  time: number;
};

export type ClippingStateModel = {
  audioTracks: SourceAudioTrack[];
  clipStatusMap: Record<string, string>;
  clipEntries: ClipEntry[];
  currentTime: number;
  duration: number;
  errorMessage: string;
  existingClips: ExistingClip[];
  hasMultipleAudioTracks: boolean;
  hideDefaultAudioTrackWhenMultiple: boolean;
  isPlaying: boolean;
  mutedAudioTrackIndices: number[];
  outputDirectory: string;
  playbackSeekRequest: PlaybackSeekRequest;
  plan: ExportPlan;
  progressById: ProgressById;
  ranges: ClipRange[];
  readyToStart: boolean;
  runResult: ExportRunResult;
  selectedAudioTrackIndices: number[];
  selectedRangeId: string | null;
  setAudioTracks: StateSetter<SourceAudioTrack[]>;
  setCurrentTime: StateSetter<number>;
  setDuration: StateSetter<number>;
  setErrorMessage: StateSetter<string>;
  setExistingClips: StateSetter<ExistingClip[]>;
  setHideDefaultAudioTrackWhenMultiple: StateSetter<boolean>;
  setIsPlaying: StateSetter<boolean>;
  setMutedAudioTrackIndices: StateSetter<number[]>;
  setOutputDirectory: StateSetter<string>;
  setPlaybackSeekRequest: StateSetter<PlaybackSeekRequest>;
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
  visibleAudioTracks: SourceAudioTrack[];
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
