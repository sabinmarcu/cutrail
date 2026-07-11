import {
  defaultThemePrimaryColor,
  isThemePrimaryColorValue,
  normalizeThemePrimaryColor,
  type ThemePrimaryColorValue,
} from '../shared/themePrimaryColor';

export const createRendererThemeConfig = (
  primaryColor: ThemePrimaryColorValue = defaultThemePrimaryColor,
) => ({
  primary: normalizeThemePrimaryColor(primaryColor),
  secondary: normalizeThemePrimaryColor(primaryColor),
  info: 'blue',
  success: 'lime',
  warning: 'yellow',
  error: 'red',
  background: {
    light: '#0c1a14',
    dark: '#020805',
  },
  grid: 16,
  breakpoint: {
    mobile: 700,
    tablet: 1000,
    screen: 1200,
    large: 1980,
    huge: 3000,
  },
});

const mixColor = (base: string, reference: string, amount: number): string => (
  `color-mix(in oklch, ${base}, ${reference} ${amount}%)`
);

const resolvePrimaryColor = (primaryColor: ThemePrimaryColorValue): string => {
  const normalized = normalizeThemePrimaryColor(primaryColor);

  return isThemePrimaryColorValue(normalized)
    ? normalized
    : defaultThemePrimaryColor;
};

export const applyRendererTheme = (primaryColor: ThemePrimaryColorValue): void => {
  const resolvedPrimary = resolvePrimaryColor(primaryColor);
  const root = document.documentElement;

  root.style.setProperty('--theme-colors-primary-base', resolvedPrimary);
  root.style.setProperty('--theme-colors-primary-emphasis', mixColor(resolvedPrimary, 'white', 22));
  root.style.setProperty('--theme-colors-primary-muted', mixColor(resolvedPrimary, 'black', 56));
  root.style.setProperty('--theme-colors-primary-contrast', mixColor(resolvedPrimary, 'black', 88));

  root.style.setProperty('--theme-colors-secondary-base', mixColor(resolvedPrimary, 'white', 30));
  root.style.setProperty('--theme-colors-secondary-emphasis', mixColor(resolvedPrimary, 'white', 46));
  root.style.setProperty('--theme-colors-secondary-muted', mixColor(resolvedPrimary, 'black', 44));
  root.style.setProperty('--theme-colors-secondary-contrast', mixColor(resolvedPrimary, 'black', 90));
};
