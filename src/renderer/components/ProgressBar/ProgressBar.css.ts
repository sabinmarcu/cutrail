import { style } from '@vanilla-extract/css';
import { theme } from '@sabinmarcu/theme';

export const root = style({
  display: 'grid',
  gap: theme.grid.xs,
});

export const labelRow = style({
  alignItems: 'baseline',
  color: theme.colors.secondary.emphasis,
  display: 'flex',
  fontSize: '0.74rem',
  justifyContent: 'space-between',
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
});

export const track = style({
  background: 'var(--cutrail-surface-panel)',
  borderInlineStart: `1px solid ${theme.colors.primary.muted}`,
  borderInlineEnd: `1px solid ${theme.colors.primary.muted}`,
  borderBlockStart: `1px solid ${theme.colors.primary.muted}`,
  borderBlockEnd: `1px solid ${theme.colors.primary.muted}`,
  blockSize: '0.75rem',
  overflow: 'hidden',
  position: 'relative',
});

export const fill = style({
  background: theme.colors.primary.base,
  blockSize: '100%',
  inlineSize: '0%',
  transition: 'inline-size 160ms linear',
});
