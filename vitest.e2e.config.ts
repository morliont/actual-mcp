import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'], // Include all test files for E2E
    globals: true,
    alias: {
      '^(\\.{1,2}/.*)\\.js$': '$1', // Handle .js imports in TypeScript
    },
    testTransformMode: {
      web: ['\\.tsx?$'],
    },
  },
});
