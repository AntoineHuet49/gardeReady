import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    VitePWA({
      // Chaque déploiement met à jour l'app installée sans action de l'utilisateur
      registerType: 'autoUpdate',
      manifest: {
        name: "Véri'Feu",
        short_name: "Véri'Feu",
        description: 'Vérification du matériel des engins - SDIS 49',
        lang: 'fr',
        start_url: '/',
        display: 'standalone',
        theme_color: '#C8102E',
        background_color: '#FFFFFF',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Seul le shell de l'app est mis en cache : les données /api restent toujours en réseau
        navigateFallbackDenylist: [/^\/api\//],
      },
    }),
  ],
  server: {
    watch: {
      usePolling: true
    },
    host: '0.0.0.0',
    port: 5173,
  },
})
