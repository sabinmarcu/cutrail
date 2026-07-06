import { defineConfig } from 'vite';
import {
  fileURLToPath,
  URL,
} from 'node:url';
import react from '@vitejs/plugin-react';
import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin';

export default defineConfig({
  plugins: [vanillaExtractPlugin(), react()],
  resolve: {
    alias: {
      '@renderer': fileURLToPath(new URL('src/renderer', import.meta.url)),
      '@assets': fileURLToPath(new URL('src/assets', import.meta.url)),
    },
  },
  build: {
    outDir: 'dist/renderer',
    emptyOutDir: true,
  },
});
