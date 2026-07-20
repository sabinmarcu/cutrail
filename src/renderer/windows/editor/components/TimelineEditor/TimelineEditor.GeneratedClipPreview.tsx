import {
  type DragEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  Check,
  Copy,
  FolderOpen,
  ClipboardCopy,
} from 'lucide-react';
import { Button } from '@renderer/components/Button';
import { VideoPreview } from '@renderer/components/VideoPreview';
import {
  actionButton,
  actionsRow,
  frame,
  preview,
} from './TimelineEditor.GeneratedClipPreview.css';

type GeneratedClipPreviewProps = {
  filePath: string;
  modifiedAtMs?: number;
  title: string;
};

type ClipActionResult = {
  ok: boolean;
  method: string;
  error?: string;
};

export const TimelineEditorGeneratedClipPreview = ({
  filePath,
  modifiedAtMs,
  title,
}: GeneratedClipPreviewProps) => {
  const [confirmedAction, setConfirmedAction] = useState<'file' | 'path' | 'reveal' | null>(null);
  const [failedAction, setFailedAction] = useState<'file' | 'path' | 'reveal' | null>(null);
  const [failureMessage, setFailureMessage] = useState<string | null>(null);
  const confirmTimerReference = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (confirmTimerReference.current) {
      clearTimeout(confirmTimerReference.current);
    }
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

    globalThis.window.cutrail?.startFileDrag?.({
      filePath,
    });
  }, [filePath]);

  return (
    <section className={preview}>
      <VideoPreview
        filePath={filePath}
        title={title}
        cacheKey={modifiedAtMs}
        frameClassName={frame}
        frameDraggable
        onFrameDragStart={startDragFromPreview}
      />

      <div className={actionsRow}>
        <Button
          type="button"
          variant="secondary"
          className={actionButton}
          title={failedAction === 'file' ? (failureMessage ?? 'Copy file failed') : undefined}
          onClick={() => {
            runClipAction('file', globalThis.window.cutrail?.copyClipFile);
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
            runClipAction('path', globalThis.window.cutrail?.copyClipPath);
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
            runClipAction('reveal', globalThis.window.cutrail?.revealClip);
          }}
        >
          {confirmedAction === 'reveal' ? <Check size={13} strokeWidth={2.25} /> : <FolderOpen size={13} strokeWidth={2.25} />}
          {confirmedAction === 'reveal' ? 'Opened' : (failedAction === 'reveal' ? 'Failed' : 'Reveal')}
        </Button>
      </div>
    </section>
  );
};
