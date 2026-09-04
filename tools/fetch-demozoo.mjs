import { mkdir, readFile, writeFile } from "node:fs/promises"
import { dirname, resolve } from "node:path"
import { execFile as execFileCallback } from "node:child_process"
import { promisify } from "node:util"
import readline from "node:readline"

const execFile = promisify(execFileCallback)

const PAGE_SIZE = 50
const TARGET = page => `https://demozoo.org/productions/?platform=67&production_type=&page=${page}`
const OUTPUT = resolve("public/data/demozoo_snapshot.json")


const proxies = url => [
  `https://proxy.corsfix.com/?url=${encodeURIComponent(url)}`,
  `https://proxy.corsfix.com/?${url}`
]

const corsfixOrigin = globalThis.process.env.DEMOZOO_ORIGIN || "http://localhost:6502"

const strip = value => value
  .replace(/<script[\s\S]*?<\/script>/gi, " ")
  .replace(/<style[\s\S]*?<\/style>/gi, " ")
  .replace(/<[^>]+>/g, " ")
  .replace(/&nbsp;/gi, " ")
  .replace(/&amp;/gi, "&")
  .replace(/&quot;/gi, "\"")
  .replace(/&#39;/gi, "'")
  .replace(/&#x27;/gi, "'")
  .replace(/\s+/g, " ")
  .trim()

const absolute = url => {
  if (!url) return ""
  return url.startsWith("http") ? url : new URL(url, "https://demozoo.org").toString()
}

const first = (value, expression) => value.match(expression)?.[1]?.trim() || ""

const classifyProductionType = value => {
  const normalized = value.toLowerCase()
  if (normalized.includes("cracktro")) return "Cracktro"
  if (normalized.includes("musicdisk") || normalized.includes("music")) return "Music"
  if (normalized.includes("intro")) return "Intro"
  if (normalized.includes("game")) return "Game"
  return "Demo"
}

function parsePage(html, page) {
  const unique = new Map()
  const rows = [...html.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)].map(match => match[1])

  for (const block of rows) {
    const match = block.match(/href=["'](\/productions\/(\d+)\/?)["'][^>]*>([\s\S]*?)<\/a>/i)
    if (!match) continue
    const id = Number(match[2])
    if (!id || unique.has(id)) continue

    const title = strip(match[3])
    const image = first(block, /(?:src|data-src)=["']([^"']*(?:screens|thumbnail|image)[^"']*)["']/i)
    const text = strip(block)
    const date = text.match(/\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4}\b|\b(?:19|20)\d{2}\b/i)?.[0] || ""
    const platformType = (block.match(/Apple II[^<]{0,100}/i)?.[0] || "").replace(/\s+/g, " ").trim()
    const authors = [...block.matchAll(/href=["']\/(?:groups|sceners)\/[^"']+["'][^>]*>([\s\S]*?)<\/a>/gi)]
      .map(author => strip(author[1]))
      .filter(Boolean)
      .filter((author, authorIndex, all) => all.indexOf(author) === authorIndex)

    unique.set(id, {
      id,
      title,
      subType: platformType || "Apple II",
      type: classifyProductionType(platformType),
      author: authors.join(" / "),
      dateStr: date,
      year: date.match(/\d{4}/)?.[0] || "",
      screenshotUrl: absolute(image),
      demozooUrl: `https://demozoo.org/productions/${id}/`,
      page
    })
  }

  return [...unique.values()].slice(0, PAGE_SIZE)
}

async function fetchText(url) {
  let lastError
  const endpoints = [url, ...proxies(url)]
  for (const endpoint of endpoints) {
    try {
      if (endpoint === url && globalThis.process.platform === "win32") {
        const { stdout } = await execFile("curl.exe", ["-L", "--fail", "--max-time", "60", "-sS", url], {
          maxBuffer: 10 * 1024 * 1024
        })
        if (/just a moment|enable javascript and cookies|cf-chl-/i.test(stdout)) {
          throw new Error("DemoZoo returned a Cloudflare challenge")
        }
        return stdout
      }
      const headers = {
        Accept: "text/html,application/xhtml+xml",
      }
      if (endpoint !== url) headers.Origin = corsfixOrigin
      const response = await fetch(endpoint, { headers })
      if (!response.ok) throw new Error(`Corsfix ${response.status} ${response.statusText}`)
      const text = await response.text()
      if (/just a moment|enable javascript and cookies|cf-chl-/i.test(text)) {
        throw new Error(`${endpoint === url ? "DemoZoo" : "Corsfix"} returned a Cloudflare challenge`)
      }
      return text
    } catch (error) {
      lastError = error
    }
  }
  throw lastError || new Error("Unable to fetch DemoZoo through Corsfix")
}

async function main() {
  let existing
  try {
    existing = JSON.parse(await readFile(OUTPUT, "utf8"))
  } catch {
    existing = null
  }

  const hasSnapshot = Boolean(existing?.pages?.length)
  const promptRefresh = globalThis.process.argv.includes("--prompt")
  let shouldRefresh = !hasSnapshot

  if (promptRefresh && hasSnapshot && globalThis.process.stdin.isTTY) {
    const defaultAnswer = "n"
    const question = "DemoZoo data already exists. Update all available pages? [y/N] (default N in 3 seconds): "
    shouldRefresh = await new Promise(resolvePrompt => {
      const input = readline.createInterface({ input: globalThis.process.stdin, output: globalThis.process.stdout })
      let finished = false
      const finish = answer => {
        if (finished) return
        finished = true
        clearTimeout(timeout)
        input.close()
        const normalized = answer.trim().toLowerCase()
        resolvePrompt(normalized ? normalized === "y" || normalized === "yes" : defaultAnswer === "y")
      }
      const timeout = setTimeout(() => finish(""), 3000)
      input.question(question, finish)
    })
  } else if (!promptRefresh) {
    // Build/deploy must be non-interactive: create the first snapshot if
    // needed, otherwise keep the existing one unchanged.
    shouldRefresh = !hasSnapshot
  }

  if (!shouldRefresh) {
    console.log(hasSnapshot ? "Keeping the existing DemoZoo snapshot." : "DemoZoo snapshot was not fetched.")
    return
  }

  const diskExts = [".hdv", ".2mg", ".dsk", ".woz", ".po", ".do", ".bin", ".bas", ".nib", ".2img", ".d13", ".dc", ".img", ".zip", ".7z", ".gz", ".tar"]
  const isDisk = url => {
    try {
      const path = decodeURIComponent(new URL(url).pathname).toLowerCase()
      return diskExts.some(ext => path.endsWith(ext))
    } catch {
      return false
    }
  }

  const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

  const normalizeUrl = raw => {
    if (!raw) return ""
    let trimmed = raw.trim()
    const match = trimmed.match(/^https?:\/\/files\.scene\.org\/(?:view|get)\/(.+)$/i)
    if (match) trimmed = `https://archive.scene.org/pub/${match[1]}`
    if (trimmed.includes("marqueeedesign_")) {
      trimmed = trimmed.replace("marqueeedesign_", "marqueedesign_")
    }
    const brutalLocsMatch = trimmed.match(/^https?:\/\/(?:www\.)?brutaldeluxe\.fr\/products\/french\/locs\/(.+)$/i)
    if (brutalLocsMatch) {
      trimmed = `https://web.archive.org/web/0id_/http://www.brutaldeluxe.fr/products/french/locs/${brutalLocsMatch[1]}`
    }
    return trimmed
  }

  const fetchDetailWithRetry = async id => {
    const url = `https://demozoo.org/api/v1/productions/${id}/?format=json`
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const { stdout } = await execFile("curl.exe", ["-L", "--fail", "--max-time", "15", "-sS", url])
        if (/just a moment|enable javascript and cookies|cf-chl-/i.test(stdout)) {
          console.warn(`CF challenge on item ${id}, waiting 3s (attempt ${attempt})`)
          await sleep(3000)
          continue
        }
        const detail = JSON.parse(stdout)
        const links = (detail.download_links || [])
          .filter(link => Boolean(link.url))
          .map(link => ({ ...link, url: normalizeUrl(link.url) }))
          .sort((a, b) => {
            const sa = isDisk(a.url) ? 100 : (/download/i.test(a.link_class || "") ? 10 : 0)
            const sb = isDisk(b.url) ? 100 : (/download/i.test(b.link_class || "") ? 10 : 0)
            return sb - sa
          })
          .map(link => link.url)
        const yt = (detail.external_links || []).find(link => /youtube/i.test(link.link_class || "") || /youtube\.com|youtu\.be/i.test(link.url || ""))?.url || ""
        return { downloadUrls: links, downloadUrl: links[0] || "", youtubeUrl: yt }
      } catch {
        if (attempt < 3) await sleep(2000)
      }
    }
    return { downloadUrls: [], downloadUrl: "", youtubeUrl: "" }
  }

  const pages = []
  for (let page = 1; page <= 1000; page++) {
    try {
      const html = await fetchText(TARGET(page))
      const items = parsePage(html, page)
      if (items.length === 0) {
        if (page === 1) throw new Error("No productions parsed from page 1")
        break
      }
      pages.push({ page, items })
      console.log(`DemoZoo page ${page}: ${items.length} productions`)
      if (items.length < PAGE_SIZE) break
    } catch (error) {
      if (existing?.pages?.length) {
        console.warn(`DemoZoo refresh stopped at page ${page}: ${error.message}`)
        console.warn(`Keeping the previous snapshot (${existing.pageCount || existing.pages.length} pages).`)
        return
      }
      throw error
    }
  }

  const allItems = pages.flatMap(p => p.items)
  console.log(`Pre-fetching download links for ${allItems.length} productions...`)
  let linksCount = 0
  for (let i = 0; i < allItems.length; i++) {
    const item = allItems[i]
    if (item.downloadUrls?.length) {
      linksCount++
      continue
    }
    const res = await fetchDetailWithRetry(item.id)
    if (res.downloadUrl) {
      item.downloadUrl = res.downloadUrl
      item.downloadUrls = res.downloadUrls
      linksCount++
    }
    if (res.youtubeUrl) {
      item.youtubeUrl = res.youtubeUrl
    }
    if ((i + 1) % 50 === 0 || i + 1 === allItems.length) {
      console.log(`Pre-fetch progress: ${i + 1}/${allItems.length} (${linksCount} with links)`)
    }
    await sleep(150)
  }
  console.log(`Pre-fetched download links: ${linksCount}/${allItems.length}`)

  await mkdir(dirname(OUTPUT), { recursive: true })
  await writeFile(OUTPUT, JSON.stringify({
    source: "https://demozoo.org/productions/?platform=67&production_type=",
    generatedAt: new Date().toISOString(),
    pageSize: PAGE_SIZE,
    pageCount: pages.length,
    pages
  }, null, 2) + "\n")
}

main().catch(error => {
  console.error(`DemoZoo snapshot failed: ${error.message}`)
  globalThis.process.exitCode = 1
})
