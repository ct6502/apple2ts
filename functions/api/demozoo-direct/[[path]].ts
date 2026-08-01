type PagesFunction = (context: {
  request: Request
  params: { path?: string }
}) => Promise<Response>

const handler: PagesFunction = async ({ request }) => {
  const incoming = new URL(request.url)
  const upstreamPath = incoming.pathname.replace(/^\/api\/demozoo-direct/, "") || "/"
  const target = new URL(`https://demozoo.org${upstreamPath}`)
  target.search = incoming.search

  try {
    const response = await fetch(target, {
      headers: {
        Accept: request.headers.get("Accept") || "application/json,text/html",
        "User-Agent": "apple2ts-demozoo-proxy/3.5.1"
      }
    })
    const headers = new Headers(response.headers)
    headers.set("Cache-Control", "no-store")
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers
    })
  } catch (error) {
    return new Response(`DemoZoo server fetch failed: ${String(error)}`, {
      status: 502,
      headers: { "Content-Type": "text/plain; charset=utf-8" }
    })
  }
}

export const onRequestGet = handler
