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

  let apiKey = (globalThis.process.env.DEMOZOO_API_KEY || "").trim()
  if (!apiKey && globalThis.process.stdin.isTTY) {
    console.log("\n--------------------------------------------------------------------------------")
    console.log("DemoZoo API Access Notice:")
    console.log("Due to bot protection, the DemoZoo API now requires an API key to access productions.")
    console.log("You can obtain a free API key at: https://demozoo.org/account/api_keys/")
    console.log("Note: This key is only used locally during this session to fetch the snapshot")
    console.log("and is never stored on or transmitted to any server.")
    console.log("--------------------------------------------------------------------------------\n")

    apiKey = await new Promise(resolveKey => {
      const input = readline.createInterface({ input: globalThis.process.stdin, output: globalThis.process.stdout })
      input.on("SIGINT", () => {
        console.log("\nOperation cancelled by user.")
        input.close()
        globalThis.process.exit(0)
      })
      input.question("Enter DemoZoo API key (or press Ctrl+C to cancel): ", answer => {
        input.close()
        resolveKey(answer.trim())
      })
    })

    if (!apiKey) {
      console.warn("No API key provided. DemoZoo API requests may be blocked by Cloudflare (403 Forbidden).")
    }
  }

  const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

  if (apiKey) {
    try {
      const curlTestArgs = [
        "-L", "--fail", "--max-time", "10", "-sS",
        "-H", "User-Agent: Apple2TS/3.7.0",
        "-H", "Accept: application/json",
        "-H", `Authorization: Api-Key ${apiKey}`,
        "https://demozoo.org/api/v1/auth_test/"
      ]
      const { stdout } = await execFile("curl.exe", curlTestArgs)
      const auth = JSON.parse(stdout)
      if (auth?.message === "Authenticated OK!" || auth?.user) {
        console.log(`DemoZoo API key verified${auth.user ? ` for user: ${auth.user}` : " successfully"}.`)
      } else {
        console.log("DemoZoo API key authenticated successfully.")
      }
    } catch {
      try {
        const testRes = await fetch("https://demozoo.org/api/v1/auth_test/", {
          headers: {
            "User-Agent": "Apple2TS/3.7.0",
            "Accept": "application/json",
            "Authorization": `Api-Key ${apiKey}`
          }
        })
        if (testRes.ok) {
          const auth = await testRes.json()
          console.log(`DemoZoo API key verified${auth?.user ? ` for user: ${auth.user}` : " successfully"}.`)
        } else {
          console.warn(`DemoZoo API key verification failed (HTTP ${testRes.status}). Proceeding anyway...`)
        }
      } catch (err) {
        console.warn(`DemoZoo API key verification skipped: ${err.message}. Proceeding anyway...`)
      }
    }
  }

  const formatDateStr = releaseDate => {
    if (!releaseDate) return ""
    const match = releaseDate.match(/^(\d{4})(?:-(\d{2}))?/)
    if (!match) return releaseDate
    const year = match[1]
    const month = match[2]
    if (!month) return year
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const mIndex = parseInt(month, 10) - 1
    if (mIndex >= 0 && mIndex < 12) {
      return `${months[mIndex]} ${year}`
    }
    return year
  }

  const existingItemsMap = new Map()
  if (existing?.pages) {
    for (const page of existing.pages) {
      for (const item of (page.items || [])) {
        if (item && item.id) {
          existingItemsMap.set(item.id, item)
        }
      }
    }
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
    const curlArgs = [
      "-L", "--fail", "--max-time", "15", "-sS",
      "-H", "User-Agent: Apple2TS/3.7.0",
      "-H", "Accept: application/json"
    ]
    if (apiKey) {
      curlArgs.push("-H", `Authorization: Api-Key ${apiKey}`)
    }
    curlArgs.push(url)

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        let stdout = ""
        try {
          const res = await execFile("curl.exe", curlArgs)
          stdout = res.stdout
        } catch (curlErr) {
          // Fallback to global fetch if curl is unavailable or fails
          const headers = {
            "User-Agent": "Apple2TS/3.7.0",
            "Accept": "application/json"
          }
          if (apiKey) headers["Authorization"] = `Api-Key ${apiKey}`
          const fetchRes = await fetch(url, { headers })
          if (!fetchRes.ok) throw curlErr || new Error(`Fetch failed: ${fetchRes.status}`)
          stdout = await fetchRes.text()
        }

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
        const scr = detail.screenshots?.[0]?.thumbnail_url || detail.screenshots?.[0]?.standard_url || ""
        return { downloadUrls: links, downloadUrl: links[0] || "", youtubeUrl: yt, screenshotUrl: scr }
      } catch {
        if (attempt < 3) await sleep(2000)
      }
    }
    return { downloadUrls: [], downloadUrl: "", youtubeUrl: "", screenshotUrl: "" }
  }

  let allItems = []

  if (apiKey) {
    console.log("Fetching productions list via DemoZoo API...")
    let nextUrl = "https://demozoo.org/api/v1/productions/?platform=67"
    let apiPage = 1
    const rawProds = []
    while (nextUrl) {
      try {
        let stdout = ""
        const curlArgs = [
          "-L", "--fail", "--max-time", "20", "-sS",
          "-H", "User-Agent: Apple2TS/3.7.0",
          "-H", "Accept: application/json",
          "-H", `Authorization: Api-Key ${apiKey}`,
          nextUrl
        ]
        try {
          const res = await execFile("curl.exe", curlArgs)
          stdout = res.stdout
        } catch {
          const fetchRes = await fetch(nextUrl, {
            headers: {
              "User-Agent": "Apple2TS/3.7.0",
              "Accept": "application/json",
              "Authorization": `Api-Key ${apiKey}`
            }
          })
          if (!fetchRes.ok) throw new Error(`API page fetch failed: ${fetchRes.status}`)
          stdout = await fetchRes.text()
        }
        const data = JSON.parse(stdout)
        rawProds.push(...(data.results || []))
        console.log(`DemoZoo API page ${apiPage}: ${data.results?.length || 0} productions (total so far: ${rawProds.length}/${data.count || "?"})`)
        nextUrl = data.next
        apiPage++
        if (nextUrl) await sleep(300)
      } catch (err) {
        console.warn(`DemoZoo API page fetch stopped: ${err.message}`)
        break
      }
    }

    if (rawProds.length > 0) {
      allItems = rawProds.map((prod, idx) => {
        const typeName = prod.types?.[0]?.name || "Demo"
        const subType = prod.types?.length ? `Apple II - ${typeName}` : "Apple II"
        const authors = (prod.author_nicks || []).map(a => a.name).filter(Boolean)
        const date = prod.release_date || ""
        const page = Math.floor(idx / PAGE_SIZE) + 1
        const existingItem = existingItemsMap.get(prod.id)

        return {
          id: prod.id,
          title: prod.title,
          subType,
          type: classifyProductionType(subType),
          author: authors.join(" / "),
          dateStr: formatDateStr(date),
          year: date.match(/\d{4}/)?.[0] || "",
          screenshotUrl: existingItem?.screenshotUrl || "",
          demozooUrl: prod.demozoo_url || `https://demozoo.org/productions/${prod.id}/`,
          page,
          downloadUrl: existingItem?.downloadUrl || "",
          downloadUrls: existingItem?.downloadUrls || [],
          youtubeUrl: existingItem?.youtubeUrl || ""
        }
      })
    }
  }

  if (allItems.length === 0) {
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
    allItems = pages.flatMap(p => p.items)
  }

  console.log(`Pre-fetching download links for ${allItems.length} productions...`)
  let linksCount = 0
  let fetchAttempts = 0
  for (let i = 0; i < allItems.length; i++) {
    const item = allItems[i]
    if (item.downloadUrls?.length && item.screenshotUrl) {
      linksCount++
      continue
    }
    const res = await fetchDetailWithRetry(item.id)
    fetchAttempts++
    if (res.downloadUrl && !item.downloadUrl) {
      item.downloadUrl = res.downloadUrl
      item.downloadUrls = res.downloadUrls
    }
    if (res.screenshotUrl && !item.screenshotUrl) {
      item.screenshotUrl = res.screenshotUrl
    }
    if (res.youtubeUrl && !item.youtubeUrl) {
      item.youtubeUrl = res.youtubeUrl
    }
    if (item.downloadUrls?.length) {
      linksCount++
    }
    if ((i + 1) % 50 === 0 || i + 1 === allItems.length) {
      console.log(`Pre-fetch progress: ${i + 1}/${allItems.length} (${linksCount} with links)`)
    }
    if (fetchAttempts > 0) {
      // Respect DemoZoo policy: leave pause between repeated detail requests
      await sleep(500)
    }
  }
  console.log(`Pre-fetched download links: ${linksCount}/${allItems.length}`)

  const pages = []
  for (let i = 0; i < allItems.length; i += PAGE_SIZE) {
    const pageNum = Math.floor(i / PAGE_SIZE) + 1
    const pageItems = allItems.slice(i, i + PAGE_SIZE).map(it => ({ ...it, page: pageNum }))
    pages.push({ page: pageNum, items: pageItems })
  }

  await mkdir(dirname(OUTPUT), { recursive: true })
  await writeFile(OUTPUT, JSON.stringify({
    source: "https://demozoo.org/productions/?platform=67&production_type=",
    generatedAt: new Date().toISOString(),
    pageSize: PAGE_SIZE,
    pageCount: pages.length,
    pages
  }, null, 2) + "\n")
  console.log(`DemoZoo snapshot saved successfully (${pages.length} pages, ${allItems.length} productions).`)
}

main().catch(error => {
  console.error(`DemoZoo snapshot failed: ${error.message}`)
  globalThis.process.exitCode = 1
})
