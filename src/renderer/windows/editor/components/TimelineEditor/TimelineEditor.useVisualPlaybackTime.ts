type UseVisualPlaybackTimeParams = {
  currentTime: number;
  isPlaying: boolean;
  videoElementRef: {
    current: HTMLVideoElement | null;
  };
};

export const useVisualPlaybackTime = ({
  currentTime,
}: UseVisualPlaybackTimeParams): number => currentTime;
