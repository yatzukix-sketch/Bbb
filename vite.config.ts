import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    allowedHosts: true,
    headers: {
      // Allow Arena live-preview iframe
      'X-Frame-Options': 'ALLOWALL',
      'Content-Security-Policy':
        "frame-ancestors *",
    },
  },
  preview: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: true,
    headers: {
      'X-Frame-Options': 'ALLOWALL',
      'Content-Security-Policy': "frame-ancestors *",
    },
  },
})
