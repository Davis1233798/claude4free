import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    testTimeout: 30000,
    include: ['tests/**/*.test.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['index.html'],
      exclude: [
        'node_modules/',
        'backend/',
        'tests/',
        '*.config.js',
        '.cursor/'
      ]
    }
  }
}); 