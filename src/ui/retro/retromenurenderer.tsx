import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react"
import { createPortal, flushSync } from "react-dom"
import type { RetroResolvedControl } from "./retromenucontext"
import { formatControlLabel } from "../controls/controlregistry"
import { useRetroMenuHost } from "./retromenuhost"
import {
  actionHintWidth,
  controlTextWidth,
  fitControlText,
  formatClockTime,
  menuItemTextWidth,
  mouseTextGlyphs,
  retroFontSupports,
  selectArrowSpacing,
  selectHintWidth,
  shouldUseCompactLatinFooter,
  truncateControlText,
} from "./retrotext"
import "./retrocontrolpanel.css"
import { RETRO_SKIN } from "../localstorage"
import { SETTINGS_CHANGED_EVENT, type SettingsChangedDetail } from "../settingschange"
import { DISK_LOAD_SUCCESS_EVENT, getCrtDistortion, getMonitorMode, getTheme } from "../ui_settings"
import { setDisplayOverride, xmargin, ymargin } from "../graphics"
import { MONITOR_MODE, UI_THEME } from "../../common/utility"
import { DiskPanelVtoc } from "../diskdialog/diskpanel_vtoc"
import { diskItemKey, isDiskExportable, TAB_INDEX } from "../diskdialog/diskpanel_utils"
import { cloudProviderHasAuthToken } from "../devices/disk/cloudauth"
import { DISK_BOOKMARKS_CHANGED_EVENT } from "../devices/disk/diskbookmarks"
import {
  getRetroVtocIndicator,
  resetCollectionDriveSelectionSession,
  resetSelectedCollectionDriveIndex,
} from "../devices/disk/diskinterface"
import { renderRetroPanelLayout } from "./retropanellayout"
import { renderRetroPanelToCanvas } from "./retrocanvas"
import { isInteractiveKeyboardTarget } from "./retrokeyboard"
import { OPEN_RETRO_CONTROL_PANEL_EVENT } from "./retrocontrolevents"
import { getPanelSwipeKey } from "./retrogestures"

type RetroMenuItem = RetroResolvedControl

type CanvasBounds = {
  left: number
  top: number
  width: number
  height: number
}

type CanvasRenderState = "native" | "pending" | "rendered"

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
  onLeave?: (items: readonly RetroMenuItem[], values: number[]) => void
}

const mouseTextDown = mouseTextGlyphs.down
const mouseTextLeft = mouseTextGlyphs.left
const mouseTextRight = mouseTextGlyphs.right
const mouseTextUp = mouseTextGlyphs.up
const mouseTextReturn = mouseTextGlyphs.return
const mouseTextCursor = String.fromCodePoint(0xE07F)
const checkmark = String.fromCodePoint(0xE084)
const fixedWidthSpace = String.fromCodePoint(0x2007)
const topBorderGlyph = String.fromCodePoint(0xE05F)
const bottomBorderGlyph = String.fromCodePoint(0xE08C)
const leftBorderGlyph = String.fromCodePoint(0xE09F)
const rightBorderGlyph = String.fromCodePoint(0xE09A)
const submenuTitleContentWidth = 34
const retroNativeWidth = 560
const retroNativeHeight = 384
const clockPauseMs = 33
const cursorBlinkMs = 500

const dispatchPanelKey = (key: string) => {
  window.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true }))
}

const PanelKeyControl = ({ children, keyName }: { children: ReactNode, keyName: string }) =>
  <span
    className={`retro-panel-key${keyName.startsWith("Arrow") ? " retro-panel-arrow-key" : ""}`}
    role="button"
    tabIndex={0}
    onClick={() => dispatchPanelKey(keyName)}
    onKeyDown={event => {
      if (event.key !== "Enter" && event.key !== " ") return
      event.preventDefault()
      dispatchPanelKey(keyName)
    }}
  >{children}</span>

const PanelArrowControls = ({
  separator,
  showHorizontal,
  submenuOpen,
}: {
  separator: string
  showHorizontal: boolean
  submenuOpen: boolean
}) => <i className="retro-mousetext">
    {showHorizontal && <>
      <PanelKeyControl keyName="ArrowLeft">{mouseTextLeft}</PanelKeyControl>{separator}
      <PanelKeyControl keyName="ArrowRight">{mouseTextRight}</PanelKeyControl>{separator}
    </>}
    {submenuOpen
      ? <>
        <PanelKeyControl keyName="ArrowUp">{mouseTextUp}</PanelKeyControl>{separator}
        <PanelKeyControl keyName="ArrowDown">{mouseTextDown}</PanelKeyControl>
      </>
      : <>
        <PanelKeyControl keyName="ArrowDown">{mouseTextDown}</PanelKeyControl>{separator}
        <PanelKeyControl keyName="ArrowUp">{mouseTextUp}</PanelKeyControl>
      </>}
  </i>

const isCloudSearchTitle = (item: RetroMenuItem | undefined) => Boolean(
  item?.textInput &&
  (item.id.endsWith(".internetArchive.title") || item.id.endsWith(".demoZoo.title")),
)

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
  adaptiveLayout,
  cancelLabel,
  compactLatin,
  language,
  maxActionWidth,
  selectLabel,
  showAction,
  showHorizontalSelectionHint,
}: {
  actionLabel: string
  adaptiveLayout: boolean
  cancelLabel?: string
  compactLatin: boolean
  language: string
  maxActionWidth: number
  selectLabel: string
  showAction: boolean
  showHorizontalSelectionHint: boolean
}) => {
  const arrowText = `${showHorizontalSelectionHint ? `${mouseTextLeft}_${mouseTextRight}_` : ""}${cancelLabel
    ? `${mouseTextUp}_${mouseTextDown}`
    : `${mouseTextDown}_${mouseTextUp}`}`

  if (adaptiveLayout) {
    return <footer className={`retro-text-footer retro-compact-apple-footer${compactLatin
      ? " retro-compact-latin-footer"
      : ""}`}>
      <span className={`retro-footer-select${retroFontSupports(selectLabel) ? "" : " retro-browser-font"}`}>
        {`${selectLabel}:`}<PanelArrowControls
          separator="_"
          showHorizontal={showHorizontalSelectionHint}
          submenuOpen={Boolean(cancelLabel)}
        />
      </span>
      <span className={`retro-footer-cancel${retroFontSupports(cancelLabel ?? "") ? "" : " retro-browser-font"}`}>
        {cancelLabel && <PanelKeyControl keyName="Escape">{cancelLabel}</PanelKeyControl>}
      </span>
      <span className={`retro-footer-action${showAction ? "" : " hidden"}${retroFontSupports(actionLabel) ? "" : " retro-browser-font"
        }`}>
        <PanelKeyControl keyName="Enter">
          {`${actionLabel}:`}<i className="retro-mousetext">{mouseTextReturn}</i>
        </PanelKeyControl>
      </span>
    </footer>
  }

  const selectText = `${selectLabel}:${arrowText}`
  const actionText = showAction ? `${actionLabel}:${mouseTextReturn}` : ""
  const rowWidth = 36
  const maxSelectText = `${selectLabel}:${mouseTextLeft}_${mouseTextRight}_${mouseTextUp}_${mouseTextDown}`
  const maxSelectWidth = controlTextWidth(maxSelectText, language)
  const actionStart = rowWidth - maxActionWidth
  const cancelWidth = cancelLabel ? controlTextWidth(cancelLabel, language) : 0
  const cancelStart = cancelLabel
    ? maxSelectWidth + Math.max(0, Math.floor(
      (actionStart - maxSelectWidth - cancelWidth) / 2,
    ))
    : 0
  const placements: Array<{ start: number, text: string, content: ReactNode }> = [
    {
      start: 0,
      text: selectText,
      content: <>{`${selectLabel}:`}<PanelArrowControls
        separator="_"
        showHorizontal={showHorizontalSelectionHint}
        submenuOpen={Boolean(cancelLabel)}
      /></>,
    },
    ...(cancelLabel
      ? [{
        start: cancelStart,
        text: cancelLabel,
        content: <PanelKeyControl keyName="Escape">{cancelLabel}</PanelKeyControl>,
      }]
      : []),
    ...(actionText
      ? [{
        start: actionStart,
        text: actionText,
        content: <PanelKeyControl keyName="Enter">
          {`${actionLabel}:`}<i className="retro-mousetext">{mouseTextReturn}</i>
        </PanelKeyControl>,
      }]
      : []),
  ].sort((left, right) => left.start - right.start)
  const runs: { border: boolean, text: string, content?: ReactNode }[] = []
  let cursor = 0
  placements.forEach((placement) => {
    if (placement.start > cursor) runs.push({ border: true, text: "_".repeat(placement.start - cursor) })
    runs.push({ border: false, text: placement.text, content: placement.content })
    cursor = Math.max(cursor, placement.start + controlTextWidth(placement.text, language))
  })
  if (cursor < rowWidth) runs.push({ border: true, text: "_".repeat(rowWidth - cursor) })

  return <footer className="retro-text-footer">
    {runs.map((run, index) => <span
      className={run.border || retroFontSupports(run.text) ? undefined : "retro-browser-font"}
      key={`${index}-${run.text}`}
    >{run.content ?? run.text}</span>)}
  </footer>
}

const RetroBorder = ({
  appleIIPlus = false,
  appleIIPlusBottomBorder = false,
  appleIIPlusFullHeightSides = false,
  className,
  columns = 40,
  notchedCorners = false,
  rows = 24,
  separatorRow,
}: {
  appleIIPlus?: boolean
  appleIIPlusBottomBorder?: boolean
  appleIIPlusFullHeightSides?: boolean
  className: string
  columns?: number
  notchedCorners?: boolean
  rows?: number
  separatorRow?: number
}) => {
  const sideRows = appleIIPlusFullHeightSides ? rows : Math.max(0, rows - 2)
  if (!appleIIPlus) {
    const bottomBorderGlyphs = bottomBorderGlyph.repeat(columns)
    return <div className={`retro-border ${className}${appleIIPlusFullHeightSides
      ? " retro-border-full-height-sides"
      : ""}`} aria-hidden="true">
      <span className="retro-border-glyph retro-border-glyph-top">{topBorderGlyph.repeat(columns)}</span>
      <span className="retro-border-glyph retro-border-glyph-bottom">{bottomBorderGlyphs}</span>
      <span className="retro-border-glyph retro-border-glyph-left">{Array(sideRows).fill(leftBorderGlyph).join("\n")}</span>
      <span className="retro-border-glyph retro-border-glyph-right">{Array(sideRows).fill(rightBorderGlyph).join("\n")}</span>
      {separatorRow && <span
        className="retro-border-separator"
        style={{ top: `calc(${separatorRow - 1} * var(--retro-row-height))` }}
      >{bottomBorderGlyphs}</span>}
      {notchedCorners && <>
        <span className="retro-border-notch retro-border-notch-top-left" />
        <span className="retro-border-notch retro-border-notch-top-right" />
        <span className="retro-border-notch retro-border-notch-bottom-left" />
        <span className="retro-border-notch retro-border-notch-bottom-right" />
      </>}
    </div>
  }

  const appleIIPlusHorizontalBorder = columns > 1
    ? ` ${"_".repeat(columns - 2)} `
    : " ".repeat(columns)
  const topBorderGlyphs = appleIIPlusHorizontalBorder
  const bottomBorderGlyphs = appleIIPlusBottomBorder ? appleIIPlusHorizontalBorder : ""
  const leftBorderGlyphs = Array(sideRows)
    .fill("!").join("\n")
  const rightBorderGlyphs = Array(sideRows)
    .fill("!").join("\n")
  const separatorGlyphs = bottomBorderGlyphs
  return <div className={`retro-border ${className}${appleIIPlusFullHeightSides
    ? " retro-border-full-height-sides"
    : ""}`} aria-hidden="true">
    <span className="retro-border-glyph retro-border-glyph-top">{topBorderGlyphs}</span>
    <span className="retro-border-glyph retro-border-glyph-bottom">{bottomBorderGlyphs}</span>
    <span className="retro-border-glyph retro-border-glyph-left">{leftBorderGlyphs}</span>
    <span className="retro-border-glyph retro-border-glyph-right">{rightBorderGlyphs}</span>
    {separatorRow && <span
      className="retro-border-separator"
      style={{ top: `calc(${separatorRow - 1} * var(--retro-row-height))` }}
    >{separatorGlyphs}</span>}
  </div>
}

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
  onLeave?: (items: readonly RetroMenuItem[], values: number[]) => void,
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
    onLeave,
  }
}

const leaveMenuFrame = (frame?: RetroMenuFrame) => frame?.onLeave?.(frame.items, frame.values)

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
    previousFrame.onLeave,
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
  const [canvasRenderState, setCanvasRenderState] = useState<CanvasRenderState>("native")
  const panelCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const panelCanvasPoolRef = useRef<HTMLCanvasElement[]>([])
  const panelRenderRevision = useRef(0)
  const clockPausedUntilRef = useRef(0)
  const menuStackRef = useRef<RetroMenuFrame[]>([])
  useLayoutEffect(() => {
    menuStackRef.current = manualMenuStack
  }, [manualMenuStack])
  useEffect(() => () => setDisplayOverride(null), [])
  const close = () => {
    const frame = menuStackRef.current.at(-1)
    menuStackRef.current = []
    leaveMenuFrame(frame)
    setCanvasRenderState("native")
    setIsOpen(false)
  }
  const {
    activeVtocCheckKey,
    authRefresh,
    dialogs,
    diskBookmarks,
    diskCollection,
    panelClasses,
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
  const open = () => {
    menuStack.toReversed().forEach(restoreMenuFramePreview)
    resetCollectionDriveSelectionSession()
    setNow(new Date())
    clockPausedUntilRef.current = Date.now() + clockPauseMs
    setCanvasRenderState(getCrtDistortion() ? "pending" : "native")
    setIsOpen(true)
    setMenuStack([])
    setSelectedIndex(0)
  }
  const maxVisibleMenuItems = 16
  const visibleMenuStart = currentFrame
    ? Math.min(
      Math.max(0, selectedIndex - maxVisibleMenuItems + 1),
      Math.max(0, currentMenu.length - maxVisibleMenuItems),
    )
    : 0
  const visibleMenu = currentMenu.slice(visibleMenuStart, visibleMenuStart + maxVisibleMenuItems)
  const selectedItem = currentMenu[selectedIndex]
  const handleMenuItemClick = (
    event: ReactMouseEvent<HTMLElement>,
    item: RetroMenuItem,
    index: number,
  ) => {
    const panel = event.currentTarget.closest<HTMLElement>(".retro-panel")
    if (panel?.dataset.suppressClick === "true") {
      delete panel.dataset.suppressClick
      return
    }
    if (!isMenuItemSelectable(item, currentFrame)) return
    flushSync(() => setSelectedIndex(index))
    dispatchPanelKey(currentFrame && item.options && item.kind !== "action"
      ? "ArrowRight"
      : "Enter")
  }
  const handlePanelPointerDown = (event: ReactPointerEvent<HTMLElement>) => {
    if (!event.isPrimary) return
    event.currentTarget.dataset.pointerId = String(event.pointerId)
    event.currentTarget.dataset.pointerX = String(event.clientX)
    event.currentTarget.dataset.pointerY = String(event.clientY)
    delete event.currentTarget.dataset.suppressClick
  }
  const handlePanelPointerUp = (event: ReactPointerEvent<HTMLElement>) => {
    const panel = event.currentTarget
    const pointerId = Number(panel.dataset.pointerId)
    const startX = Number(panel.dataset.pointerX)
    const startY = Number(panel.dataset.pointerY)
    delete panel.dataset.pointerId
    delete panel.dataset.pointerX
    delete panel.dataset.pointerY
    if (pointerId !== event.pointerId || !Number.isFinite(startX) || !Number.isFinite(startY)) return
    const key = getPanelSwipeKey(event.clientX - startX, event.clientY - startY)
    if (!key) return
    panel.dataset.suppressClick = "true"
    window.setTimeout(() => delete panel.dataset.suppressClick, 0)
    dispatchPanelKey(key)
  }
  const handlePanelPointerCancel = (event: ReactPointerEvent<HTMLElement>) => {
    delete event.currentTarget.dataset.pointerId
    delete event.currentTarget.dataset.pointerX
    delete event.currentTarget.dataset.pointerY
    delete event.currentTarget.dataset.suppressClick
  }
  const hasBlinkingCloudSearchCursor = Boolean(currentFrame) && isCloudSearchTitle(selectedItem)
  const showCloudSearchCursor = Math.floor(now.getTime() / cursorBlinkMs) % 2 === 0
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
  const retroScale = panelBounds
    ? Math.min(
      panelBounds.width * (1 - 2 * xmargin) / retroNativeWidth,
      panelBounds.height * (1 - 2 * ymargin) / retroNativeHeight,
    )
    : 1
  const hasClassicMonitorFrame = getTheme() === UI_THEME.CLASSIC && document.fullscreenElement === null
  const panelStyle = panelBounds
    ? {
      ...iigsStyle,
      "--retro-scale": retroScale,
      "--retro-viewport-height": `${retroNativeHeight * retroScale}px`,
      "--retro-viewport-width": `${retroNativeWidth * retroScale}px`,
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
  const selectHintCells = Math.ceil(isAppleIIPlus
    ? controlTextWidth(selectLabel, language) + 9
    : selectHintWidth(selectLabel, language))
  const saveActionLabel = t("retroControl.save")
  const footerActionLabel = selectedItem?.contextualActionLabel
    ?? currentFrame?.actionLabel
    ?? (currentFrame ? saveActionLabel : t("retroControl.open"))
  const maxFooterActionWidth = Math.max(
    controlTextWidth(`${footerActionLabel}:${mouseTextReturn}`, language),
    ...currentMenu.map(item => item.contextualActionLabel
      ? controlTextWidth(`${item.contextualActionLabel}:${mouseTextReturn}`, language)
      : 0),
  )
  const cancelLabel = currentFrame ? t("retroControl.cancelEsc") : ""
  const useCompactLatinFooter = shouldUseCompactLatinFooter(
    [selectLabel, cancelLabel, footerActionLabel],
    Math.ceil(selectHintWidth(selectLabel, language)) +
    controlTextWidth(cancelLabel, language) + maxFooterActionWidth,
  )
  const useAdaptiveAppleFooter = useCompactLatinFooter ||
    [selectLabel, cancelLabel, footerActionLabel].some(text => !retroFontSupports(text))
  const actionHintCells = Math.ceil(actionHintWidth(footerActionLabel, language))
  const actionStartLine = 37 - actionHintCells
  const showHorizontalSelectionHint = (selectedItem?.options?.length ?? 0) > 1 ||
    selectedItem?.onHorizontalInput !== undefined
  const showFooterAction = selectedItem?.contextualActionLabel !== undefined
    ? Boolean(selectedItem.contextualActionLabel)
    : !currentFrame || (currentFrame.isSubmitVisible
      ? currentFrame.isSubmitVisible(currentFrame.items, currentFrame.values)
      : currentFrame.actionLabel !== t("retroControl.load") || Boolean(selectedItem?.action))

  useEffect(() => {
    if (!isOpen || (currentFrame && !hasBlinkingCloudSearchCursor)) return
    const timer = window.setInterval(() => {
      if (currentFrame || Date.now() >= clockPausedUntilRef.current) setNow(new Date())
    }, currentFrame ? cursorBlinkMs : 1000)
    return () => window.clearInterval(timer)
  }, [currentFrame, hasBlinkingCloudSearchCursor, isOpen])

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
          frame.onLeave,
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
    const handleDiskLoadSuccess = () => close()
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
          frame.onLeave,
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
    const handleOpen = () => {
      if (isOpen) {
        close()
      } else {
        open()
      }
    }
    window.addEventListener(OPEN_RETRO_CONTROL_PANEL_EVENT, handleOpen)
    return () => window.removeEventListener(OPEN_RETRO_CONTROL_PANEL_EVENT, handleOpen)
  }, [isOpen, menuStack])

  useEffect(() => {
    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (isInteractiveKeyboardTarget(event.target)) return
      if (runTour) return
      if (hasOpenDialog) return
      if (event.shiftKey && !event.ctrlKey && !event.altKey && !event.metaKey && event.key === "Escape") {
        event.preventDefault()
        event.stopPropagation()
        if (isOpen) {
          close()
        } else {
          open()
        }
        return
      }
      if (!isOpen) return
      clockPausedUntilRef.current = Date.now() + clockPauseMs

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
              frame.onLeave,
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
          const openSubmenu = () => {
            const refresh = typeof item.children === "function" ? item.children : undefined
            const children = typeof item.children === "function" ? item.children() : item.children!
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
                item.onLeave,
              ),
            ])
            setSelectedIndex(Math.max(0, children.findIndex(child => isMenuItemSelectable(child))))
            if (item.afterOpen) {
              void item.afterOpen().then(() => {
                if (!refresh) return
                const refreshedChildren = refresh()
                setMenuStack(stack => stack.map((frame, index) => index === stack.length - 1 &&
                  frame.menuId === item.id
                  ? createMenuFrame(
                    item.id,
                    item.submenuTitle ?? item.label,
                    refreshedChildren,
                    item.submenuTitleValue,
                    refresh,
                    item.actionLabel,
                    item.submit,
                    item.isSubmitVisible,
                    selectedIndex,
                    item.onLeave,
                  )
                  : frame))
                setSelectedIndex(Math.max(
                  0,
                  refreshedChildren.findIndex(child => isMenuItemSelectable(child)),
                ))
              })
            }
          }
          openSubmenu()
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
          leaveMenuFrame(currentFrame)
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
                  frame.onLeave,
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
          leaveMenuFrame(currentFrame)
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
  useLayoutEffect(() => {
    if (!isOpen || !canvasBounds) {
      panelRenderRevision.current++
      if (panelCanvasRef.current) panelCanvasPoolRef.current.push(panelCanvasRef.current)
      panelCanvasRef.current = null
      setDisplayOverride(null)
      return
    }
    const displayCanvas = document.getElementById("apple2canvas") as HTMLCanvasElement | null
    const panel = document.querySelector<HTMLElement>(".retro-panel")
    const nativeSurface = panel?.querySelector<HTMLElement>(".retro-native-surface")
    if (!displayCanvas || !panel || !nativeSurface) return
    const revision = ++panelRenderRevision.current
    const canvas = panelCanvasPoolRef.current.pop() ?? document.createElement("canvas")
    const renderAtDisplayResolution = getMonitorMode() === MONITOR_MODE.RGB &&
      !getCrtDistortion()
    const rasterWidth = renderAtDisplayResolution
      ? Math.floor(displayCanvas.width * (1 - 2 * xmargin))
      : retroNativeWidth
    const rasterHeight = renderAtDisplayResolution
      ? Math.floor(displayCanvas.height * (1 - 2 * ymargin))
      : retroNativeHeight
    void renderRetroPanelToCanvas(
      panel,
      nativeSurface,
      canvas,
      rasterWidth,
      rasterHeight,
    ).then(() => {
      if (revision !== panelRenderRevision.current) {
        panelCanvasPoolRef.current.push(canvas)
        return
      }
      if (panelCanvasRef.current) panelCanvasPoolRef.current.push(panelCanvasRef.current)
      panelCanvasRef.current = canvas
      setDisplayOverride(canvas)
      setCanvasRenderState("rendered")
    }).catch(() => {
      panelCanvasPoolRef.current.push(canvas)
      if (revision !== panelRenderRevision.current) return
      setDisplayOverride(null)
      setCanvasRenderState("native")
    })
    return () => {
      panelRenderRevision.current = Math.max(panelRenderRevision.current, revision + 1)
    }
  }, [
    activeVtocCheckKey,
    canvasBounds,
    currentFrame,
    currentMenu,
    panelClasses,
    isOpen,
    manualMenuStack,
    manualSelectedIndex,
    now,
    rootMenu,
  ])
  const submenuTitleValue = selectedItem?.contextualSubmenuTitleValue
    ?? currentFrame?.submenuTitleValue?.(currentFrame.items, currentFrame.values)
  const submenuTitleValueWidth = submenuTitleValue
    ? controlTextWidth(submenuTitleValue, language)
    : 0
  const submenuTitleWidth = currentFrame
    ? Math.max(0, submenuTitleContentWidth - submenuTitleValueWidth -
      (submenuTitleValue ? 1 : 0))
    : submenuTitleContentWidth
  const visibleSubmenuTitle = currentFrame
    ? truncateControlText(currentFrame.title, submenuTitleWidth, language)
    : ""
  const visibleSubmenuTitleWidth = controlTextWidth(visibleSubmenuTitle, language)

  return (
    <>
      {isOpen && canvasBounds && canvasHost && createPortal(renderRetroPanelLayout({
        border: <RetroBorder
          appleIIPlus={isAppleIIPlus}
          className="retro-outer-border"
          columns={38}
          notchedCorners
          rows={24}
          separatorRow={isAppleIIPlus ? undefined : 3}
        />,
        title: <header className={`retro-title${currentFrame ? " submenu-open" : ""}`}>
          {isAppleIIPlus
            ? <>
              <span className="retro-title-text">Apple2TS_Control_Panel_</span>
              {currentFrame
                ? <span className="retro-title-rule" aria-hidden="true">{"_".repeat(13)}</span>
                : <span className="retro-title-fill" aria-hidden="true">{" ".repeat(13)}</span>}
            </>
            : <span>{"Apple2TS Control Panel "}&#8198;</span>}
        </header>,
        submenu: currentFrame && (isAppleIIPlus
          ? <div className="retro-submenu-title retro-text-submenu-title">
            <RetroBorder
              appleIIPlus
              appleIIPlusFullHeightSides
              className="retro-submenu-title-border"
              columns={38}
              rows={3}
            />
            <span className="retro-submenu-title-row">
              <span className={retroFontSupports(currentFrame.title) ? undefined : "retro-browser-font"}>
                {visibleSubmenuTitle.replaceAll(" ", "_")}_
              </span>
              <span className="retro-inverse-space" aria-hidden="true">
                {fixedWidthSpace.repeat(Math.max(
                  0,
                  submenuTitleContentWidth - visibleSubmenuTitleWidth - submenuTitleValueWidth,
                ))}
                {submenuTitleValue}
                {fixedWidthSpace}
              </span>
            </span>
          </div>
          : <div className="retro-submenu-title">
            <RetroBorder className="retro-submenu-title-border" columns={38} rows={3} />
            <span className={`retro-submenu-title-text${retroFontSupports(currentFrame.title) ? "" : " retro-browser-font"}`}>
              <span className="retro-submenu-title-content">
                {visibleSubmenuTitle}{fixedWidthSpace}
              </span>
            </span>
            {submenuTitleValue && <span className="retro-submenu-title-value">
              {submenuTitleValue}
            </span>}
          </div>),
        clock: menuStack.length === 0 && <div className="retro-clock" aria-label={`${now.toLocaleTimeString(language)} ${now.toLocaleDateString(language)}`}>
          <RetroBorder
            appleIIPlus={isAppleIIPlus}
            className="retro-clock-border"
            columns={isAppleIIPlus ? 14 : 17}
            notchedCorners
            rows={4}
          />
          <time>{formatClockTime(now, language)}</time>
          <time><span>{now.toLocaleDateString(language, {
            month: "numeric",
            day: "numeric",
            year: "2-digit",
          })}</span></time>
        </div>,
        menu: <div className={`retro-menu${currentFrame ? " retro-submenu-menu" : " retro-root-menu"}`} role="menu">
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
            const availableWidth = currentFrame ? menuItemTextWidth.submenu : menuItemTextWidth.root
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
                onClick={event => handleMenuItemClick(event, item, index)}
                onMouseEnter={() => {
                  if (isMenuItemSelectable(item, currentFrame)) setSelectedIndex(index)
                }}
                style={!currentFrame && item.id === "quit"
                  ? { gridRow: visibleIndex + 2 }
                  : undefined}
              >
                {currentFrame && <span className="retro-menu-check">
                  {unresolvedExportDisk
                    ? <RetroVtocIndicator
                      active={diskItemKey(unresolvedExportDisk) === activeVtocCheckKey}
                      disk={unresolvedExportDisk}
                      isAppleIIPlus={isAppleIIPlus}
                    />
                    : item.indicator ?? (isChecked
                      ? item.checkedIndicator ?? (isAppleIIPlus ? "*" : checkmark)
                      : " ")}
                </span>}
                <span className={`retro-menu-name${item.useRetroFont || retroFontSupports(visibleLabel) ? "" : " retro-browser-font"}`}>
                  {visibleLabel}
                  {visibleOption || item.textInput ? ":" : ""}
                </span>
                {(visibleOption || item.textInput) &&
                  <>{" "}<span className={`retro-menu-value${option?.useBrowserFont || !retroFontSupports(visibleOption ?? "") ? " retro-browser-font" : ""}`}>
                    {visibleOption}
                    {item.textInput && selectedIndex === index &&
                      (!isCloudSearchTitle(item) || showCloudSearchCursor) && <span
                        className={`retro-text-cursor retro-mousetext${item.id.endsWith(".internetArchive.title") || item.id.endsWith(".demoZoo.title")
                          ? " retro-solid-text-cursor"
                          : ""
                          }`}
                        aria-hidden="true"
                      >{mouseTextCursor}</span>}
                  </span></>}
              </div>
            )
          })}
        </div>,
        footer: isAppleIIPlus
          ? <AppleIIPlusFooter
            actionLabel={footerActionLabel}
            adaptiveLayout={useAdaptiveAppleFooter}
            cancelLabel={currentFrame ? t("retroControl.cancelEsc") : undefined}
            compactLatin={useCompactLatinFooter}
            language={language}
            maxActionWidth={maxFooterActionWidth}
            selectLabel={selectLabel}
            showAction={showFooterAction}
            showHorizontalSelectionHint={showHorizontalSelectionHint}
          />
          : <footer className={`${currentFrame ? "retro-submenu-footer" : "retro-root-footer"}${useCompactLatinFooter ? " retro-compact-latin-footer" : ""
            }`}>
            <span
              className={`retro-footer-select${retroFontSupports(selectLabel) ? "" : " retro-browser-font"}`}
              style={{ gridColumn: `1 / ${selectHintCells + 1}` }}
            ><span className="retro-footer-text"><span className="retro-footer-content">{`${selectLabel}:`}
              <PanelArrowControls
                separator={arrowSpacing}
                showHorizontal={showHorizontalSelectionHint}
                submenuOpen={Boolean(currentFrame)}
              />
            </span></span></span>
            {currentFrame && <span
              className={`retro-footer-cancel${retroFontSupports(cancelLabel) ? "" : " retro-browser-font"}`}
              style={{
                gridColumn: `${selectHintCells + 1} / ${actionStartLine}`,
              }}
            ><span className="retro-footer-text"><span className="retro-footer-content">
              <PanelKeyControl keyName="Escape">{cancelLabel}</PanelKeyControl>
            </span></span></span>}
            <span
              aria-hidden={!showFooterAction}
              className={`retro-footer-action${showFooterAction ? "" : " hidden"}${retroFontSupports(footerActionLabel) ? "" : " retro-browser-font"}`}
              style={{ gridColumn: `${actionStartLine} / 37` }}
            >
              <span className="retro-footer-text"><span className="retro-footer-content">
                <PanelKeyControl keyName="Enter">
                  {`${footerActionLabel}:`}<i className="retro-mousetext">{mouseTextReturn}</i>
                </PanelKeyControl>
              </span></span>
            </span>
          </footer>,
      }, {
        "aria-label": t("retroControl.ariaLabel"),
        className: `${panelClasses}${canvasRenderState === "native"
          ? ""
          : ` retro-canvas-${canvasRenderState}`}`,
        onContextMenu: event => event.preventDefault(),
        onPointerDown: handlePanelPointerDown,
        onPointerUp: handlePanelPointerUp,
        onPointerCancel: handlePanelPointerCancel,
        style: panelStyle,
      }), canvasHost)}
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