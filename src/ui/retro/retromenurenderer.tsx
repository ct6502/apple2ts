import { useEffect, useLayoutEffect, useState } from "react"
import { createPortal } from "react-dom"
import type { RetroResolvedControl } from "./retromenucontext"
import { formatControlLabel } from "../controls/controlregistry"
import { useRetroMenuHost } from "./retromenuhost"
import {
  actionHintWidth,
  controlTextWidth,
  fitControlText,
  formatClockTime,
  retroFontSupports,
  selectArrowSpacing,
  selectHintWidth,
  truncateControlText,
} from "./retrotext"
import "./retrocontrolpanel.css"
import { RETRO_SKIN } from "../localstorage"
import { SETTINGS_CHANGED_EVENT, type SettingsChangedDetail } from "../settingschange"
import { DISK_LOAD_SUCCESS_EVENT, getTheme } from "../ui_settings"
import { xmargin, ymargin } from "../graphics"
import { UI_THEME } from "../../common/utility"
import { DiskPanelVtoc } from "../diskdialog/diskpanel_vtoc"
import { diskItemKey, isDiskExportable, TAB_INDEX } from "../diskdialog/diskpanel_utils"
import { cloudProviderHasAuthToken } from "../devices/disk/cloudauth"
import { DISK_BOOKMARKS_CHANGED_EVENT } from "../devices/disk/diskbookmarks"
import {
  getRetroVtocIndicator,
  resetCollectionDriveSelectionSession,
  resetSelectedCollectionDriveIndex,
} from "../devices/disk/diskinterface"

type RetroMenuItem = RetroResolvedControl

type CanvasBounds = {
  left: number
  top: number
  width: number
  height: number
}

type RetroMenuFrame = {
  menuId: string
  title: string
  submenuTitleValue?: (items: readonly RetroMenuItem[], values: number[]) => string | undefined
  items: RetroMenuItem[]
  parentSelectedIndex: number
  originalValues: number[]
  values: number[]
  actionLabel?: string
  refresh?: (items?: readonly RetroMenuItem[], values?: number[]) => RetroMenuItem[]
  submit?: (items: readonly RetroMenuItem[], values: number[]) => void
  isSubmitVisible?: (items: readonly RetroMenuItem[], values: number[]) => boolean
}

const mouseTextDown = String.fromCodePoint(0x2193)
const mouseTextLeft = String.fromCodePoint(0x2190)
const mouseTextRight = String.fromCodePoint(0x2192)
const mouseTextUp = String.fromCodePoint(0x2191)
const mouseTextReturn = String.fromCodePoint(0x21B5)
const mouseTextCursor = String.fromCodePoint(0xE07F)
const checkmark = String.fromCodePoint(0x2713)
const fixedWidthSpace = String.fromCodePoint(0x2007)
const horizontalBorderGlyphs = ` ${"_".repeat(78)} `
const verticalBorderGlyphs = Array(30).fill("!").join("\n")
const rootMenuContentWidth = 34
const submenuTextWidth = 40

const RetroVtocIndicator = ({
  active,
  disk,
  isAppleIIPlus,
}: {
  active: boolean
  disk: DiskCollectionItem
  isAppleIIPlus: boolean
}) => {
  const [frameIndex, setFrameIndex] = useState(0)
  useEffect(() => {
    if (!active) return
    const timer = window.setInterval(() => setFrameIndex(index => (index + 1) % 4), 125)
    return () => window.clearInterval(timer)
  }, [active])
  const frames = isAppleIIPlus ? ["/", "-", "\\", "!"] : ["/", "-", "\\", "|"]
  return getRetroVtocIndicator(disk, active ? diskItemKey(disk) : null, frames[frameIndex])
}

const AppleIIPlusFooter = ({
  actionLabel,
  cancelLabel,
  language,
  selectLabel,
  showAction,
  showHorizontalSelectionHint,
}: {
  actionLabel: string
  cancelLabel?: string
  language: string
  selectLabel: string
  showAction: boolean
  showHorizontalSelectionHint: boolean
}) => {
  const arrowText = `${showHorizontalSelectionHint ? `${mouseTextLeft}_${mouseTextRight}_` : ""}${cancelLabel
    ? `${mouseTextUp}_${mouseTextDown}`
    : `${mouseTextDown}_${mouseTextUp}`}`
  const selectText = `${selectLabel}:${arrowText}`
  const actionText = showAction ? `${actionLabel}:${mouseTextReturn}` : ""
  const rowWidth = 42
  const placements = [
    { start: 0, text: selectText },
    ...(cancelLabel
      ? [{ start: Math.floor((rowWidth - controlTextWidth(cancelLabel, language)) / 2), text: cancelLabel }]
      : []),
    ...(actionText
      ? [{ start: rowWidth - controlTextWidth(actionText, language), text: actionText }]
      : []),
  ].sort((left, right) => left.start - right.start)
  const runs: { border: boolean, text: string }[] = []
  let cursor = 0
  placements.forEach((placement) => {
    if (placement.start > cursor) runs.push({ border: true, text: "_".repeat(placement.start - cursor) })
    runs.push({ border: false, text: placement.text })
    cursor = Math.max(cursor, placement.start + controlTextWidth(placement.text, language))
  })
  if (cursor < rowWidth) runs.push({ border: true, text: "_".repeat(rowWidth - cursor) })

  return <footer className="retro-text-footer">
    {runs.map((run, index) => <span
      className={run.border || retroFontSupports(run.text) ? undefined : "retro-browser-font"}
      key={`${index}-${run.text}`}
    >{run.text}</span>)}
  </footer>
}

const RetroBorder = ({ className, separatorRow }: {
  className: string
  separatorRow?: number
}) => (
  <div className={`retro-border ${className}`} aria-hidden="true">
    <span className="retro-border-glyph retro-border-glyph-top">{horizontalBorderGlyphs}</span>
    <span className="retro-border-glyph retro-border-glyph-bottom">{horizontalBorderGlyphs}</span>
    <span className="retro-border-glyph retro-border-glyph-left">{verticalBorderGlyphs}</span>
    <span className="retro-border-glyph retro-border-glyph-right">{verticalBorderGlyphs}</span>
    {separatorRow && (
      <span
        className="retro-border-separator"
        style={{
          top: `calc(${separatorRow - 1} * var(--retro-row-height) + var(--retro-border-width))`,
        }}
      />
    )}
  </div>
)

const createMenuFrame = (
  menuId: string,
  title: string,
  items: RetroMenuItem[],
  submenuTitleValue?: (items: readonly RetroMenuItem[], values: number[]) => string | undefined,
  refresh?: (items?: readonly RetroMenuItem[], values?: number[]) => RetroMenuItem[],
  actionLabel?: string,
  submit?: (items: readonly RetroMenuItem[], values: number[]) => void,
  isSubmitVisible?: (items: readonly RetroMenuItem[], values: number[]) => boolean,
  parentSelectedIndex = 0,
): RetroMenuFrame => {
  const values = items.map(item => item.optionIndex ?? -1)
  return {
    menuId,
    title,
    submenuTitleValue,
    items,
    parentSelectedIndex,
    originalValues: values,
    values,
    actionLabel,
    refresh,
    submit,
    isSubmitVisible,
  }
}

const isMenuItemSelectable = (item: RetroMenuItem, frame?: RetroMenuFrame) => {
  if (item.selectableWhen && frame) {
    const controlIndex = frame.items.findIndex(control => control.id === item.selectableWhen?.controlId)
    return item.selectable !== false && controlIndex >= 0 &&
      item.selectableWhen.optionIndexes.includes(frame.values[controlIndex])
  }
  return item.selectable !== false
}

const isMenuItemBulkSelectable = (item: RetroMenuItem, frame?: RetroMenuFrame) =>
  item.bulkSelectable !== false && isMenuItemSelectable(item, frame)

const refreshPreviousMenu = (stack: RetroMenuFrame[]) => {
  const previousStack = stack.slice(0, -1)
  const previousFrame = previousStack[previousStack.length - 1]
  if (!previousFrame?.refresh) return previousStack

  previousStack[previousStack.length - 1] = createMenuFrame(
    previousFrame.menuId,
    previousFrame.title,
    previousFrame.refresh(),
    previousFrame.submenuTitleValue,
    previousFrame.refresh,
    previousFrame.actionLabel,
    previousFrame.submit,
    previousFrame.isSubmitVisible,
    previousFrame.parentSelectedIndex,
  )
  return previousStack
}

const restoreMenuFramePreview = (frame: RetroMenuFrame) => {
  frame.items.forEach((item, index) => {
    if (frame.values[index] !== frame.originalValues[index]) {
      item.options?.[frame.originalValues[index]]?.preview?.()
    }
  })
}

const RetroMenuRenderer = ({ displayProps }: { displayProps: DisplayProps }) => {
  const [manualIsOpen, setIsOpen] = useState(false)
  const [manualMenuStack, setMenuStack] = useState<RetroMenuFrame[]>([])
  const [manualSelectedIndex, setSelectedIndex] = useState(0)
  const [, setSettingsRevision] = useState(0)
  const [now, setNow] = useState(() => new Date())
  const [canvasBounds, setCanvasBounds] = useState<CanvasBounds | null>(null)
  const close = () => setIsOpen(false)
  const {
    activeVtocCheckKey,
    authRefresh,
    dialogs,
    diskBookmarks,
    diskCollection,
    effects,
    hasOpenDialog,
    iigsStyle,
    language,
    retroSkin,
    rootMenu,
    runTour,
    resolveMenu,
    setActiveVtocCheckKey,
    setDiskCollection,
    t,
  } = useRetroMenuHost(displayProps, close)
  const menuStack = manualMenuStack
  const currentFrame = menuStack[menuStack.length - 1]
  const currentMenu = currentFrame?.items ?? rootMenu
  const selectedIndex = manualSelectedIndex
  const isOpen = manualIsOpen
  const maxVisibleMenuItems = 18
  const visibleMenuStart = currentFrame
    ? Math.min(
      Math.max(0, selectedIndex - maxVisibleMenuItems + 1),
      Math.max(0, currentMenu.length - maxVisibleMenuItems),
    )
    : 0
  const visibleMenu = currentMenu.slice(visibleMenuStart, visibleMenuStart + maxVisibleMenuItems)
  const selectedItem = currentMenu[selectedIndex]
  const selectLabel = t("retroControl.select")
  const isAppleIIPlus = retroSkin === RETRO_SKIN.APPLE_IIPLUS
  const isExportScreen = Boolean(currentFrame?.items.some(item =>
    item.id === "diskCollection.export.sort"))
  const updateDiskCollection = (update: (prev: DiskCollectionItem[]) => DiskCollectionItem[]) => {
    setDiskCollection(update)
    setMenuStack(stack => stack.map((frame, index) => {
      if (index !== stack.length - 1 || !frame.refresh || !frame.items.some(item =>
        item.id === "diskCollection.export.sort")) return frame
      const items = frame.refresh(frame.items, frame.values)
      return { ...frame, items, values: items.map(item => item.optionIndex ?? -1) }
    }))
  }

  useLayoutEffect(() => {
    if (!isOpen) return
    const canvas = document.getElementById("apple2canvas")
    if (!canvas) return
    const updateCanvasBounds = () => {
      const bounds = canvas.getBoundingClientRect()
      setCanvasBounds({
        left: bounds.left + canvas.clientLeft,
        top: bounds.top + canvas.clientTop,
        width: canvas.clientWidth,
        height: canvas.clientHeight,
      })
    }
    let updateTimer = 0
    let fullscreenTimer = 0
    const scheduleCanvasBoundsUpdate = () => {
      window.clearTimeout(updateTimer)
      updateTimer = window.setTimeout(updateCanvasBounds, 0)
    }
    updateCanvasBounds()
    const observer = new ResizeObserver(scheduleCanvasBoundsUpdate)
    observer.observe(canvas)
    if (canvas.parentElement) observer.observe(canvas.parentElement)
    window.addEventListener("resize", scheduleCanvasBoundsUpdate)
    const handleFullscreenChange = () => {
      setCanvasBounds(null)
      scheduleCanvasBoundsUpdate()
      window.clearTimeout(fullscreenTimer)
      fullscreenTimer = window.setTimeout(scheduleCanvasBoundsUpdate, 100)
    }
    document.addEventListener("fullscreenchange", handleFullscreenChange)
    return () => {
      window.clearTimeout(updateTimer)
      window.clearTimeout(fullscreenTimer)
      observer.disconnect()
      window.removeEventListener("resize", scheduleCanvasBoundsUpdate)
      document.removeEventListener("fullscreenchange", handleFullscreenChange)
    }
  }, [isOpen])

  const panelBounds = canvasBounds
    ? {
      height: canvasBounds.height,
      left: canvasBounds.left,
      top: canvasBounds.top,
      width: canvasBounds.width,
    }
    : undefined
  const hasClassicMonitorFrame = getTheme() === UI_THEME.CLASSIC && document.fullscreenElement === null
  const panelStyle = panelBounds
    ? {
      ...iigsStyle,
      "--retro-cell-height": `${Math.min(
        panelBounds.height * (1 - 2 * ymargin) / 24,
        panelBounds.width * (1 - 2 * xmargin) / 40.25,
      )}px`,
      "--retro-row-height": `${panelBounds.height * (1 - 2 * ymargin) / 24}px`,
      ...(hasClassicMonitorFrame
        ? {
          WebkitMaskImage: `url(${window.assetRegistry.monitorOpeningMask})`,
          WebkitMaskSize: "100% 100%",
          maskImage: `url(${window.assetRegistry.monitorOpeningMask})`,
          maskSize: "100% 100%",
        }
        : {}),
      ...panelBounds,
    } as React.CSSProperties
    : undefined

  const arrowSpacing = isAppleIIPlus ? "_" : selectArrowSpacing(selectLabel, language)
  const selectHintHalfCells = Math.ceil((isAppleIIPlus
    ? controlTextWidth(selectLabel, language) + 9
    : selectHintWidth(selectLabel, language)) * 2)
  const saveActionLabel = t("retroControl.save")
  const footerActionLabel = selectedItem?.contextualActionLabel
    ?? currentFrame?.actionLabel
    ?? (currentFrame ? saveActionLabel : t("retroControl.open"))
  const actionHintHalfCells = Math.ceil(actionHintWidth(footerActionLabel, language) * 2)
  const actionStartLine = 81 - actionHintHalfCells
  const showHorizontalSelectionHint = (selectedItem?.options?.length ?? 0) > 1 ||
    selectedItem?.onHorizontalInput !== undefined
  const showFooterAction = selectedItem?.contextualActionLabel !== undefined
    ? Boolean(selectedItem.contextualActionLabel)
    : !currentFrame || (currentFrame.isSubmitVisible
      ? currentFrame.isSubmitVisible(currentFrame.items, currentFrame.values)
      : currentFrame.actionLabel !== t("retroControl.load") || Boolean(selectedItem?.action))

  useEffect(() => {
    if (!isOpen) return
    const timer = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(timer)
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const handleSettingsChanged = (event: Event) => {
      const { controlIds } = (event as CustomEvent<SettingsChangedDetail>).detail
      if (currentFrame && !currentFrame.items.some(item => controlIds.includes(item.id))) return
      setSettingsRevision(revision => revision + 1)
      if (!currentFrame) return

      const selectedId = currentFrame.items[selectedIndex]?.id
      const items = resolveMenu(currentFrame.menuId)
      const nextSelectedIndex = selectedId
        ? items.findIndex(item => item.id === selectedId)
        : -1
      setMenuStack(stack => stack.map((frame, index) => index === stack.length - 1
        && frame.menuId === currentFrame.menuId
        ? createMenuFrame(
          frame.menuId,
          frame.title,
          items,
          frame.submenuTitleValue,
          frame.refresh,
          frame.actionLabel,
          frame.submit,
          frame.isSubmitVisible,
          frame.parentSelectedIndex,
        )
        : frame))
      setSelectedIndex(nextSelectedIndex >= 0
        ? nextSelectedIndex
        : Math.max(0, items.findIndex(item => isMenuItemSelectable(item))))
    }
    window.addEventListener(SETTINGS_CHANGED_EVENT, handleSettingsChanged)
    return () => window.removeEventListener(SETTINGS_CHANGED_EVENT, handleSettingsChanged)
  }, [currentFrame, isOpen, resolveMenu, selectedIndex])

  useEffect(() => {
    const handleDiskLoadSuccess = () => setIsOpen(false)
    window.addEventListener(DISK_LOAD_SUCCESS_EVENT, handleDiskLoadSuccess)
    return () => window.removeEventListener(DISK_LOAD_SUCCESS_EVENT, handleDiskLoadSuccess)
  }, [])

  useEffect(() => {
    const handleBookmarksChanged = () => {
      if (!isOpen || !currentFrame?.refresh ||
        (currentFrame.menuId !== "diskCollection.favorites" &&
          currentFrame.menuId !== "diskCollection.export" &&
          !currentFrame.menuId.includes(".internetArchive"))) return

      const selectedId = currentFrame.items[selectedIndex]?.id
      const items = currentFrame.refresh(currentFrame.items, currentFrame.values)
      const nextSelectedIndex = items.findIndex(item => item.id === selectedId)
      setMenuStack(stack => stack.map((frame, index) => index === stack.length - 1
        ? createMenuFrame(
          frame.menuId,
          frame.title,
          items,
          frame.submenuTitleValue,
          frame.refresh,
          frame.actionLabel,
          frame.submit,
          frame.isSubmitVisible,
          frame.parentSelectedIndex,
        )
        : frame))
      setSelectedIndex(nextSelectedIndex >= 0
        ? nextSelectedIndex
        : Math.max(0, items.findIndex(item => isMenuItemSelectable(item))))
    }
    window.addEventListener(DISK_BOOKMARKS_CHANGED_EVENT, handleBookmarksChanged)
    return () => window.removeEventListener(DISK_BOOKMARKS_CHANGED_EVENT, handleBookmarksChanged)
  }, [currentFrame, isOpen, selectedIndex])

  useEffect(() => {
    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (runTour) return
      if (hasOpenDialog) return
      if (event.shiftKey && !event.ctrlKey && !event.altKey && !event.metaKey && event.key === "Escape") {
        event.preventDefault()
        event.stopPropagation()
        if (!isOpen) {
          menuStack.toReversed().forEach(restoreMenuFramePreview)
          resetCollectionDriveSelectionSession()
          setNow(new Date())
          setIsOpen(true)
          setMenuStack([])
          setSelectedIndex(0)
        }
        return
      }
      if (!isOpen) return

      const isSubmitFrame = Boolean(currentFrame?.submit) &&
        currentMenu.some(item => item.checkmarkIndex !== undefined)
      if (event.ctrlKey && !event.altKey && !event.metaKey && event.key.toLocaleLowerCase() === "a" &&
        currentFrame && isSubmitFrame) {
        event.preventDefault()
        event.stopPropagation()
        const allSelected = currentFrame.items.every((item, index) =>
          item.checkmarkIndex === undefined ||
          !isMenuItemBulkSelectable(item, currentFrame) ||
          currentFrame.values[index] === item.checkmarkIndex)
        const values = currentFrame.items.map((item, itemIndex) => item.checkmarkIndex !== undefined &&
          isMenuItemBulkSelectable(item, currentFrame)
          ? allSelected ? 0 : item.checkmarkIndex ?? 0
          : currentFrame.values[itemIndex])
        const items = currentFrame.refresh?.(currentFrame.items, values) ?? currentFrame.items
        const refreshedValues = currentFrame.refresh
          ? items.map(item => item.optionIndex ?? -1)
          : values
        const selectedId = currentMenu[selectedIndex]?.id
        const refreshedSelectedIndex = items.findIndex(item => item.id === selectedId)
        setMenuStack(stack => stack.map((frame, index) => index === stack.length - 1
          ? { ...frame, items, values: refreshedValues }
          : frame))
        if (refreshedSelectedIndex >= 0) setSelectedIndex(refreshedSelectedIndex)
      } else if (event.key === "ArrowUp" || event.key === "ArrowDown" ||
        event.key === "PageUp" || event.key === "PageDown") {
        event.preventDefault()
        event.stopPropagation()
        const selectedItem = currentMenu[selectedIndex]
        const isLastSelectable = (event.key === "ArrowDown" || event.key === "PageDown") && !currentMenu
          .slice(selectedIndex + 1)
          .some(item => isMenuItemSelectable(item, currentFrame))
        if (currentFrame && isLastSelectable && selectedItem?.loadMoreOnNavigatePastEnd) {
          void selectedItem.loadMoreOnNavigatePastEnd().then(items => {
            const nextIndex = items.findIndex((item, index) =>
              index > selectedIndex && isMenuItemSelectable(item))
            setMenuStack(stack => stack.map((frame, index) => index === stack.length - 1
              ? { ...frame, items, values: items.map(item => item.optionIndex ?? -1) }
              : frame))
            if (nextIndex >= 0) setSelectedIndex(nextIndex)
          })
          return
        }
        if (currentFrame?.menuId.startsWith("diskCollection.") && currentFrame.refresh) {
          resetSelectedCollectionDriveIndex()
          const items = currentFrame.refresh(currentFrame.items, currentFrame.values)
          setMenuStack(stack => stack.map((frame, index) => index === stack.length - 1
            ? createMenuFrame(
              frame.menuId,
              frame.title,
              items,
              frame.submenuTitleValue,
              frame.refresh,
              frame.actionLabel,
              frame.submit,
              frame.isSubmitVisible,
              frame.parentSelectedIndex,
            )
            : frame))
        }
        const direction = event.key === "ArrowUp" || event.key === "PageUp" ? -1 : 1
        setSelectedIndex(index => {
          if (event.key === "PageUp" || event.key === "PageDown") {
            const selectableIndexes = currentMenu
              .map((item, itemIndex) => isMenuItemSelectable(item, currentFrame) ? itemIndex : -1)
              .filter(itemIndex => itemIndex >= 0)
            const selectablePosition = selectableIndexes.indexOf(index)
            const nextPosition = Math.max(0, Math.min(
              selectableIndexes.length - 1,
              selectablePosition + direction * maxVisibleMenuItems,
            ))
            return selectableIndexes[nextPosition] ?? index
          }
          let nextIndex = index
          for (let offset = 0; offset < currentMenu.length; offset += 1) {
            nextIndex = (nextIndex + direction + currentMenu.length) % currentMenu.length
            if (isMenuItemSelectable(currentMenu[nextIndex], currentFrame)) return nextIndex
          }
          return index
        })
      } else if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        const item = currentMenu[selectedIndex]
        if (!item) return
        const direction = event.key === "ArrowLeft" ? -1 : 1
        if (currentFrame && item.onHorizontalInput) {
          event.preventDefault()
          event.stopPropagation()
          const items = item.onHorizontalInput(direction)
          if (!items) return
          const refreshedSelectedIndex = items.findIndex(refreshedItem => refreshedItem.id === item.id)
          setMenuStack(stack => stack.map((frame, index) => index === stack.length - 1
            ? { ...frame, items, values: items.map(refreshedItem => refreshedItem.optionIndex ?? -1) }
            : frame))
          if (refreshedSelectedIndex >= 0) setSelectedIndex(refreshedSelectedIndex)
          return
        }
        const options = item.options
        if (currentFrame && options && options.length > 1) {
          event.preventDefault()
          event.stopPropagation()
          const revealCurrentValue = item.revealOptionOnFirstHorizontalInput &&
            item.contextualSubmenuTitleValue === undefined
          const nextValue = revealCurrentValue
            ? currentFrame.values[selectedIndex]
            : (currentFrame.values[selectedIndex] + direction + options.length) % options.length
          options[nextValue].preview?.()
          const pendingValues = [...currentFrame.values]
          pendingValues[selectedIndex] = nextValue
          const refreshedItems = item.refreshOptions?.(nextValue, currentFrame.items, pendingValues)
          const refreshedSelectedIndex = refreshedItems?.findIndex(refreshedItem => refreshedItem.id === item.id)
            ?? selectedIndex
          setMenuStack(stack => stack.map((frame, index) => {
            if (index !== stack.length - 1) return frame
            const items = refreshedItems ?? frame.items
            const values = refreshedItems
              ? refreshedItems.map(refreshedItem => refreshedItem.optionIndex ?? -1)
              : [...frame.values]
            values[refreshedSelectedIndex] = nextValue
            return { ...frame, title: item.refreshTitle?.() ?? frame.title, items, values }
          }))
          setSelectedIndex(refreshedSelectedIndex)
        }
      } else if (event.key === "Enter") {
        event.preventDefault()
        event.stopPropagation()
        const item = currentMenu[selectedIndex]
        if (!item) return
        if (item.children) {
          const refresh = typeof item.children === "function" ? item.children : undefined
          const children = typeof item.children === "function" ? item.children() : item.children
          setMenuStack(stack => [
            ...stack,
            createMenuFrame(
              item.id,
              item.submenuTitle ?? item.label,
              children,
              item.submenuTitleValue,
              refresh,
              item.actionLabel,
              item.submit,
              item.isSubmitVisible,
              selectedIndex,
            ),
          ])
          setSelectedIndex(Math.max(0, children.findIndex(child => isMenuItemSelectable(child))))
        } else if (currentFrame && item.options && item.kind !== "action") {
          if (currentFrame.submit && !item.valueOnly) {
            if (currentFrame.isSubmitVisible?.(currentFrame.items, currentFrame.values)) {
              currentFrame.submit(currentFrame.items, currentFrame.values)
              setMenuStack([])
              setSelectedIndex(0)
            }
            return
          }
          currentFrame.items.forEach((frameItem, index) => {
            if (currentFrame.values[index] !== currentFrame.originalValues[index]) {
              frameItem.options?.[currentFrame.values[index]]?.action?.()
            }
          })
          setMenuStack(refreshPreviousMenu)
          setSelectedIndex(currentFrame.parentSelectedIndex)
        } else {
          const actionResult = item.action?.()
          if (currentFrame && item.refreshAfterAction && actionResult instanceof Promise) {
            const selectedId = item.id
            void actionResult.then(() => {
              setMenuStack(stack => stack.map((frame, index) => {
                if (index !== stack.length - 1 || !frame.refresh) return frame
                const items = frame.refresh(frame.items, frame.values)
                const refreshedSelectedIndex = items.findIndex(child => child.id === selectedId)
                setSelectedIndex(refreshedSelectedIndex >= 0
                  ? refreshedSelectedIndex
                  : Math.max(0, items.findIndex(child => isMenuItemSelectable(child))))
                return createMenuFrame(
                  frame.menuId,
                  frame.title,
                  items,
                  frame.submenuTitleValue,
                  frame.refresh,
                  frame.actionLabel,
                  frame.submit,
                  frame.isSubmitVisible,
                  frame.parentSelectedIndex,
                )
              }))
            })
          } else if (currentFrame && !item.keepMenuOpen) {
            setMenuStack(refreshPreviousMenu)
            setSelectedIndex(currentFrame.parentSelectedIndex)
          }
        }
      } else if (event.key === "Escape") {
        event.preventDefault()
        event.stopPropagation()
        if (menuStack.length > 0) {
          restoreMenuFramePreview(currentFrame)
          setMenuStack(refreshPreviousMenu)
          setSelectedIndex(currentFrame.parentSelectedIndex)
        } else {
          const quitIndex = currentMenu.findIndex(item => item.id === "quit")
          if (quitIndex >= 0) setSelectedIndex(quitIndex)
        }
      } else if (currentFrame && selectedItem?.textInput && !event.ctrlKey && !event.altKey && !event.metaKey &&
        (event.key === "Backspace" || event.key.length === 1)) {
        event.preventDefault()
        event.stopPropagation()
        const nextValue = event.key === "Backspace"
          ? (selectedItem.textValue ?? "").slice(0, -1)
          : `${selectedItem.textValue ?? ""}${event.key}`
        const items = selectedItem.onTextInput?.(nextValue)
        if (items) {
          const selectedId = selectedItem.id
          setMenuStack(stack => stack.map((frame, index) => index === stack.length - 1
            ? { ...frame, items, values: items.map(item => item.optionIndex ?? -1) }
            : frame))
          const nextIndex = items.findIndex(item => item.id === selectedId)
          if (nextIndex >= 0) setSelectedIndex(nextIndex)
        }
      } else if (!event.ctrlKey && !event.altKey && !event.metaKey && /^[a-z]$/i.test(event.key)) {
        const shortcut = event.key.toLocaleLowerCase()
        const nextIndex = Array.from(
          { length: currentMenu.length },
          (_, offset) => (selectedIndex + offset + 1) % currentMenu.length,
        ).find(index => isMenuItemSelectable(currentMenu[index], currentFrame) &&
          currentMenu[index].label.toLocaleLowerCase().startsWith(shortcut))
        if (nextIndex !== undefined) {
          event.preventDefault()
          event.stopPropagation()
          setSelectedIndex(nextIndex)
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown, true)
    return () => window.removeEventListener("keydown", handleKeyDown, true)
  }, [
    currentFrame,
    currentMenu,
    hasOpenDialog,
    isOpen,
    menuStack,
    runTour,
    saveActionLabel,
    selectedItem,
    selectedIndex,
  ])

  const canvasHost = document.getElementById("apple2canvas")?.parentElement
  const submenuTitleValue = selectedItem?.contextualSubmenuTitleValue
    ?? currentFrame?.submenuTitleValue?.(currentFrame.items, currentFrame.values)
  const submenuTitleValueWidth = submenuTitleValue
    ? controlTextWidth(submenuTitleValue, language)
    : 0
  const submenuTitleWidth = currentFrame
    ? Math.max(0, 38 - submenuTitleValueWidth - (submenuTitleValue ? 1 : 0))
    : 38
  const visibleSubmenuTitle = currentFrame
    ? truncateControlText(currentFrame.title, submenuTitleWidth, language)
    : ""
  const visibleSubmenuTitleWidth = controlTextWidth(visibleSubmenuTitle, language)

  return (
    <>
      {isOpen && canvasBounds && canvasHost && createPortal(<section
        className={`retro-panel menu-open scanline-gradient ${effects}`}
        style={panelStyle}
        role="dialog"
        aria-label={t("retroControl.ariaLabel")}
        onContextMenu={event => event.preventDefault()}
      >
        <div className="retro-window">
          <RetroBorder
            className="retro-outer-border"
            separatorRow={2}
          />
          <header className={`retro-title${currentFrame ? " submenu-open" : ""}`}>
            {isAppleIIPlus
              ? <>
                <span className="retro-title-text">Apple2TS Control Panel</span>
                <span className="retro-title-spacer" aria-hidden="true">{fixedWidthSpace}</span>
                {!currentFrame &&
                  <span className="retro-title-fill" aria-hidden="true">{" ".repeat(19)}</span>}
              </>
              : <span>{"Apple2TS Control Panel "}&#8198;</span>}
          </header>
          {currentFrame && (isAppleIIPlus
            ? <div className="retro-submenu-title retro-text-submenu-title">
              <span className={retroFontSupports(currentFrame.title) ? undefined : "retro-browser-font"}>
                {visibleSubmenuTitle}
              </span>
              <span aria-hidden="true">{fixedWidthSpace}</span>
              <span className="retro-inverse-space" aria-hidden="true">
                {fixedWidthSpace.repeat(Math.max(
                  0,
                  40 - visibleSubmenuTitleWidth - submenuTitleValueWidth,
                ))}
                {submenuTitleValue}
                {fixedWidthSpace}
              </span>
            </div>
            : <div className="retro-submenu-title">
              <RetroBorder className="retro-submenu-title-border" />
              <span className={`retro-submenu-title-text${retroFontSupports(currentFrame.title) ? "" : " retro-browser-font"}`}>
                <span className="retro-submenu-title-content">
                  {visibleSubmenuTitle}
                </span>
              </span>
              {submenuTitleValue && <span className="retro-submenu-title-value">
                {submenuTitleValue}
              </span>}
            </div>)}
          {menuStack.length === 0 && <div className="retro-clock" aria-label={`${now.toLocaleTimeString(language)} ${now.toLocaleDateString(language)}`}>
            <RetroBorder className="retro-clock-border" />
            <time>{formatClockTime(now, language)}</time>
            <time><span>{now.toLocaleDateString(language, {
              month: "numeric",
              day: "numeric",
              year: "2-digit",
            })}</span></time>
          </div>}
          <div className={`retro-menu${currentFrame ? " retro-submenu-menu" : " retro-root-menu"}`} role="menu">
            {visibleMenu.map((item, visibleIndex) => {
              const index = visibleMenuStart + visibleIndex
              const valueIndex = currentFrame?.values[index] ?? item.optionIndex ?? -1
              const option = item.options?.[valueIndex]
              const baseLabel = item.valueOnly && option ? option.label : item.label
              const itemLabel = formatControlLabel(baseLabel, item.separator)
              const textValue = item.textInput ? item.textValue ?? "" : undefined
              const hasOptionValue = (option && !item.valueOnly && !item.hideOptionValue &&
                item.checkmarkIndex === undefined
              ) || item.textInput
              const availableWidth = currentFrame ? submenuTextWidth : rootMenuContentWidth
              const fittedText = fitControlText(
                itemLabel,
                hasOptionValue ? textValue ?? option?.label : undefined,
                availableWidth,
                language,
              )
              const visibleOption = fittedText.option
              const visibleLabel = fittedText.label
              const isChecked = item.checkmarkIndex !== undefined
                ? valueIndex === item.checkmarkIndex
                : item.defaultIndex !== undefined && valueIndex === item.defaultIndex
              const exportDisk = item.id.startsWith("diskCollection.export.disk.") && item.payload
                ? item.payload as DiskCollectionItem
                : undefined
              const unresolvedExportDisk = exportDisk?.vtocType === undefined ? exportDisk : undefined
              return (
                <div
                  className={`retro-menu-item${item.separator ? " separator" : ""}${selectedIndex === index ? " selected" : ""}`}
                  key={item.id}
                  role="menuitem"
                  aria-current={selectedIndex === index ? "true" : undefined}
                  aria-disabled={!isMenuItemSelectable(item, currentFrame) ? "true" : undefined}
                >
                  {currentFrame && <span className="retro-menu-check">
                    {unresolvedExportDisk
                      ? <RetroVtocIndicator
                        active={diskItemKey(unresolvedExportDisk) === activeVtocCheckKey}
                        disk={unresolvedExportDisk}
                        isAppleIIPlus={isAppleIIPlus}
                      />
                      : item.indicator ?? (isChecked ? (isAppleIIPlus ? "*" : checkmark) : " ")}
                  </span>}
                  <span className={`retro-menu-name${retroFontSupports(visibleLabel) ? "" : " retro-browser-font"}`}>
                    {visibleLabel}
                    {visibleOption || item.textInput ? ":" : ""}
                  </span>
                  {(visibleOption || item.textInput) &&
                    <>{" "}<span className={`retro-menu-value${option?.useBrowserFont || !retroFontSupports(visibleOption ?? "") ? " retro-browser-font" : ""}`}>
                      {visibleOption}
                      {item.textInput && selectedIndex === index && <span
                        className={`retro-text-cursor retro-mousetext${
                          item.id.endsWith(".internetArchive.title") || item.id.endsWith(".demoZoo.title")
                            ? " retro-solid-text-cursor"
                            : ""
                        }`}
                        aria-hidden="true"
                      >{mouseTextCursor}</span>}
                    </span></>}
                </div>
              )
            })}
          </div>
          {isAppleIIPlus
            ? <AppleIIPlusFooter
              actionLabel={footerActionLabel}
              cancelLabel={currentFrame ? t("retroControl.cancelEsc") : undefined}
              language={language}
              selectLabel={selectLabel}
              showAction={showFooterAction}
              showHorizontalSelectionHint={showHorizontalSelectionHint}
            />
            : <footer className={currentFrame ? "retro-submenu-footer" : "retro-root-footer"}>
              <span
                className={`retro-footer-select${retroFontSupports(selectLabel) ? "" : " retro-browser-font"}`}
                style={{ gridColumn: `1 / ${selectHintHalfCells + 1}` }}
              >{fixedWidthSpace}<span className="retro-footer-text"><span className="retro-footer-content">{`${selectLabel}:`}<i className="retro-mousetext">
                {showHorizontalSelectionHint && <>{mouseTextLeft}{arrowSpacing}{mouseTextRight}{arrowSpacing}</>}
                {currentFrame
                  ? <>{mouseTextUp}{arrowSpacing}{mouseTextDown}</>
                  : <>{mouseTextDown}{arrowSpacing}{mouseTextUp}</>}
              </i></span></span></span>
              {currentFrame && <span
                className={`retro-footer-cancel${retroFontSupports(t("retroControl.cancelEsc")) ? "" : " retro-browser-font"}`}
                style={{
                  gridColumn: `${selectHintHalfCells + 1} / ${actionStartLine}`,
                }}
              ><span className="retro-footer-text"><span className="retro-footer-content">
                {t("retroControl.cancelEsc")}
              </span></span></span>}
              <span
                aria-hidden={!showFooterAction}
                className={`retro-footer-action${showFooterAction ? "" : " hidden"}${retroFontSupports(footerActionLabel) ? "" : " retro-browser-font"}`}
                style={{ gridColumn: `${actionStartLine} / 81` }}
              >
                <span className="retro-footer-text"><span className="retro-footer-content">{`${footerActionLabel}:`}
                  <i className="retro-mousetext">{mouseTextReturn}</i>
                </span></span>{fixedWidthSpace}
              </span>
            </footer>}
        </div>
      </section>, canvasHost)}
      <DiskPanelVtoc
        activeTab={TAB_INDEX.EXPORT}
        isFlyoutOpen={isOpen && isExportScreen}
        diskBookmarks={diskBookmarks}
        setDiskCollection={updateDiskCollection}
        exportQueue={[]}
        downloadedDisks={[]}
        visibleCandidates={isExportScreen ? diskCollection.filter(isDiskExportable) : []}
        authRefresh={authRefresh}
        cloudProviderHasAuthToken={cloudProviderHasAuthToken}
        setActiveVtocCheckKey={setActiveVtocCheckKey}
        showProgressModal={false}
        panelVisible={isOpen && isExportScreen}
      />
      {dialogs}
    </>
  )
}

export default RetroMenuRenderer