import {
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
  controls,
  frame,
  root,
  seek,
  time,
  video,
} from './VideoPreview.css';

type VideoPreviewProps = {
  filePath: string;
  title: string;
};

const formatSeconds = (value: number): string => `${Math.max(0, value).toFixed(1)}s`;

export const VideoPreview = ({
  filePath,
  title,
}: VideoPreviewProps) => {
  const playbackUrl = useMemo(() => normalizeVideoPath(filePath), [filePath]);
  const videoReference = useRef<HTMLVideoElement | null>(null);
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

  return (
    <section className={root}>
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

      <div className={controls}>
        <Button
          type="button"
          variant="secondary"
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
        <input
          aria-label={`Seek clip preview ${title}`}
          className={seek}
          max={Math.max(0, duration)}
          min={0}
          step={0.1}
          type="range"
          value={Math.max(0, Math.min(currentTime, duration))}
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
      <p className={time}>{formatSeconds(currentTime)} / {formatSeconds(duration)}</p>
    </section>
  );
};
