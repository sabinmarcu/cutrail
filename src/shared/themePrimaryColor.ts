export const defaultThemePrimaryColor = '#2dff7a' as const;

const primaryColorHexPattern = /^#[\da-fA-F]{6}$/;

export type ThemePrimaryColorValue = string;

export const normalizeThemePrimaryColor = (value: string): ThemePrimaryColorValue => (
  value.trim().toLowerCase()
);

export const isThemePrimaryColorValue = (value: unknown): value is ThemePrimaryColorValue => (
  typeof value === 'string'
  && primaryColorHexPattern.test(value)
);
