import {
  type DragEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Check,
  Copy,
  FolderOpen,
  Pause,
  Play,
  ClipboardCopy,
} from 'lucide-react';
import { Button } from '@renderer/components/Button';
import { normalizeVideoPath } from '@renderer/core/clipping';
import {
  actionButton,
  actionsRow,
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

type GeneratedClipPreviewProps = {
  filePath: string;
  title: string;
};

type ClipActionResult = {
  ok: boolean;
  method: string;
  error?: string;
};

const formatSeconds = (value: number) => `${Math.max(0, value).toFixed(1)}s`;

export const TimelineEditorGeneratedClipPreview = ({
  filePath,
  title,
}: GeneratedClipPreviewProps) => {
  const playbackUrl = useMemo(() => normalizeVideoPath(filePath), [filePath]);
  const videoReference = useRef<HTMLVideoElement | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [confirmedAction, setConfirmedAction] = useState<'file' | 'path' | 'reveal' | null>(null);
  const [failedAction, setFailedAction] = useState<'file' | 'path' | 'reveal' | null>(null);
  const [failureMessage, setFailureMessage] = useState<string | null>(null);
  const confirmTimerReference = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (confirmTimerReference.current) {
      clearTimeout(confirmTimerReference.current);
    }
  }, []);

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

  const seekTo = useCallback((nextTime: number) => {
    const media = videoReference.current;

    if (!media) {
      return;
    }

    media.currentTime = nextTime;
    setCurrentTime(nextTime);
  }, []);

  const runClipAction = useCallback(async (
    kind: 'file' | 'path' | 'reveal',
    action: ((clipPath: string) => Promise<ClipActionResult>) | undefined,
  ) => {
    if (!action) {
      setConfirmedAction(null);
      setFailedAction(kind);
      setFailureMessage('action-unavailable');

      return;
    }

    const result = await action(filePath).catch<ClipActionResult>(() => ({
      ok: false,
      method: 'none',
      error: 'action-request-failed',
    }));

    const isSuccessful = result.ok;

    setConfirmedAction(isSuccessful ? kind : null);
    setFailedAction(isSuccessful ? null : kind);
    setFailureMessage(isSuccessful ? null : (result.error ?? 'action-failed'));

    if (confirmTimerReference.current) {
      clearTimeout(confirmTimerReference.current);
    }

    confirmTimerReference.current = setTimeout(() => {
      setConfirmedAction(null);
      setFailedAction(null);
    }, 1500);
  }, [filePath]);

  const startDragFromPreview = useCallback((event: DragEvent<HTMLDivElement>) => {
    if (typeof filePath !== 'string' || filePath.length === 0) {
      return;
    }

    event.preventDefault();

    void globalThis.window.cutrail?.startFileDrag?.({
      filePath,
    });
  }, [filePath]);

  const fillRatio = duration > 0 ? Math.max(0, Math.min(currentTime, duration)) / duration : 0;

  return (
    <section className={preview}>
      <div
        className={frame}
        draggable
        onDragStart={startDragFromPreview}
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

      <div className={actionsRow}>
        <Button
          type="button"
          variant="secondary"
          className={actionButton}
          title={failedAction === 'file' ? (failureMessage ?? 'Copy file failed') : undefined}
          onClick={() => {
            void runClipAction('file', globalThis.window.cutrail?.copyClipFile);
          }}
        >
          {confirmedAction === 'file' ? <Check size={13} strokeWidth={2.25} /> : <Copy size={13} strokeWidth={2.25} />}
          {confirmedAction === 'file' ? 'Copied' : (failedAction === 'file' ? 'Failed' : 'Copy file')}
        </Button>
        <Button
          type="button"
          variant="secondary"
          className={actionButton}
          title={failedAction === 'path' ? (failureMessage ?? 'Copy path failed') : undefined}
          onClick={() => {
            void runClipAction('path', globalThis.window.cutrail?.copyClipPath);
          }}
        >
          {confirmedAction === 'path' ? <Check size={13} strokeWidth={2.25} /> : <ClipboardCopy size={13} strokeWidth={2.25} />}
          {confirmedAction === 'path' ? 'Copied' : (failedAction === 'path' ? 'Failed' : 'Copy path')}
        </Button>
        <Button
          type="button"
          variant="secondary"
          className={actionButton}
          title={failedAction === 'reveal' ? (failureMessage ?? 'Reveal failed') : undefined}
          onClick={() => {
            void runClipAction('reveal', globalThis.window.cutrail?.revealClip);
          }}
        >
          {confirmedAction === 'reveal' ? <Check size={13} strokeWidth={2.25} /> : <FolderOpen size={13} strokeWidth={2.25} />}
          {confirmedAction === 'reveal' ? 'Opened' : (failedAction === 'reveal' ? 'Failed' : 'Reveal')}
        </Button>
      </div>
    </section>
  );
};
