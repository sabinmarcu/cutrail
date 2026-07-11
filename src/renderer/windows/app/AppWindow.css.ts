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
  ...dragAppRegion,
  background: '#020805',
  display: 'grid',
  gridTemplateRows: 'minmax(0, 1fr) auto',
  blockSize: '100%',
  minBlockSize: 0,
  overflow: 'hidden',
  padding: theme.grid.s,
  position: 'relative',
});

export const noDrag = style({
  ...noDragAppRegion,
});

export const content = style({
  alignContent: 'center',
  alignSelf: 'center',
  borderInlineStart: '1px dashed transparent',
  borderInlineEnd: '1px dashed transparent',
  borderBlockStart: '1px dashed transparent',
  borderBlockEnd: '1px dashed transparent',
  borderRadius: '12px',
  display: 'grid',
  gap: theme.grid.m,
  justifyItems: 'center',
  justifySelf: 'center',
  minBlockSize: 0,
  padding: theme.grid.l,
  maxInlineSize: '34rem',
  inlineSize: '100%',
  textAlign: 'center',
  transition: 'border-color 120ms ease, background-color 120ms ease',
});

export const dragActive = style({
  backgroundColor: 'rgba(9, 27, 17, 0.55)',
  borderInlineStart: `1px dashed ${theme.colors.primary.base}`,
  borderInlineEnd: `1px dashed ${theme.colors.primary.base}`,
  borderBlockStart: `1px dashed ${theme.colors.primary.base}`,
  borderBlockEnd: `1px dashed ${theme.colors.primary.base}`,
});

export const dropHint = style({
  color: theme.colors.secondary.base,
  fontSize: '0.74rem',
  letterSpacing: '0.07em',
  margin: 0,
  textTransform: 'uppercase',
});

export const actionsRow = style({
  display: 'flex',
  flexWrap: 'wrap',
  gap: theme.grid.s,
  justifyContent: 'center',
});

export const footer = style({
  display: 'flex',
  justifyContent: 'center',
  paddingBlockStart: '0',
  paddingInline: `${theme.grid.l}`,
  paddingBlockEnd: `${theme.grid.l}`,
});

export const logo = style({
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
