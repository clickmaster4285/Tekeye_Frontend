import { defineConfig, loadEnv } from "vite"
import react from "@vitejs/plugin-react"
import { VitePWA } from "vite-plugin-pwa"
import * as path from "path"
import * as fs from "fs"

const projectRoot = path.resolve(__dirname)

// Ensure dist/icon.svg exists so vite:css-analysis doesn't throw ENOENT when resolving /icon.svg
function ensureDistIconPlugin() {
  return {
    name: "ensure-dist-icon",
    configResolved() {
      const distIcon = path.join(projectRoot, "dist", "icon.svg")
      const publicIcon = path.join(projectRoot, "public", "icon.svg")
      if (!fs.existsSync(distIcon) && fs.existsSync(publicIcon)) {
        const distDir = path.dirname(distIcon)
        if (!fs.existsSync(distDir)) fs.mkdirSync(distDir, { recursive: true })
        fs.copyFileSync(publicIcon, distIcon)
      }
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, projectRoot, "")
  const devProxyTarget = env.VITE_DEV_API_PROXY_TARGET?.trim()

  return {
  root: projectRoot,
  publicDir: path.join(projectRoot, "public"),
  plugins: [
    ensureDistIconPlugin(),
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["pakistan-customs-logo.png", "icon.svg"],
      manifest: {
        name: "Pakistan Customs — Secure Access Portal",
        short_name: "Customs Portal",
        description:
          "Pakistan Customs integrated management system — VMS, WMS, AI Analytics, and more.",
        theme_color: "#2563eb",
        background_color: "#fafafa",
        display: "standalone",
        orientation: "any",
        scope: "/",
        start_url: "/",
        lang: "en",
        dir: "ltr",
        icons: [
          {
            src: "pakistan-customs-logo.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "pakistan-customs-logo.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2,jpg,jpeg}"],
        navigateFallback: "/index.html",
        navigateFallbackDenylist: [/^\/api/, /^\/_/],
        cleanupOutdatedCaches: true,
        skipWaiting: true,
        clientsClaim: true,
      },
    }),
  ],
  optimizeDeps: {
    include: ["qrcode"],
  },
  build: {
    commonjsOptions: {
      include: [/qrcode/, /node_modules/],
      transformMixedEsModules: true,
    },
  },
  resolve: {
    alias: {
      "@": path.join(projectRoot, "src"),
    },
  },
  server: {
    port: 3000,
    ...(devProxyTarget
      ? {
          proxy: {
            "/api": { target: devProxyTarget, changeOrigin: true },
            "/media": { target: devProxyTarget, changeOrigin: true },
          },
        }
      : {}),
  },
  }
})