import {
  type DragEvent,
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
  controlBar,
  controls,
  frame,
  progressFill,
  progressText,
  progressTextFill,
  progressTextFillInner,
  progressTextInner,
  scrubber,
  playButton,
  root,
  seek,
  video,
} from './VideoPreview.css';

type VideoPreviewProps = {
  cacheKey?: number;
  frameClassName?: string;
  frameDraggable?: boolean;
  filePath: string;
  onFrameDragStart?: (event: DragEvent<HTMLDivElement>) => void;
  title: string;
};

const withCacheKey = (url: string, cacheKey?: number): string => {
  if (url.length === 0 || typeof cacheKey !== 'number' || !Number.isFinite(cacheKey)) {
    return url;
  }

  const separator = url.includes('?') ? '&' : '?';

  return `${url}${separator}v=${encodeURIComponent(String(cacheKey))}`;
};

const formatSeconds = (value: number): string => `${Math.max(0, value).toFixed(1)}s`;

export const VideoPreview = ({
  cacheKey,
  frameClassName,
  frameDraggable = false,
  filePath,
  onFrameDragStart,
  title,
}: VideoPreviewProps) => {
  const playbackUrl = useMemo(
    () => withCacheKey(normalizeVideoPath(filePath), cacheKey),
    [cacheKey, filePath],
  );
  const videoReference = useRef<HTMLVideoElement | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const safeDuration = Math.max(0, duration);
  const safeCurrentTime = Math.max(0, Math.min(currentTime, safeDuration));
  const progressPercent = safeDuration > 0 ? (safeCurrentTime / safeDuration) * 100 : 0;
  const timeLabel = `${formatSeconds(safeCurrentTime)} / ${formatSeconds(safeDuration)}`;

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

  return (
    <section className={root}>
      <div
        className={frameClassName ? `${frame} ${frameClassName}` : frame}
        draggable={frameDraggable}
        onDragStart={onFrameDragStart}
      >
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

      <div className={controls}>
        <Button
          type="button"
          variant="secondary"
          className={playButton}
          onClick={() => {
            const media = videoReference.current;

            if (!media) {
              return;
            }

            if (media.paused) {
              media.play();
              return;
            }

            media.pause();
          }}
        >
          {isPlaying
            ? <Pause size={14} strokeWidth={2.25} />
            : <Play size={14} strokeWidth={2.25} />}
        </Button>
        <div className={controlBar}>
          <div className={scrubber}>
            <div
              aria-hidden="true"
              className={progressFill}
              style={{ inlineSize: `${progressPercent}%` }}
            />
            <div aria-hidden="true" className={progressText}>
              <span className={progressTextInner}>{timeLabel}</span>
            </div>
            <div
              aria-hidden="true"
              className={progressTextFill}
              style={{ clipPath: `inset(0 ${100 - progressPercent}% 0 0)` }}
            >
              <span className={progressTextFillInner}>{timeLabel}</span>
            </div>
            <input
              aria-label={`Seek clip preview ${title}`}
              className={seek}
              max={safeDuration}
              min={0}
              step={0.1}
              type="range"
              value={safeCurrentTime}
              onChange={(event) => {
                const media = videoReference.current;
                const nextTime = Number(event.currentTarget.value);

                if (!media) {
                  return;
                }

                media.currentTime = nextTime;
                setCurrentTime(nextTime);
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
};
