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

export type DraftClipVariant = {
  id: string;
  isEditable: boolean;
  sourceFilePath: string | null;
  rangeId: string;
  trimMode: TrimMode;
  selectedAudioTrackIndices: number[];
  mutedAudioTrackIndices: number[];
};

export type ClipVariantStatus =
  | 'draft'
  | 'planned'
  | 'exporting'
  | 'exported'
  | 'failed'
  | 'legacy'
  | 'foreign'
  | 'invalid';

export type ClipVariantEntry = {
  clip: ExistingClip | null;
  filePath: string | null;
  isEditable: boolean;
  isLocked: boolean;
  key: string;
  modifiedAtMs: number | null;
  mutedAudioTrackIndices: number[];
  progressText: string;
  selectedAudioTrackIndices: number[];
  status: ClipVariantStatus;
  trimMode: TrimMode;
};

export type ClipEntry = {
  activeVariant: ClipVariantEntry;
  exportedVariantCount: number;
  exportingVariantCount: number;
  draftVariantCount: number;
  range: ClipRange;
  trustedExistingCount: number;
  variantEntries: ClipVariantEntry[];
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
  draftClipVariants: DraftClipVariant[];
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
  selectedVariantIsEditable: boolean;
  selectedRangeId: string | null;
  selectedVariantId: string | null;
  setAudioTracks: StateSetter<SourceAudioTrack[]>;
  setCurrentTime: StateSetter<number>;
  setDuration: StateSetter<number>;
  setDraftClipVariants: StateSetter<DraftClipVariant[]>;
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
  setSelectedVariantId: StateSetter<string | null>;
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
  createNewVariantFromSelection: () => void;
  createVariantDuplicate: (rangeId: string, variant: ClipVariantEntry) => void;
  pausePlayback: () => void;
  removeClip: (range: ClipRange | null | undefined) => Promise<void>;
  removeRange: (id: string, options?: { forceLocked?: boolean }) => void;
  removeVariant: (range: ClipRange, variant: ClipVariantEntry) => Promise<void>;
  resetPlan: () => void;
  setPlaybackTime: (time: number) => void;
  setSelectedRangeId: (rangeId: string | null) => void;
  setSelectedVariant: (rangeId: string, variantKey: string) => void;
  setTrimMode: (nextTrimMode: TrimMode) => void;
  setVariantTrimMode: (rangeId: string, variantKey: string, nextTrimMode: TrimMode) => void;
  startExport: () => Promise<void>;
  toggleAudioTrackMuted: (trackIndex: number) => void;
  toggleVariantAudioTrackMuted: (
    rangeId: string,
    variantKey: string,
    trackIndex: number,
  ) => void;
};
