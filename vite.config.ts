import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
// The define 'process.env' is a hack so that process.env.<env var> works properly.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 6502,
  },
  build: {
    chunkSizeWarningLimit: 900
  },
  define: {
    'process.env': process.env
  }
})
