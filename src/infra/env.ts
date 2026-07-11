import { z } from 'zod';

const TRUTHY_ENV_VALUES = new Set(['1', 'true', 'yes', 'on']);

const normalizeOptionalString = (value: string | undefined): string | undefined => {
  if (typeof value !== 'string') {
    return undefined;
  }

  const nextValue = value.trim();

  return nextValue.length > 0 ? nextValue : undefined;
};

const parseOptionalBoolean = (value: string | undefined): boolean => {
  if (typeof value !== 'string') {
    return false;
  }

  return TRUTHY_ENV_VALUES.has(value.trim().toLowerCase());
};

const environmentSchema = z.object({
  APPIMAGE: z.string().optional().transform(normalizeOptionalString),
  APPMENU_DISPLAY_BOTH: z.string().optional().transform(parseOptionalBoolean),
  CUTRAIL_FFMPEG_PATH: z.string().optional().transform(normalizeOptionalString),
  CUTRAIL_FORCE_NATIVE_WINDOW_DECORATIONS: z
    .string()
    .optional()
    .transform(parseOptionalBoolean),
  CUTRAIL_OPEN_DEVTOOLS: z.string().optional().transform(parseOptionalBoolean),
  CUTRAIL_FORCE_WINDOW_DECORATION_MENU: z
    .string()
    .optional()
    .transform(parseOptionalBoolean),
  DESKTOP_SESSION: z.string().optional().transform(normalizeOptionalString),
  GTK_MODULES: z.string().optional().transform(normalizeOptionalString),
  KDE_FULL_SESSION: z.string().optional().transform(parseOptionalBoolean),
  KDE_SESSION_VERSION: z.string().optional().transform(normalizeOptionalString),
  QT_QPA_PLATFORMTHEME: z.string().optional().transform(normalizeOptionalString),
  UBUNTU_MENUPROXY: z.string().optional().transform(normalizeOptionalString),
  VITE_DEV_SERVER_URL: z.string().optional().transform((value) => {
    const nextValue = normalizeOptionalString(value);

    return nextValue ? z.string().url().parse(nextValue) : undefined;
  }),
  XDG_CURRENT_DESKTOP: z.string().optional().transform(normalizeOptionalString),
});

export type AppEnvironment = {
  appMenuDisplayBoth: boolean;
  appImagePath?: string;
  desktopEnvironment?: string;
  desktopSession?: string;
  devServerUrl?: string;
  ffmpegOverridePath?: string;
  forceNativeWindowDecorations: boolean;
  forceWindowDecorationMenu: boolean;
  gtkModules?: string;
  kdeFullSession: boolean;
  kdeSessionVersion?: string;
  openDevToolsOnStart: boolean;
  qtPlatformTheme?: string;
  ubuntuMenuProxy?: string;
};

export const parseEnvironment = (
  source: NodeJS.ProcessEnv = process.env,
): AppEnvironment => {
  const parsed = environmentSchema.parse(source);

  return {
    appMenuDisplayBoth: parsed.APPMENU_DISPLAY_BOTH,
    appImagePath: parsed.APPIMAGE,
    desktopSession: parsed.DESKTOP_SESSION,
    desktopEnvironment: parsed.XDG_CURRENT_DESKTOP,
    devServerUrl: parsed.VITE_DEV_SERVER_URL,
    ffmpegOverridePath: parsed.CUTRAIL_FFMPEG_PATH,
    forceNativeWindowDecorations: parsed.CUTRAIL_FORCE_NATIVE_WINDOW_DECORATIONS,
    forceWindowDecorationMenu: parsed.CUTRAIL_FORCE_WINDOW_DECORATION_MENU,
    gtkModules: parsed.GTK_MODULES,
    kdeFullSession: parsed.KDE_FULL_SESSION,
    kdeSessionVersion: parsed.KDE_SESSION_VERSION,
    openDevToolsOnStart: parsed.CUTRAIL_OPEN_DEVTOOLS,
    qtPlatformTheme: parsed.QT_QPA_PLATFORMTHEME,
    ubuntuMenuProxy: parsed.UBUNTU_MENUPROXY,
  };
};

const appEnvironment = parseEnvironment();

export const getAppEnvironment = (): AppEnvironment => appEnvironment;
