import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

/**
 * Vitest Configuration
 * 
 * This is a minimal, backward-compatible testing setup for the app.
 * It uses jsdom to simulate a browser environment for React component testing.
 * 
 * Safe addition: Only used when running tests, doesn't affect production build.
 */
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.js',
    // Only run tests in __tests__ directories and files ending in .test.jsx or .test.js
    include: ['src/**/*.{test,spec}.{js,jsx}', 'src/**/__tests__/**/*.{js,jsx}'],
    // Exclude node_modules and build directories
    exclude: ['node_modules', 'dist', '.git', 'build'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
