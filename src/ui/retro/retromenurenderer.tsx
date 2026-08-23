import { useEffect, useState } from "react"
import Apple2Canvas from "../canvas"
import type { RetroResolvedControl } from "./retromenucontext"
import { formatControlLabel } from "../controls/controlregistry"
import { useRetroMenuHost } from "./retromenuhost"
import "./retrocontrolpanel.css"

type RetroMenuItem = RetroResolvedControl

type RetroMenuFrame = {
  title: string
  items: RetroMenuItem[]
  originalValues: number[]
  values: number[]
  actionLabel: string
  refresh?: () => RetroMenuItem[]
  submit?: (items: readonly RetroMenuItem[], values: number[]) => void
  isSubmitVisible?: (items: readonly RetroMenuItem[], values: number[]) => boolean
}

const mouseTextDown = String.fromCodePoint(0x2193)
const mouseTextLeft = String.fromCodePoint(0x2190)
const mouseTextRight = String.fromCodePoint(0x2192)
const mouseTextUp = String.fromCodePoint(0x2191)
const mouseTextReturn = String.fromCodePoint(0x21B5)
const checkmark = String.fromCodePoint(0x2713)

const mouseTextSupports = (text: string) => /^[\x20-\x7E\u2014]*$/.test(text)

const RetroBorder = ({ className, separatorRow }: {
  className: string
  separatorRow?: number
}) => (
  <div className={`retro-border ${className}`} aria-hidden="true">
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
  title: string,
  items: RetroMenuItem[],
  refresh?: () => RetroMenuItem[],
  actionLabel: string = "",
  submit?: (items: readonly RetroMenuItem[], values: number[]) => void,
  isSubmitVisible?: (items: readonly RetroMenuItem[], values: number[]) => boolean,
): RetroMenuFrame => {
  const values = items.map(item => item.optionIndex ?? -1)
  return { title, items, originalValues: values, values, actionLabel, refresh, submit, isSubmitVisible }
}

const refreshPreviousMenu = (stack: RetroMenuFrame[]) => {
  const previousStack = stack.slice(0, -1)
  const previousFrame = previousStack[previousStack.length - 1]
  if (!previousFrame?.refresh) return previousStack

  previousStack[previousStack.length - 1] = createMenuFrame(
    previousFrame.title,
    previousFrame.refresh(),
    previousFrame.refresh,
    previousFrame.actionLabel,
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
  const [isOpen, setIsOpen] = useState(false)
  const [menuStack, setMenuStack] = useState<RetroMenuFrame[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [now, setNow] = useState(() => new Date())
  const close = () => setIsOpen(false)
  const { dialogs, effects, language, rootMenu, t } = useRetroMenuHost(displayProps, close)
  const currentFrame = menuStack[menuStack.length - 1]
  const currentMenu = currentFrame?.items ?? rootMenu
  const maxVisibleMenuItems = 16
  const visibleMenuStart = currentFrame
    ? Math.min(
      Math.max(0, selectedIndex - maxVisibleMenuItems + 1),
      Math.max(0, currentMenu.length - maxVisibleMenuItems),
    )
    : 0
  const visibleMenu = currentMenu.slice(visibleMenuStart, visibleMenuStart + maxVisibleMenuItems)
  const selectedItem = currentMenu[selectedIndex]
  const saveActionLabel = t("retroControl.save")
  const footerActionLabel = selectedItem?.contextualActionLabel
    ?? currentFrame?.actionLabel
    ?? t("retroControl.open")
  const showHorizontalSelectionHint = (selectedItem?.options?.length ?? 0) > 1
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
    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.shiftKey && !event.ctrlKey && !event.altKey && !event.metaKey && event.key === "Escape") {
        event.preventDefault()
        event.stopPropagation()
        menuStack.toReversed().forEach(restoreMenuFramePreview)
        setNow(new Date())
        setIsOpen(open => !open)
        setMenuStack([])
        setSelectedIndex(0)
        return
      }
      if (!isOpen) return

      const isSubmitFrame = Boolean(currentFrame?.submit) && currentMenu.length > 0 &&
        currentMenu.every(item => item.checkmarkIndex !== undefined)
      if (event.ctrlKey && !event.altKey && !event.metaKey && event.key.toLocaleLowerCase() === "a" &&
        currentFrame && isSubmitFrame) {
        event.preventDefault()
        event.stopPropagation()
        const allSelected = currentFrame.items.every(
          (item, index) => currentFrame.values[index] === item.checkmarkIndex,
        )
        setMenuStack(stack => stack.map((frame, index) => index === stack.length - 1
          ? {
            ...frame,
            values: frame.items.map(item => allSelected ? 0 : item.checkmarkIndex ?? 0),
          }
          : frame))
      } else if (event.key === "ArrowUp" || event.key === "ArrowDown") {
        event.preventDefault()
        event.stopPropagation()
        const direction = event.key === "ArrowUp" ? -1 : 1
        setSelectedIndex(index => {
          let nextIndex = index
          for (let offset = 0; offset < currentMenu.length; offset += 1) {
            nextIndex = (nextIndex + direction + currentMenu.length) % currentMenu.length
            if (currentMenu[nextIndex].selectable !== false) return nextIndex
          }
          return index
        })
      } else if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        const item = currentMenu[selectedIndex]
        if (!item) return
        const options = item.options
        if (currentFrame && options && options.length > 1) {
          event.preventDefault()
          event.stopPropagation()
          const direction = event.key === "ArrowLeft" ? -1 : 1
          const nextValue = (currentFrame.values[selectedIndex] + direction + options.length) % options.length
          options[nextValue].preview?.()
          setMenuStack(stack => stack.map((frame, index) => {
            if (index !== stack.length - 1) return frame
            const items = item.refreshOptions?.(nextValue) ?? frame.items
            const values = item.refreshOptions
              ? items.map(refreshedItem => refreshedItem.optionIndex ?? -1)
              : [...frame.values]
            values[selectedIndex] = nextValue
            return { ...frame, title: item.refreshTitle?.() ?? frame.title, items, values }
          }))
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
              item.label,
              children,
              refresh,
              item.actionLabel ?? saveActionLabel,
              item.submit,
              item.isSubmitVisible,
            ),
          ])
          setSelectedIndex(Math.max(0, children.findIndex(child => child.selectable !== false)))
        } else if (currentFrame && item.options) {
          if (currentFrame.submit) {
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
          setSelectedIndex(0)
        } else {
          item.action?.()
          if (currentFrame) {
            setMenuStack(refreshPreviousMenu)
            setSelectedIndex(0)
          }
        }
      } else if (event.key === "Escape") {
        event.preventDefault()
        event.stopPropagation()
        if (menuStack.length > 0) {
          restoreMenuFramePreview(currentFrame)
          setMenuStack(refreshPreviousMenu)
          setSelectedIndex(0)
        }
      } else if (!event.ctrlKey && !event.altKey && !event.metaKey && /^[a-z]$/i.test(event.key)) {
        const shortcut = event.key.toLocaleLowerCase()
        const nextIndex = Array.from(
          { length: currentMenu.length },
          (_, offset) => (selectedIndex + offset + 1) % currentMenu.length,
        ).find(index => currentMenu[index].selectable !== false &&
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
  }, [currentFrame, currentMenu, isOpen, menuStack, saveActionLabel, selectedIndex])

  return (
    <main
      className={`retro-shell${isOpen ? " menu-open" : ""}`}
      onContextMenu={isOpen ? event => event.preventDefault() : undefined}
    >
      <Apple2Canvas {...displayProps} />
      {isOpen && (
        <section
          className={`retro-panel scanline-gradient ${effects}`}
          role="dialog"
          aria-label={t("retroControl.ariaLabel")}
        >
          <div className="retro-window">
            <RetroBorder className="retro-outer-border" separatorRow={2} />
            <header className={`retro-title${currentFrame ? " submenu-open" : ""}`}>
              <span>{"Apple2TS "}&#8198;</span>
            </header>
            {currentFrame && <div className="retro-submenu-title">
              <span className={mouseTextSupports(currentFrame.title) ? undefined : "retro-browser-font"}>
                {currentFrame.title}
              </span>
            </div>}
            {menuStack.length === 0 && <div className="retro-clock" aria-label={`${now.toLocaleTimeString(language)} ${now.toLocaleDateString(language)}`}>
              <RetroBorder className="retro-clock-border" />
              <time>{now.toLocaleTimeString(language, {
                hour: "numeric",
                minute: "2-digit",
                second: "2-digit",
              })}</time>
              <time>{now.toLocaleDateString(language, {
                month: "numeric",
                day: "numeric",
                year: "2-digit",
              })}</time>
            </div>}
            <div className={`retro-menu${currentFrame ? " retro-submenu-menu" : " retro-root-menu"}`} role="menu">
              {visibleMenu.map((item, visibleIndex) => {
                const index = visibleMenuStart + visibleIndex
                const valueIndex = currentFrame?.values[index] ?? item.optionIndex ?? -1
                const option = item.options?.[valueIndex]
                const baseLabel = item.valueOnly && option ? option.label : item.label
                const itemLabel = formatControlLabel(baseLabel, item.separator)
                const isChecked = item.checkmarkIndex !== undefined
                  ? valueIndex === item.checkmarkIndex
                  : item.defaultIndex !== undefined && valueIndex === item.defaultIndex
                return (
                  <div
                    className={`retro-menu-item${selectedIndex === index ? " selected" : ""}`}
                    key={item.id}
                    role="menuitem"
                    aria-current={selectedIndex === index ? "true" : undefined}
                    aria-disabled={item.selectable === false ? "true" : undefined}
                  >
                    {currentFrame && <span className="retro-menu-check">
                      {isChecked ? checkmark : " "}
                    </span>}
                    <span className={`retro-menu-name${mouseTextSupports(itemLabel) ? "" : " retro-browser-font"}`}>
                      {itemLabel}
                      {option && !item.valueOnly && item.checkmarkIndex === undefined ? ":" : ""}
                    </span>
                    {option && !item.valueOnly && item.checkmarkIndex === undefined &&
                      <>{" "}<span className={`retro-menu-value${option.useBrowserFont || !mouseTextSupports(option.label) ? " retro-browser-font" : ""}`}>
                        {option.label}
                      </span></>}
                  </div>
                )
              })}
            </div>
            <footer className={currentFrame ? "retro-submenu-footer" : "retro-root-footer"}>
              <span className={`retro-footer-select${mouseTextSupports(t("retroControl.select")) ? "" : " retro-browser-font"}`}>{` ${t("retroControl.select")}:`}<i className="retro-mousetext">
                {showHorizontalSelectionHint && <>{mouseTextLeft} {mouseTextRight} </>}
                {currentFrame
                  ? <>{mouseTextUp} {mouseTextDown}</>
                  : <>{mouseTextDown} {mouseTextUp}</>}
              </i></span>
              {currentFrame && <span className={`retro-footer-cancel${mouseTextSupports(t("retroControl.cancelEsc")) ? "" : " retro-browser-font"}`}>{t("retroControl.cancelEsc")}</span>}
              {showFooterAction &&
                <span className={`retro-footer-action${mouseTextSupports(footerActionLabel) ? "" : " retro-browser-font"}`}>
                  {`${footerActionLabel}:`}
                  <i className="retro-mousetext">{mouseTextReturn}</i>{" "}
                </span>}
            </footer>
          </div>
        </section>
      )}
      {dialogs}
    </main>
  )
}

export default RetroMenuRenderer