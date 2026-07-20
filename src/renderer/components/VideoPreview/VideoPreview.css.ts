import {
  globalStyle,
  style,
} from '@vanilla-extract/css';
import { theme } from '@sabinmarcu/theme';

export const root = style({
  display: 'grid',
  gap: theme.grid.xs,
});

export const frame = style({
  background: 'var(--cutrail-surface-elevated)',
  borderInlineStart: `1px solid ${theme.colors.primary.muted}`,
  borderInlineEnd: `1px solid ${theme.colors.primary.muted}`,
  borderBlockStart: `1px solid ${theme.colors.primary.muted}`,
  borderBlockEnd: `1px solid ${theme.colors.primary.muted}`,
  overflow: 'hidden',
});

export const video = style({
  aspectRatio: '16 / 9',
  background: '#000',
  display: 'block',
  inlineSize: '100%',
  objectFit: 'cover',
});

export const controls = style({
  alignItems: 'center',
  display: 'grid',
  gap: 0,
  gridTemplateColumns: 'auto minmax(0, 1fr)',
});

export const playButton = style({
  alignItems: 'center',
  alignSelf: 'stretch',
  blockSize: '2rem',
  borderRadius: 0,
  display: 'inline-flex',
  inlineSize: '2.5rem',
  justifyContent: 'center',
  marginInlineEnd: '-1px',
  minInlineSize: '2.5rem',
  padding: 0,
  zIndex: 1,
});

export const controlBar = style({
  minInlineSize: 0,
});

export const scrubber = style({
  background: 'var(--cutrail-surface-panel)',
  borderInlineStart: `1px solid ${theme.colors.primary.muted}`,
  borderInlineEnd: `1px solid ${theme.colors.primary.muted}`,
  borderBlockStart: `1px solid ${theme.colors.primary.muted}`,
  borderBlockEnd: `1px solid ${theme.colors.primary.muted}`,
  blockSize: '2rem',
  minInlineSize: 0,
  overflow: 'hidden',
  position: 'relative',
});

export const progressFill = style({
  background: theme.colors.primary.base,
  insetBlock: 0,
  insetInlineStart: 0,
  pointerEvents: 'none',
  position: 'absolute',
  zIndex: 1,
});

export const seek = style({
  cursor: 'pointer',
  inset: 0,
  margin: 0,
  opacity: 0,
  position: 'absolute',
  zIndex: 4,
});

export const progressText = style({
  color: theme.colors.secondary.base,
  inset: 0,
  pointerEvents: 'none',
  position: 'absolute',
  zIndex: 2,
});

export const progressTextFill = style({
  inset: 0,
  overflow: 'hidden',
  pointerEvents: 'none',
  position: 'absolute',
  zIndex: 3,
});

const progressTextBase = {
  alignItems: 'center',
  display: 'flex',
  color: theme.colors.secondary.base,
  fontSize: '0.74rem',
  fontVariantNumeric: 'tabular-nums',
  inlineSize: '100%',
  inset: 0,
  justifyContent: 'flex-end',
  letterSpacing: '0.04em',
  paddingInline: theme.grid.s,
  position: 'absolute' as const,
  whiteSpace: 'nowrap' as const,
};

export const progressTextInner = style(progressTextBase);

export const progressTextFillInner = style({
  ...progressTextBase,
  color: theme.colors.primary.contrast,
});

globalStyle(`${seek}::-webkit-slider-runnable-track`, {
  appearance: 'none',
  background: 'transparent',
  blockSize: '2rem',
});

globalStyle(`${seek}::-webkit-slider-thumb`, {
  WebkitAppearance: 'none',
  background: theme.colors.secondary.emphasis,
  blockSize: '2rem',
  borderInlineStart: `1px solid ${theme.colors.secondary.emphasis}`,
  borderInlineEnd: `1px solid ${theme.colors.secondary.emphasis}`,
  borderBlockStart: `1px solid ${theme.colors.secondary.emphasis}`,
  borderBlockEnd: `1px solid ${theme.colors.secondary.emphasis}`,
  borderRadius: 0,
  boxSizing: 'border-box',
  cursor: 'pointer',
  inlineSize: '2px',
  marginBlockStart: '0',
});

globalStyle(`${seek}::-moz-range-track`, {
  background: 'transparent',
  blockSize: '2rem',
  borderInlineStart: 'none',
  borderInlineEnd: 'none',
  borderBlockStart: 'none',
  borderBlockEnd: 'none',
});

globalStyle(`${seek}::-moz-range-thumb`, {
  background: theme.colors.secondary.emphasis,
  blockSize: '2rem',
  borderInlineStart: `1px solid ${theme.colors.secondary.emphasis}`,
  borderInlineEnd: `1px solid ${theme.colors.secondary.emphasis}`,
  borderBlockStart: `1px solid ${theme.colors.secondary.emphasis}`,
  borderBlockEnd: `1px solid ${theme.colors.secondary.emphasis}`,
  borderRadius: 0,
  boxSizing: 'border-box',
  cursor: 'pointer',
  inlineSize: '2px',
});
