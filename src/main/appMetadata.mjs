// @ts-check

import fsPromises from 'node:fs/promises';
import path from 'node:path';
import { app } from 'electron';

/**
 * @returns {Promise<{ version: string, copyright: string, attribution: string, license: string }>}
 */
const getAppMetadata = async () => {
  const defaultMetadata = {
    version: app.getVersion(),
    copyright: 'Copyright (c) 2026 Sabin Marcu',
    attribution: 'Created and maintained by Sabin Marcu with community contributions.',
    license: 'Cutrail is licensed under the MIT License.',
  };

  try {
    const packageJsonPath = path.join(app.getAppPath(), 'package.json');
    const packageJsonContent = await fsPromises.readFile(packageJsonPath, 'utf8');
    const packageJson = JSON.parse(packageJsonContent);

    return {
      version: typeof packageJson.version === 'string' && packageJson.version.length > 0
        ? packageJson.version
        : defaultMetadata.version,
      copyright: defaultMetadata.copyright,
      attribution: typeof packageJson.author === 'string' && packageJson.author.length > 0
        ? `Created and maintained by ${packageJson.author}.`
        : defaultMetadata.attribution,
      license: typeof packageJson.license === 'string' && packageJson.license.length > 0
        ? `Cutrail is licensed under the ${packageJson.license} License.`
        : defaultMetadata.license,
    };
  } catch {
    return defaultMetadata;
  }
};

export {
  getAppMetadata,
};
