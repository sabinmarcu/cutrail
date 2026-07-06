// @ts-check

import { z } from 'zod';

const DEVTOOLS_ENABLED_VALUES = new Set(['1', 'true', 'yes', 'on']);

const runtimeConfigSchema = z.object({
  CUTRAIL_OPEN_DEVTOOLS: z.string().optional().transform((value) => {
    if (typeof value !== 'string') {
      return false;
    }

    return DEVTOOLS_ENABLED_VALUES.has(value.trim().toLowerCase());
  }),
  VITE_DEV_SERVER_URL: z.string().optional().transform((value) => {
    if (typeof value !== 'string') {
      return undefined;
    }

    const nextValue = value.trim();

    if (nextValue.length === 0) {
      return undefined;
    }

    return z.string().url().parse(nextValue);
  }),
});

/**
 * @typedef {{
 *   devServerUrl?: string,
 *   openDevToolsOnStart: boolean
 * }} RuntimeConfig
 */

/**
 * @returns {RuntimeConfig}
 */
const getRuntimeConfig = () => {
  const parsed = runtimeConfigSchema.parse(process.env);

  return {
    devServerUrl: parsed.VITE_DEV_SERVER_URL,
    openDevToolsOnStart: parsed.CUTRAIL_OPEN_DEVTOOLS,
  };
};

export {
  getRuntimeConfig,
};
