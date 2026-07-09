import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Pause,
  Play,
} from 'lucide-react';
import { Button } from '@renderer/components/Button';
import { normalizeVideoPath } from '@renderer/core/clipping';
import {
  controlButton,
  frame,
  preview,
  progressFill,
  progressInput,
  progressRail,
  progressShell,
  mediaRow,
  progressTimeEmpty,
  progressTimeFilled,
  progressTime,
  video,
} from './TimelineEditor.GeneratedClipPreview.css';

const formatSeconds = (value) => `${Math.max(0, value).toFixed(1)}s`;

export const TimelineEditorGeneratedClipPreview = ({
  filePath,
  title,
}) => {
  const playbackUrl = useMemo(() => normalizeVideoPath(filePath), [filePath]);
  const videoReference = useRef(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    setCurrentTime(0);
    setDuration(0);
    setIsPlaying(false);

    const media = videoReference.current;

    if (media) {
      media.pause();
      media.load();
    }
  }, [playbackUrl]);

  const togglePlayback = useCallback(async () => {
    const media = videoReference.current;

    if (!media) {
      return;
    }

    if (media.paused) {
      await media.play();
      return;
    }

    media.pause();
  }, []);

  const seekTo = useCallback((nextTime) => {
    const media = videoReference.current;

    if (!media) {
      return;
    }

    media.currentTime = nextTime;
    setCurrentTime(nextTime);
  }, []);

  const fillRatio = duration > 0 ? Math.max(0, Math.min(currentTime, duration)) / duration : 0;

  return (
    <section className={preview}>
      <div className={frame}>
        <video
          ref={videoReference}
          className={video}
          controls={false}
          key={playbackUrl}
          preload="metadata"
          src={playbackUrl}
          onLoadedMetadata={(event) => {
            setDuration(Number(event.currentTarget.duration) || 0);
            setCurrentTime(0);
          }}
          onPause={() => setIsPlaying(false)}
          onPlay={() => setIsPlaying(true)}
          onTimeUpdate={(event) => {
            setCurrentTime(event.currentTarget.currentTime);
          }}
        >
          <track kind="captions" />
        </video>
      </div>

      <div className={mediaRow}>
        <Button
          type="button"
          variant="secondary"
          className={controlButton}
          onClick={() => {
            void togglePlayback();
          }}
        >
          {isPlaying ? <Pause size={14} strokeWidth={2.25} /> : <Play size={14} strokeWidth={2.25} />}
        </Button>
        <div className={progressShell}>
          <div className={progressRail}>
            <div
              className={progressFill}
              style={{
                inlineSize: `${fillRatio * 100}%`,
              }}
            />
          </div>
          <input
            aria-label={`Seek generated clip ${title}`}
            className={progressInput}
            max={Math.max(0, duration)}
            min={0}
            step={0.1}
            type="range"
            value={Math.max(0, Math.min(currentTime, duration))}
            onChange={(event) => {
              seekTo(Number(event.currentTarget.value));
            }}
          />
          <div
            className={progressTimeFilled}
            style={{
              clipPath: `inset(0 ${Math.max(0, 100 - (fillRatio * 100))}% 0 0)`,
            }}
          >
            <span className={progressTime}>
              {formatSeconds(currentTime)} / {formatSeconds(duration)}
            </span>
          </div>
          <div className={progressTimeEmpty}>
            <span className={progressTime}>
              {formatSeconds(currentTime)} / {formatSeconds(duration)}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
