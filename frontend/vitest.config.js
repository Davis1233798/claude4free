import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    testTimeout: 60000,
    hookTimeout: 10000,
    reporter: ['verbose', 'json'],
    outputFile: 'test-results.json'
  }
}); 