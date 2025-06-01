import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      reporter: ['text', 'html', 'json'],
      exclude: [
        'node_modules/**',
        'dist/**',
        '**/*.config.js',
        'coverage/**'
      ]
    },
    // 模擬 Cloudflare Workers 環境
    setupFiles: ['./tests/setup.js']
  }
}); 