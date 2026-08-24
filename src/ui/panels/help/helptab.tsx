import React from "react"
import "./helppanel.css"
import { UI_THEME } from "../../../common/utility"
import { isMinimalTheme } from "../../ui_settings"
import { useTranslation } from "../../../i18n/useTranslation"
import { DefaultHelpContent } from "./defaulthelpcontent"
import { isDefaultHelp } from "./helpselection"

type HelpPanelProps = {
  helptext: string,
  minimalPresentation?: boolean,
  theme: UI_THEME,
  useOpenAppleKey: boolean,
}

const HelpTab = React.memo((props: HelpPanelProps) => {
  const { t } = useTranslation()
  const paperheight = window.innerHeight ? window.innerHeight - 170 : (window.outerHeight - 170)
  const isDarkMode = props.theme == UI_THEME.DARK
  const useMinimalPresentation = props.minimalPresentation || isMinimalTheme()

  if (useMinimalPresentation) {
    import("./helppanel.minimal.css")
  }

  const isTouchDevice = "ontouchstart" in document.documentElement
  const height = window.innerHeight ? window.innerHeight : (window.outerHeight - 120)
  const width = window.innerWidth ? window.innerWidth : (window.outerWidth - 20)
  const narrow = isTouchDevice || (width < height)
  const helpClassName = "help-text " + (isDarkMode ? "help-text-dark" : "help-text-light")
  const showDefaultHelp = isDefaultHelp(props.helptext)

  return (
    <div className="help-parent"
      style={{
        width: narrow || useMinimalPresentation ? "687px" : 500,
        height: narrow || useMinimalPresentation ? "" : paperheight,
        overflow: (narrow ? "visible" : "auto")
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
    && prevProps.minimalPresentation === nextProps.minimalPresentation
    && prevProps.theme === nextProps.theme
    && prevProps.useOpenAppleKey === nextProps.useOpenAppleKey
})

HelpTab.displayName = "HelpPanel"

export default HelpTab
