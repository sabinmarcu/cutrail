import { style } from '@vanilla-extract/css';
import { theme } from '@sabinmarcu/theme';

export const shell = style({
  background: 'var(--cutrail-surface-dark)',
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

export const controlsBar = style({
  display: 'grid',
  gridTemplateRows: 'auto auto',
});

export const controlsGrid = style({
  borderBlockEnd: `1px solid ${theme.colors.primary.muted}`,
  display: 'grid',
  gap: theme.grid.xs,
  padding: theme.grid.s,
});

export const topRow = style({
  alignItems: 'end',
  columnGap: theme.grid.s,
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1fr) auto',
  rowGap: theme.grid.xs,
});

export const dropdownRow = style({
  columnGap: theme.grid.xs,
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(12rem, 1fr))',
  rowGap: theme.grid.xs,
});

export const searchControl = style({
  minInlineSize: 0,
});

export const viewControl = style({
  inlineSize: '13rem',
  justifySelf: 'end',
});

export const control = style({
  display: 'grid',
  gap: theme.grid.xxs,
  minInlineSize: 0,
});

export const controlLabel = style({
  color: theme.colors.secondary.base,
  fontSize: '0.72rem',
  letterSpacing: '0.08em',
  margin: 0,
  textTransform: 'uppercase',
});

export const searchInput = style({
  background: 'var(--cutrail-surface-panel)',
  borderInlineStart: `1px solid ${theme.colors.primary.muted}`,
  borderInlineEnd: `1px solid ${theme.colors.primary.muted}`,
  borderBlockStart: `1px solid ${theme.colors.primary.muted}`,
  borderBlockEnd: `1px solid ${theme.colors.primary.muted}`,
  color: theme.colors.primary.emphasis,
  fontSize: '0.86rem',
  minBlockSize: '2.35rem',
  paddingInline: theme.grid.xs,
});

export const controlSelect = style({
  background: 'var(--cutrail-surface-panel)',
  borderInlineStart: `1px solid ${theme.colors.primary.muted}`,
  borderInlineEnd: `1px solid ${theme.colors.primary.muted}`,
  borderBlockStart: `1px solid ${theme.colors.primary.muted}`,
  borderBlockEnd: `1px solid ${theme.colors.primary.muted}`,
  color: theme.colors.primary.emphasis,
  minBlockSize: '1.9rem',
  paddingInline: theme.grid.xs,
});

export const viewSwitch = style({
  blockSize: '2.35rem',
  inlineSize: '100%',
});

export const viewSwitchOption = style({
  blockSize: '100%',
  flex: 1,
  fontSize: '0.76rem',
  paddingInline: theme.grid.m,
});

export const body = style({
  display: 'grid',
  gap: `calc(${theme.grid.m} * 2)`,
  minBlockSize: 0,
  overflowInline: 'hidden',
  overflowBlock: 'auto',
  padding: theme.grid.m,
});

export const pathBar = style({
  background: 'var(--cutrail-surface-panel)',
  borderInlineStart: `1px solid ${theme.colors.primary.muted}`,
  borderInlineEnd: `1px solid ${theme.colors.primary.muted}`,
  borderBlockStart: `1px solid ${theme.colors.primary.muted}`,
  borderBlockEnd: `1px solid ${theme.colors.primary.muted}`,
  color: theme.colors.secondary.base,
  display: 'grid',
  gap: theme.grid.xxs,
  margin: 0,
  padding: theme.grid.xs,
});

export const group = style({
  display: 'grid',
  gap: theme.grid.s,
});

export const groupTitle = style({
  color: theme.colors.primary.base,
  fontSize: '0.82rem',
  letterSpacing: '0.1em',
  margin: 0,
  textTransform: 'uppercase',
});

export const videosGrid = style({
  display: 'grid',
  gap: theme.grid.s,
  gridTemplateColumns: 'repeat(auto-fill, minmax(17rem, 1fr))',
});

export const videosList = style({
  display: 'grid',
  gap: theme.grid.s,
  gridTemplateColumns: 'minmax(0, 1fr)',
});

export const card = style({
  background: 'var(--cutrail-surface-dark)',
  borderInlineStart: `1px solid ${theme.colors.primary.muted}`,
  borderInlineEnd: `1px solid ${theme.colors.primary.muted}`,
  borderBlockStart: `1px solid ${theme.colors.primary.muted}`,
  borderBlockEnd: `1px solid ${theme.colors.primary.muted}`,
  display: 'grid',
  gap: theme.grid.xs,
  padding: theme.grid.s,
  transition: 'border-color 140ms ease, box-shadow 140ms ease',
});

export const cardWithClips = style({
  background: 'var(--cutrail-surface-panel)',
  borderInlineStart: `1px solid ${theme.colors.secondary.base}`,
  borderInlineEnd: `1px solid ${theme.colors.secondary.base}`,
  borderBlockStart: `1px solid ${theme.colors.secondary.base}`,
  borderBlockEnd: `1px solid ${theme.colors.secondary.base}`,
  boxShadow: '0 0 0 1px rgba(70, 240, 220, 0.30), 0 0 22px rgba(70, 240, 220, 0.24)',
});

export const cardNew = style({
  borderInlineStart: `1px solid ${theme.colors.warning.base}`,
  borderInlineEnd: `1px solid ${theme.colors.warning.base}`,
  borderBlockStart: `1px solid ${theme.colors.warning.base}`,
  borderBlockEnd: `1px solid ${theme.colors.warning.base}`,
  boxShadow: '0 0 0 1px rgba(255, 205, 90, 0.24), 0 0 18px rgba(255, 205, 90, 0.18)',
});

export const cardNewWithClips = style({
  boxShadow: '0 0 0 1px rgba(255, 205, 90, 0.24), 0 0 24px rgba(120, 240, 220, 0.20)',
});

export const listCard = style({
  alignItems: 'stretch',
  columnGap: theme.grid.m,
  gridTemplateColumns: '20rem minmax(0, 1fr)',
});

export const previewCell = style({
  minInlineSize: 0,
  position: 'relative',
});

export const cardBadge = style({
  borderRadius: 0,
  fontSize: '0.65rem',
  fontWeight: 700,
  insetBlockStart: theme.grid.xs,
  letterSpacing: '0.08em',
  lineHeight: 1,
  paddingBlock: theme.grid.xxs,
  paddingInline: theme.grid.xs,
  pointerEvents: 'none',
  position: 'absolute',
  textTransform: 'uppercase',
  zIndex: 4,
});

export const cardBadgeNew = style({
  background: '#1b1202',
  borderInlineStart: `1px solid ${theme.colors.warning.base}`,
  borderInlineEnd: `1px solid ${theme.colors.warning.base}`,
  borderBlockStart: `1px solid ${theme.colors.warning.base}`,
  borderBlockEnd: `1px solid ${theme.colors.warning.base}`,
  color: theme.colors.warning.base,
  insetInlineEnd: theme.grid.xs,
});

export const cardBadgeClips = style({
  background: 'var(--cutrail-surface-panel)',
  borderInlineStart: `1px solid ${theme.colors.secondary.base}`,
  borderInlineEnd: `1px solid ${theme.colors.secondary.base}`,
  borderBlockStart: `1px solid ${theme.colors.secondary.base}`,
  borderBlockEnd: `1px solid ${theme.colors.secondary.base}`,
  color: theme.colors.secondary.base,
  insetInlineStart: theme.grid.xs,
});

export const cardContent = style({
  alignContent: 'start',
  display: 'grid',
  gap: theme.grid.xxs,
  minInlineSize: 0,
});

export const listCardContent = style({
  blockSize: '100%',
});

export const cardActions = style({
  marginBlockStart: 'auto',
});

export const cardTitle = style({
  color: theme.colors.primary.emphasis,
  fontSize: '0.86rem',
  letterSpacing: '0.04em',
  margin: 0,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
});

export const cardMeta = style({
  color: theme.colors.secondary.base,
  fontSize: '0.75rem',
  margin: 0,
});

export const empty = style({
  color: theme.colors.secondary.base,
  fontSize: '0.82rem',
  margin: 0,
  textTransform: 'uppercase',
});
