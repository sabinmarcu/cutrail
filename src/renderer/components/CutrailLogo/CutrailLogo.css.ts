import { style } from '@vanilla-extract/css';

export const root = style({
  display: 'block',
  color: 'var(--theme-colors-primary-base)',
  inlineSize: '100%',
  blockSize: '100%',
});

export const glyph = style({
  display: 'block',
  inlineSize: '100%',
  blockSize: '100%',
});
