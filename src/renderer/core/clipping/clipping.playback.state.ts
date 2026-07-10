import { atom } from 'jotai';
import type { PlaybackSeekRequest } from './clipping.types';

export const playbackSeekRequestAtom = atom<PlaybackSeekRequest>({
  revision: 0,
  time: 0,
});
