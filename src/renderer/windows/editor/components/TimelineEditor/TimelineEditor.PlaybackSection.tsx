import {
  type SyntheticEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
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
  videoFrame,
} from './TimelineEditor.css';

export const TimelineEditorPlaybackSection = () => {
  const state = useClippingState();
  const {
    currentTime,
    isPlaying,
    setDuration,
    setCurrentTime,
    setIsPlaying,
    sourcePath,
    videoRef,
    videoUrl,
  } = state;
  const [showOverlayControl, setShowOverlayControl] = useState(true);
  const hideTimerReference = useRef<ReturnType<typeof globalThis.setTimeout> | null>(null);

  const scheduleOverlayHide = useCallback(() => {
    if (hideTimerReference.current) {
      globalThis.clearTimeout(hideTimerReference.current);
    }

    if (!isPlaying) {
      return;
    }

    hideTimerReference.current = globalThis.setTimeout(() => {
      setShowOverlayControl(false);
    }, 1800);
  }, [isPlaying]);

  useEffect(() => {
    scheduleOverlayHide();

    return () => {
      if (hideTimerReference.current) {
        globalThis.clearTimeout(hideTimerReference.current);
      }
    };
  }, [scheduleOverlayHide, sourcePath]);

  useEffect(() => {
    const media = videoRef.current;

    if (!media) {
      return;
    }

    if (Math.abs(media.currentTime - currentTime) > 0.05) {
      media.currentTime = currentTime;
    }
  }, [currentTime, videoRef]);

  const togglePlayback = async () => {
    const media = videoRef.current;

    if (!media) {
      return;
    }

    if (media.paused) {
      await media.play();

      return;
    }

    media.pause();
  };

  const overlayVisible = !isPlaying || showOverlayControl;

  return (
    <section className={playbackSection}>
      <div
        className={videoFrame}
        onMouseMove={() => {
          setShowOverlayControl(true);
          scheduleOverlayHide();
        }}
        onPointerDown={() => {
          setShowOverlayControl(true);
          scheduleOverlayHide();
        }}
      >
        {sourcePath
          ? (
          <>
            <video
              ref={videoRef}
              className={video}
              controls={false}
              src={videoUrl}
              key={videoUrl}
              onLoadedMetadata={(event: SyntheticEvent<HTMLVideoElement>) => {
                setDuration(Number(event.currentTarget.duration) || 0);
                setCurrentTime(0);
                setIsPlaying(false);
              }}
              onTimeUpdate={(event: SyntheticEvent<HTMLVideoElement>) => {
                setCurrentTime(event.currentTarget.currentTime);
              }}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            >
              <track kind="captions" />
            </video>

            <button
              type="button"
              className={`${overlayPlayButton} ${overlayVisible ? overlayPlayButtonVisible : ''}`}
              aria-label={isPlaying ? 'Pause playback' : 'Play playback'}
              onClick={() => {
                togglePlayback();
                setShowOverlayControl(true);
                scheduleOverlayHide();
              }}
            >
              {isPlaying ? <Pause size={16} strokeWidth={2} /> : <Play size={16} strokeWidth={2} />}
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
