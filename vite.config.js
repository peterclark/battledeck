import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import eslint from 'vite-plugin-eslint2';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  // Skip the lint plugin under Vitest — `npm run lint` and the dev server cover it
  plugins: [react(), mode !== 'test' && eslint()],
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    coverage: {
      provider: 'v8',
      // json-summary is what scripts/coverage-badge.mjs reads; the rest are
      // for humans reading the CI artifact
      reporter: ['text-summary', 'json-summary', 'html'],
      reportsDirectory: './coverage',
      include: ['src/**/*.{js,jsx}'],
      exclude: [
        // Test code and its setup
        'src/**/*.test.{js,jsx}',
        'src/test/**',
        // Entrypoint: mounts the app, no branching logic of its own
        'src/main.jsx',
      ],
    },
  },
}))
