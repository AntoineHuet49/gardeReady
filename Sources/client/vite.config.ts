import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from "tailwindcss";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    watch: {
      usePolling: true
    },
    host: '0.0.0.0',
    port: 5173,
  },
  css: {
    postcss: {
      plugins: [
        tailwindcss(),
      ]
    },
  }
})
