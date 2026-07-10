import { ipcMain } from 'electron';
import type { GetSourceAudioTrackWaveformPayload } from '../../../shared/contracts.ts';
import { assertTrustedSender } from '../assertTrustedSender.ts';

const registerGetSourceAudioTrackWaveformHandler = (): void => {
  ipcMain.handle('cutrail:get-source-audio-track-waveform', async (event, payload) => {
    assertTrustedSender(event);
    const nextPayload: GetSourceAudioTrackWaveformPayload = typeof payload === 'object' && payload !== null
      ? payload as GetSourceAudioTrackWaveformPayload
      : {};
    const sourcePath = typeof nextPayload.sourcePath === 'string'
      ? nextPayload.sourcePath
      : '';
    const trackIndex = typeof nextPayload.trackIndex === 'number'
      && Number.isInteger(nextPayload.trackIndex)
      && nextPayload.trackIndex >= 0
      ? nextPayload.trackIndex
      : null;

    if (sourcePath.length === 0 || trackIndex === null) {
      return {
        sourcePath,
        trackIndex: trackIndex ?? -1,
        waveformDataUrl: null,
      };
    }

    try {
      const { readSourceAudioTrackWaveformDataUrl } = await import('../../../infra/ffmpeg/readSourceAudioTracks.ts');
      const waveformDataUrl = await readSourceAudioTrackWaveformDataUrl(sourcePath, trackIndex);

      return {
        sourcePath,
        trackIndex,
        waveformDataUrl,
      };
    } catch {
      return {
        sourcePath,
        trackIndex,
        waveformDataUrl: null,
      };
    }
  });
};

export {
  registerGetSourceAudioTrackWaveformHandler,
};
