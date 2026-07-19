import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 4173,
    strictPort: true,
  },
  preview: {
    port: 4173,
    strictPort: true,
  },
  build: {
    // Phaser 是獨立 lazy chunk；1.6 MB 門檻避免把預期的 game-engine bundle 誤報為異常。
    chunkSizeWarningLimit: 1600,
  },
  test: {
    environment: 'node',
    coverage: {
      reporter: ['text', 'json-summary'],
    },
  },
});
