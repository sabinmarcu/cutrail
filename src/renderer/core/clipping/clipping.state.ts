import {
  atom,
  useAtom,
} from 'jotai';
import {
  useCallback,
  useEffect,
  useMemo,
} from 'react';
import { normalizeVideoPath } from './clipping';
import { deriveClipEntries } from './clipping.variants';
import { playbackSeekRequestAtom } from './clipping.playback.state';
import type {
  ClipRange,
  ClippingStateModel,
  DraftClipVariant,
  ExistingClip,
  ExportPlan,
  ExportRunResult,
  ProgressById,
  SharedReference,
  SourceAudioTrack,
  TrimMode,
} from './clipping.types';

const createSharedReference = <T>(current: T): SharedReference<T> => ({ current });
const DEFAULT_TRIM_MODE: TrimMode = 'fast';

const normalizeTrackIndices = (trackIndices: number[]): number[] => [...new Set(trackIndices
  .filter((value) => Number.isInteger(value) && value >= 0)
  .map(Number))].sort((left, right) => left - right);

const buildDefaultMutedIndices = (
  audioTracks: SourceAudioTrack[],
  hideDefaultAudioTrackWhenMultiple: boolean,
): number[] => {
  const shouldMuteHiddenFirstTrack = (
    hideDefaultAudioTrackWhenMultiple
    && audioTracks.length > 1
    && audioTracks.some((track) => track.trackIndex === 0)
  );

  return shouldMuteHiddenFirstTrack ? [0] : [];
};

const buildSelectedTrackIndices = ({
  audioTracks,
  hideDefaultAudioTrackWhenMultiple,
  mutedAudioTrackIndices,
}: {
  audioTracks: SourceAudioTrack[];
  hideDefaultAudioTrackWhenMultiple: boolean;
  mutedAudioTrackIndices: number[];
}): number[] => {
  const hiddenTrackIndices = new Set<number>(
    hideDefaultAudioTrackWhenMultiple && audioTracks.length > 1 ? [0] : [],
  );
  const mutedTrackIndexSet = new Set(normalizeTrackIndices(mutedAudioTrackIndices));

  return normalizeTrackIndices(audioTracks
    .map((track) => track.trackIndex)
    .filter((trackIndex) => !hiddenTrackIndices.has(trackIndex))
    .filter((trackIndex) => !mutedTrackIndexSet.has(trackIndex)));
};

const sourcePathAtom = atom<string>('');
const outputDirectoryAtom = atom<string>('');
const rangesAtom = atom<ClipRange[]>([]);
const draftClipVariantsAtom = atom<DraftClipVariant[]>([]);
const planAtom = atom<ExportPlan>({
  jobs: [],
  errors: [],
});
const runResultAtom = atom<ExportRunResult>(null);
const progressByIdAtom = atom<ProgressById>({});
const errorMessageAtom = atom<string>('');
const durationAtom = atom<number>(0);
const currentTimeAtom = atom<number>(0);
const isPlayingAtom = atom<boolean>(false);
const selectedRangeIdAtom = atom<string | null>(null);
const selectedVariantIdAtom = atom<string | null>(null);
const existingClipsAtom = atom<ExistingClip[]>([]);
const audioTracksAtom = atom<SourceAudioTrack[]>([]);
const hideDefaultAudioTrackWhenMultipleAtom = atom<boolean>(false);
const videoReferenceAtom = atom<SharedReference<HTMLVideoElement | null>>(
  createSharedReference<HTMLVideoElement | null>(null),
);
const timelineReferenceAtom = atom<SharedReference<HTMLDivElement | null>>(
  createSharedReference<HTMLDivElement | null>(null),
);

export const useClippingState = (
  { initialSourcePath = '' }: { initialSourcePath?: string } = {},
): ClippingStateModel => {
  const [sourcePath, setSourcePath] = useAtom(sourcePathAtom);
  const [outputDirectory, setOutputDirectory] = useAtom(outputDirectoryAtom);
  const [ranges, setRanges] = useAtom(rangesAtom);
  const [draftClipVariants, setDraftClipVariants] = useAtom(draftClipVariantsAtom);
  const [plan, setPlan] = useAtom(planAtom);
  const [runResult, setRunResult] = useAtom(runResultAtom);
  const [progressById, setProgressById] = useAtom(progressByIdAtom);
  const [errorMessage, setErrorMessage] = useAtom(errorMessageAtom);
  const [duration, setDuration] = useAtom(durationAtom);
  const [currentTime, setCurrentTime] = useAtom(currentTimeAtom);
  const [playbackSeekRequest, setPlaybackSeekRequest] = useAtom(playbackSeekRequestAtom);
  const [isPlaying, setIsPlaying] = useAtom(isPlayingAtom);
  const [selectedRangeId, setSelectedRangeId] = useAtom(selectedRangeIdAtom);
  const [selectedVariantId, setSelectedVariantId] = useAtom(selectedVariantIdAtom);
  const [existingClips, setExistingClips] = useAtom(existingClipsAtom);
  const [audioTracks, setAudioTracks] = useAtom(audioTracksAtom);
  const [hideDefaultAudioTrackWhenMultiple, setHideDefaultAudioTrackWhenMultiple] = useAtom(
    hideDefaultAudioTrackWhenMultipleAtom,
  );
  const [videoReference] = useAtom(videoReferenceAtom);
  const [timelineReference] = useAtom(timelineReferenceAtom);

  useEffect(() => {
    if (typeof initialSourcePath !== 'string' || initialSourcePath.length === 0) {
      return;
    }

    setSourcePath((currentSourcePath) => (
      currentSourcePath.length === 0 ? initialSourcePath : currentSourcePath
    ));
  }, [initialSourcePath, setSourcePath]);

  const videoUrl = useMemo(() => normalizeVideoPath(sourcePath), [sourcePath]);
  const hasMultipleAudioTracks = audioTracks.length > 1;
  const visibleAudioTracks = useMemo(() => {
    if (!hasMultipleAudioTracks || !hideDefaultAudioTrackWhenMultiple) {
      return audioTracks;
    }

    return audioTracks.filter((track) => track.trackIndex !== 0);
  }, [audioTracks, hasMultipleAudioTracks, hideDefaultAudioTrackWhenMultiple]);

  const activeDraftVariant = useMemo(() => {
    const bySelectedId = draftClipVariants.find((variant) => variant.id === selectedVariantId);

    if (bySelectedId) {
      return bySelectedId;
    }

    if (selectedRangeId) {
      const byRange = draftClipVariants.find((variant) => variant.rangeId === selectedRangeId);

      if (byRange) {
        return byRange;
      }
    }

    return draftClipVariants[0] ?? null;
  }, [draftClipVariants, selectedRangeId, selectedVariantId]);

  const mutedAudioTrackIndices = useMemo(() => {
    if (activeDraftVariant) {
      return normalizeTrackIndices(activeDraftVariant.mutedAudioTrackIndices);
    }

    return buildDefaultMutedIndices(audioTracks, hideDefaultAudioTrackWhenMultiple);
  }, [activeDraftVariant, audioTracks, hideDefaultAudioTrackWhenMultiple]);

  const selectedAudioTrackIndices = useMemo(() => {
    if (activeDraftVariant) {
      return normalizeTrackIndices(activeDraftVariant.selectedAudioTrackIndices);
    }

    return buildSelectedTrackIndices({
      audioTracks,
      hideDefaultAudioTrackWhenMultiple,
      mutedAudioTrackIndices,
    });
  }, [activeDraftVariant, audioTracks, hideDefaultAudioTrackWhenMultiple, mutedAudioTrackIndices]);

  const trimMode = activeDraftVariant?.trimMode ?? DEFAULT_TRIM_MODE;
  const readyToStart = (
    sourcePath.length > 0
    && outputDirectory.length > 0
    && draftClipVariants.length > 0
  );

  const clipStatusMap = useMemo(() => {
    const results = runResult?.results ?? [];
    const statusByJobId: Record<string, string> = Object.fromEntries(
      results.map((result) => [result.jobId, result.status]),
    );
    const plannedIds = new Set(
      plan.jobs
        .map((job) => job.id)
        .filter((id): id is string => typeof id === 'string' && id.length > 0),
    );

    return Object.fromEntries(draftClipVariants.map((variant) => {
      if (statusByJobId[variant.id]) {
        return [variant.id, statusByJobId[variant.id]];
      }

      return [variant.id, plannedIds.has(variant.id) ? 'PLANNED' : 'DRAFT'];
    }));
  }, [draftClipVariants, plan.jobs, runResult]);

  const planJobs = useMemo(
    () => plan.jobs.reduce(
      (nextMap, job) => nextMap.set(String(job.id), { outputPath: job.outputPath }),
      new Map<string, { outputPath?: string }>(),
    ),
    [plan.jobs],
  );

  const derivedClipEntries = useMemo(() => deriveClipEntries({
    clipStatusMap,
    draftClipVariants,
    existingClips,
    planJobs,
    progressById,
    ranges,
    selectedVariantId,
  }), [
    clipStatusMap,
    draftClipVariants,
    existingClips,
    planJobs,
    progressById,
    ranges,
    selectedVariantId,
  ]);

  useEffect(() => {
    setDraftClipVariants((previous) => {
      let changed = false;

      const nextVariants = previous.map((variant) => {
        if (!variant.isEditable) {
          return variant;
        }

        const matchingEntry = derivedClipEntries
          .flatMap((clipEntry) => clipEntry.variantEntries)
          .find((entry) => entry.key === variant.id);

        if (!matchingEntry?.clip || typeof matchingEntry.filePath !== 'string') {
          return variant;
        }

        changed = true;

        return {
          ...variant,
          isEditable: false,
          sourceFilePath: matchingEntry.filePath,
        };
      });

      return changed ? nextVariants : previous;
    });
  }, [derivedClipEntries, setDraftClipVariants]);

  const selectedVariantEntry = useMemo(
    () => derivedClipEntries
      .flatMap((clipEntry) => clipEntry.variantEntries)
      .find((variantEntry) => variantEntry.key === selectedVariantId)
      ?? null,
    [derivedClipEntries, selectedVariantId],
  );
  const selectedVariantIsEditable = selectedVariantEntry?.isEditable ?? false;

  useEffect(() => {
    if (activeDraftVariant === null) {
      if (selectedVariantId !== null) {
        setSelectedVariantId(null);
      }

      return;
    }

    if (selectedVariantId !== activeDraftVariant.id) {
      setSelectedVariantId(activeDraftVariant.id);
    }

    if (selectedRangeId !== activeDraftVariant.rangeId) {
      setSelectedRangeId(activeDraftVariant.rangeId);
    }
  }, [
    activeDraftVariant,
    selectedRangeId,
    selectedVariantId,
    setSelectedRangeId,
    setSelectedVariantId,
  ]);

  const setTrimMode = useCallback<ClippingStateModel['setTrimMode']>((value) => {
    if (!activeDraftVariant) {
      return;
    }

    const nextTrimMode = typeof value === 'function'
      ? value(activeDraftVariant.trimMode)
      : value;

    setDraftClipVariants((previous) => previous.map((variant) => (
      variant.id === activeDraftVariant.id
        ? {
          ...variant,
          trimMode: nextTrimMode,
        }
        : variant
    )));
  }, [activeDraftVariant, setDraftClipVariants]);

  const setMutedAudioTrackIndices = useCallback<ClippingStateModel['setMutedAudioTrackIndices']>((value) => {
    if (!activeDraftVariant) {
      return;
    }

    const nextMutedTrackIndices = normalizeTrackIndices(
      typeof value === 'function'
        ? value(activeDraftVariant.mutedAudioTrackIndices)
        : value,
    );
    const nextSelectedTrackIndices = buildSelectedTrackIndices({
      audioTracks,
      hideDefaultAudioTrackWhenMultiple,
      mutedAudioTrackIndices: nextMutedTrackIndices,
    });

    setDraftClipVariants((previous) => previous.map((variant) => (
      variant.id === activeDraftVariant.id
        ? {
          ...variant,
          mutedAudioTrackIndices: nextMutedTrackIndices,
          selectedAudioTrackIndices: nextSelectedTrackIndices,
        }
        : variant
    )));
  }, [
    activeDraftVariant,
    audioTracks,
    hideDefaultAudioTrackWhenMultiple,
    setDraftClipVariants,
  ]);

  return {
    audioTracks,
    clipStatusMap,
    clipEntries: derivedClipEntries,
    currentTime,
    draftClipVariants,
    duration,
    errorMessage,
    existingClips,
    hasMultipleAudioTracks,
    hideDefaultAudioTrackWhenMultiple,
    isPlaying,
    mutedAudioTrackIndices,
    outputDirectory,
    playbackSeekRequest,
    plan,
    progressById,
    ranges,
    readyToStart,
    runResult,
    selectedAudioTrackIndices,
    selectedVariantIsEditable,
    selectedRangeId,
    selectedVariantId,
    setAudioTracks,
    setCurrentTime,
    setDuration,
    setDraftClipVariants,
    setErrorMessage,
    setExistingClips,
    setHideDefaultAudioTrackWhenMultiple,
    setIsPlaying,
    setMutedAudioTrackIndices,
    setOutputDirectory,
    setPlaybackSeekRequest,
    setPlan,
    setProgressById,
    setRanges,
    setRunResult,
    setSelectedRangeId,
    setSelectedVariantId,
    setSourcePath,
    setTrimMode,
    sourcePath,
    timelineRef: timelineReference,
    trimMode,
    videoRef: videoReference,
    videoUrl,
    visibleAudioTracks,
  };
};
