import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  // Load environment variables based on current mode (development/production)
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      tailwindcss(),
      react(),
    ],
    server: {
      proxy: {
        // Intercept local browser requests to "/api" 
        '/api': {
          target: 'https://api.coingecko.com/api/v3',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''), // Strip "/api" from target request URL
          headers: {
            // Automatically inject the local API key into outgoing request headers
            'x-cg-demo-api-key': env.VITE_API_KEY || ''
          }
        }
      }
    }
  }
})