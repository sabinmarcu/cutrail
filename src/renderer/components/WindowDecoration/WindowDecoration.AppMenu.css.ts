import { style } from '@vanilla-extract/css';
import { theme } from '@sabinmarcu/theme';

const noDragAppRegion = { WebkitAppRegion: 'no-drag' } as any;

export const root = style({
  background: '#06100b',
  borderBlockStart: `1px solid ${theme.colors.primary.muted}`,
  borderBlockEnd: `1px solid ${theme.colors.primary.muted}`,
  display: 'flex',
  gap: 0,
  inlineSize: '100%',
  alignItems: 'stretch',
  justifyContent: 'flex-start',
  minBlockSize: '1.8rem',
  paddingInline: 0,
  ...noDragAppRegion,
});

export const menuTrigger = style({
  background: '#07110d',
  borderInlineStart: `1px solid ${theme.colors.primary.muted}`,
  borderInlineEnd: `1px solid ${theme.colors.primary.muted}`,
  borderBlock: 'none',
  borderRadius: 0,
  color: theme.colors.primary.emphasis,
  cursor: 'pointer',
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, monospace',
  fontSize: '0.66rem',
  fontWeight: 700,
  letterSpacing: '0.14em',
  lineHeight: 1,
  minBlockSize: '1.38rem',
  paddingBlock: `${theme.grid.xxs}`,
  paddingInline: `${theme.grid.s}`,
  textTransform: 'uppercase',
  ':hover': {
    borderColor: theme.colors.primary.base,
    color: theme.colors.primary.base,
  },
});

export const menuPanel = style({
  background: '#050e0a',
  borderInlineStart: `1px solid ${theme.colors.primary.base}`,
  borderInlineEnd: `1px solid ${theme.colors.primary.base}`,
  borderBlock: `1px solid ${theme.colors.primary.base}`,
  borderBlockEnd: `1px solid ${theme.colors.primary.base}`,
  display: 'grid',
  gap: '1px',
  insetBlockStart: 'calc(100% + 2px)',
  insetInlineStart: 0,
  minInlineSize: '14.5rem',
  maxInlineSize: '22rem',
  padding: '1px',
  position: 'absolute',
  zIndex: 40,
});

export const menuGroup = style({
  display: 'grid',
  gap: '1px',
});

export const menuItem = style({
  alignItems: 'center',
  background: '#08120d',
  display: 'flex',
  justifyContent: 'space-between',
  borderInlineStart: 0,
  borderInlineEnd: 0,
  borderBlockStart: 0,
  borderBlockEnd: 0,
  color: theme.colors.primary.emphasis,
  cursor: 'pointer',
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, monospace',
  fontSize: '0.68rem',
  fontWeight: 500,
  letterSpacing: '0.08em',
  lineHeight: 1.2,
  paddingBlock: `${theme.grid.xs}`,
  paddingInline: `${theme.grid.s}`,
  textAlign: 'start',
  textTransform: 'uppercase',
  ':hover': {
    background: '#0f1d16',
    color: theme.colors.primary.base,
  },
  ':disabled': {
    color: theme.colors.primary.muted,
    cursor: 'default',
  },
  selectors: {
    '&:disabled:hover': {
      background: '#08120d',
      color: theme.colors.primary.muted,
    },
  },
});

export const menuSlot = style({
  position: 'relative',
  blockSize: '100%',
});

export const menuSeparator = style({
  blockSize: 1,
  background: theme.colors.primary.muted,
  opacity: 0.45,
  marginInline: theme.grid.xs,
});

export const accelerator = style({
  color: theme.colors.secondary.base,
  fontSize: '0.62rem',
  letterSpacing: '0.06em',
  marginInlineStart: theme.grid.m,
  textTransform: 'none',
});
