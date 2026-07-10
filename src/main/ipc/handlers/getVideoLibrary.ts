import { ipcMain } from 'electron';
import { assertTrustedSender } from '../assertTrustedSender.ts';
import { readSourceVideos } from '../../videoLibrary.ts';

type GetVideoLibraryDeps = {
  getPersistedOutputDirectory: () => Promise<string | null>;
  getPersistedSourceDirectory: () => Promise<string | null>;
};

const registerGetVideoLibraryHandler = ({
  getPersistedOutputDirectory,
  getPersistedSourceDirectory,
}: GetVideoLibraryDeps): void => {
  ipcMain.handle('cutrail:get-video-library', async (event) => {
    assertTrustedSender(event);
    const sourceDirectory = await getPersistedSourceDirectory();
    const outputDirectory = await getPersistedOutputDirectory();

    if (!sourceDirectory) {
      return {
        sourceDirectory: '',
        outputDirectory: outputDirectory ?? '',
        videos: [],
      };
    }

    try {
      const videos = await readSourceVideos(sourceDirectory, outputDirectory);

      return {
        sourceDirectory,
        outputDirectory: outputDirectory ?? '',
        videos,
      };
    } catch {
      return {
        sourceDirectory,
        outputDirectory: outputDirectory ?? '',
        videos: [],
      };
    }
  });
};

export {
  registerGetVideoLibraryHandler,
};
