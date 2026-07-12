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
  background: theme.colors.background.surface,
  borderInlineStart: 'none',
  borderInlineEnd: 'none',
  borderBlockStart: 'none',
  borderBlockEnd: 'none',
  borderRadius: 0,
  display: 'grid',
  gridTemplateRows: 'auto minmax(0, 1fr)',
  blockSize: '100%',
  minBlockSize: 0,
  overflow: 'hidden',
  padding: 0,
  inlineSize: '100%',
  gap: 0,
  '@media': {
    'screen and (max-width: 820px)': {
      minBlockSize: 0,
      padding: 0,
    },
  },
});

export const workspaceGrid = style({
  alignItems: 'stretch',
  display: 'grid',
  gap: 0,
  blockSize: '100%',
  gridRow: '2',
  gridTemplateColumns: 'minmax(0, 5fr) minmax(18rem, 2fr)',
  minBlockSize: 0,
  overflow: 'hidden',
  '@media': {
    'screen and (max-width: 980px)': {
      gridTemplateColumns: '1fr',
      minBlockSize: 0,
    },
  },
});

export const editorColumn = style({
  borderInlineEnd: `1px solid ${theme.colors.primary.muted}`,
  display: 'grid',
  gridTemplateRows: 'minmax(0, 1fr)',
  blockSize: '100%',
  minBlockSize: 0,
  minInlineSize: 0,
  overflow: 'hidden',
});

export const sideColumn = style({
  display: 'grid',
  gap: 0,
  gridTemplateRows: '1fr auto',
  minBlockSize: 0,
  minInlineSize: 0,
  overflow: 'hidden',
  '@media': {
    'screen and (max-width: 980px)': {
      gridTemplateRows: 'auto auto',
    },
  },
});

export const panel = style({
  background: 'var(--cutrail-surface-dark)',
  borderInlineStart: `1px solid ${theme.colors.primary.muted}`,
  borderInlineEnd: `1px solid ${theme.colors.primary.muted}`,
  borderBlockStart: `1px solid ${theme.colors.primary.muted}`,
  borderBlockEnd: `1px solid ${theme.colors.primary.muted}`,
  borderRadius: 0,
  display: 'grid',
  marginBlockStart: 0,
  minBlockSize: 0,
  padding: theme.grid.s,
});

export const clipPanel = style({
  gridTemplateRows: 'auto minmax(0, 1fr)',
  overflow: 'hidden',
});

export const controlsPanel = style({
  alignSelf: 'end',
  borderBlockStart: 'none',
  display: 'grid',
  gap: theme.grid.s,
});

export const editorPanel = style({
  background: 'var(--cutrail-surface-dark)',
  borderInlineStart: 'none',
  borderInlineEnd: 'none',
  borderBlockStart: 'none',
  borderBlockEnd: 'none',
  borderRadius: 0,
  display: 'grid',
  blockSize: '100%',
  minBlockSize: 0,
  overflow: 'hidden',
  padding: 0,
});

export const panelHeaderRow = style({
  alignItems: 'center',
  display: 'flex',
  justifyContent: 'space-between',
  gap: theme.grid.xs,
});

export const panelHeading = style({
  color: theme.colors.primary.base,
  fontSize: '0.84rem',
  letterSpacing: '0.1em',
  marginBlockStart: '0',
  marginInline: '0',
  marginBlockEnd: `${theme.grid.xs}`,
  textTransform: 'uppercase',
});

export const clipList = style({
  alignContent: 'start',
  alignItems: 'start',
  display: 'grid',
  gap: theme.grid.m,
  listStyle: 'none',
  margin: 0,
  minBlockSize: 0,
  overflowBlock: 'auto',
  padding: 0,
});

export const clipItem = style({
  background: 'var(--cutrail-surface-panel)',
  borderInlineStart: `1px solid ${theme.colors.primary.muted}`,
  borderInlineEnd: `1px solid ${theme.colors.primary.muted}`,
  borderBlockStart: `1px solid ${theme.colors.primary.muted}`,
  borderBlockEnd: `1px solid ${theme.colors.primary.muted}`,
  borderRadius: 0,
  paddingBlock: `${theme.grid.xxs}`,
  paddingInline: `${theme.grid.xs}`,
});

export const clipTitle = style({
  color: theme.colors.primary.base,
  fontSize: '0.76rem',
  fontWeight: 700,
  letterSpacing: '0.06em',
  marginBlockEnd: '0.1rem',
  textTransform: 'uppercase',
});

export const clipMeta = style({
  color: theme.colors.secondary.base,
  fontSize: '0.74rem',
  lineHeight: 1.25,
});

export const clipActionRow = style({
  display: 'grid',
  gap: theme.grid.xxs,
  marginBlockStart: theme.grid.xxs,
});

export const clipActionButton = style({
  alignItems: 'center',
  display: 'inline-flex',
  gap: theme.grid.xxs,
  blockSize: '1.6rem',
  justifyContent: 'center',
  minInlineSize: 0,
  paddingBlock: 0,
  paddingInline: theme.grid.xxs,
  fontSize: '0.62rem',
  inlineSize: '100%',
});

export const sideActions = style({
  display: 'grid',
  gap: theme.grid.xs,
});

export const switchRow = style({
  alignItems: 'center',
  display: 'flex',
  gap: theme.grid.s,
  justifyContent: 'space-between',
});

export const switchLabel = style({
  color: theme.colors.secondary.base,
  fontSize: '0.76rem',
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
});

export const switchInput = style({
  accentColor: theme.colors.secondary.base,
  cursor: 'pointer',
  blockSize: '1rem',
  inlineSize: '1rem',
});

export const errorText = style({
  color: theme.colors.error.emphasis,
  margin: 0,
});
