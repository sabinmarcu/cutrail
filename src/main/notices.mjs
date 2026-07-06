// @ts-check

import path from 'node:path';
import fsPromises from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { app } from 'electron';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * @returns {Promise<string>}
 */
const readThirdPartyNotices = async () => {
  const candidatePaths = [
    path.resolve(app.getAppPath(), 'THIRD_PARTY_NOTICES.md'),
    path.resolve(__dirname, '../../THIRD_PARTY_NOTICES.md'),
  ];

  for (const candidatePath of candidatePaths) {
    try {
      const content = await fsPromises.readFile(candidatePath, 'utf8');

      if (content.trim().length > 0) {
        return content;
      }
    } catch {
      // Continue through fallback paths.
    }
  }

  return 'THIRD_PARTY_NOTICES.md content is unavailable in this build.';
};

export {
  readThirdPartyNotices,
};
