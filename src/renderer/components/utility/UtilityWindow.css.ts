import { style } from '@vanilla-extract/css';
import { theme } from '@sabinmarcu/theme';

export const shell = style({
  background: '#020805',
  borderInlineStart: `1px solid ${theme.colors.primary.muted}`,
  borderInlineEnd: `1px solid ${theme.colors.primary.muted}`,
  borderBlockStart: `1px solid ${theme.colors.primary.muted}`,
  borderBlockEnd: `1px solid ${theme.colors.primary.muted}`,
  display: 'grid',
  gridTemplateRows: 'auto minmax(0, 1fr)',
  blockSize: '100%',
  minBlockSize: 0,
  overflow: 'hidden',
});

export const body = style({
  display: 'grid',
  gap: theme.grid.s,
  minBlockSize: 0,
  overflowInline: 'hidden',
  overflowBlock: 'auto',
  padding: theme.grid.m,
  scrollbarGutter: 'stable',
});

export const actions = style({
  display: 'flex',
  gap: theme.grid.xs,
  justifyContent: 'flex-end',
  marginBlockStart: 'auto',
});
