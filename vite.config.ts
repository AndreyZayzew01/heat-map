import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Bind on all interfaces to avoid localhost IPv4/IPv6 mismatch.
    host: true,
    port: 5174,
    strictPort: true,
    // Keep a stable dev origin when app is embedded by another host.
    origin: 'http://127.0.0.1:5174',
  },
})
