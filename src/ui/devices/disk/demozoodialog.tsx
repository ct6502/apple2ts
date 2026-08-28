import { useEffect, useMemo, useState } from "react"
import "./demozoodialog.css"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faStar as faStarOutline } from "@fortawesome/free-regular-svg-icons"
import { faStar as faStarSolid } from "@fortawesome/free-solid-svg-icons"
import { DiskBookmarks } from "./diskbookmarks"
import { CLOUD_SYNC } from "../../../common/utility"
import { svgDemoZooLogo, svgDemoZooTitle } from "../../img/icon_demozoo"
import { DISK_COLLECTION_ITEM_TYPE } from "../../diskdialog/diskpanel_utils"
import { showGlobalProgressModal } from "../../ui_utilities"
import { handleSetDiskFromURL } from "./driveprops"
import { apple2tsProxyPath, hasApple2tsProxy } from "./apple2tsproxy"
import { useTranslation } from "../../../i18n/useTranslation"
export interface DemoZooItem {
  id: number
  title: string
  subType: string
  author: string
  year: string
  dateStr: string
  type: string
  screenshotUrl: string
  demozooUrl: string
  page: number
  downloadUrl?: string
  downloadLinkClass?: string
  externalUrl?: string
}

interface DemoZooSnapshot {
  pageCount: number
  pages: Array<{ page: number; items: DemoZooItem[] }>
}

export const demoZooTypeFilters = [
  { id: "all", labelKey: "demoZoo.all" },
  { id: "demo", labelKey: "demoZoo.demo" },
  { id: "intro", labelKey: "demoZoo.intro" },
  { id: "cracktro", labelKey: "demoZoo.cracktro" },
  { id: "music", labelKey: "demoZoo.music" },
]

export const loadDemoZooSnapshot = async (): Promise<DemoZooItem[]> => {
  const response = await fetch(`${import.meta.env.BASE_URL}data/demozoo_snapshot.json`, { cache: "no-store" })
  if (!response.ok) throw new Error(`Snapshot request failed: ${response.status}`)
  const snapshot = await response.json() as DemoZooSnapshot
  return snapshot.pages.flatMap(page => page.items)
}

export const filterDemoZooItems = (items: DemoZooItem[], type: string, query: string) => {
  const normalizedQuery = query.trim().toLowerCase()
  return items.filter(item =>
    (type === "all" || item.type.toLowerCase().includes(type.toLowerCase())) &&
    (!normalizedQuery || item.title.toLowerCase().includes(normalizedQuery) ||
      item.author.toLowerCase().includes(normalizedQuery)))
}

export const createDemoZooCloudData = (item: DemoZooItem, downloadUrl = item.demozooUrl): CloudData => ({
  providerName: "DemoZoo",
  syncStatus: CLOUD_SYNC.INACTIVE,
  syncInterval: -1,
  lastSyncTime: Number.MAX_VALUE,
  fileName: item.title,
  itemId: `demozoo_${item.id}`,
  apiEndpoint: "",
  downloadUrl,
  detailsUrl: item.demozooUrl,
  fileSize: -1,
})

const DEMOZOO_DIALOG_STATE_KEY = "apple2ts.demozoo.dialogState"
interface DemoZooDialogState {
  currentPage: number
  searchQuery: string
  selectedType: string
}

const readDemoZooDialogState = (): DemoZooDialogState => {
  const defaultState = { currentPage: 1, searchQuery: "", selectedType: "all" }
  try {
    const saved = JSON.parse(localStorage.getItem(DEMOZOO_DIALOG_STATE_KEY) || "null") as Partial<DemoZooDialogState> | null
    return {
      currentPage: Number.isInteger(saved?.currentPage) && (saved?.currentPage || 0) > 0
        ? saved?.currentPage || 1
        : defaultState.currentPage,
      searchQuery: typeof saved?.searchQuery === "string" ? saved.searchQuery : defaultState.searchQuery,
      selectedType: typeof saved?.selectedType === "string" ? saved.selectedType : defaultState.selectedType
    }
  } catch {
    return defaultState
  }
}

interface DemoZooDialogResultProps {
  item: DemoZooItem
  onTileClick: (item: DemoZooItem) => void
  diskBookmarks: DiskBookmarks
}

const DemoZooResultCard = (props: DemoZooDialogResultProps) => {
  const { t } = useTranslation()
  const item = props.item
  const [imageError, setImageError] = useState(false)
  const [bookmarked, setBookmarked] = useState<boolean>(props.diskBookmarks.contains(`demozoo_${item.id}`))

  const handleTileClick = () => {
    props.onTileClick(item)
  }

  const handleBookmarkAddClicked = (e: React.MouseEvent) => {
    e.stopPropagation()
    const itemId = `demozoo_${item.id}`
    props.diskBookmarks.set({
      type: DISK_COLLECTION_ITEM_TYPE.DEMOZOO,
      id: itemId,
      title: item.title,
      screenshotUrl: new URL(item.screenshotUrl || "https://demozoo.org/static/images/demozoo-logo.png"),
      diskUrl: item.demozooUrl,
      detailsUrl: new URL(item.demozooUrl),
      lastUpdated: new Date(),
      cloudData: createDemoZooCloudData(item)
    })
    setBookmarked(true)
  }

  const handleBookmarkRemoveClicked = (e: React.MouseEvent) => {
    e.stopPropagation()
    props.diskBookmarks.remove(`demozoo_${item.id}`)
    setBookmarked(false)
  }

  return (
    <div className="dzd-result-tile">
      <div className="dzd-result-bookmark">
        <FontAwesomeIcon
          size="lg"
          className="dzd-result-bookmark-icon"
          onClick={bookmarked ? handleBookmarkRemoveClicked : handleBookmarkAddClicked}
          title={bookmarked ? t("disk.clickToRemoveFromDiskCollection") : t("disk.clickToAddToDiskCollection")}
          icon={bookmarked ? faStarSolid : faStarOutline}
        />
      </div>

      <div className="dzd-result-image-container" onClick={handleTileClick} title={t("disk.clickToLoadDiskImage")}>
        {!imageError && item.screenshotUrl ? (
          <img
            className="dzd-result-image"
            src={item.screenshotUrl}
            alt={item.title}
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="dzd-result-image-fallback">
            {svgDemoZooLogo}
            <div>{item.title}</div>
          </div>
        )}
      </div>

      <div className="dzd-result-content" onClick={handleTileClick} title={t("disk.clickToLoadDiskImage")}>
        <div>
          <div className="dzd-result-title" title={item.title}>
            {item.title}
          </div>
          {item.subType && (
            <div className="dzd-result-subtype" title={item.subType}>
              {item.subType}
            </div>
          )}
          {item.author && (
            <div className="dzd-result-author" title={item.author}>
              {item.author}
            </div>
          )}
        </div>
        <div className="dzd-result-meta">
          <span className="dzd-result-tag">{item.type}</span>
          {(item.dateStr || item.year) && <span className="dzd-result-date">{item.dateStr || item.year}</span>}
        </div>
      </div>
    </div>
  )
}

interface RawDemoZooApiProduction {
  id: number
  title: string
  supertype?: string
  author_nicks?: Array<{ name: string }>
  release_date?: string
  screenshots?: Array<{ thumbnail_url?: string; standard_url?: string }>
  download_links?: Array<{ url: string; link_class?: string }>
  external_links?: Array<{ link_class: string; url: string }>
}

const diskDownloadExtensions = [
  ".hdv", ".2mg", ".dsk", ".woz", ".po", ".do", ".bin", ".bas", ".nib", ".2img", ".d13", ".dc", ".img",
  ".zip", ".7z", ".gz", ".tar"
]

const isDiskDownloadUrl = (url: string) => {
  try {
    const pathname = decodeURIComponent(new URL(url).pathname).toLowerCase()
    return diskDownloadExtensions.some(extension => pathname.endsWith(extension))
  } catch {
    return false
  }
}

const chooseDemoZooDownloadUrls = (links: RawDemoZooApiProduction["download_links"] = []) => {
  return [...links]
    .filter(link => Boolean(link.url))
    .sort((left, right) => {
      const leftScore = isDiskDownloadUrl(left.url) ? 100 : /download/i.test(left.link_class || "") ? 10 : 0
      const rightScore = isDiskDownloadUrl(right.url) ? 100 : /download/i.test(right.link_class || "") ? 10 : 0
      return rightScore - leftScore
    })
    .map(link => link.url)
}

const parseDemoZooProductionPage = (html: string, id: number): RawDemoZooApiProduction => {
  const links: Array<{ url: string; link_class?: string }> = []
  const externalLinks: Array<{ url: string; link_class: string }> = []
  const hrefPattern = /<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi

  for (const match of html.matchAll(hrefPattern)) {
    const rawUrl = match[1].trim()
    if (!rawUrl || rawUrl.startsWith("#") || rawUrl.startsWith("javascript:")) continue
    let url = rawUrl
    try {
      url = new URL(rawUrl, "https://demozoo.org").toString()
    } catch {
      continue
    }

    if (isDiskDownloadUrl(url)) {
      links.push({ url, link_class: "disk image" })
    } else if (/youtube\.com|youtu\.be/i.test(url)) {
      externalLinks.push({ url, link_class: "YouTube" })
    }
  }

  return {
    id,
    title: `DemoZoo production ${id}`,
    download_links: links,
    external_links: externalLinks
  }
}

const resolveExternalDownloadUrls = async (url: string): Promise<string[]> => {
  try {
    new URL(url)
  } catch {
    return []
  }

  if (isDiskDownloadUrl(url)) {
    return [url]
  }

  const html = await fetchExternalServerText(url)
  const candidates: string[] = []
  const hrefPattern = /<a\b[^>]*href=["']([^"']+)["'][^>]*>/gi
  for (const match of html.matchAll(hrefPattern)) {
    const href = match[1].trim()
    try {
      const candidate = new URL(href, url).toString()
      if (isDiskDownloadUrl(candidate) && !candidates.includes(candidate)) {
        candidates.push(candidate)
      }
    } catch {
      // Ignore malformed links.
    }
  }

  if (candidates.length === 0) throw new Error(`No disk image found on external page: ${url}`)
  return candidates
}

const fetchDemoZooServerText = async (url: string): Promise<string> => {
  const parsed = new URL(url)
  const response = await fetch(apple2tsProxyPath(`/api/demozoo-direct${parsed.pathname}${parsed.search}`))
  if (!response.ok) throw new Error(`DemoZoo server fetch failed: ${response.status}`)
  return response.text()
}

const fetchExternalServerText = async (url: string): Promise<string> => {
  if (hasApple2tsProxy || /\.pages\.dev$/i.test(window.location.hostname)) {
    const response = await fetch(apple2tsProxyPath(`/api/disk-direct?url=${encodeURIComponent(url)}`))
    if (!response.ok) throw new Error(`External server fetch failed: ${response.status}`)
    return response.text()
  }
  const response = await fetch(url)
  if (!response.ok) throw new Error(`External server fetch failed: ${response.status}`)
  return response.text()
}

const fetchDemoZooProduction = async (id: number): Promise<RawDemoZooApiProduction> => {
  let apiError: unknown
  if (import.meta.env.DEV) {
    try {
      const localResponse = await fetchDemoZooServerText(`https://demozoo.org/api/v1/productions/${id}/?format=json`)
      return JSON.parse(localResponse) as RawDemoZooApiProduction
    } catch {
      apiError = new Error("Local DemoZoo API proxy failed")
    }
  }

  try {
    const detailUrl = `https://demozoo.org/api/v1/productions/${id}/?format=json`
    const text = await fetchDemoZooServerText(detailUrl)
    return JSON.parse(text) as RawDemoZooApiProduction
  } catch (error) {
    apiError = error
  }

  // DemoZoo's public production page contains the real download anchors even
  // when its JSON endpoint is unavailable. Parse that page as a fallback.
  try {
    const pageUrl = `https://demozoo.org/productions/${id}/`
    const html = await fetchDemoZooServerText(pageUrl)
    return parseDemoZooProductionPage(html, id)
  } catch (pageError) {
    throw new Error(`DemoZoo API and web page unavailable: ${String(pageError || apiError)}`)
  }
}

export const loadDemoZooResult = async (item: DemoZooItem, driveIndex: number): Promise<boolean> => {
  let downloadUrls = item.downloadUrl ? [item.downloadUrl] : []
  if (downloadUrls.length === 0) {
    const detail = await fetchDemoZooProduction(item.id)
    downloadUrls = chooseDemoZooDownloadUrls(detail.download_links)
  }

  const resolvedDownloadUrls: string[] = []
  for (const candidateUrl of downloadUrls) {
    try {
      const resolvedUrls = await resolveExternalDownloadUrls(candidateUrl)
      for (const resolvedUrl of resolvedUrls) {
        if (!resolvedDownloadUrls.includes(resolvedUrl)) resolvedDownloadUrls.push(resolvedUrl)
      }
    } catch (error) {
      console.warn(`Unable to resolve DemoZoo download page: ${candidateUrl}`, error)
    }
  }

  for (const downloadUrl of resolvedDownloadUrls) {
    if (await handleSetDiskFromURL(downloadUrl, undefined, driveIndex, createDemoZooCloudData(item, downloadUrl))) {
      return true
    }
  }
  return false
}

const classifyProductionType = (value: string): string => {
  const normalized = value.toLowerCase()
  if (normalized.includes("cracktro")) return "Cracktro"
  if (normalized.includes("musicdisk") || normalized.includes("music")) return "Music"
  if (normalized.includes("intro")) return "Intro"
  if (normalized.includes("game")) return "Game"
  return "Demo"
}

const parseDemoZooListPage = (html: string, page: number): DemoZooItem[] => {
  const document = new DOMParser().parseFromString(html, "text/html")
  const seen = new Set<number>()
  const items: DemoZooItem[] = []

  for (const link of Array.from(document.querySelectorAll<HTMLAnchorElement>("a[href^=\"/productions/\"]"))) {
    const match = link.pathname.match(/^\/productions\/(\d+)\/?$/)
    if (!match) continue
    const id = Number(match[1])
    if (!id || seen.has(id)) continue
    seen.add(id)

    const row = link.closest("li, tr, article") || link.parentElement
    if (!row) continue
    const text = row.textContent?.replace(/\s+/g, " ").trim() || ""
    const dateStr = text.match(/\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4}\b|\b(?:19|20)\d{2}\b/i)?.[0] || ""
    const platformText = text.match(/Apple II[^|\n]{0,120}/i)?.[0]?.trim() || "Apple II"
    const authors = Array.from(row.querySelectorAll<HTMLAnchorElement>("a[href^=\"/groups/\"], a[href^=\"/sceners/\"]"))
      .map(author => author.textContent?.replace(/\s+/g, " ").trim() || "")
      .filter(Boolean)
    const image = row.querySelector<HTMLImageElement>("img[src], img[data-src], img[data-original]")
    const imageUrl = image?.getAttribute("data-src") || image?.getAttribute("data-original") || image?.src || ""

    items.push({
      id,
      title: link.textContent?.replace(/\s+/g, " ").trim() || `Production ${id}`,
      subType: platformText,
      type: classifyProductionType(platformText),
      author: Array.from(new Set(authors)).join(" / "),
      dateStr,
      year: dateStr.match(/\d{4}/)?.[0] || "",
      screenshotUrl: imageUrl ? new URL(imageUrl, "https://demozoo.org").toString() : "",
      demozooUrl: `https://demozoo.org/productions/${id}/`,
      page
    })
  }

  return items.slice(0, 50)
}

export interface DemoZooDialogProps {
  driveIndex: number
  open: boolean
  onClose: () => void
  onLoadSuccess?: () => void
}

const DemoZooDialog = (props: DemoZooDialogProps) => {
  const { t } = useTranslation()
  const [savedDialogState] = useState(readDemoZooDialogState)
  const [diskBookmarks] = useState<DiskBookmarks>(new DiskBookmarks())
  const [searchQuery, setSearchQuery] = useState<string>(savedDialogState.searchQuery)
  const [selectedType, setSelectedType] = useState<string>(savedDialogState.selectedType)
  const [currentPage, setCurrentPage] = useState<number>(savedDialogState.currentPage)
  const [pageInput, setPageInput] = useState<string>(String(savedDialogState.currentPage))
  const [youtubeModalInfo, setYoutubeModalInfo] = useState<{ open: boolean; title: string; url: string }>({
    open: false,
    title: "",
    url: ""
  })

  const ITEMS_PER_PAGE = 50
  const [liveItems, setLiveItems] = useState<DemoZooItem[]>([])
  const [snapshotPageCount, setSnapshotPageCount] = useState<number>(1)

  useEffect(() => {
    if (!props.open) return

    const loadSnapshot = async () => {
      try {
        const response = await fetch(`${import.meta.env.BASE_URL}data/demozoo_snapshot.json`, { cache: "no-store" })
        if (!response.ok) throw new Error(`Snapshot request failed: ${response.status}`)
        const snapshot = await response.json() as DemoZooSnapshot
        let pages = snapshot.pages
        const snapshotItems = pages.flatMap(page => page.items)
        // Render the last known local data immediately. A live refresh is
        // optional and must never turn a usable list into an empty dialog.
        setLiveItems(snapshotItems)
        setSnapshotPageCount(pages.length || 1)
        if (snapshot.pageCount < 1) {
          try {
            const freshPages: Array<{ page: number; items: DemoZooItem[] }> = []
            for (let page = 1; page <= 1000; page++) {
              const html = await fetchDemoZooServerText(`https://demozoo.org/productions/?platform=67&production_type=&page=${page}`)
              const items = parseDemoZooListPage(html, page)
              if (items.length === 0) {
                if (page === 1) throw new Error("No productions parsed from DemoZoo page 1")
                break
              }
              freshPages.push({ page, items })
              if (items.length < ITEMS_PER_PAGE) break
            }
            pages = freshPages
          } catch (error) {
            console.warn("DemoZoo live refresh unavailable; keeping local snapshot", error)
          }
        }
        const items = pages.flatMap(page => page.items)
        setLiveItems(items)
        setSnapshotPageCount(pages.length || 1)
        // Read the latest persisted value when reopening. `savedDialogState`
        // is captured only when the dialog component mounts, so using it here
        // would reset a page selected during an earlier dialog session.
        const restoredPage = Math.min(readDemoZooDialogState().currentPage, pages.length || 1)
        setCurrentPage(restoredPage)
        setPageInput(String(restoredPage))
      } catch (error) {
        console.warn("DemoZoo snapshot is unavailable", error)
        setLiveItems([])
      }
    }

    void loadSnapshot()
  }, [props.open, savedDialogState.currentPage])

  useEffect(() => {
    try {
      localStorage.setItem(DEMOZOO_DIALOG_STATE_KEY, JSON.stringify({ currentPage, searchQuery, selectedType }))
    } catch {
      // localStorage may be unavailable in private browsing or embedded contexts.
    }
  }, [currentPage, searchQuery, selectedType])

  const filteredResults = useMemo(() => {
    let items = liveItems
    if (selectedType !== "all") {
      items = items.filter(item => item.type.toLowerCase().includes(selectedType.toLowerCase()))
    }
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase()
      items = items.filter(
        item => item.title.toLowerCase().includes(q) || item.author.toLowerCase().includes(q)
      )
    }
    return items
  }, [liveItems, selectedType, searchQuery])

  const hasLocalFilter = selectedType !== "all" || searchQuery.trim().length > 0
  const totalPages = hasLocalFilter
    ? Math.ceil(filteredResults.length / ITEMS_PER_PAGE) || 1
    : snapshotPageCount
  const displayPage = Math.min(Math.max(currentPage, 1), totalPages)

  const goToPage = (page: number) => {
    const nextPage = Math.min(Math.max(page, 1), totalPages)
    setCurrentPage(nextPage)
    setPageInput(String(nextPage))
  }

  const handlePageInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      const requestedPage = Number.parseInt(pageInput, 10)
      goToPage(Number.isNaN(requestedPage) ? displayPage : requestedPage)
    }
  }

  const currentPagedItems = useMemo(() => {
    const start = (displayPage - 1) * ITEMS_PER_PAGE
    return filteredResults.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredResults, displayPage])

  const handleClose = () => {
    props.onClose()
  }

  const handleTileClick = async (item: DemoZooItem) => {
    showGlobalProgressModal(true, t("disk.downloadingDisk"))
    try {
      let downloadUrl = item.downloadUrl || ""
      let downloadUrls = downloadUrl ? [downloadUrl] : []
      let externalUrl = item.externalUrl || ""
      if (!downloadUrl && !externalUrl) {
        const detail = await fetchDemoZooProduction(item.id)
        downloadUrls = chooseDemoZooDownloadUrls(detail.download_links)
        downloadUrl = downloadUrls[0] || ""
        externalUrl = detail.external_links?.find(link =>
          /youtube\.com|youtu\.be/i.test(link.url)
        )?.url || detail.external_links?.[0]?.url || ""
      }

      const resolvedDownloadUrls: string[] = []
      for (const candidateUrl of downloadUrls) {
        try {
          const resolvedUrls = await resolveExternalDownloadUrls(candidateUrl)
          for (const resolvedUrl of resolvedUrls) {
            if (!resolvedDownloadUrls.includes(resolvedUrl)) {
              resolvedDownloadUrls.push(resolvedUrl)
            }
          }
        } catch (error) {
          console.warn(`Unable to resolve DemoZoo download page: ${candidateUrl}`, error)
        }
      }
      downloadUrls = resolvedDownloadUrls
      downloadUrl = downloadUrls[0] || ""

      showGlobalProgressModal(false)

      if (!downloadUrl && externalUrl) {
        setYoutubeModalInfo({
          open: true,
          title: item.title,
          url: externalUrl
        })
        return
      }

      if (downloadUrl) {
        let loaded = false
        for (const candidateUrl of downloadUrls) {
          const cloudData: CloudData = {
            providerName: "DemoZoo",
            syncStatus: CLOUD_SYNC.INACTIVE,
            syncInterval: -1,
            lastSyncTime: Number.MAX_VALUE,
            fileName: item.title,
            itemId: `demozoo_${item.id}`,
            apiEndpoint: "",
            downloadUrl: candidateUrl,
            detailsUrl: item.demozooUrl,
            fileSize: -1
          }
          loaded = await handleSetDiskFromURL(candidateUrl, undefined, props.driveIndex, cloudData)
          if (loaded) {
            downloadUrl = candidateUrl
            break
          }
        }
        if (loaded) {
          handleClose()
          props.onLoadSuccess?.()
        } else {
          console.error(`DemoZoo disk could not be loaded: ${downloadUrl}`)
        }
      } else {
        setYoutubeModalInfo({
          open: true,
          title: item.title,
          url: item.demozooUrl
        })
      }
    } catch (err) {
      console.error("Failed to load DemoZoo disk:", err)
      showGlobalProgressModal(false)
    }
  }

  const handleSearchBoxKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      handleClose()
    }
  }

  const handleTypeClick = (typeName: string) => {
    setSelectedType(typeName)
    goToPage(1)
  }

  if (!props.open) return <></>

  const typeFilters = [
    { id: "all", label: t("demoZoo.all") },
    { id: "demo", label: t("demoZoo.demo") },
    { id: "intro", label: t("demoZoo.intro") },
    { id: "cracktro", label: t("demoZoo.cracktro") },
    { id: "music", label: t("demoZoo.music") }
  ]

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="demozoo-dialog" onClick={e => e.stopPropagation()}>
        <div className="dzd-header">
          {svgDemoZooLogo}
          {svgDemoZooTitle}
        </div>
        <div className="dzd-search">
          <div className="dzd-type-filters">
            {typeFilters.map(filter => (
              <div
                key={filter.id}
                className={`dzd-type-tab ${selectedType === filter.id ? "dzd-type-tab-selected" : ""}`}
                onClick={() => handleTypeClick(filter.id)}>
                {filter.label}
              </div>
            ))}
          </div>
          <div className="dzd-search-panel">
            <input
              className="dzd-search-box"
              name="search"
              type="text"
              placeholder={t("demoZoo.searchPlaceholder") || "Search DemoZoo (title, author)..."}
              autoCorrect="off"
              autoComplete="off"
              spellCheck="false"
              autoFocus
              value={searchQuery}
              onChange={event => {
                setSearchQuery(event.target.value)
                setCurrentPage(1)
              }}
              onKeyDown={handleSearchBoxKeyDown}
            />
            <input
              className="dzd-search-button"
              name="searchButton"
              type="button"
              value={t("internetArchive.go") || "GO"}
              onClick={() => { }}
            />
          </div>
        </div>
        <div className="dzd-body">
          {currentPagedItems.length > 0 ? (
            <div className="dzd-search-results">
              {currentPagedItems.map(item => (
                <DemoZooResultCard
                  key={`result-${item.id}`}
                  item={item}
                  onTileClick={handleTileClick}
                  diskBookmarks={diskBookmarks}
                />
              ))}
            </div>
          ) : (
            <div className="dzd-empty-message">{t("demoZoo.noProductions")}</div>
          )}
        </div>

        <div className="dzd-footer">
          <div className="dzd-pagination">
            <button
              className="dzd-page-btn"
              title={t("demoZoo.firstPage")}
              aria-label={t("demoZoo.firstPage")}
              disabled={displayPage === 1}
              onClick={() => goToPage(1)}>
              &laquo;
            </button>
            <button
              className="dzd-page-btn"
              title={t("demoZoo.previous")}
              aria-label={t("demoZoo.previous")}
              disabled={displayPage === 1}
              onClick={() => goToPage(displayPage - 1)}>
              &lsaquo;
            </button>
            <input
              className="dzd-page-input"
              aria-label={t("demoZoo.pageInput")}
              value={pageInput}
              onChange={event => setPageInput(event.target.value)}
              onKeyDown={handlePageInputKeyDown}
              inputMode="numeric"
              size={3}
            />
            <span className="dzd-page-info">of {totalPages}</span>
            <button
              className="dzd-page-btn"
              title={t("demoZoo.next")}
              aria-label={t("demoZoo.next")}
              disabled={displayPage >= totalPages}
              onClick={() => goToPage(displayPage + 1)}>
              &rsaquo;
            </button>
            <button
              className="dzd-page-btn"
              title={t("demoZoo.lastPage")}
              aria-label={t("demoZoo.lastPage")}
              disabled={displayPage >= totalPages}
              onClick={() => goToPage(totalPages)}>
              &raquo;
            </button>
          </div>
        </div>
      </div>

      {youtubeModalInfo.open && (
        <div className="dzd-youtube-hint-overlay" onClick={() => setYoutubeModalInfo({ open: false, title: "", url: "" })}>
          <div className="dzd-youtube-hint-modal" onClick={e => e.stopPropagation()}>
            <h3>{youtubeModalInfo.title}</h3>
            <p>
              {youtubeModalInfo.url.includes("youtube") || youtubeModalInfo.url.includes("youtu.be")
                ? t("demoZoo.youtubeOnly")
                : t("demoZoo.externalOnly")}
            </p>
            <a className="dzd-youtube-link" href={youtubeModalInfo.url} target="_blank" rel="noreferrer">
              {youtubeModalInfo.url}
            </a>
            <div className="dzd-youtube-hint-actions">
              <button
                className="dzd-btn-primary"
                onClick={() => {
                  window.open(youtubeModalInfo.url, "_blank")
                  setYoutubeModalInfo({ open: false, title: "", url: "" })
                }}>
                {t("demoZoo.openInNewTab")}
              </button>
              <button
                className="dzd-btn-secondary"
                onClick={() => setYoutubeModalInfo({ open: false, title: "", url: "" })}>
                {t("messages.cancel")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DemoZooDialog
