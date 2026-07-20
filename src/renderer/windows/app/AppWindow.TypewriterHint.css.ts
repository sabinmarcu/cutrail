import {
  keyframes,
  style,
} from '@vanilla-extract/css';
import { theme } from '@sabinmarcu/theme';

const cursorBlink = keyframes({
  '0%': { opacity: '1' },
  '50%': { opacity: '0' },
  '100%': { opacity: '1' },
});

export const wrapper = style({
  minBlockSize: '4.2rem',
  paddingBlock: `${theme.grid.s}`,
  paddingInline: `${theme.grid.m}`,
  inlineSize: '100%',
  maxInlineSize: '30rem',
  display: 'grid',
  alignItems: 'center',
  background: 'rgba(0, 0, 0, 0.2)',
});

export const text = style({
  color: theme.colors.secondary.base,
  fontFamily: 'monospace',
  fontSize: '0.8rem',
  letterSpacing: '0.03em',
  lineHeight: 1.45,
  margin: 0,
});

export const cursor = style({
  color: theme.colors.primary.base,
  animation: `${cursorBlink} 1s steps(1, end) infinite`,
  marginInlineStart: '0.08em',
});
