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
  },
}))
