import { createRequire } from 'node:module'
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

const require = createRequire(import.meta.url)

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  // tsconfig `paths` maps `react` to its type stubs; at runtime it must be the real package.
  resolve: { alias: [{ find: /^react$/, replacement: require.resolve('react') }] },
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['tests/int/**/*.int.spec.{ts,tsx}'],
  },
})
