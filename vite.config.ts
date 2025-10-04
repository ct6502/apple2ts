import { defineConfig } from "vite"
import react from "@vitejs/plugin-react-swc"
import basicSsl from "@vitejs/plugin-basic-ssl"

// https://vitejs.dev/config/
// The define 'process.env' is a hack so that process.env.<env var> works properly.
export default defineConfig({
  base: "./",  // This makes all paths relative
  plugins: [react(),
    basicSsl({
      /** name of certification */
      name: "test",
      /** custom trust domains */
      domains: ["*.custom.com"],
      /** custom certification directory */
      certDir: "/Users/.../.devServer/cert",
    })
  ],
  server: {
    host: true,
    port: 6502,
  },
  build: {
    chunkSizeWarningLimit: 1500
  },
  define: {
    "process.env.npm_config_urlparam": JSON.stringify(process.env.npm_config_urlparam),
  }
})
