import { useCallback } from 'react';
import {
  buildRangeId,
  clamp,
  DEFAULT_RANGE_DURATION,
  MIN_RANGE_DURATION,
} from './clipping';
import { toVariantKeyFromClip } from './clipping.variants';
import type {
  ClipVariantEntry,
  ClipRange,
  ClippingActions,
  ClippingStateModel,
  DraftClipVariant,
  FfmpegAvailabilityResult,
  TrimMode,
} from './clipping.types';

const getFfmpegStatus = async (): Promise<FfmpegAvailabilityResult> => {
  if (typeof globalThis.cutrail?.checkFfmpeg !== 'function') {
    return {
      available: false,
      path: '',
      source: 'UNKNOWN',
      code: 'FFMPEG_CHECK_UNAVAILABLE',
      error: 'FFmpeg check API is unavailable.',
    };
  }

  return globalThis.cutrail.checkFfmpeg();
};

const buildRangeLookupKey = (range: { start: number; end: number }): string => (
  `${Math.floor(range.start)}:${Math.floor(range.end)}`
);

const normalizeTrackIndices = (trackIndices: number[]): number[] => (
  [...new Set(trackIndices
    .filter((value) => Number.isInteger(value) && value >= 0)
    .map(Number))].sort((left, right) => left - right)
);

const createDraftVariantId = (rangeId: string): string => (
  `draft:${rangeId}:${Date.now()}:${Math.random().toString(36).slice(2, 10)}`
);

const appendOutputSuffix = (outputPath: string, suffix: string): string => {
  const extensionSeparatorIndex = outputPath.lastIndexOf('.');
  const hasExtension = extensionSeparatorIndex > outputPath.lastIndexOf('/');
  const extension = hasExtension ? outputPath.slice(extensionSeparatorIndex) : '';
  const withoutExtension = outputPath.slice(0, outputPath.length - extension.length);

  return `${withoutExtension}__${suffix}${extension}`;
};

const withUniqueOutputPaths = <TJob extends { outputPath: string; args: string[] }>(
  jobs: TJob[],
): TJob[] => {
  const seenCountsByPath = new Map<string, number>();

  return jobs.map((job) => {
    const seenCount = seenCountsByPath.get(job.outputPath) ?? 0;
    const nextSeenCount = seenCount + 1;

    seenCountsByPath.set(job.outputPath, nextSeenCount);

    if (seenCount === 0) {
      return job;
    }

    const nextOutputPath = appendOutputSuffix(job.outputPath, `variant-${nextSeenCount}`);
    const nextArguments = [...job.args];
    const outputPathArgumentIndex = nextArguments.lastIndexOf(job.outputPath);

    if (outputPathArgumentIndex !== -1) {
      nextArguments[outputPathArgumentIndex] = nextOutputPath;
    }

    return {
      ...job,
      outputPath: nextOutputPath,
      args: nextArguments,
    };
  });
};

export const useClippingActions = (state: ClippingStateModel): ClippingActions => {
  const resetPlan = useCallback(() => {
    state.setPlan({
      jobs: [],
      errors: [],
    });
    state.setRunResult(null);
    state.setProgressById({});
  }, [state]);

  const removeRangeById = useCallback((id: string, { allowLocked = false } = {}) => {
    const clipEntry = state.clipEntries.find((entry) => entry.range.id === id);

    if (!allowLocked && clipEntry?.isLocked) {
      return;
    }

    state.setRanges((previous) => previous.filter((range) => range.id !== id));
    state.setDraftClipVariants((previous) => previous.filter((variant) => variant.rangeId !== id));
    resetPlan();
    state.setSelectedRangeId((current) => (current === id ? null : current));
    state.setSelectedVariantId((current) => {
      if (!current) {
        return current;
      }

      const hasVariantForRange = state.draftClipVariants.some((variant) => (
        variant.id === current && variant.rangeId !== id
      ));

      return hasVariantForRange ? current : null;
    });
  }, [resetPlan, state]);

  const pausePlayback = useCallback(() => {
    if (state.videoRef.current) {
      state.videoRef.current.pause();
    }

    state.setIsPlaying(false);
  }, [state]);

  const setPlaybackTime = useCallback((time: number) => {
    state.setCurrentTime(time);
    state.setPlaybackSeekRequest((previous) => ({
      revision: previous.revision + 1,
      time,
    }));
  }, [state]);

  const setSelectedRangeId = useCallback((rangeId: string | null) => {
    state.setSelectedRangeId(rangeId);

    if (!rangeId) {
      state.setSelectedVariantId(null);

      return;
    }

    const firstVariantForRange = state.draftClipVariants.find(
      (variant) => variant.rangeId === rangeId,
    );

    state.setSelectedVariantId(firstVariantForRange?.id ?? null);
  }, [state]);

  const setSelectedVariant = useCallback((rangeId: string, variantKey: string) => {
    const draftVariant = state.draftClipVariants.find((variant) => (
      variant.rangeId === rangeId && variant.id === variantKey
    ));

    state.setSelectedRangeId(rangeId);
    state.setSelectedVariantId(draftVariant?.id ?? null);
  }, [state]);

  const setTrimMode = useCallback((nextTrimMode: TrimMode) => {
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

    const nextRangeId = buildRangeId(state.ranges);
    const nextRange: ClipRange = {
      id: nextRangeId,
      start: Number(start.toFixed(3)),
      end: Number(end.toFixed(3)),
    };

    state.setRanges((previous) => [...previous, nextRange]);

    const nextDraftVariant: DraftClipVariant = {
      id: createDraftVariantId(nextRange.id),
      isEditable: true,
      sourceFilePath: null,
      rangeId: nextRange.id,
      mutedAudioTrackIndices: [...state.mutedAudioTrackIndices],
      selectedAudioTrackIndices: [...state.selectedAudioTrackIndices],
      trimMode: state.defaultTrimMode,
    };

    state.setDraftClipVariants((previous) => [...previous, nextDraftVariant]);
    state.setSelectedRangeId(nextRange.id);
    state.setSelectedVariantId(nextDraftVariant.id);

    resetPlan();
  }, [resetPlan, state]);

  const createNewVariantFromSelection = useCallback(() => {
    if (!state.selectedRangeId || !state.selectedVariantId) {
      return;
    }

    const selectedVariant = state.draftClipVariants.find((variant) => (
      variant.id === state.selectedVariantId
    ));

    if (!selectedVariant) {
      return;
    }

    const nextVariant: DraftClipVariant = {
      ...selectedVariant,
      id: createDraftVariantId(selectedVariant.rangeId),
      isEditable: true,
      sourceFilePath: selectedVariant.sourceFilePath,
      trimMode: state.defaultTrimMode,
    };

    state.setDraftClipVariants((previous) => [...previous, nextVariant]);
    state.setSelectedVariantId(nextVariant.id);
    resetPlan();
  }, [resetPlan, state]);

  const createVariantDuplicate = useCallback((rangeId: string, variant: ClipVariantEntry) => {
    const nextVariant: DraftClipVariant = {
      id: createDraftVariantId(rangeId),
      isEditable: true,
      sourceFilePath: variant.filePath ?? null,
      rangeId,
      mutedAudioTrackIndices: [...variant.mutedAudioTrackIndices],
      selectedAudioTrackIndices: [...variant.selectedAudioTrackIndices],
      trimMode: state.defaultTrimMode,
    };

    state.setDraftClipVariants((previous) => [...previous, nextVariant]);
    state.setSelectedRangeId(nextVariant.rangeId);
    state.setSelectedVariantId(nextVariant.id);
    resetPlan();
  }, [resetPlan, state]);

  const setVariantTrimMode = useCallback((
    rangeId: string,
    variantKey: string,
    nextTrimMode: TrimMode,
  ) => {
    let updated = false;

    state.setDraftClipVariants((previous) => previous.map((variant) => {
      if (variant.rangeId !== rangeId || variant.id !== variantKey) {
        return variant;
      }

      if (variant.trimMode === nextTrimMode) {
        return variant;
      }

      updated = true;

      return {
        ...variant,
        trimMode: nextTrimMode,
      };
    }));

    if (!updated) {
      return;
    }

    state.setSelectedRangeId(rangeId);
    state.setSelectedVariantId(variantKey);
    resetPlan();
    state.setErrorMessage('');
  }, [resetPlan, state]);

  const toggleAudioTrackMuted = useCallback((trackIndex: number) => {
    state.setMutedAudioTrackIndices((previous) => {
      const hasTrackMuted = previous.includes(trackIndex);

      if (hasTrackMuted) {
        return normalizeTrackIndices(previous.filter((value) => value !== trackIndex));
      }

      return normalizeTrackIndices([...previous, trackIndex]);
    });
    resetPlan();
    state.setErrorMessage('');
  }, [resetPlan, state]);

  const toggleVariantAudioTrackMuted = useCallback((
    rangeId: string,
    variantKey: string,
    trackIndex: number,
  ) => {
    let updated = false;

    state.setDraftClipVariants((previous) => previous.map((variant) => {
      if (variant.rangeId !== rangeId || variant.id !== variantKey) {
        return variant;
      }

      const hasTrackMuted = variant.mutedAudioTrackIndices.includes(trackIndex);
      const nextMutedAudioTrackIndices = hasTrackMuted
        ? normalizeTrackIndices(
          variant.mutedAudioTrackIndices.filter((value) => value !== trackIndex),
        )
        : normalizeTrackIndices([...variant.mutedAudioTrackIndices, trackIndex]);
      const nextSelectedAudioTrackIndices = normalizeTrackIndices(
        variant.selectedAudioTrackIndices.filter((value) => value !== trackIndex),
      );
      const resolvedSelectedAudioTrackIndices = hasTrackMuted
        ? normalizeTrackIndices([...nextSelectedAudioTrackIndices, trackIndex])
        : nextSelectedAudioTrackIndices;

      updated = true;

      return {
        ...variant,
        mutedAudioTrackIndices: nextMutedAudioTrackIndices,
        selectedAudioTrackIndices: resolvedSelectedAudioTrackIndices,
      };
    }));

    if (!updated) {
      return;
    }

    state.setSelectedRangeId(rangeId);
    state.setSelectedVariantId(variantKey);
    resetPlan();
    state.setErrorMessage('');
  }, [resetPlan, state]);

  const removeVariant = useCallback(async (range: ClipRange, variant: ClipVariantEntry) => {
    const bridge = globalThis.cutrail;
    const clipVariantKey = variant.clip ? toVariantKeyFromClip(variant.clip) : variant.key;

    if (variant.filePath) {
      const deleteResult = await bridge?.deleteClipRangeOutputs?.({
        filePath: variant.filePath,
        outputDirectory: state.outputDirectory,
        range: {
          start: range.start,
          end: range.end,
        },
        sourcePath: state.sourcePath,
        variantKey: clipVariantKey,
      });

      if (!deleteResult?.ok) {
        state.setErrorMessage(deleteResult?.error ?? 'Failed to delete generated clip variant files.');

        return;
      }
    }

    state.setExistingClips((previous) => previous.filter((clip) => {
      if (variant.filePath && clip.filePath === variant.filePath) {
        return false;
      }

      if (buildRangeLookupKey(clip.range) !== buildRangeLookupKey(range)) {
        return true;
      }

      return toVariantKeyFromClip(clip) !== clipVariantKey;
    }));
    state.setDraftClipVariants((previous) => previous.filter(
      (draftVariant) => draftVariant.id !== variant.key,
    ));

    const hasAnyVariantLeft = state.clipEntries.some((entry) => {
      if (entry.range.id !== range.id) {
        return false;
      }

      return entry.variantEntries.some((entryVariant) => entryVariant.key !== variant.key);
    });

    if (!hasAnyVariantLeft) {
      state.setRanges((previous) => previous.filter((entryRange) => entryRange.id !== range.id));
    }

    if (state.selectedVariantId === variant.key) {
      const nextVariant = state.draftClipVariants.find((draftVariant) => (
        draftVariant.rangeId === range.id && draftVariant.id !== variant.key
      ));

      state.setSelectedVariantId(nextVariant?.id ?? null);
      state.setSelectedRangeId(nextVariant?.rangeId ?? null);
    }

    state.setErrorMessage('');
    resetPlan();
  }, [resetPlan, state]);

  const removeClip = useCallback(async (range: ClipRange | null | undefined) => {
    if (!range) {
      return;
    }

    const selectedVariantEntry = state.clipEntries
      .find((entry) => entry.range.id === range.id)
      ?.variantEntries
      .find((variant) => variant.key === state.selectedVariantId)
      ?? null;

    if (selectedVariantEntry) {
      await removeVariant(range, selectedVariantEntry);
    }
  }, [removeVariant, state]);

  const startExport = useCallback(async () => {
    pausePlayback();

    try {
      const bridge = globalThis.cutrail;

      const status = await getFfmpegStatus();

      if (!status.available) {
        state.setErrorMessage('Export is unavailable.');

        return;
      }

      if (
        typeof bridge?.createExportPlan !== 'function'
        || typeof bridge.runExportPlan !== 'function'
      ) {
        state.setErrorMessage('Export APIs are unavailable.');

        return;
      }

      const rangesById = new Map(state.ranges.map((range) => [range.id, range]));
      const exportableDraftVariants = state.draftClipVariants.filter((variant) => (
        variant.isEditable === true
      ));
      const planParts = await Promise.all(exportableDraftVariants.map(async (variant) => {
        const range = rangesById.get(variant.rangeId);

        if (!range) {
          return {
            errors: [{
              code: 'MISSING_RANGE',
              id: variant.id,
            }],
            jobs: [],
          };
        }

        return bridge.createExportPlan({
          sourcePath: state.sourcePath,
          outputDirectory: state.outputDirectory,
          ranges: [
            {
              id: variant.id,
              start: range.start,
              end: range.end,
            },
          ],
          trimMode: variant.trimMode,
          audioStreamIndices: variant.selectedAudioTrackIndices,
          selectedAudioTrackIndices: variant.selectedAudioTrackIndices,
          mutedAudioTrackIndices: variant.mutedAudioTrackIndices,
        });
      }));

      const nextPlan = {
        jobs: withUniqueOutputPaths(planParts.flatMap((part) => part.jobs)),
        errors: planParts.flatMap((part) => part.errors),
      };

      state.setPlan(nextPlan);
      state.setProgressById({});
      state.setErrorMessage('');
      state.setRunResult(null);

      if (nextPlan.errors.length > 0 || nextPlan.jobs.length === 0) {
        state.setErrorMessage(
          nextPlan.errors.length > 0
            ? 'Clip ranges contain validation errors.'
            : 'No clips available to export.',
        );

        return;
      }

      const result = await bridge.runExportPlan({ jobs: nextPlan.jobs });
      state.setRunResult(result);

      if (typeof bridge.syncExistingExportClips === 'function') {
        bridge.syncExistingExportClips({
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
    createNewVariantFromSelection,
    createVariantDuplicate,
    pausePlayback,
    removeClip,
    removeRange: (id: string, options?: { forceLocked?: boolean }) => {
      removeRangeById(id, { allowLocked: options?.forceLocked === true });
    },
    removeVariant,
    resetPlan,
    setPlaybackTime,
    setSelectedRangeId,
    setSelectedVariant,
    setTrimMode,
    setVariantTrimMode,
    startExport,
    toggleAudioTrackMuted,
    toggleVariantAudioTrackMuted,
  };
};
