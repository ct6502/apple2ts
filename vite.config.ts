import { defineConfig, type Plugin } from "vite"
import react from "@vitejs/plugin-react"
import { execFile } from "node:child_process"
import { promisify } from "node:util"
import { rm } from "node:fs/promises"
import { resolve } from "node:path"
// Uncomment to enable HTTPS for localhost
// import basicSsl from "@vitejs/plugin-basic-ssl"

// https://vitejs.dev/config/
// The define 'process.env' is a hack so that process.env.<env var> works properly.
const execFileAsync = promisify(execFile)

const demoZooDirectPlugin: Plugin = {
  name: "demozoo-direct-local-fetch",
  configureServer(server) {
    server.middlewares.use(async (req, res, next) => {
      if (!req.url?.startsWith("/api/demozoo-direct/")) {
        next()
        return
      }

      const targetPath = req.url.replace(/^\/api\/demozoo-direct/, "")
      const targetUrl = `https://demozoo.org${targetPath}`
      try {
        const result = await execFileAsync("curl.exe", [
          "-L", "--fail", "--max-time", "60", "-sS",
          targetUrl
        ], { maxBuffer: 50 * 1024 * 1024 })
        res.statusCode = 200
        res.setHeader("Content-Type", targetPath.includes("format=json") ? "application/json" : "text/html")
        res.end(result.stdout)
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        res.statusCode = 502
        res.setHeader("Content-Type", "text/plain; charset=utf-8")
        res.end(`DemoZoo direct fetch failed: ${message}`)
      }
    })
  }
}

const cloudflarePagesAssetCleanup: Plugin = {
  name: "cloudflare-pages-asset-cleanup",
  async closeBundle() {
    if (process.env.VITE_DEMOZOO_ENABLED !== "true" && process.env.CF_PAGES !== "1") return
    // Cloudflare Pages rejects individual assets larger than 25 MiB. This
    // development disk image is replaced by the compact zip in the DemoZoo deployment.
    await rm(resolve("dist/disks/dosmaster18.po"), { force: true })
  }
}

export default defineConfig({
  base: "./",  // This makes all paths relative
  plugins: [react(), demoZooDirectPlugin, cloudflarePagesAssetCleanup,
    // Uncomment all these lines to enable HTTPS for localhost
    // basicSsl({
    //   /** name of certification */
    //   name: "test",
    //   /** custom trust domains */
    //   domains: ["*.custom.com"],
    //   /** custom certification directory */
    //   certDir: "/Users/.../.devServer/cert",
    // })
  ],
  server: {
    host: true,
    port: 6502,
    proxy: {
      "/api/ollama/tags": {
        target: "http://127.0.0.1:11434",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/ollama\/tags/, "/api/tags"),
      },
      "/api/ollama": {
        target: "http://127.0.0.1:11434",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/ollama/, "/v1/chat/completions"),
      },
      "/api/demozoo": {
        target: "https://demozoo.org",
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api\/demozoo/, "/api"),
      },
    }
  },
  build: {
    chunkSizeWarningLimit: 3000,
    sourcemap: true
  },
  define: {
    "process.env.npm_config_urlparam": JSON.stringify(process.env.npm_config_urlparam),
  }
})
