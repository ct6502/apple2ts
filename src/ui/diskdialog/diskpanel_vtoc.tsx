import { useEffect, useRef, useState } from "react"
import { determineVtocType, lookupFourCadeByTitle, VTOC_REFRESH } from "../../common/prodos_hdv"
import { hasSessionVtocFailure, addSessionVtocFailure, removeSessionVtocFailure, setPreferenceVtocType } from "../localstorage"
import { isMinimalTheme } from "../ui_settings"
import { showGlobalProgressModal } from "../ui_utilities"
import { isDiskExportable, getExportFilename, DISK_COLLECTION_ITEM_TYPE, TAB_INDEX, diskItemKey } from "./diskpanel_utils"
import { DiskBookmarks } from "../devices/disk/diskbookmarks"
import { handleSetDiskFromCloudData, handleSetDiskFromFile, handleSetDiskFromURL } from "../devices/disk/driveprops"
import { clearIaResolveCache, internetArchiveUrlProtocol } from "../devices/disk/internetarchive_utils"

type DiskPanelVtocProps = {
  activeTab: number,
  isFlyoutOpen: boolean,
  diskBookmarks: DiskBookmarks,
  setDiskCollection: (update: (prev: DiskCollectionItem[]) => DiskCollectionItem[]) => void,
  exportQueue: DiskCollectionItem[],
  downloadedDisks: DownloadedExportDisk[],
  visibleCandidates: DiskCollectionItem[],
  authRefresh: number,
  cloudProviderHasAuthToken: (providerName: string) => boolean,
  setForceVtocCheck?: React.Dispatch<React.SetStateAction<((disk: DiskCollectionItem) => void) | null>>,
  setActiveVtocCheckKey?: (key: string | null) => void,
  showProgressModal?: boolean,
  panelVisible?: boolean,
}

// Downloads a disk's bytes without disturbing the running emulator. Unlike
// loadDisk(), this never changes the run mode or loads the disk into a drive;
// it simply resolves with the raw buffer (or null on failure) via callback.
// This runs as silent background verification (to populate export badges), so
// it deliberately does NOT show a blocking progress modal.
const fetchDiskBufferForItem = (diskCollectionItem: DiskCollectionItem): Promise<Uint8Array | null> => {
  return new Promise((resolve) => {
    const cb = (buffer: ArrayBuffer | null) => resolve(buffer ? new Uint8Array(buffer) : null)
    if (diskCollectionItem.type == DISK_COLLECTION_ITEM_TYPE.CLOUD_DRIVE && diskCollectionItem.cloudData) {
      handleSetDiskFromCloudData(diskCollectionItem.cloudData, -1, cb)
    } else if (diskCollectionItem.diskUrl && !diskCollectionItem.diskUrl.includes("://")) {
      handleSetDiskFromFile(diskCollectionItem.diskUrl, null, -1, cb)
    } else {
      handleSetDiskFromURL(diskCollectionItem.diskUrl || "", undefined, -1, diskCollectionItem.cloudData, cb)
    }
  })
}

export const DiskPanelVtoc = (props: DiskPanelVtocProps) => {

  // Tracks disk items whose VTOC download has been attempted during the current
  // active-tab verification pass (success or failure), so we don't re-pick the
  // same disk while iterating the queue. Cleared when the active tab changes.
  const vtocResolveAttempted = useRef<Set<string>>(new Set())
  // Bumped after a failed download so the verification effect advances to the
  // next pending disk. CORS/network failures are retried when the user revisits
  // the tab in a new browser session.
  const [vtocCheckPass, setVtocCheckPass] = useState(0)
  // Remembers which tab the current VTOC pass belongs to so a tab switch starts
  // a fresh pass for the newly visible disks.
  const vtocActiveTabRef = useRef<number | null>(null)
  const vtocProgressVisibleRef = useRef(false)
  // Tracks the last authRefresh value so a sign-in clears attempted cloud disks.
  const vtocAuthRefreshRef = useRef<number>(props.authRefresh)
  // When true, the next single-disk VTOC check skips the progress modal (user
  // clicked the export badge to force a check for one specific disk).
  const suppressProgressRef = useRef(false)
  const vtocWorkerRef = useRef<Worker | null>(null)
  const vtocWorkerRequestRef = useRef(0)
  const vtocWorkerPendingRef = useRef(new Map<number, {
    resolve: (vtocType: VtocType) => void
    reject: () => void
  }>())

  const itemKey = diskItemKey
  const { setDiskCollection, setForceVtocCheck } = props

  useEffect(() => () => {
    vtocWorkerRef.current?.terminate()
    vtocWorkerPendingRef.current.forEach(request => request.reject())
    vtocWorkerPendingRef.current.clear()
  }, [])

  const determineVtocTypeAsync = (
    filename: string,
    data: Uint8Array,
    title?: string,
  ): Promise<VtocType> => {
    if (typeof Worker === "undefined") {
      return Promise.resolve(determineVtocType(filename, data, title))
    }
    if (!vtocWorkerRef.current) {
      const worker = new Worker(new URL("../../worker/vtoc_worker", import.meta.url), { type: "module" })
      worker.onmessage = (event: MessageEvent<{ id: number, vtocType: VtocType }>) => {
        const request = vtocWorkerPendingRef.current.get(event.data.id)
        if (!request) return
        vtocWorkerPendingRef.current.delete(event.data.id)
        request.resolve(event.data.vtocType)
      }
      worker.onerror = () => {
        vtocWorkerPendingRef.current.forEach(request => request.reject())
        vtocWorkerPendingRef.current.clear()
        worker.terminate()
        vtocWorkerRef.current = null
      }
      vtocWorkerRef.current = worker
    }
    const id = vtocWorkerRequestRef.current
    vtocWorkerRequestRef.current += 1
    return new Promise((resolve, reject) => {
      vtocWorkerPendingRef.current.set(id, { resolve, reject })
      vtocWorkerRef.current?.postMessage({ id, filename, data, title })
    })
  }

  // Expose a force-check function to the parent without mutating a ref prop.
  useEffect(() => {
    if (!setForceVtocCheck) return
    const forceVtocCheck = (disk: DiskCollectionItem) => {
      const key = itemKey(disk)
      disk.vtocType = undefined
      disk.vtocVersion = undefined
      removeSessionVtocFailure(disk.diskUrl?.toString() || "")
      // Clear the Internet Archive negative cache so the identifier is
      // re-resolved from scratch instead of returning the cached failure.
      if (disk.type === DISK_COLLECTION_ITEM_TYPE.INTERNET_ARCHIVE && disk.diskUrl?.startsWith(internetArchiveUrlProtocol)) {
        clearIaResolveCache(disk.diskUrl.substring(internetArchiveUrlProtocol.length))
      }
      vtocResolveAttempted.current.delete(key)
      suppressProgressRef.current = true
      setDiskCollection((prev) => [...prev])
      setVtocCheckPass((pass) => pass + 1)
    }
    setForceVtocCheck(() => forceVtocCheck)
    return () => {
      setForceVtocCheck(null)
    }
  }, [itemKey, setDiskCollection, setForceVtocCheck])

  // Stores a determined VTOC type onto the in-memory collection item and persists
  // it so it only needs to be determined once. Bookmarks keep their type in their
  // own dbm- entry; other disks (built-in images, new releases) use the shared
  // URL-keyed cache. A disk is never written to both, so a bookmark can't pick up
  // a stale URL-cache value (and vice versa).
  const persistVtocType = (diskCollectionItem: DiskCollectionItem, vtocType: VtocType) => {
    diskCollectionItem.vtocType = vtocType
    diskCollectionItem.vtocVersion = VTOC_REFRESH

    if (diskCollectionItem.bookmarkId) {
      const bookmark = props.diskBookmarks.get(diskCollectionItem.bookmarkId)
      if (bookmark) {
        bookmark.vtocType = vtocType
        bookmark.vtocVersion = VTOC_REFRESH
        props.diskBookmarks.set(bookmark)
      }
    } else {
      // Cache by URL so non-bookmarked disks (e.g. new releases) avoid
      // re-downloading their bytes to redetermine the VTOC on every visit.
      setPreferenceVtocType(diskCollectionItem.diskUrl.toString(), vtocType, VTOC_REFRESH)
    }

    // Trigger a re-render so the export filter reflects the new VTOC type.
    props.setDiskCollection((prev) => [...prev])
  }

  // A stable signature of the currently visible disks. Used as the effect
  // dependency instead of the visibleCandidates array itself, whose identity
  // changes on every parent render (it is produced by .filter()). Depending on
  // the array identity re-ran the effect on every render, cancelling in-flight
  // VTOC fetches before they could record a failure -- an infinite retry loop
  // for un-fetchable (CORS/offline) disks.
  const visibleCandidatesKey = props.visibleCandidates
    .map((item) => item.diskUrl?.toString() || "")
    .join("|")

  // While the Export tab is visible, fill in (and cache) the VTOC type of any
  // disk that doesn't already have one by downloading its bytes. This keeps VTOC
  // probing and its progress modal scoped to export workflows only. Built-in
  // disks, new releases, and bookmarks are treated identically: an HDV or
  // previously-cached type is filled in without a download (see
  // restoreCachedVtocType), and only disks small enough to ever be exported are
  // resolved here -- so large disks and un-downloadable (e.g. CORS-blocked)
  // disks never trigger a download and never show as exportable. Disks are
  // resolved one at a time to avoid a download stampede, and each result is
  // cached in local storage so a given disk is only ever downloaded once.
  // Download failures are remembered for the browser session (sessionStorage) so
  // they aren't re-attempted on reload; they are retried in a new browser
  // session.
  useEffect(() => {
    // The panel content is shown when the flyout is open (minimal theme) or
    // always (classic theme renders it inside a dialog), matching Flyout's own
    // render condition. Gate verification on actual visibility so it runs in
    // both themes, not just when isFlyoutOpen is toggled.
    const panelVisible = props.panelVisible ?? (props.isFlyoutOpen || !isMinimalTheme())
    if (!panelVisible) {
      if (vtocProgressVisibleRef.current) {
        showGlobalProgressModal(false)
        vtocProgressVisibleRef.current = false
      }
      props.setActiveVtocCheckKey?.(null)
      vtocActiveTabRef.current = null
      return
    }

    // While exporting or building, progress ownership belongs to the export
    // pipeline; avoid overlapping VTOC progress updates.
    if (props.exportQueue.length > 0 || props.downloadedDisks.length > 0) {
      if (vtocProgressVisibleRef.current) {
        showGlobalProgressModal(false)
        vtocProgressVisibleRef.current = false
      }
      props.setActiveVtocCheckKey?.(null)
      return
    }

    // On a tab change, start a fresh pass for the newly visible disks. Disks
    // that already resolved keep their cached vtocType and are not re-picked.
    if (vtocActiveTabRef.current !== props.activeTab) {
      vtocActiveTabRef.current = props.activeTab
      vtocResolveAttempted.current.clear()
    }

    // After a cloud sign-in, clear attempted disks so cloud disks that were
    // previously skipped (no auth token) get picked up for VTOC resolution.
    if (vtocAuthRefreshRef.current !== props.authRefresh) {
      vtocAuthRefreshRef.current = props.authRefresh
      vtocResolveAttempted.current.clear()
    }

    // Only resolve disks that are visible in the current tab, so we don't
    // background-download disks the user can't see. Cloud disks (Google Drive /
    // OneDrive) are only probed when their provider has an auth token; without a
    // token the fetch would fail or trigger an auth popup. After a successful
    // sign-in, authRefresh bumps and this effect re-runs with the cloud disks
    // now eligible.
    const pendingCandidates = props.visibleCandidates.filter((item) =>
      item.vtocType === undefined &&
      isDiskExportable(item) &&
      !hasSessionVtocFailure(item.diskUrl.toString()) &&
      (item.type !== DISK_COLLECTION_ITEM_TYPE.CLOUD_DRIVE ||
        props.cloudProviderHasAuthToken(item.cloudData?.providerName || ""))
    )
    const pending = pendingCandidates.find((item) =>
      !vtocResolveAttempted.current.has(itemKey(item))
    )
    if (!pending) {
      if (vtocProgressVisibleRef.current) {
        showGlobalProgressModal(false)
        vtocProgressVisibleRef.current = false
      }
      props.setActiveVtocCheckKey?.(null)
      return
    }

    const currentDisk = vtocResolveAttempted.current.size + 1
    const totalDisks = vtocResolveAttempted.current.size + pendingCandidates.length
    const suppressProgress = suppressProgressRef.current
    suppressProgressRef.current = false
    if (!suppressProgress && props.activeTab === TAB_INDEX.EXPORT && props.showProgressModal !== false) {
      showGlobalProgressModal(true, `Fetching disk metadata ${currentDisk}/${totalDisks}`)
      vtocProgressVisibleRef.current = true
    }

    vtocResolveAttempted.current.add(itemKey(pending))
    // Capture the ref's Set (stable across renders) and the item key so the
    // cleanup below doesn't read a ref during teardown (which lint flags).
    const attempted = vtocResolveAttempted.current
    const pendingKey = itemKey(pending)
    props.setActiveVtocCheckKey?.(pendingKey)
    let cancelled = false
    let settled = false

    fetchDiskBufferForItem(pending).then((data) => {
      if (!data) {
      settled = true
        // Download failed (CORS/network). For Internet Archive disks, try
        // title-based matching against the 4cade DB first; fall back to "dos"
        // since the actual disk download often succeeds during export.
        if (pending.type === DISK_COLLECTION_ITEM_TYPE.INTERNET_ARCHIVE) {
          if (!cancelled) {
            const vtoc = lookupFourCadeByTitle(pending.title) ? "4cade" : "dos"
            persistVtocType(pending, vtoc)
            setVtocCheckPass((pass) => pass + 1)
          }
        } else {
          addSessionVtocFailure(pending.diskUrl.toString())
          if (!cancelled) {
            setVtocCheckPass((pass) => pass + 1)
          }
        }
        return
      }
      if (cancelled) {
        settled = true
        return
      }
      const filename = getExportFilename(pending, data)
      return determineVtocTypeAsync(filename, data, pending.title).then((vtocType) => {
        settled = true
        if (cancelled) return
        // Cache the determined VTOC (and persist it for bookmarks).
        persistVtocType(pending, vtocType)
        // Advance to the next pending disk. We no longer rely on the collection
        // re-render (which changes visibleCandidates identity) to re-run this
        // effect, so bump the pass counter explicitly.
        setVtocCheckPass((pass) => pass + 1)
      })
    })
      .catch(() => {
        settled = true
        if (pending.type === DISK_COLLECTION_ITEM_TYPE.INTERNET_ARCHIVE) {
          if (!cancelled) {
            persistVtocType(pending, "dos")
            setVtocCheckPass((pass) => pass + 1)
          }
        } else {
          addSessionVtocFailure(pending.diskUrl.toString())
          if (!cancelled) {
            setVtocCheckPass((pass) => pass + 1)
          }
        }
      })

    return () => {
      cancelled = true
      props.setActiveVtocCheckKey?.(null)
      // If this effect re-ran (e.g. diskCollection changed during the panel-open
      // re-render storm) before the fetch settled, un-mark the disk so it is
      // retried on the next pass. Otherwise it would be stranded with an
      // undefined VTOC -- showing a non-exportable badge until the panel is
      // reopened. This most often struck the first disk, whose fetch is in flight
      // exactly while the collection is still settling.
      if (!settled) {
        attempted.delete(pendingKey)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.activeTab, props.isFlyoutOpen, vtocCheckPass, props.exportQueue.length, props.downloadedDisks.length, visibleCandidatesKey, props.authRefresh])

  return (<></>)
}
