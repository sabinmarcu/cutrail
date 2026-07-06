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

export const useClippingActions = (state) => {
  const resetPlan = useCallback(() => {
    state.setPlan({
      jobs: [],
      errors: [],
    });
    state.setRunResult(null);
    state.setProgressById({});
  }, [state]);

  const pausePlayback = useCallback(() => {
    if (state.videoRef.current) {
      state.videoRef.current.pause();
    }

    state.setIsPlaying(false);
  }, [state]);

  const setPlaybackTime = useCallback((time) => {
    state.setCurrentTime(time);
  }, [state]);

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
    state.setRanges((previous) => previous.filter((range) => range.id !== id));
    resetPlan();
    state.setSelectedRangeId((current) => (current === id ? null : current));
  }, [resetPlan, state]);

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
    } catch (error) {
      state.setErrorMessage(error instanceof Error ? error.message : 'Failed to run export plan');
    }
  }, [pausePlayback, state]);

  return {
    addRangeAtPlayhead,
    pausePlayback,
    removeRange,
    resetPlan,
    setPlaybackTime,
    startExport,
  };
};
