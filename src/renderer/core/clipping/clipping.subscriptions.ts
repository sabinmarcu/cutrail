import {
  useEffect,
  useRef,
} from 'react';
import { useWatcherSubscriptions } from '@renderer/core/watchers';
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
  const existingRangeKeys = new Set(previousRanges.map((range) => buildRangeLookupKey(range)));
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
    outputDirectory,
    setAudioTracks,
    setCurrentTime,
    setDraftClipVariants,
    setDuration,
    setErrorMessage,
    setExistingClips,
    setDefaultTrimMode,
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
    sourcePath,
    videoRef,
  } = state;
  const sourcePathReference = useRef(sourcePath);
  const sourceIdentityReference = useRef<{
    extension: string;
    modifiedAtMs: number;
  } | null>(null);

  useEffect(() => {
    sourcePathReference.current = sourcePath;
  }, [sourcePath]);

  useEffect(() => {
    if (typeof globalThis.cutrail?.getVideoLibrary !== 'function') {
      return;
    }

    globalThis.cutrail.getVideoLibrary().catch(() => {
      // Best-effort watcher bootstrap for editor windows.
    });
  }, []);

  useEffect(() => {
    if (
      sourcePath.length === 0
      || typeof globalThis.cutrail?.getVideoLibrary !== 'function'
    ) {
      sourceIdentityReference.current = null;

      return;
    }

    globalThis.cutrail.getVideoLibrary().then((snapshot) => {
      const videos = Array.isArray(snapshot.videos) ? snapshot.videos : [];
      const currentSourcePath = sourcePathReference.current;
      const matchingEntry = videos.find((video) => video.filePath === currentSourcePath);

      if (!matchingEntry) {
        return;
      }

      sourceIdentityReference.current = {
        extension: matchingEntry.extension,
        modifiedAtMs: matchingEntry.modifiedAtMs,
      };
    }).catch(() => {
      sourceIdentityReference.current = null;
    });
  }, [sourcePath]);

  useWatcherSubscriptions({
    onOutputSnapshot: (payload) => {
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
    },
    onSourceSnapshot: (payload) => {
      const currentSourcePath = sourcePathReference.current;

      if (currentSourcePath.length === 0) {
        return;
      }

      const videos = Array.isArray(payload.videos) ? payload.videos : [];
      const matchingEntry = videos.find((video) => video.filePath === currentSourcePath);

      if (matchingEntry) {
        sourceIdentityReference.current = {
          extension: matchingEntry.extension,
          modifiedAtMs: matchingEntry.modifiedAtMs,
        };

        return;
      }

      const currentIdentity = sourceIdentityReference.current;

      if (!currentIdentity) {
        return;
      }

      const candidates = videos.filter((video) => (
        video.extension === currentIdentity.extension
        && Math.round(video.modifiedAtMs) === Math.round(currentIdentity.modifiedAtMs)
      ));

      if (candidates.length !== 1) {
        return;
      }

      const nextSourcePath = candidates[0]?.filePath;

      if (typeof nextSourcePath !== 'string' || nextSourcePath.length === 0) {
        return;
      }

      if (nextSourcePath === currentSourcePath) {
        return;
      }

      setSourcePath(nextSourcePath);
      setErrorMessage('');
    },
  });

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
    const hasLegacySubscription = (
      typeof globalThis.cutrail?.onExistingExportClipsUpdated === 'function'
    );

    if (!hasLegacySubscription) {
      return undefined;
    }

    const applySnapshot = (payload: {
      sourcePath: string;
      outputDirectory: string;
      clips: ExistingClip[];
    }) => {
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
    };

    const unsubscribeLegacy = hasLegacySubscription
      ? (globalThis.cutrail?.onExistingExportClipsUpdated?.(
        (payload: ExistingExportClipsSnapshot) => {
          applySnapshot(payload);
        },
      ) ?? (() => {}))
      : () => {};

    return () => {
      unsubscribeLegacy();
    };
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
      setDraftClipVariants([]);
      setSelectedRangeId(null);
      setSelectedVariantId(null);
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
    setDraftClipVariants,
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
    setSelectedVariantId,
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
    let mounted = true;

    if (typeof globalThis.cutrail?.getDefaultTrimMode !== 'function') {
      return undefined;
    }

    globalThis.cutrail.getDefaultTrimMode().then((value) => {
      if (mounted) {
        setDefaultTrimMode(value === 'accurate' ? 'accurate' : 'fast');
      }
    });

    return () => {
      mounted = false;
    };
  }, [setDefaultTrimMode]);

  useEffect(() => {
    if (typeof globalThis.cutrail?.onDefaultTrimModeUpdated !== 'function') {
      return undefined;
    }

    return globalThis.cutrail.onDefaultTrimModeUpdated((value) => {
      setDefaultTrimMode(value === 'accurate' ? 'accurate' : 'fast');
    });
  }, [setDefaultTrimMode]);

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

      return undefined;
    }

    if (typeof globalThis.cutrail?.getSourceAudioTracks !== 'function') {
      return undefined;
    }

    setAudioTracks([]);

    globalThis.cutrail.getSourceAudioTracks({ sourcePath }).then(
      (payload: SourceAudioTrackSnapshot) => {
        if (!mounted || payload.sourcePath !== sourcePath) {
          return;
        }

        const nextAudioTracks = Array.isArray(payload.tracks) ? payload.tracks : [];

        setAudioTracks(nextAudioTracks);
      },
    );

    return () => {
      mounted = false;
    };
  }, [setAudioTracks, sourcePath]);

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
  }, [outputDirectory, sourcePath]);
};
