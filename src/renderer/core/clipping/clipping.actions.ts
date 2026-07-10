import { useCallback } from 'react';
import {
  buildRangeId,
  clamp,
  DEFAULT_RANGE_DURATION,
  MIN_RANGE_DURATION,
} from './clipping';

const getFfmpegStatus = async () => {
  if (typeof globalThis.cutrail?.checkFfmpeg !== 'function') {
    return {
      available: false,
      code: 'FFMPEG_CHECK_UNAVAILABLE',
      error: 'FFmpeg check API is unavailable.',
    };
  }

  return globalThis.cutrail.checkFfmpeg();
};

const buildRangeLookupKey = (range) => `${Math.floor(range.start)}:${Math.floor(range.end)}`;

export const useClippingActions = (state) => {
  const resetPlan = useCallback(() => {
    state.setPlan({
      jobs: [],
      errors: [],
    });
    state.setRunResult(null);
    state.setProgressById({});
  }, [state]);

  const removeRangeById = useCallback((id, { allowLocked = false } = {}) => {
    const clipEntry = state.clipEntries.find((entry) => entry.range.id === id);

    if (!allowLocked && clipEntry?.isLocked) {
      return;
    }

    state.setRanges((previous) => previous.filter((range) => range.id !== id));
    resetPlan();
    state.setSelectedRangeId((current) => (current === id ? null : current));
  }, [resetPlan, state]);

  const pausePlayback = useCallback(() => {
    if (state.videoRef.current) {
      state.videoRef.current.pause();
    }

    state.setIsPlaying(false);
  }, [state]);

  const setPlaybackTime = useCallback((time) => {
    state.setCurrentTime(time);
  }, [state]);

  const setSelectedRangeId = useCallback((rangeId) => {
    state.setSelectedRangeId(rangeId);
  }, [state]);

  const setTrimMode = useCallback((nextTrimMode) => {
    if (state.trimMode === nextTrimMode) {
      return;
    }

    state.setTrimMode(nextTrimMode);
    resetPlan();
    state.setErrorMessage('');
  }, [resetPlan, state]);

  const addRangeAtPlayhead = useCallback(() => {
    if (state.duration <= 0) {
      return;
    }

    const start = clamp(state.currentTime, 0, state.duration - MIN_RANGE_DURATION);
    const end = clamp(start + DEFAULT_RANGE_DURATION, start + MIN_RANGE_DURATION, state.duration);

    state.setRanges((previous) => ([
      ...previous,
      {
        id: buildRangeId(previous),
        start: Number(start.toFixed(3)),
        end: Number(end.toFixed(3)),
      },
    ]));
    resetPlan();
  }, [resetPlan, state]);

  const removeRange = useCallback((id) => {
    removeRangeById(id);
  }, [removeRangeById]);

  const removeClip = useCallback(async (range) => {
    if (!range) {
      return;
    }

    const rangeKey = buildRangeLookupKey(range);
    const hasGeneratedOutputs = state.existingClips.some((clip) => buildRangeLookupKey(clip.range) === rangeKey);

    if (hasGeneratedOutputs) {
      const result = await globalThis.cutrail?.deleteClipRangeOutputs?.({
        outputDirectory: state.outputDirectory,
        range: {
          start: range.start,
          end: range.end,
        },
        sourcePath: state.sourcePath,
      });

      if (!result?.ok) {
        state.setErrorMessage(result?.error ?? 'Failed to delete generated clip files.');

        return;
      }
    }

    state.setExistingClips((previous) => previous.filter((clip) => buildRangeLookupKey(clip.range) !== rangeKey));
    state.setErrorMessage('');
    removeRangeById(range.id, { allowLocked: true });
  }, [removeRangeById, state]);

  const startExport = useCallback(async () => {
    pausePlayback();

    try {
      const status = await getFfmpegStatus();

      if (!status.available) {
        state.setErrorMessage('Export is unavailable.');

        return;
      }

      const nextPlan = await globalThis.cutrail.createExportPlan({
        sourcePath: state.sourcePath,
        outputDirectory: state.outputDirectory,
        ranges: state.ranges,
        trimMode: state.trimMode,
      });

      state.setPlan(nextPlan);
      state.setProgressById({});
      state.setErrorMessage('');
      state.setRunResult(null);

      if (nextPlan.errors.length > 0 || nextPlan.jobs.length === 0) {
        state.setErrorMessage(nextPlan.errors.length > 0 ? 'Clip ranges contain validation errors.' : 'No clips available to export.');

        return;
      }

      const result = await globalThis.cutrail.runExportPlan({ jobs: nextPlan.jobs });
      state.setRunResult(result);

      if (typeof globalThis.cutrail?.syncExistingExportClips === 'function') {
        void globalThis.cutrail.syncExistingExportClips({
          sourcePath: state.sourcePath,
          outputDirectory: state.outputDirectory,
        });
      }
    } catch (error) {
      state.setErrorMessage(error instanceof Error ? error.message : 'Failed to run export plan');
    }
  }, [pausePlayback, state]);

  return {
    addRangeAtPlayhead,
    pausePlayback,
    removeClip,
    removeRange,
    resetPlan,
    setPlaybackTime,
    setSelectedRangeId,
    setTrimMode,
    startExport,
  };
};
