import { style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import { theme } from '@sabinmarcu/theme';

const dragAppRegion = { WebkitAppRegion: 'drag' } as any;
const noDragAppRegion = { WebkitAppRegion: 'no-drag' } as any;

export const root = recipe({
  base: {
    alignItems: 'center',
    background: 'var(--cutrail-surface-elevated)',
    borderBlockEnd: `1px solid ${theme.colors.primary.muted}`,
    color: theme.colors.primary.emphasis,
    display: 'grid',
    gap: 0,
    gridTemplateColumns: 'minmax(0, 1fr) auto',
    gridTemplateAreas: '"title controls" "menu menu"',
    minBlockSize: '2rem',
    paddingBlockStart: `${theme.grid.xxs}`,
    paddingInline: 0,
    boxShadow: 'inset 0 -1px 0 var(--cutrail-glow-soft)',
    ...dragAppRegion,
  },
  variants: {
    variant: {
      bar: {},
      overlay: {
        background: 'var(--cutrail-overlay-medium)',
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
  background: 'var(--cutrail-surface-elevated)',
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
  boxShadow: '0 0 0 1px var(--cutrail-glow-soft), 0 0 10px var(--cutrail-glow-soft)',
  transition: 'border-color 140ms ease, color 140ms ease, box-shadow 140ms ease, background-color 140ms ease',
  ':hover': {
    borderColor: theme.colors.error.emphasis,
    background: '#1a0f11',
    boxShadow: '0 0 0 1px var(--cutrail-glow-strong), 0 0 14px var(--cutrail-glow-strong)',
  },
});

export const windowButton = recipe({
  base: {
    alignItems: 'center',
    background: 'var(--cutrail-surface-elevated)',
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
    boxShadow: '0 0 0 1px var(--cutrail-glow-soft), 0 0 10px var(--cutrail-glow-soft)',
    transition: 'border-color 140ms ease, color 140ms ease, box-shadow 140ms ease, background-color 140ms ease',
    ':hover': {
      background: 'var(--cutrail-surface-elevated)',
      boxShadow: '0 0 0 1px var(--cutrail-glow-strong), 0 0 14px var(--cutrail-glow-strong)',
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

