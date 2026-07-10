import {
  useEffect,
  useState,
} from 'react';

type UseVisualPlaybackTimeParams = {
  currentTime: number;
  isPlaying: boolean;
  videoElementRef: {
    current: HTMLVideoElement | null;
  };
};

export const useVisualPlaybackTime = ({
  currentTime,
  isPlaying,
  videoElementRef,
}: UseVisualPlaybackTimeParams): number => {
  const [visualCurrentTime, setVisualCurrentTime] = useState(currentTime);

  useEffect(() => {
    let frameHandle: number | null = null;

    const cancelFrame = () => {
      if (frameHandle !== null) {
        globalThis.cancelAnimationFrame(frameHandle);
        frameHandle = null;
      }
    };

    if (!isPlaying) {
      setVisualCurrentTime(currentTime);

      return cancelFrame;
    }

    const tick = () => {
      const mediaElement = videoElementRef.current;

      if (!mediaElement || mediaElement.paused) {
        frameHandle = null;

        return;
      }

      setVisualCurrentTime(mediaElement.currentTime);
      frameHandle = globalThis.requestAnimationFrame(tick);
    };

    frameHandle = globalThis.requestAnimationFrame(tick);

    return cancelFrame;
  }, [currentTime, isPlaying, videoElementRef]);

  return visualCurrentTime;
};
