import path from 'node:path';
import fsPromises from 'node:fs/promises';
import { app } from 'electron';

const SETTINGS_FILE_NAME = 'settings.json';
const SOURCE_DIRECTORY_KEY = 'sourceDirectory';
const OUTPUT_DIRECTORY_KEY = 'outputDirectory';

const getSettingsFilePath = (): string => path.join(app.getPath('userData'), SETTINGS_FILE_NAME);

const readSettings = async (): Promise<Record<string, unknown>> => {
  try {
    const raw = await fsPromises.readFile(getSettingsFilePath(), 'utf8');
    const parsed = JSON.parse(raw);

    return typeof parsed === 'object' && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
};

const writeSettings = async (nextSettings: Record<string, unknown>): Promise<void> => {
  const safeSettings = typeof nextSettings === 'object' && nextSettings !== null ? nextSettings : {};
  await fsPromises.writeFile(getSettingsFilePath(), JSON.stringify(safeSettings, null, 2), 'utf8');
};

const readStringSetting = (settings: Record<string, unknown>, key: string): string | null => {
  const value = settings[key];

  return typeof value === 'string' && value.length > 0 ? value : null;
};

const getDefaultSourceDirectory = (): string | null => {
  try {
    const videosPath = app.getPath('videos');

    if (typeof videosPath === 'string' && videosPath.length > 0) {
      return videosPath;
    }
  } catch {
    // Fallback below.
  }

  try {
    const homePath = app.getPath('home');

    if (typeof homePath === 'string' && homePath.length > 0) {
      return path.join(homePath, 'Videos');
    }
  } catch {
    return null;
  }

  return null;
};

const getDefaultOutputDirectory = (sourceDirectory: string): string => path.join(sourceDirectory, 'Clips');

const getPersistedSourceDirectory = async (): Promise<string | null> => {
  const settings = await readSettings();

  return readStringSetting(settings, SOURCE_DIRECTORY_KEY);
};

const getPersistedOutputDirectory = async (): Promise<string | null> => {
  const settings = await readSettings();

  return readStringSetting(settings, OUTPUT_DIRECTORY_KEY);
};

const setPersistedSourceDirectory = async (sourceDirectory: string): Promise<void> => {
  const settings = await readSettings();
  settings[SOURCE_DIRECTORY_KEY] = sourceDirectory;

  if (!readStringSetting(settings, OUTPUT_DIRECTORY_KEY)) {
    settings[OUTPUT_DIRECTORY_KEY] = getDefaultOutputDirectory(sourceDirectory);
  }

  await writeSettings(settings);
};

const setPersistedOutputDirectory = async (outputDirectory: string): Promise<void> => {
  const settings = await readSettings();
  settings[OUTPUT_DIRECTORY_KEY] = outputDirectory;

  await writeSettings(settings);
};

const ensurePersistedDirectories = async (): Promise<void> => {
  const settings = await readSettings();
  let hasChanges = false;
  let sourceDirectory = readStringSetting(settings, SOURCE_DIRECTORY_KEY);

  if (!sourceDirectory) {
    const defaultSourceDirectory = getDefaultSourceDirectory();

    if (defaultSourceDirectory) {
      sourceDirectory = defaultSourceDirectory;
      settings[SOURCE_DIRECTORY_KEY] = sourceDirectory;
      hasChanges = true;
    }
  }

  if (!readStringSetting(settings, OUTPUT_DIRECTORY_KEY) && sourceDirectory) {
    settings[OUTPUT_DIRECTORY_KEY] = getDefaultOutputDirectory(sourceDirectory);
    hasChanges = true;
  }

  if (hasChanges) {
    await writeSettings(settings);
  }
};

export {
  ensurePersistedDirectories,
  getPersistedSourceDirectory,
  getPersistedOutputDirectory,
  setPersistedSourceDirectory,
  setPersistedOutputDirectory,
};
