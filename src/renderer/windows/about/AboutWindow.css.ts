import { style } from '@vanilla-extract/css';
import { theme } from '@sabinmarcu/theme';

export const page = style({
  display: 'grid',
  blockSize: '100%',
  overflow: 'hidden',
  padding: 0,
  inlineSize: '100%',
});

export const shell = style({
  background: '#020805',
  display: 'grid',
  gridTemplateRows: 'auto minmax(0, 1fr) auto',
  blockSize: '100%',
  minBlockSize: 0,
  overflow: 'hidden',
});

export const panel = style({
  alignContent: 'center',
  display: 'grid',
  gap: theme.grid.m,
  justifyItems: 'center',
  minBlockSize: 0,
  padding: theme.grid.l,
  textAlign: 'center',
});

export const hero = style({
  alignItems: 'center',
  display: 'grid',
  gap: theme.grid.s,
  justifyItems: 'center',
  maxInlineSize: '34rem',
});

export const icon = style({
  borderInlineStart: `1px solid ${theme.colors.primary.muted}`,
  borderInlineEnd: `1px solid ${theme.colors.primary.muted}`,
  borderBlockStart: `1px solid ${theme.colors.primary.muted}`,
  borderBlockEnd: `1px solid ${theme.colors.primary.muted}`,
  borderRadius: '14px',
  blockSize: '8rem',
  inlineSize: '8rem',
  filter: 'drop-shadow(0 0 12px rgba(49, 255, 145, 0.28))',
});

export const title = style({
  color: theme.colors.primary.base,
  fontSize: '1.3rem',
  letterSpacing: '0.18em',
  margin: 0,
  textTransform: 'uppercase',
});

export const subtitle = style({
  color: theme.colors.secondary.base,
  fontSize: '0.82rem',
  letterSpacing: '0.04em',
  lineHeight: 1.45,
  margin: 0,
});

export const linkRow = style({
  display: 'flex',
  flexWrap: 'wrap',
  gap: theme.grid.s,
  justifyContent: 'center',
});

export const link = style({
  color: theme.colors.primary.base,
  fontSize: '0.76rem',
  letterSpacing: '0.08em',
  textDecoration: 'none',
  textTransform: 'uppercase',
  ':hover': {
    color: theme.colors.primary.emphasis,
    textDecoration: 'underline',
  },
});

export const footer = style({
  display: 'flex',
  justifyContent: 'center',
  paddingBlockStart: '0',
  paddingInline: `${theme.grid.l}`,
  paddingBlockEnd: `${theme.grid.l}`,
});
