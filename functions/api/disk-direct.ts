type DiskProxyFunction = (context: {
  request: Request
}) => Promise<Response>

export const onRequestGet: DiskProxyFunction = async ({ request }) => {
  const requestUrl = new URL(request.url)
  const targetUrl = requestUrl.searchParams.get("url") || ""

  let target: URL
  try {
    target = new URL(targetUrl)
  } catch {
    return new Response("Invalid disk URL", { status: 400 })
  }

  if (target.protocol !== "http:" && target.protocol !== "https:") {
    return new Response("Unsupported disk URL protocol", { status: 400 })
  }

  try {
    const upstream = await fetch(target, {
      headers: {
        Accept: "application/octet-stream,application/zip,*/*",
        "User-Agent": "apple2ts-disk-proxy/3.5.1"
      },
      redirect: "follow"
    })
    const headers = new Headers(upstream.headers)
    headers.set("Cache-Control", "no-store")
    return new Response(upstream.body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers
    })
  } catch (error) {
    return new Response(`Disk server fetch failed: ${String(error)}`, {
      status: 502,
      headers: { "Content-Type": "text/plain; charset=utf-8" }
    })
  }
}
