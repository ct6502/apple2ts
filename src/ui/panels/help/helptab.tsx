import React from "react"
import "./helppanel.css"
import { UI_THEME } from "../../../common/utility"
import { isMinimalTheme } from "../../ui_settings"
import { useTranslation } from "../../../i18n/useTranslation"
import { DefaultHelpContent } from "./defaulthelpcontent"
import { isDefaultHelp } from "./helpselection"

type HelpPanelProps = {
  helptext: string,
  narrow: boolean,
  theme: UI_THEME,
  useOpenAppleKey: boolean,
}

const getViewportHeight = () => window.innerHeight || window.outerHeight - 120

const getPaperHeight = (help: HTMLElement | null, viewportHeight: number) => {
  const helpTop = help?.getBoundingClientRect().top ?? 0
  const flyoutButton = help?.closest(".flyout")?.querySelector<HTMLElement>(".flyout-button")
  const buttonHeight = flyoutButton?.getBoundingClientRect().height ?? 0
  return Math.max(0, Math.floor(viewportHeight - helpTop - buttonHeight - 4))
}

const HelpTab = React.memo((props: HelpPanelProps) => {
  const { t } = useTranslation()
  const [paperHeight, setPaperHeight] = React.useState(() => getViewportHeight() - 170)
  const helpRef = React.useRef<HTMLDivElement>(null)
  const isDarkMode = props.theme == UI_THEME.DARK
  const minimalTheme = isMinimalTheme()

  if (minimalTheme) {
    import("./helppanel.minimal.css")
  }

  React.useLayoutEffect(() => {
    const handleResize = () => {
      setPaperHeight(getPaperHeight(helpRef.current, getViewportHeight()))
    }
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [props.narrow])

  const isTouchDevice = "ontouchstart" in document.documentElement
  const helpClassName = "help-text " + (isDarkMode ? "help-text-dark" : "help-text-light")
  const showDefaultHelp = isDefaultHelp(props.helptext)

  return (
    <div ref={helpRef} className="help-parent" translate="no"
      style={{
        width: minimalTheme ? "687px" : 500,
        height: props.narrow || minimalTheme ? "" : paperHeight,
        overflow: (props.narrow ? "visible" : "auto")
      }}>
      <div className={isDarkMode ? "" : "help-paper"}>
        {showDefaultHelp
          ? <pre className={helpClassName}>
            <DefaultHelpContent
              t={t}
              useOpenAppleKey={props.useOpenAppleKey}
              isTouchDevice={isTouchDevice}
            />
          </pre>
          : <pre className={helpClassName} dangerouslySetInnerHTML={{ __html: props.helptext }} />}
      </div>
    </div>
  )
}, (prevProps, nextProps) => {
  return prevProps.helptext === nextProps.helptext
    && prevProps.theme === nextProps.theme
    && prevProps.narrow === nextProps.narrow
    && prevProps.useOpenAppleKey === nextProps.useOpenAppleKey
})

HelpTab.displayName = "HelpPanel"

export default HelpTab
