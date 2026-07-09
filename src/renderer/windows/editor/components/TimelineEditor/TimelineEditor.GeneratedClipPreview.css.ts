import { style } from '@vanilla-extract/css';
import { theme } from '@sabinmarcu/theme';

export const preview = style({
  display: 'grid',
  gap: 0,
  marginInline: `-${theme.grid.xs}`,
});

export const frame = style({
  background: '#000f0a',
  borderInlineStart: `1px solid ${theme.colors.primary.muted}`,
  borderInlineEnd: `1px solid ${theme.colors.primary.muted}`,
  borderBlockStart: `1px solid ${theme.colors.primary.muted}`,
  borderBlockEnd: `1px solid ${theme.colors.primary.muted}`,
  borderRadius: 0,
  aspectRatio: '16 / 9',
  blockSize: 'auto',
  cursor: 'grab',
  minBlockSize: '8rem',
  inlineSize: '100%',
  overflow: 'hidden',
  position: 'relative',
  selectors: {
    '&::before': {
      backgroundImage: 'repeating-linear-gradient(0deg, rgba(53, 255, 149, 0.08) 0 1px, transparent 1px 4px)',
      content: '',
      inset: 0,
      pointerEvents: 'none',
      position: 'absolute',
      zIndex: 0,
    },
  },
});

export const video = style({
  display: 'block',
  blockSize: '100%',
  inlineSize: '100%',
  objectFit: 'contain',
  position: 'relative',
  zIndex: 1,
});

export const mediaRow = style({
  alignItems: 'center',
  display: 'flex',
  gap: 0,
});

export const actionsRow = style({
  display: 'flex',
  flexWrap: 'wrap',
  gap: theme.grid.xxs,
  marginBlockStart: theme.grid.xxs,
});

export const actionButton = style({
  alignItems: 'center',
  display: 'inline-flex',
  flex: 1,
  gap: theme.grid.xxs,
  blockSize: '1.6rem',
  justifyContent: 'center',
  minInlineSize: 0,
  paddingBlock: 0,
  paddingInline: theme.grid.xxs,
  fontSize: '0.62rem',
});

export const controlButton = style({
  alignItems: 'center',
  display: 'inline-flex',
  gap: 0,
  blockSize: '1.75rem',
  inlineSize: '1.75rem',
  borderRadius: 0,
  borderInlineEnd: 'none',
  flexShrink: 0,
  fontSize: '0.68rem',
  justifyContent: 'center',
  paddingBlock: 0,
  paddingInline: 0,
});

export const progressShell = style({
  display: 'grid',
  flex: 1,
  minInlineSize: 0,
  position: 'relative',
});

export const progressRail = style({
  alignItems: 'center',
  background: '#020805',
  borderInlineStart: `1px solid ${theme.colors.primary.muted}`,
  borderInlineEnd: `1px solid ${theme.colors.primary.muted}`,
  borderBlockStart: `1px solid ${theme.colors.primary.muted}`,
  borderBlockEnd: `1px solid ${theme.colors.primary.muted}`,
  borderRadius: 0,
  blockSize: '1.75rem',
  display: 'grid',
  overflow: 'hidden',
  position: 'relative',
  selectors: {
    '&::before': {
      backgroundImage: 'repeating-linear-gradient(0deg, rgba(53, 255, 149, 0.08) 0 1px, transparent 1px 4px)',
      content: '',
      inset: 0,
      pointerEvents: 'none',
      position: 'absolute',
      zIndex: 0,
    },
  },
});

export const progressFill = style({
  background: theme.colors.secondary.base,
  blockSize: '100%',
  boxShadow: `0 0 12px color-mix(in oklab, ${theme.colors.secondary.base} 30%, transparent)`,
  position: 'relative',
  zIndex: 2,
});

export const progressInput = style({
  appearance: 'none',
  background: 'transparent',
  borderInlineStart: 0,
  borderInlineEnd: 0,
  borderBlockStart: 0,
  borderBlockEnd: 0,
  cursor: 'pointer',
  inset: 0,
  margin: 0,
  opacity: 0,
  position: 'absolute',
  inlineSize: '100%',
  blockSize: '100%',
});

export const progressTime = style({
  color: 'inherit',
  fontSize: '0.66rem',
  fontVariantNumeric: 'tabular-nums',
  insetBlockStart: '50%',
  insetInlineEnd: `${theme.grid.xs}`,
  lineHeight: 1,
  position: 'absolute',
  transform: 'translateY(-50%)',
  whiteSpace: 'nowrap',
  zIndex: 1,
});

export const progressTimeEmpty = style({
  color: theme.colors.secondary.base,
  fontSize: '0.66rem',
  fontVariantNumeric: 'tabular-nums',
  pointerEvents: 'none',
  position: 'absolute',
  inset: 0,
  overflow: 'hidden',
  zIndex: 3,
});

export const progressTimeFilled = style({
  color: theme.colors.background.surface,
  inset: 0,
  overflow: 'hidden',
  pointerEvents: 'none',
  position: 'absolute',
  zIndex: 4,
});
