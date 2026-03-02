import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths(), react()],

  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest-setup.ts'],
    globalSetup: ['./vitest.global-setup.ts'],
    fileParallelism: true,
    testTimeout: 30_000,
    hookTimeout: 30_000,
  },
})
