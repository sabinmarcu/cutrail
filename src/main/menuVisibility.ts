import type { AppEnvironment } from '../infra/env.ts';

export type WindowMenuPresentation = {
  platform: NodeJS.Platform;
  desktopEnvironment: string;
  hasVisibleGlobalMenu: boolean;
  forceWindowDecorationMenu: boolean;
  useWindowDecorationMenu: boolean;
  detectionSource: 'platform-default' | 'linux-appmenu-session';
};

const normalizeDesktopValue = (value: string | undefined): string => {
  const trimmed = typeof value === 'string' ? value.trim() : '';

  return trimmed.length > 0 ? trimmed : 'unknown';
};

const includesToken = (value: string, token: string): boolean => value
  .split(':')
  .map((entry) => entry.trim().toLowerCase())
  .some((entry) => entry === token || entry.includes(token));

const hasAppMenuModule = (value: string | undefined): boolean => {
  const normalized = typeof value === 'string' ? value.trim().toLowerCase() : '';

  return normalized.includes('appmenu');
};

const hasUbuntuMenuProxy = (value: string | undefined): boolean => {
  const normalized = typeof value === 'string' ? value.trim().toLowerCase() : '';

  if (normalized.length === 0) {
    return false;
  }

  return !['0', 'false', 'off', 'no'].includes(normalized);
};

const hasKdePlasmaSession = (environment: AppEnvironment): boolean => {
  const desktopEnvironment = `${environment.desktopEnvironment ?? ''}:${environment.desktopSession ?? ''}`
    .toLowerCase();

  if (environment.kdeFullSession) {
    return true;
  }

  return (
    includesToken(desktopEnvironment, 'kde')
    || includesToken(desktopEnvironment, 'plasma')
    || includesToken(environment.qtPlatformTheme ?? '', 'kde')
    || (typeof environment.kdeSessionVersion === 'string'
      && environment.kdeSessionVersion.trim().length > 0)
  );
};

const detectLinuxGlobalMenu = (environment: AppEnvironment): boolean => {
  const desktopEnvironment = `${environment.desktopEnvironment ?? ''}:${environment.desktopSession ?? ''}`
    .toLowerCase();

  return (
    hasUbuntuMenuProxy(environment.ubuntuMenuProxy)
    || environment.appMenuDisplayBoth
    || hasAppMenuModule(environment.gtkModules)
    || hasAppMenuModule(environment.qtPlatformTheme)
    || hasKdePlasmaSession(environment)
    || includesToken(desktopEnvironment, 'unity')
  );
};

export const detectVisibleGlobalMenu = (
  environment: AppEnvironment,
  platform: NodeJS.Platform = process.platform,
): boolean => {
  if (platform === 'darwin') {
    return true;
  }

  if (platform !== 'linux') {
    return false;
  }

  return detectLinuxGlobalMenu(environment);
};

export const resolveWindowMenuPresentation = (
  environment: AppEnvironment,
  platform: NodeJS.Platform = process.platform,
): WindowMenuPresentation => {
  const hasVisibleGlobalMenu = detectVisibleGlobalMenu(environment, platform);
  const { forceWindowDecorationMenu } = environment;

  return {
    platform,
    desktopEnvironment: normalizeDesktopValue(
      environment.desktopEnvironment ?? environment.desktopSession,
    ),
    hasVisibleGlobalMenu,
    forceWindowDecorationMenu,
    useWindowDecorationMenu: forceWindowDecorationMenu || !hasVisibleGlobalMenu,
    detectionSource:
      platform === 'darwin' ? 'platform-default' : 'linux-appmenu-session',
  };
};
