import {
  atom,
  useAtom,
} from 'jotai';
import {
  useEffect,
  useMemo,
} from 'react';
import { normalizeVideoPath } from './clipping';
import type {
  ClipEntry,
  ClipRange,
  ClippingStateModel,
  ExistingClip,
  ExportPlan,
  ExportRunResult,
  ProgressById,
  SharedReference,
  TrimMode,
} from './clipping.types';

const createSharedReference = <T>(current: T): SharedReference<T> => ({ current });

const sourcePathAtom = atom<string>('');
const outputDirectoryAtom = atom<string>('');
const rangesAtom = atom<ClipRange[]>([]);
const planAtom = atom<ExportPlan>({
  jobs: [],
  errors: [],
});
const runResultAtom = atom<ExportRunResult>(null);
const progressByIdAtom = atom<ProgressById>({});
const errorMessageAtom = atom<string>('');
const trimModeAtom = atom<TrimMode>('fast');
const durationAtom = atom<number>(0);
const currentTimeAtom = atom<number>(0);
const isPlayingAtom = atom<boolean>(false);
const selectedRangeIdAtom = atom<string | null>(null);
const existingClipsAtom = atom<ExistingClip[]>([]);
const videoReferenceAtom = atom<SharedReference<HTMLVideoElement | null>>(
  createSharedReference<HTMLVideoElement | null>(null),
);
const timelineReferenceAtom = atom<SharedReference<HTMLDivElement | null>>(
  createSharedReference<HTMLDivElement | null>(null),
);

const buildRangeLookupKey = (range: { start: number; end: number }) => (
  `${Math.floor(range.start)}:${Math.floor(range.end)}`
);

export const useClippingState = (
  { initialSourcePath = '' }: { initialSourcePath?: string } = {},
): ClippingStateModel => {
  const [sourcePath, setSourcePath] = useAtom(sourcePathAtom);
  const [outputDirectory, setOutputDirectory] = useAtom(outputDirectoryAtom);
  const [ranges, setRanges] = useAtom(rangesAtom);
  const [plan, setPlan] = useAtom(planAtom);
  const [runResult, setRunResult] = useAtom(runResultAtom);
  const [progressById, setProgressById] = useAtom(progressByIdAtom);
  const [errorMessage, setErrorMessage] = useAtom(errorMessageAtom);
  const [trimMode, setTrimMode] = useAtom(trimModeAtom);
  const [duration, setDuration] = useAtom(durationAtom);
  const [currentTime, setCurrentTime] = useAtom(currentTimeAtom);
  const [isPlaying, setIsPlaying] = useAtom(isPlayingAtom);
  const [selectedRangeId, setSelectedRangeId] = useAtom(selectedRangeIdAtom);
  const [existingClips, setExistingClips] = useAtom(existingClipsAtom);
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
  const readyToStart = (
    sourcePath.length > 0
    && outputDirectory.length > 0
    && ranges.length > 0
  );
  const clipEntries = useMemo<ClipEntry[]>(() => [...ranges]
    .sort(
      (left, right) => (
        left.start - right.start
        || left.end - right.end
        || left.id.localeCompare(right.id)
      ),
    )
    .map((range) => {
      const matchingExistingClips = existingClips.filter(
        (clip) => buildRangeLookupKey(clip.range) === buildRangeLookupKey(range),
      );

      return {
        range,
        existingClips: matchingExistingClips,
        currentModeClip:
          matchingExistingClips.find((clip) => clip.trimMode === trimMode) ?? null,
        isLocked: matchingExistingClips.length > 0,
      };
    }), [existingClips, ranges, trimMode]);

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

    return Object.fromEntries(ranges.map((range) => {
      if (statusByJobId[range.id]) {
        return [range.id, statusByJobId[range.id]];
      }

      return [range.id, plannedIds.has(range.id) ? 'PLANNED' : 'DRAFT'];
    }));
  }, [plan.jobs, ranges, runResult]);

  return {
    clipStatusMap,
    clipEntries,
    currentTime,
    duration,
    errorMessage,
    existingClips,
    isPlaying,
    outputDirectory,
    plan,
    progressById,
    ranges,
    readyToStart,
    runResult,
    selectedRangeId,
    setCurrentTime,
    setDuration,
    setErrorMessage,
    setExistingClips,
    setIsPlaying,
    setOutputDirectory,
    setPlan,
    setProgressById,
    setRanges,
    setRunResult,
    setSelectedRangeId,
    setSourcePath,
    setTrimMode,
    sourcePath,
    timelineRef: timelineReference,
    trimMode,
    videoRef: videoReference,
    videoUrl,
  };
};
