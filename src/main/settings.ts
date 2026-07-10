import path from 'node:path';
import fsPromises from 'node:fs/promises';
import { app } from 'electron';

const SETTINGS_FILE_NAME = 'settings.json';

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

const getPersistedOutputDirectory = async (): Promise<string | null> => {
  const settings = await readSettings();
  const { outputDirectory } = settings;

  return typeof outputDirectory === 'string' && outputDirectory.length > 0 ? outputDirectory : null;
};

const setPersistedOutputDirectory = async (outputDirectory: string): Promise<void> => {
  const settings = await readSettings();
  settings.outputDirectory = outputDirectory;
  await writeSettings(settings);
};

export {
  getPersistedOutputDirectory,
  setPersistedOutputDirectory,
};
