import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const basePath = (process.env.BASE_PATH ?? '/stats').replace(/\/+$/, '');

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: `${basePath}/`,
  root: 'src/web',
  publicDir: false,
  resolve: {
    alias: {
      '@shared': fileURLToPath(new URL('./src/shared', import.meta.url)),
    },
  },
  build: {
    outDir: fileURLToPath(new URL('./dist/web', import.meta.url)),
    emptyOutDir: true,
  },
  server: {
    port: 5173,
    proxy: {
      [`${basePath}/api`]: 'http://localhost:3100',
    },
  },
  test: {
    root: fileURLToPath(new URL('.', import.meta.url)),
    include: ['tests/**/*.test.ts'],
  },
});
