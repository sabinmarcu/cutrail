import { style } from '@vanilla-extract/css';
import { theme } from '@sabinmarcu/theme';

export const root = style({
  display: 'grid',
  gap: theme.grid.xs,
});

export const frame = style({
  background: '#030b08',
  borderInlineStart: `1px solid ${theme.colors.primary.muted}`,
  borderInlineEnd: `1px solid ${theme.colors.primary.muted}`,
  borderBlockStart: `1px solid ${theme.colors.primary.muted}`,
  borderBlockEnd: `1px solid ${theme.colors.primary.muted}`,
  overflow: 'hidden',
});

export const video = style({
  aspectRatio: '16 / 9',
  background: '#000',
  display: 'block',
  inlineSize: '100%',
  objectFit: 'cover',
});

export const controls = style({
  alignItems: 'center',
  display: 'grid',
  gap: theme.grid.xs,
  gridTemplateColumns: 'auto minmax(0, 1fr)',
});

export const seek = style({
  accentColor: theme.colors.primary.base,
  cursor: 'pointer',
  inlineSize: '100%',
  margin: 0,
});

export const time = style({
  color: theme.colors.secondary.base,
  fontSize: '0.74rem',
  letterSpacing: '0.04em',
  margin: 0,
});
