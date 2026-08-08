// Optional external proxy used by static deployments such as GitHub Pages.
// Cloudflare Pages keeps using its same-origin /api routes when this is unset.
const configuredProxyBase = (import.meta.env.VITE_DEMOZOO_PROXY_URL || "")
  .trim()
  .replace(/\/+$/, "")

export const hasApple2tsProxy = configuredProxyBase.length > 0

export const apple2tsProxyPath = (path: string): string => {
  if (!configuredProxyBase) return path
  return `${configuredProxyBase}${path.startsWith("/") ? path : `/${path}`}`
}
