import { useEffect } from 'react';
import { useClippingContext } from '@renderer/core/clipping';

const isEditableTarget = (target) => {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  return target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);
};

export const EditorWindowKeyboardShortcuts = () => {
  const {
    currentTime, duration, pausePlayback, setPlaybackTime, sourcePath, videoRef,
  } = useClippingContext();

  useEffect(() => {
    const seekStepSeconds = 1;
    const seekStepPreciseSeconds = 0.1;

    const onKeyDown = (event) => {
      if (isEditableTarget(event.target)) {
        return;
      }

      const key = typeof event.key === 'string' ? event.key.toLowerCase() : '';

      if (event.code === 'Space') {
        if (event.repeat) {
          return;
        }

        event.preventDefault();

        const media = videoRef.current;

        if (!media || sourcePath.length === 0) {
          return;
        }

        if (media.paused) {
          void media.play();

          return;
        }

        pausePlayback();

        return;
      }

      if (sourcePath.length === 0 || duration <= 0) {
        return;
      }

      if (event.code === 'ArrowLeft' || key === 'h') {
        event.preventDefault();
        const step = event.shiftKey ? seekStepPreciseSeconds : seekStepSeconds;
        setPlaybackTime(Math.max(0, currentTime - step));

        return;
      }

      if (event.code === 'ArrowRight' || key === 'l') {
        event.preventDefault();
        const step = event.shiftKey ? seekStepPreciseSeconds : seekStepSeconds;
        setPlaybackTime(Math.min(duration, currentTime + step));
      }
    };

    globalThis.addEventListener('keydown', onKeyDown);

    return () => {
      globalThis.removeEventListener('keydown', onKeyDown);
    };
  }, [currentTime, duration, pausePlayback, setPlaybackTime, sourcePath, videoRef]);

  return null;
};
