import { useEffect } from 'react';
import { buildRangeId } from './clipping';
import type {
  ClipRange,
  ClippingStateModel,
  ExistingClip,
  ExistingExportClipsSnapshot,
  ExportProgressPayload,
  SourceAudioTrackSnapshot,
} from './clipping.types';

const buildRangeLookupKey = (range: { start: number; end: number }): string => (
  `${Math.floor(range.start)}:${Math.floor(range.end)}`
);

const isTrustedExistingClip = (clip: ExistingClip): boolean => {
  const classification = clip.classificationKind;

  return classification !== 'foreign' && classification !== 'invalid';
};

const mergeRangesWithExistingClips = (
  previousRanges: ClipRange[],
  existingClips: ExistingClip[],
): ClipRange[] => {
  const nextRanges = [...previousRanges];
  const existingRangeKeys = new Set(
    previousRanges.map((range) => buildRangeLookupKey(range)),
  );
  const uniqueClipsByRangeKey = new Map(
    existingClips
      .filter((clip) => isTrustedExistingClip(clip))
      .map((clip) => [buildRangeLookupKey(clip.range), clip]),
  );

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

  return nextRanges.sort(
    (left, right) => (
      left.start - right.start
      || left.end - right.end
      || left.id.localeCompare(right.id)
    ),
  );
};

export const useClippingSubscriptions = ({
  state,
}: {
  state: ClippingStateModel;
}): void => {
  const {
    audioTracks,
    hideDefaultAudioTrackWhenMultiple,
    outputDirectory,
    setAudioTracks,
    setCurrentTime,
    setDuration,
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
    setSourcePath,
    sourcePath,
    trimMode,
    videoRef,
  } = state;

  useEffect(() => {
    if (typeof globalThis.cutrail?.onExportProgress !== 'function') {
      return undefined;
    }

    return globalThis.cutrail.onExportProgress((progress: ExportProgressPayload) => {
      setProgressById((previous) => ({
        ...previous,
        [progress.jobId]: progress,
      }));
    });
  }, [setProgressById]);

  useEffect(() => {
    if (typeof globalThis.cutrail?.onExistingExportClipsUpdated !== 'function') {
      return undefined;
    }

    return globalThis.cutrail.onExistingExportClipsUpdated((
      payload: ExistingExportClipsSnapshot,
    ) => {
      if (
        !payload
        || payload.sourcePath !== sourcePath
        || payload.outputDirectory !== outputDirectory
      ) {
        return;
      }

      setExistingClips(Array.isArray(payload.clips) ? payload.clips : []);
      setRanges((previousRanges) => mergeRangesWithExistingClips(
        previousRanges,
        Array.isArray(payload.clips) ? payload.clips : [],
      ));
    });
  }, [outputDirectory, setExistingClips, setRanges, sourcePath]);

  useEffect(() => {
    if (typeof globalThis.cutrail?.onSourceVideoSelected !== 'function') {
      return undefined;
    }

    return globalThis.cutrail.onSourceVideoSelected((nextPath: string) => {
      if (typeof nextPath !== 'string' || nextPath.length === 0) {
        return;
      }

      setSourcePath(nextPath);
      setRanges([]);
      setSelectedRangeId(null);
      setCurrentTime(0);
      setPlaybackSeekRequest({
        revision: 0,
        time: 0,
      });
      setDuration(0);
      setAudioTracks([]);
      setExistingClips([]);
      setMutedAudioTrackIndices([]);

      if (videoRef.current) {
        videoRef.current.pause();
      }

      setIsPlaying(false);
      setPlan({
        jobs: [],
        errors: [],
      });
      setRunResult(null);
      setProgressById({});
      setErrorMessage('');
    });
  }, [
    setAudioTracks,
    setCurrentTime,
    setDuration,
    setErrorMessage,
    setExistingClips,
    setIsPlaying,
    setMutedAudioTrackIndices,
    setPlaybackSeekRequest,
    setPlan,
    setProgressById,
    setRanges,
    setRunResult,
    setSelectedRangeId,
    setSourcePath,
    videoRef,
  ]);

  useEffect(() => {
    let mounted = true;

    if (typeof globalThis.cutrail?.getOutputDirectory !== 'function') {
      return undefined;
    }

    globalThis.cutrail.getOutputDirectory().then((savedPath: string | null) => {
      if (mounted && typeof savedPath === 'string' && savedPath.length > 0) {
        setOutputDirectory(savedPath);
      }
    });

    return () => {
      mounted = false;
    };
  }, [setOutputDirectory]);

  useEffect(() => {
    let mounted = true;

    if (typeof globalThis.cutrail?.getHideDefaultAudioTrackWhenMultiple !== 'function') {
      return undefined;
    }

    globalThis.cutrail.getHideDefaultAudioTrackWhenMultiple().then((value: boolean) => {
      if (mounted) {
        setHideDefaultAudioTrackWhenMultiple(value === true);
      }
    });

    return () => {
      mounted = false;
    };
  }, [setHideDefaultAudioTrackWhenMultiple]);

  useEffect(() => {
    setMutedAudioTrackIndices((previous) => {
      const hasFirstTrack = audioTracks.some((track) => track.trackIndex === 0);

      if (!hasFirstTrack || !hideDefaultAudioTrackWhenMultiple || audioTracks.length <= 1) {
        return previous.filter((trackIndex) => trackIndex !== 0);
      }

      if (previous.includes(0)) {
        return previous;
      }

      return [...previous, 0].sort((left, right) => left - right);
    });
  }, [
    audioTracks,
    hideDefaultAudioTrackWhenMultiple,
    setMutedAudioTrackIndices,
  ]);

  useEffect(() => {
    if (typeof globalThis.cutrail?.onHideDefaultAudioTrackWhenMultipleUpdated !== 'function') {
      return undefined;
    }

    return globalThis.cutrail.onHideDefaultAudioTrackWhenMultipleUpdated((value: boolean) => {
      setHideDefaultAudioTrackWhenMultiple(value === true);
    });
  }, [setHideDefaultAudioTrackWhenMultiple]);

  useEffect(() => {
    let mounted = true;

    if (sourcePath.length === 0) {
      setAudioTracks([]);
      setMutedAudioTrackIndices([]);

      return undefined;
    }

    if (typeof globalThis.cutrail?.getSourceAudioTracks !== 'function') {
      return undefined;
    }

    setAudioTracks([]);
    setMutedAudioTrackIndices([]);

    globalThis.cutrail
      .getSourceAudioTracks({ sourcePath })
      .then((payload: SourceAudioTrackSnapshot) => {
        if (!mounted || payload.sourcePath !== sourcePath) {
          return;
        }

        const nextAudioTracks = Array.isArray(payload.tracks) ? payload.tracks : [];
        const shouldMuteHiddenFirstTrack = (
          hideDefaultAudioTrackWhenMultiple
          && nextAudioTracks.length > 1
          && nextAudioTracks.some((track) => track.trackIndex === 0)
        );

        setAudioTracks(nextAudioTracks);
        setMutedAudioTrackIndices(shouldMuteHiddenFirstTrack ? [0] : []);
      });

    return () => {
      mounted = false;
    };
  }, [
    hideDefaultAudioTrackWhenMultiple,
    setAudioTracks,
    setMutedAudioTrackIndices,
    sourcePath,
  ]);

  useEffect(() => {
    if (typeof globalThis.cutrail?.onOutputDirectoryUpdated !== 'function') {
      return undefined;
    }

    return globalThis.cutrail.onOutputDirectoryUpdated((nextPath: string) => {
      if (typeof nextPath === 'string' && nextPath.length > 0) {
        setOutputDirectory(nextPath);
        setExistingClips([]);
      }
    });
  }, [setExistingClips, setOutputDirectory]);

  useEffect(() => {
    if (typeof globalThis.cutrail?.syncExistingExportClips !== 'function') {
      return undefined;
    }

    globalThis.cutrail.syncExistingExportClips({
      sourcePath,
      outputDirectory,
    });

    return undefined;
  }, [outputDirectory, sourcePath, trimMode]);
};
