import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react-swc'

// Config séparée de vite.config.ts pour ne pas embarquer le plugin PWA dans les tests
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
  },
})
