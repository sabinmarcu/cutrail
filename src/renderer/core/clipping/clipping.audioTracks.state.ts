import {
  atom,
  useAtom,
  useSetAtom,
  useStore,
} from 'jotai';
import { atomFamily } from 'jotai/utils';

export const mutedAudioTrackIndicesAtom = atom<number[]>([]);
export const audioTrackWaveformsByIndexAtom = atom<Record<number, string | null | undefined>>({});

export const audioTrackMutedAtomFamily = atomFamily((trackIndex: number) => atom(
  (get) => get(mutedAudioTrackIndicesAtom).includes(trackIndex),
  (get, set, nextMutedValue: boolean | ((previous: boolean) => boolean)) => {
    const previousMutedIndices = get(mutedAudioTrackIndicesAtom);
    const previousMutedValue = previousMutedIndices.includes(trackIndex);
    const resolvedMutedValue = typeof nextMutedValue === 'function'
      ? nextMutedValue(previousMutedValue)
      : nextMutedValue;
    const nextMutedIndices = resolvedMutedValue
      ? [...previousMutedIndices.filter((value) => value !== trackIndex), trackIndex]
        .sort((left, right) => left - right)
      : previousMutedIndices.filter((value) => value !== trackIndex);

    set(mutedAudioTrackIndicesAtom, nextMutedIndices);
  },
));

export const audioTrackWaveformAtomFamily = atomFamily((trackIndex: number) => atom(
  (get) => get(audioTrackWaveformsByIndexAtom)[trackIndex],
  (
    get,
    set,
    nextWaveformValue:
      | string
      | null
      | undefined
      | ((previous: string | null | undefined) => string | null | undefined),
  ) => {
    const previousWaveforms = get(audioTrackWaveformsByIndexAtom);
    const previousWaveformValue = previousWaveforms[trackIndex];
    const resolvedWaveformValue = typeof nextWaveformValue === 'function'
      ? nextWaveformValue(previousWaveformValue)
      : nextWaveformValue;

    set(audioTrackWaveformsByIndexAtom, {
      ...previousWaveforms,
      [trackIndex]: resolvedWaveformValue,
    });
  },
));

export const useAudioTrackWaveformsMap = () => useAtom(audioTrackWaveformsByIndexAtom);
export const useSetAudioTrackWaveformsMap = () => useSetAtom(audioTrackWaveformsByIndexAtom);
export const useAudioTrackStore = () => useStore();
