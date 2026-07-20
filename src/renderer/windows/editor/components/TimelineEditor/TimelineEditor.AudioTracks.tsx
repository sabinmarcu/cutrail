import {
  type PointerEvent as ReactPointerEvent,
  useEffect,
  useRef,
} from 'react';
import { Button } from '@renderer/components/Button';
import {
  clamp,
  useClippingActions,
  useClippingState,
} from '@renderer/core/clipping';
import {
  audioTrackWaveformAtomFamily,
  useAudioTrackStore,
  useAudioTrackWaveformsMap,
  useSetAudioTrackWaveformsMap,
} from '@renderer/core/clipping/clipping.audioTracks.state';
import {
  audioTrackLabel,
  audioTrackList,
  audioTrackMeta,
  audioTrackRow,
  audioTracksHeader,
  audioTracksHeading,
  audioTracksHint,
  waveformClipRange,
  waveformClipRangeSelected,
  audioTracksSection,
  muteButton,
  mutedWaveform,
  waveformFallback,
  waveformFrame,
  waveformImage,
  waveformPlayhead,
} from './TimelineEditor.AudioTracks.css';
import { useVisualPlaybackTime } from './TimelineEditor.useVisualPlaybackTime';

const wait = (milliseconds: number): Promise<void> => new Promise((resolve) => {
  globalThis.setTimeout(resolve, milliseconds);
});

const loadTrackWaveformWithRetry = async (
  bridge: NonNullable<typeof globalThis.cutrail>,
  sourcePath: string,
  trackIndex: number,
): Promise<string | null> => {
  const retryDelays = [0, 250, 750];

  for (const retryDelay of retryDelays) {
    if (retryDelay > 0) {
      await wait(retryDelay);
    }

    try {
      const payload = await bridge.getSourceAudioTrackWaveform({
        sourcePath,
        trackIndex,
      });

      if (payload.sourcePath === sourcePath && payload.trackIndex === trackIndex) {
        return payload.waveformDataUrl;
      }
    } catch {
      // Try again on the next retry delay.
    }
  }

  return null;
};

export const TimelineEditorAudioTracks = () => {
  const state = useClippingState();
  const {
    clipEntries,
    currentTime,
    duration,
    hasMultipleAudioTracks,
    isPlaying,
    mutedAudioTrackIndices,
    selectedVariantIsEditable,
    selectedRangeId,
    sourcePath,
    videoRef,
    visibleAudioTracks,
  } = state;
  const {
    setPlaybackTime,
    toggleAudioTrackMuted,
  } = useClippingActions(state);
  const [waveformsByTrackIndex] = useAudioTrackWaveformsMap();
  const store = useAudioTrackStore();
  const setWaveformMap = useSetAudioTrackWaveformsMap();
  const isSeekingReference = useRef(false);
  const visualCurrentTime = useVisualPlaybackTime({
    currentTime,
    isPlaying,
    videoElementRef: videoRef,
  });

  const setPlaybackFromClientX = (
    clientX: number,
    element: HTMLDivElement,
  ) => {
    if (duration <= 0) {
      return;
    }

    const rect = element.getBoundingClientRect();

    if (rect.width <= 0) {
      return;
    }

    const ratio = clamp((clientX - rect.left) / rect.width, 0, 1);
    setPlaybackTime(ratio * duration);
  };

  useEffect(() => {
    let cancelled = false;

    if (!hasMultipleAudioTracks || sourcePath.length === 0) {
      setWaveformMap({});

      return () => {
        cancelled = true;
      };
    }

    setWaveformMap({});

    const loadWaveforms = async () => {
      const bridge = globalThis.cutrail;

      if (typeof bridge?.getSourceAudioTrackWaveform !== 'function') {
        return;
      }

      setWaveformMap(
        Object.fromEntries(visibleAudioTracks.map((track) => [track.trackIndex, undefined])),
      );

      await Promise.all(visibleAudioTracks.map(async (track) => {
        const waveformDataUrl = await loadTrackWaveformWithRetry(
          bridge,
          sourcePath,
          track.trackIndex,
        );

        if (cancelled) {
          return;
        }

        store.set(audioTrackWaveformAtomFamily(track.trackIndex), waveformDataUrl);
      }));
    };

    loadWaveforms();

    return () => {
      cancelled = true;
    };
  }, [
    hasMultipleAudioTracks,
    setWaveformMap,
    sourcePath,
    store,
    visibleAudioTracks,
  ]);

  if (!hasMultipleAudioTracks) {
    return null;
  }

  const playheadPercent = duration > 0 ? (visualCurrentTime / duration) * 100 : 0;

  return (
    <section className={audioTracksSection}>
      <div className={audioTracksHeader}>
        <h3 className={audioTracksHeading}>Audio Tracks</h3>
        <p className={audioTracksHint}>Only active tracks are exported with each clip.</p>
      </div>

      <div className={audioTrackList}>
        {visibleAudioTracks.map((track) => {
          const isMuted = mutedAudioTrackIndices.includes(track.trackIndex);
          const waveformDataUrl = waveformsByTrackIndex[track.trackIndex];

          return (
            <div key={`${track.streamIndex}:${track.trackIndex}`} className={audioTrackRow}>
              <div className={audioTrackMeta}>
                <span className={audioTrackLabel}>{track.label}</span>
                <Button
                  type="button"
                  variant={isMuted ? 'danger' : 'secondary'}
                  className={muteButton}
                  aria-pressed={isMuted}
                  disabled={!selectedVariantIsEditable}
                  onClick={() => {
                    toggleAudioTrackMuted(track.trackIndex);
                  }}
                >
                  {isMuted ? 'Muted' : 'Active'}
                </Button>
              </div>

              <div
                className={waveformFrame}
                onPointerDown={(event: ReactPointerEvent<HTMLDivElement>) => {
                  isSeekingReference.current = true;
                  event.currentTarget.setPointerCapture(event.pointerId);
                  setPlaybackFromClientX(event.clientX, event.currentTarget);
                }}
                onPointerMove={(event: ReactPointerEvent<HTMLDivElement>) => {
                  if (!isSeekingReference.current) {
                    return;
                  }

                  setPlaybackFromClientX(event.clientX, event.currentTarget);
                }}
                onPointerUp={(event: ReactPointerEvent<HTMLDivElement>) => {
                  isSeekingReference.current = false;
                  event.currentTarget.releasePointerCapture(event.pointerId);
                }}
                onPointerCancel={(event: ReactPointerEvent<HTMLDivElement>) => {
                  isSeekingReference.current = false;
                  event.currentTarget.releasePointerCapture(event.pointerId);
                }}
              >
                {typeof waveformDataUrl === 'string'
                  ? (
                    <img
                      alt=""
                      aria-hidden="true"
                      className={`${waveformImage} ${isMuted ? mutedWaveform : ''}`}
                      draggable={false}
                      src={waveformDataUrl}
                    />
                  )
                  : (waveformDataUrl === null
                    ? <div className={waveformFallback}>Waveform unavailable</div>
                    : <div className={waveformFallback}>Loading waveform...</div>)}

                {clipEntries.map((clipEntry) => {
                  const left = duration > 0 ? (clipEntry.range.start / duration) * 100 : 0;
                  const width = duration > 0
                    ? ((clipEntry.range.end - clipEntry.range.start) / duration) * 100
                    : 0;

                  return (
                    <span
                      key={`${track.trackIndex}:${clipEntry.range.id}`}
                      aria-hidden="true"
                      className={
                        selectedRangeId === clipEntry.range.id
                          ? `${waveformClipRange} ${waveformClipRangeSelected}`
                          : waveformClipRange
                      }
                      style={{
                        insetInlineStart: `${left}%`,
                        inlineSize: `${Math.max(width, 0.5)}%`,
                      }}
                    />
                  );
                })}

                <span className={waveformPlayhead} style={{ insetInlineStart: `${playheadPercent}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
