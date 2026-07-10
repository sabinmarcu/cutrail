import { ipcMain } from 'electron';
import type { GetSourceAudioTracksPayload } from '../../../shared/contracts.ts';
import { assertTrustedSender } from '../assertTrustedSender.ts';

const registerGetSourceAudioTracksHandler = (): void => {
  ipcMain.handle('cutrail:get-source-audio-tracks', async (event, payload) => {
    assertTrustedSender(event);
    const nextPayload: GetSourceAudioTracksPayload = typeof payload === 'object' && payload !== null
      ? payload as GetSourceAudioTracksPayload
      : {};
    const sourcePath = typeof nextPayload.sourcePath === 'string' ? nextPayload.sourcePath : '';

    if (sourcePath.length === 0) {
      return {
        sourcePath,
        tracks: [],
      };
    }

    try {
      const { readSourceAudioTracks } = await import('../../../infra/ffmpeg/readSourceAudioTracks.ts');
      const tracks = await readSourceAudioTracks(sourcePath);

      return {
        sourcePath,
        tracks,
      };
    } catch {
      return {
        sourcePath,
        tracks: [],
      };
    }
  });
};

export {
  registerGetSourceAudioTracksHandler,
};
