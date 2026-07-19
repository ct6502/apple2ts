import { useEffect, useRef, useState } from "react"
import { determineVtocType, VTOC_REFRESH } from "../../common/prodos_hdv"
import { hasSessionVtocFailure, addSessionVtocFailure, setPreferenceVtocType } from "../localstorage"
import { isMinimalTheme } from "../ui_settings"
import { showGlobalProgressModal } from "../ui_utilities"
import { TAB_INDEX, isDiskExportable, getExportFilename, DISK_COLLECTION_ITEM_TYPE } from "./diskpanel_utils"
import { DiskBookmarks } from "../devices/disk/diskbookmarks"
import { handleSetDiskFromCloudData, handleSetDiskFromFile, handleSetDiskFromURL } from "../devices/disk/driveprops"

type DiskPanelVtocProps = {
  activeTab: number,
  isFlyoutOpen: boolean,
  diskBookmarks: DiskBookmarks,
  setDiskCollection: (update: (prev: DiskCollectionItem[]) => DiskCollectionItem[]) => void,
  exportQueue: DiskCollectionItem[],
  downloadedDisks: DownloadedExportDisk[],
  visibleCandidates: DiskCollectionItem[],
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

  // Stable identity for a disk across re-renders (bookmark id, cloud item id,
  // disk URL, or finally the title).
  const itemKey = (item: DiskCollectionItem): string =>
    item.bookmarkId || item.cloudData?.itemId || item.diskUrl?.toString() || item.title

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
    const panelVisible = props.isFlyoutOpen || !isMinimalTheme()
    if (!panelVisible) {
      if (vtocProgressVisibleRef.current) {
        showGlobalProgressModal(false)
        vtocProgressVisibleRef.current = false
      }
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
      return
    }

    // On a tab change, start a fresh pass for the newly visible disks. Disks
    // that already resolved keep their cached vtocType and are not re-picked.
    if (vtocActiveTabRef.current !== props.activeTab) {
      vtocActiveTabRef.current = props.activeTab
      vtocResolveAttempted.current.clear()
    }

    // Only resolve disks that are visible in the current tab, so we don't
    // background-download disks the user can't see. The Export tab is the
    // superset of all exportable disks, but its rendered list is pre-filtered to
    // already-determined disks; use the full exportable candidate set for it so
    // its not-yet-determined disks still get resolved when it's navigated to.
    // Cloud disks (Google Drive / OneDrive) are never background-probed here:
    // fetching them requires an auth token and would trigger an auth popup. Their
    // VTOC type is determined synchronously from the in-memory bytes when the
    // bookmark is added, and any remaining auth happens when the disk is actually
    // exported.
    const pendingCandidates = props.visibleCandidates.filter((item) =>
      item.vtocType === undefined &&
      item.type !== DISK_COLLECTION_ITEM_TYPE.CLOUD_DRIVE &&
      isDiskExportable(item) &&
      !hasSessionVtocFailure(item.diskUrl.toString())
    )
    const pending = pendingCandidates.find((item) =>
      !vtocResolveAttempted.current.has(itemKey(item))
    )
    if (!pending) {
      if (vtocProgressVisibleRef.current) {
        showGlobalProgressModal(false)
        vtocProgressVisibleRef.current = false
      }
      return
    }

    const currentDisk = vtocResolveAttempted.current.size + 1
    const totalDisks = vtocResolveAttempted.current.size + pendingCandidates.length
    const shouldShowVtocProgress = props.activeTab === TAB_INDEX.EXPORT
    if (shouldShowVtocProgress) {
      showGlobalProgressModal(true, `Fetching disk metadata ${currentDisk}/${totalDisks}`)
      vtocProgressVisibleRef.current = true
    } else if (vtocProgressVisibleRef.current) {
      showGlobalProgressModal(false)
      vtocProgressVisibleRef.current = false
    }

    vtocResolveAttempted.current.add(itemKey(pending))
    // Capture the ref's Set (stable across renders) and the item key so the
    // cleanup below doesn't read a ref during teardown (which lint flags).
    const attempted = vtocResolveAttempted.current
    const pendingKey = itemKey(pending)
    let cancelled = false
    let settled = false

    fetchDiskBufferForItem(pending).then((data) => {
      settled = true
      if (!data) {
        // Download failed (CORS/network). Remember the failure for this browser
        // session -- even if this effect was cancelled/re-run in the meantime --
        // so it is not re-attempted on every render (an infinite retry loop) or
        // on reload. It is retried in a new session. Only advance the pass when
        // still mounted; a cancelled run's successor will pick the next disk.
        addSessionVtocFailure(pending.diskUrl.toString())
        if (!cancelled) {
          setVtocCheckPass((pass) => pass + 1)
        }
        return
      }
      if (cancelled) {
        return
      }
      const filename = getExportFilename(pending, data)
      // Cache the determined VTOC (and persist it for bookmarks).
      persistVtocType(pending, determineVtocType(filename, data))
      // Advance to the next pending disk. We no longer rely on the collection
      // re-render (which changes visibleCandidates identity) to re-run this
      // effect, so bump the pass counter explicitly.
      setVtocCheckPass((pass) => pass + 1)
    })
      .catch(() => {
        settled = true
        // A rejected fetch is a definitive failure; remember it regardless of
        // cancellation so it is never retried this session.
        addSessionVtocFailure(pending.diskUrl.toString())
        if (!cancelled) {
          setVtocCheckPass((pass) => pass + 1)
        }
      })

    return () => {
      cancelled = true
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
  }, [props.activeTab, props.isFlyoutOpen, vtocCheckPass, props.exportQueue.length, props.downloadedDisks.length, visibleCandidatesKey])

  return (<></>)
}
