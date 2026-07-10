import { z } from 'zod';

const DEVTOOLS_ENABLED_VALUES = new Set(['1', 'true', 'yes', 'on']);

const normalizeOptionalString = (value: string | undefined): string | undefined => {
  if (typeof value !== 'string') {
    return undefined;
  }

  const nextValue = value.trim();

  return nextValue.length > 0 ? nextValue : undefined;
};

const environmentSchema = z.object({
  APPIMAGE: z.string().optional().transform(normalizeOptionalString),
  CUTRAIL_FFMPEG_PATH: z.string().optional().transform(normalizeOptionalString),
  CUTRAIL_OPEN_DEVTOOLS: z.string().optional().transform((value) => {
    if (typeof value !== 'string') {
      return false;
    }

    return DEVTOOLS_ENABLED_VALUES.has(value.trim().toLowerCase());
  }),
  VITE_DEV_SERVER_URL: z.string().optional().transform((value) => {
    const nextValue = normalizeOptionalString(value);

    return nextValue ? z.string().url().parse(nextValue) : undefined;
  }),
});

export type AppEnvironment = {
  appImagePath?: string;
  devServerUrl?: string;
  ffmpegOverridePath?: string;
  openDevToolsOnStart: boolean;
};

export const parseEnvironment = (
  source: NodeJS.ProcessEnv = process.env,
): AppEnvironment => {
  const parsed = environmentSchema.parse(source);

  return {
    appImagePath: parsed.APPIMAGE,
    devServerUrl: parsed.VITE_DEV_SERVER_URL,
    ffmpegOverridePath: parsed.CUTRAIL_FFMPEG_PATH,
    openDevToolsOnStart: parsed.CUTRAIL_OPEN_DEVTOOLS,
  };
};

const appEnvironment = parseEnvironment();

export const getAppEnvironment = (): AppEnvironment => appEnvironment;
