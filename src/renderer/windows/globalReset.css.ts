import { globalStyle } from '@vanilla-extract/css';
import { theme } from '@sabinmarcu/theme';

globalStyle(':root', {
  vars: {
    '--cutrail-window-border-size': '1px',
  },
  colorScheme: 'dark',
  fontFamily: "'Space Mono', 'IBM Plex Mono', 'Cascadia Mono', 'Consolas', 'Courier New', monospace",
});

globalStyle('*', {
  boxSizing: 'border-box',
});

globalStyle('html, body, #root', {
  blockSize: '100%',
  margin: 0,
  overflow: 'hidden',
});

globalStyle('body', {
  backgroundColor: 'transparent',
  color: theme.colors.primary.contrast,
  lineHeight: 1.45,
});

globalStyle('#root', {
  borderRadius: '8px',
  overflow: 'hidden',
});

globalStyle('#root > *', {
  blockSize: 'calc(100% - (var(--cutrail-window-border-size) * 2))',
  inlineSize: 'calc(100% - (var(--cutrail-window-border-size) * 2))',
  borderRadius: '8px',
  overflow: 'hidden',
  borderInlineStart: `var(--cutrail-window-border-size) solid ${theme.colors.primary.muted}`,
  borderInlineEnd: `var(--cutrail-window-border-size) solid ${theme.colors.primary.muted}`,
  borderBlockStart: `var(--cutrail-window-border-size) solid ${theme.colors.primary.muted}`,
  borderBlockEnd: `var(--cutrail-window-border-size) solid ${theme.colors.primary.muted}`,
  boxShadow: '0 0 0 1px rgba(49, 255, 145, 0.10), 0 10px 24px rgba(0, 0, 0, 0.45)',
});

globalStyle('button', {
  fontFamily: 'inherit',
});

globalStyle('*', {
  scrollbarWidth: 'thin',
  scrollbarColor: `${theme.colors.primary.base} rgba(6, 22, 16, 0.95)`,
});

globalStyle('*::-webkit-scrollbar', {
  inlineSize: '12px',
  blockSize: '12px',
});

globalStyle('*::-webkit-scrollbar-corner', {
  backgroundColor: 'rgba(6, 22, 16, 0.95)',
});

globalStyle('*::-webkit-scrollbar-track', {
  backgroundColor: 'rgba(6, 22, 16, 0.95)',
  borderInlineStart: `1px solid ${theme.colors.primary.muted}`,
  borderInlineEnd: `1px solid ${theme.colors.primary.muted}`,
  borderBlockStart: `1px solid ${theme.colors.primary.muted}`,
  borderBlockEnd: `1px solid ${theme.colors.primary.muted}`,
});

globalStyle('*::-webkit-scrollbar-thumb', {
  backgroundColor: theme.colors.primary.base,
  borderInlineStart: '2px solid rgba(6, 22, 16, 0.95)',
  borderInlineEnd: '2px solid rgba(6, 22, 16, 0.95)',
  borderBlockStart: '2px solid rgba(6, 22, 16, 0.95)',
  borderBlockEnd: '2px solid rgba(6, 22, 16, 0.95)',
  borderRadius: '999px',
});

globalStyle('*::-webkit-scrollbar-thumb:hover', {
  backgroundColor: theme.colors.primary.emphasis,
});

globalStyle('*::-webkit-scrollbar-thumb:active', {
  backgroundColor: theme.colors.primary.contrast,
});
