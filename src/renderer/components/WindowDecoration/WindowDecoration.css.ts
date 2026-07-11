import { style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import { theme } from '@sabinmarcu/theme';

const dragAppRegion = { WebkitAppRegion: 'drag' } as any;
const noDragAppRegion = { WebkitAppRegion: 'no-drag' } as any;

export const root = recipe({
  base: {
    alignItems: 'center',
    background: '#010c08',
    borderBlockEnd: `1px solid ${theme.colors.primary.muted}`,
    color: theme.colors.primary.emphasis,
    display: 'grid',
    gap: 0,
    gridTemplateColumns: 'minmax(0, 1fr) auto',
    gridTemplateAreas: '"title controls" "menu menu"',
    minBlockSize: '2rem',
    paddingBlockStart: `${theme.grid.xxs}`,
    paddingInline: 0,
    boxShadow: 'inset 0 -1px 0 rgba(80, 255, 160, 0.08)',
    ...dragAppRegion,
  },
  variants: {
    variant: {
      bar: {},
      overlay: {
        background: 'rgba(2, 8, 5, 0.92)',
        borderBlockEnd: `1px solid ${theme.colors.primary.muted}`,
        insetInlineStart: 0,
        position: 'absolute',
        insetInlineEnd: 0,
        insetBlockStart: 0,
        zIndex: 25,
      },
    },
  },
  defaultVariants: {
    variant: 'bar',
  },
});

export const titleGroup = style({
  alignItems: 'center',
  display: 'flex',
  gridArea: 'title',
  gap: theme.grid.xs,
  minInlineSize: 0,
  paddingBlockEnd: `${theme.grid.xxs}`,
  paddingInlineStart: `${theme.grid.s}`,
});

export const title = style({
  fontSize: '0.78rem',
  fontWeight: 700,
  letterSpacing: '0.12em',
  margin: 0,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  textTransform: 'uppercase',
  whiteSpace: 'nowrap',
});

export const subtitle = style({
  color: theme.colors.secondary.base,
  fontSize: '0.72rem',
  margin: 0,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
});

export const controls = style({
  alignItems: 'center',
  display: 'flex',
  gap: theme.grid.xxs,
  gridArea: 'controls',
  paddingBlockEnd: `${theme.grid.xxs}`,
  paddingInlineEnd: `${theme.grid.s}`,
  ...noDragAppRegion,
});

export const menuRow = style({
  gridArea: 'menu',
  inlineSize: '100%',
  marginInline: 0,
  marginBlockStart: `${theme.grid.xxs}`,
  marginBlockEnd: 0,
  ...noDragAppRegion,
});

export const dragRegion = style({
  flex: 1,
  minInlineSize: 0,
  ...dragAppRegion,
});

export const closeButton = style({
  alignItems: 'center',
  background: '#08130e',
  borderInlineStart: `1px solid ${theme.colors.primary.base}`,
  borderInlineEnd: `1px solid ${theme.colors.primary.base}`,
  borderBlockStart: `1px solid ${theme.colors.primary.base}`,
  borderBlockEnd: `1px solid ${theme.colors.primary.base}`,
  borderRadius: 0,
  color: theme.colors.primary.emphasis,
  cursor: 'pointer',
  display: 'inline-flex',
  blockSize: '1.55rem',
  justifyContent: 'center',
  padding: 0,
  inlineSize: '1.55rem',
  boxShadow: '0 0 0 1px rgba(49, 255, 145, 0.06), 0 0 10px rgba(49, 255, 145, 0.10)',
  transition: 'border-color 140ms ease, color 140ms ease, box-shadow 140ms ease, background-color 140ms ease',
  ':hover': {
    borderColor: theme.colors.error.emphasis,
    background: '#1a0f11',
    boxShadow: '0 0 0 1px rgba(49, 255, 145, 0.16), 0 0 14px rgba(49, 255, 145, 0.18)',
  },
});

export const windowButton = recipe({
  base: {
    alignItems: 'center',
    background: '#08130e',
    borderInlineStart: `1px solid ${theme.colors.primary.muted}`,
    borderInlineEnd: `1px solid ${theme.colors.primary.muted}`,
    borderBlockStart: `1px solid ${theme.colors.primary.muted}`,
    borderBlockEnd: `1px solid ${theme.colors.primary.muted}`,
    borderRadius: 0,
    color: theme.colors.primary.emphasis,
    cursor: 'pointer',
    display: 'inline-flex',
    blockSize: '1.55rem',
    justifyContent: 'center',
    padding: 0,
    inlineSize: '1.55rem',
    boxShadow: '0 0 0 1px rgba(49, 255, 145, 0.06), 0 0 10px rgba(49, 255, 145, 0.10)',
    transition: 'border-color 140ms ease, color 140ms ease, box-shadow 140ms ease, background-color 140ms ease',
    ':hover': {
      background: '#0d1812',
      boxShadow: '0 0 0 1px rgba(49, 255, 145, 0.16), 0 0 14px rgba(49, 255, 145, 0.18)',
    },
  },
  variants: {
    tone: {
      soft: {},
      accent: {
        color: theme.colors.primary.base,
      },
    },
  },
  defaultVariants: {
    tone: 'soft',
  },
});

