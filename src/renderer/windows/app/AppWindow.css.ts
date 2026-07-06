import {
  globalStyle,
  style,
} from '@vanilla-extract/css';
import { theme } from '@sabinmarcu/theme';

const dragAppRegion = { WebkitAppRegion: 'drag' } as any;
const noDragAppRegion = { WebkitAppRegion: 'no-drag' } as any;

export const page = style({
  display: 'grid',
  gridTemplateRows: 'minmax(0, 1fr)',
  blockSize: '100%',
  overflow: 'hidden',
  padding: 0,
  inlineSize: '100%',
});

globalStyle(`#root > .${page}`, {
  blockSize: '100%',
  inlineSize: '100%',
  borderInlineStart: 'none',
  borderInlineEnd: 'none',
  borderBlockStart: 'none',
  borderBlockEnd: 'none',
  boxShadow: 'none',
});

export const shell = style({
  background: '#020805',
  display: 'grid',
  gridTemplateRows: 'minmax(0, 1fr) auto',
  blockSize: '100%',
  minBlockSize: 0,
  overflow: 'hidden',
  padding: 0,
  ...dragAppRegion,
});

export const noDrag = style({
  ...noDragAppRegion,
});

export const content = style({
  alignContent: 'center',
  alignSelf: 'center',
  display: 'grid',
  gap: theme.grid.m,
  justifyItems: 'center',
  justifySelf: 'center',
  minBlockSize: 0,
  padding: theme.grid.l,
  maxInlineSize: '34rem',
  textAlign: 'center',
});

export const footer = style({
  display: 'flex',
  justifyContent: 'center',
  paddingBlockStart: '0',
  paddingInline: `${theme.grid.l}`,
  paddingBlockEnd: `${theme.grid.l}`,
});

export const logo = style({
  borderInlineStart: `1px solid ${theme.colors.primary.muted}`,
  borderInlineEnd: `1px solid ${theme.colors.primary.muted}`,
  borderBlockStart: `1px solid ${theme.colors.primary.muted}`,
  borderBlockEnd: `1px solid ${theme.colors.primary.muted}`,
  borderRadius: '14px',
  blockSize: '8.5rem',
  inlineSize: '8.5rem',
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
