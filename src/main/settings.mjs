// @ts-check

import path from 'node:path';
import fsPromises from 'node:fs/promises';
import { app } from 'electron';

const SETTINGS_FILE_NAME = 'settings.json';

/** @returns {string} */
const getSettingsFilePath = () => path.join(app.getPath('userData'), SETTINGS_FILE_NAME);

/**
 * @returns {Promise<Record<string, unknown>>}
 */
const readSettings = async () => {
  try {
    const raw = await fsPromises.readFile(getSettingsFilePath(), 'utf8');
    const parsed = JSON.parse(raw);

    return typeof parsed === 'object' && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
};

/**
 * @param {Record<string, unknown>} nextSettings
 * @returns {Promise<void>}
 */
const writeSettings = async (nextSettings) => {
  const safeSettings = typeof nextSettings === 'object' && nextSettings !== null ? nextSettings : {};
  await fsPromises.writeFile(getSettingsFilePath(), JSON.stringify(safeSettings, null, 2), 'utf8');
};

/**
 * @returns {Promise<string | null>}
 */
const getPersistedOutputDirectory = async () => {
  const settings = await readSettings();
  const { outputDirectory } = settings;

  return typeof outputDirectory === 'string' && outputDirectory.length > 0 ? outputDirectory : null;
};

/**
 * @param {string} outputDirectory
 * @returns {Promise<void>}
 */
const setPersistedOutputDirectory = async (outputDirectory) => {
  const settings = await readSettings();
  settings.outputDirectory = outputDirectory;
  await writeSettings(settings);
};

export {
  getPersistedOutputDirectory,
  setPersistedOutputDirectory,
};
