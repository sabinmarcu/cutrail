import { useEffect } from 'react';
import { buildRangeId } from './clipping';

type ExistingClip = {
  range: {
    start: number;
    end: number;
  };
};

const buildRangeLookupKey = (range) => `${Math.floor(range.start)}:${Math.floor(range.end)}`;

const mergeRangesWithExistingClips = (previousRanges, existingClips: ExistingClip[]) => {
  const nextRanges = [...previousRanges];
  const existingRangeKeys = new Set(previousRanges.map((range) => buildRangeLookupKey(range)));
  const uniqueClipsByRangeKey = new Map(existingClips.map((clip) => [buildRangeLookupKey(clip.range), clip]));

  for (const clip of uniqueClipsByRangeKey.values()) {
    const rangeKey = buildRangeLookupKey(clip.range);

    if (!existingRangeKeys.has(rangeKey)) {
      nextRanges.push({
        end: clip.range.end,
        id: buildRangeId(nextRanges),
        start: clip.range.start,
      });
      existingRangeKeys.add(rangeKey);
    }
  }

  return nextRanges.sort((left, right) => left.start - right.start || left.end - right.end || left.id.localeCompare(right.id));
};

export const useClippingSubscriptions = ({ actions, state }) => {
  useEffect(() => {
    if (typeof globalThis.cutrail?.onExportProgress !== 'function') {
      return undefined;
    }

    return globalThis.cutrail.onExportProgress((progress) => {
      state.setProgressById((previous) => ({
        ...previous,
        [progress.jobId]: progress,
      }));
    });
  }, [state]);

  useEffect(() => {
    if (typeof globalThis.cutrail?.onExistingExportClipsUpdated !== 'function') {
      return undefined;
    }

    return globalThis.cutrail.onExistingExportClipsUpdated((payload) => {
      if (!payload || payload.sourcePath !== state.sourcePath || payload.outputDirectory !== state.outputDirectory) {
        return;
      }

      state.setExistingClips(Array.isArray(payload.clips) ? payload.clips : []);
      state.setRanges((previousRanges) => mergeRangesWithExistingClips(previousRanges, Array.isArray(payload.clips) ? payload.clips : []));
    });
  }, [state]);

  useEffect(() => {
    if (typeof globalThis.cutrail?.onSourceVideoSelected !== 'function') {
      return undefined;
    }

    return globalThis.cutrail.onSourceVideoSelected((nextPath) => {
      if (typeof nextPath !== 'string' || nextPath.length === 0) {
        return;
      }

      state.setSourcePath(nextPath);
      state.setRanges([]);
      state.setSelectedRangeId(null);
      state.setCurrentTime(0);
      state.setDuration(0);
      state.setExistingClips([]);
      actions.pausePlayback();
      actions.resetPlan();
      state.setErrorMessage('');
    });
  }, [actions, state]);

  useEffect(() => {
    let mounted = true;

    if (typeof globalThis.cutrail?.getOutputDirectory !== 'function') {
      return undefined;
    }

    void globalThis.cutrail.getOutputDirectory().then((savedPath) => {
      if (mounted && typeof savedPath === 'string' && savedPath.length > 0) {
        state.setOutputDirectory(savedPath);
      }
    });

    return () => {
      mounted = false;
    };
  }, [state]);

  useEffect(() => {
    if (typeof globalThis.cutrail?.onOutputDirectoryUpdated !== 'function') {
      return undefined;
    }

    return globalThis.cutrail.onOutputDirectoryUpdated((nextPath) => {
      if (typeof nextPath === 'string' && nextPath.length > 0) {
        state.setOutputDirectory(nextPath);
        state.setExistingClips([]);
      }
    });
  }, [state]);

  useEffect(() => {
    if (typeof globalThis.cutrail?.syncExistingExportClips !== 'function') {
      return undefined;
    }

    void globalThis.cutrail.syncExistingExportClips({
      sourcePath: state.sourcePath,
      outputDirectory: state.outputDirectory,
    });

    return undefined;
  }, [state.outputDirectory, state.sourcePath, state.trimMode]);
};
