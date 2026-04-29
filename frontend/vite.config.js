import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// ✅ FIX: Added server.proxy so that in development, API calls to /api/* are
// forwarded to Spring Boot (port 8080). This means you can also use relative
// paths like "/api/..." in your code and avoid CORS issues entirely during dev.
//
// Your current code uses axios with baseURL: "http://localhost:8080/app" which
// also works because Spring's CorsConfig allows origin http://localhost:5173.
// This proxy config is an optional extra safety net.

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Proxy /api calls → Spring Boot (optional convenience)
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
