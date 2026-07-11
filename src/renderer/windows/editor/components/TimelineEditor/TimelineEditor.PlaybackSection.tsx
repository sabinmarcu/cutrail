import {
  type SyntheticEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  Expand,
  Pause,
  Play,
} from 'lucide-react';
import { useClippingState } from '@renderer/core/clipping';
import {
  emptyVideo,
  overlayPlayButton,
  overlayPlayButtonVisible,
  playbackSection,
  video,
  videoFitContain,
  videoFitCover,
  videoFitToggleIcon,
  videoFitToggleIconActive,
  videoFitToggleButton,
  videoFitToggleButtonVisible,
  videoFrame,
} from './TimelineEditor.css';

type AudioTrackLike = {
  enabled: boolean;
  id?: string | number;
};

type PlaybackApplyReason =
  | 'loaded-metadata'
  | 'selection-change'
  | 'sync-play';

const parseNativeTrackIdCandidates = (nativeTrack: AudioTrackLike): number[] => {
  if (typeof nativeTrack.id === 'number' && Number.isInteger(nativeTrack.id)) {
    return [nativeTrack.id];
  }

  if (typeof nativeTrack.id !== 'string') {
    return [];
  }

  const trimmedId = nativeTrack.id.trim();

  if (trimmedId.length === 0) {
    return [];
  }

  const exactNumber = Number.parseInt(trimmedId, 10);
  const trailingNumberMatch = trimmedId.match(/(\d+)(?!.*\d)/u);

  return [
    ...(Number.isNaN(exactNumber) ? [] : [exactNumber]),
    ...(trailingNumberMatch ? [Number.parseInt(trailingNumberMatch[1], 10)] : []),
  ];
};

export const TimelineEditorPlaybackSection = () => {
  const {
    isPlaying,
    playbackSeekRequest,
    selectedAudioTrackIndices,
    visibleAudioTracks,
    setDuration,
    setCurrentTime,
    setIsPlaying,
    sourcePath,
    videoRef,
    videoUrl,
  } = useClippingState();
  const [showOverlayControl, setShowOverlayControl] = useState(false);
  const [useCoverFit, setUseCoverFit] = useState(false);
  const hideTimerReference = useRef<ReturnType<typeof globalThis.setTimeout> | null>(null);
  const audioLayerMapReference = useRef<Map<number, HTMLAudioElement>>(new Map());
  const selectedAudioTrackIndicesReference = useRef<number[]>(selectedAudioTrackIndices);

  useEffect(() => {
    selectedAudioTrackIndicesReference.current = selectedAudioTrackIndices;
  }, [selectedAudioTrackIndices]);

  const applySingleTrackSelection = useCallback((
    media: HTMLMediaElement,
    targetTrackIndex: number,
  ): boolean => {
    const nativeAudioTracks = (media as HTMLMediaElement & {
      audioTracks?: ArrayLike<AudioTrackLike>;
    }).audioTracks;
    const nativeAudioTrackList = nativeAudioTracks as ArrayLike<AudioTrackLike> & {
      [index: number]: AudioTrackLike;
    };

    if (!nativeAudioTrackList || typeof nativeAudioTrackList.length !== 'number') {
      return false;
    }

    const targetTrack = visibleAudioTracks.find((track) => track.trackIndex === targetTrackIndex);
    const targetStreamIndex = targetTrack?.streamIndex;
    const trackIndices = Array.from(
      { length: nativeAudioTrackList.length },
      (_value, index) => index,
    );
    let enabledCount = 0;

    for (const trackIndex of trackIndices) {
      const nativeTrack = nativeAudioTrackList[trackIndex];
      const shouldEnable = trackIndex === targetTrackIndex;

      nativeTrack.enabled = shouldEnable;

      if (shouldEnable) {
        enabledCount += 1;
      }
    }

    if (enabledCount === 0 && typeof targetStreamIndex === 'number') {
      for (const trackIndex of trackIndices) {
        const nativeTrack = nativeAudioTrackList[trackIndex];
        const idCandidates = parseNativeTrackIdCandidates(nativeTrack);

        nativeTrack.enabled = idCandidates.includes(targetStreamIndex);
      }

      enabledCount = trackIndices.reduce((count, trackIndex) => (
        count + (nativeAudioTrackList[trackIndex].enabled ? 1 : 0)
      ), 0);
    }

    return enabledCount > 0;
  }, [visibleAudioTracks]);

  const syncAudioLayers = useCallback(async (reason: PlaybackApplyReason) => {
    const videoElement = videoRef.current;

    if (!videoElement) {
      return;
    }

    const selectedTrackIndices = selectedAudioTrackIndicesReference.current;
    const selectedTrackIndexSet = new Set(selectedTrackIndices);
    const shouldRefreshTrackMapping = (
      reason === 'loaded-metadata'
      || reason === 'selection-change'
      || reason === 'sync-play'
    );
    const shouldForceAlign = reason === 'sync-play';
    const primarySelectedTrackIndex = selectedTrackIndices.length > 0
      ? selectedTrackIndices[0]
      : null;
    const videoManagedTrackIndex = (
      primarySelectedTrackIndex !== null
      && applySingleTrackSelection(videoElement, primarySelectedTrackIndex)
    )
      ? primarySelectedTrackIndex
      : null;

    videoElement.muted = videoManagedTrackIndex === null;

    const pendingPlays: Promise<void>[] = [];

    for (const [trackIndex, audioLayer] of audioLayerMapReference.current.entries()) {
      const shouldPlay = (
        selectedTrackIndexSet.has(trackIndex)
        && trackIndex !== videoManagedTrackIndex
      );

      if (!shouldPlay) {
        audioLayer.pause();
      } else {
        const hasTrackMapping = shouldRefreshTrackMapping
          ? applySingleTrackSelection(audioLayer, trackIndex)
          : true;

        if (!hasTrackMapping) {
          audioLayer.pause();
        } else {
          const needsRealign = (
            shouldForceAlign
            || Math.abs(audioLayer.currentTime - videoElement.currentTime) > 0.05
          );

          if (needsRealign) {
            audioLayer.currentTime = videoElement.currentTime;
          }

          audioLayer.playbackRate = videoElement.playbackRate;

          if (videoElement.paused) {
            audioLayer.pause();
          } else {
            pendingPlays.push((async () => {
              try {
                await audioLayer.play();
              } catch {
                // Ignore aborted play requests during rapid state changes.
              }
            })());
          }
        }
      }
    }

    await Promise.all(pendingPlays);
  }, [applySingleTrackSelection, videoRef]);

  const revealOverlayIndicator = useCallback(() => {
    setShowOverlayControl(true);

    if (hideTimerReference.current) {
      globalThis.clearTimeout(hideTimerReference.current);
    }

    hideTimerReference.current = globalThis.setTimeout(() => {
      setShowOverlayControl(false);
    }, 2000);
  }, []);

  useEffect(() => () => {
    if (hideTimerReference.current) {
      globalThis.clearTimeout(hideTimerReference.current);
    }
  }, [sourcePath]);

  useEffect(() => {
    const layerMap = audioLayerMapReference.current;
    const visibleTrackIndexSet = new Set(visibleAudioTracks.map((track) => track.trackIndex));

    for (const trackIndex of visibleTrackIndexSet) {
      if (!layerMap.has(trackIndex)) {
        const audioLayer = new Audio(videoUrl);

        audioLayer.preload = 'metadata';
        audioLayer.loop = false;
        audioLayer.muted = false;

        layerMap.set(trackIndex, audioLayer);
      }
    }

    for (const [trackIndex, audioLayer] of layerMap.entries()) {
      if (!visibleTrackIndexSet.has(trackIndex)) {
        audioLayer.pause();
        audioLayer.removeAttribute('src');
        audioLayer.load();
        layerMap.delete(trackIndex);
      }
    }

    syncAudioLayers('selection-change').catch(() => {});

    return () => {
      for (const audioLayer of layerMap.values()) {
        audioLayer.pause();
        audioLayer.removeAttribute('src');
        audioLayer.load();
      }

      layerMap.clear();
    };
  }, [syncAudioLayers, videoUrl, visibleAudioTracks]);

  useEffect(() => {
    syncAudioLayers('selection-change').catch(() => {});
  }, [selectedAudioTrackIndices, syncAudioLayers]);

  useEffect(() => {
    const videoElement = videoRef.current;

    if (!videoElement) {
      return;
    }

    const targetTime = playbackSeekRequest.time;

    if (Math.abs(videoElement.currentTime - targetTime) <= 0.01) {
      return;
    }

    videoElement.currentTime = targetTime;

    for (const audioLayer of audioLayerMapReference.current.values()) {
      if (Math.abs(audioLayer.currentTime - targetTime) > 0.01) {
        audioLayer.currentTime = targetTime;
      }

      audioLayer.playbackRate = videoElement.playbackRate;
    }
  }, [playbackSeekRequest, videoRef]);

  useEffect(() => {
    if (!isPlaying) {
      for (const audioLayer of audioLayerMapReference.current.values()) {
        audioLayer.pause();
      }
    }
  }, [isPlaying]);

  const togglePlayback = async () => {
    const videoElement = videoRef.current;

    if (!videoElement) {
      return;
    }

    if (videoElement.paused) {
      await videoElement.play();

      return;
    }

    videoElement.pause();

    for (const audioLayer of audioLayerMapReference.current.values()) {
      audioLayer.pause();
    }
  };

  const handleFrameToggle = () => {
    togglePlayback().catch(() => {});
    revealOverlayIndicator();
  };

  return (
    <section className={playbackSection}>
      <div
        className={videoFrame}
        role={sourcePath ? 'button' : undefined}
        tabIndex={sourcePath ? 0 : undefined}
        onClick={() => {
          if (!sourcePath) {
            return;
          }

          handleFrameToggle();
        }}
        onKeyDown={(event) => {
          if (!sourcePath) {
            return;
          }

          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            handleFrameToggle();
          }
        }}
        onMouseMove={() => {
          if (!sourcePath) {
            return;
          }

          revealOverlayIndicator();
        }}
        aria-label={sourcePath ? (isPlaying ? 'Pause playback' : 'Play playback') : undefined}
      >
        {sourcePath
          ? (
            <>
              <video
                ref={videoRef}
                className={`${video} ${useCoverFit ? videoFitCover : videoFitContain}`}
                controls={false}
                src={videoUrl}
                key={videoUrl}
                onLoadedMetadata={(event: SyntheticEvent<HTMLVideoElement>) => {
                  const mediaElement = event.currentTarget;

                  setDuration(Number(mediaElement.duration) || 0);
                  setCurrentTime(0);
                  setIsPlaying(false);
                  syncAudioLayers('loaded-metadata').catch(() => {});
                }}
                onTimeUpdate={(event: SyntheticEvent<HTMLVideoElement>) => {
                  const mediaElement = event.currentTarget;

                  setCurrentTime(mediaElement.currentTime);
                }}
                onPlay={() => {
                  syncAudioLayers('sync-play').catch(() => {});
                  setIsPlaying(true);
                  revealOverlayIndicator();
                }}
                onSeeking={(event: SyntheticEvent<HTMLVideoElement>) => {
                  const mediaElement = event.currentTarget;

                  setCurrentTime(mediaElement.currentTime);
                }}
                onSeeked={(event: SyntheticEvent<HTMLVideoElement>) => {
                  const mediaElement = event.currentTarget;

                  setCurrentTime(mediaElement.currentTime);
                }}
                onPause={() => {
                  const mediaElement = videoRef.current;

                  if (mediaElement) {
                    setCurrentTime(mediaElement.currentTime);
                  }

                  for (const audioLayer of audioLayerMapReference.current.values()) {
                    audioLayer.pause();
                  }
                  setIsPlaying(false);
                  revealOverlayIndicator();
                }}
              >
                <track kind="captions" />
              </video>

              <div
                className={`${overlayPlayButton} ${showOverlayControl ? overlayPlayButtonVisible : ''}`}
                aria-hidden="true"
              >
                {isPlaying
                  ? <Pause size={16} strokeWidth={2} />
                  : <Play size={16} strokeWidth={2} />}
              </div>

              <button
                type="button"
                className={`${videoFitToggleButton} ${showOverlayControl ? videoFitToggleButtonVisible : ''}`}
                onClick={(event) => {
                  event.stopPropagation();
                  setUseCoverFit((previous) => !previous);
                  revealOverlayIndicator();
                }}
                onKeyDown={(event) => {
                  event.stopPropagation();
                }}
                aria-label={useCoverFit ? 'Switch video fit to contain' : 'Switch video fit to cover'}
              >
                  <Expand
                    size={15}
                    strokeWidth={2}
                    className={`${videoFitToggleIcon} ${useCoverFit ? videoFitToggleIconActive : ''}`}
                  />
              </button>
            </>
          )
          : (
            <div className={emptyVideo}>Select source video.</div>
          )}
      </div>
    </section>
  );
};
