export type BinaryResolutionMode = 'auto' | 'bundled' | 'local';

let ffmpegResolutionMode: BinaryResolutionMode = 'auto';
let ffprobeResolutionMode: BinaryResolutionMode = 'auto';

export const getFfmpegResolutionMode = (): BinaryResolutionMode => ffmpegResolutionMode;

export const setFfmpegResolutionMode = (mode: BinaryResolutionMode): void => {
  ffmpegResolutionMode = mode;
};

export const getFfprobeResolutionMode = (): BinaryResolutionMode => ffprobeResolutionMode;

export const setFfprobeResolutionMode = (mode: BinaryResolutionMode): void => {
  ffprobeResolutionMode = mode;
};
