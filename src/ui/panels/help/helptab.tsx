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

const HelpTab = (props: HelpPanelProps) => {
  const { t } = useTranslation()
  const isDarkMode = props.theme == UI_THEME.DARK
  const useMinimalPresentation = props.minimalPresentation || isMinimalTheme()

  if (useMinimalPresentation) {
    import("./helppanel.minimal.css")
  }

  const isTouchDevice = "ontouchstart" in document.documentElement
  const width = window.innerWidth ? window.innerWidth : (window.outerWidth - 20)
  const isLandscape = (window.innerWidth > window.innerHeight)
  const height = isLandscape ? Math.max((window.innerHeight - 100), 470) : 560
  const narrow = isTouchDevice || (width < height)
  const helpClassName = "help-text " + (isDarkMode ? "help-text-dark" : "help-text-light")
  const showDefaultHelp = isDefaultHelp(props.helptext)

  return (
    <div className="help-parent" translate="no"
      style={{
        width: narrow || useMinimalPresentation ? "687px" : 500,
        height: narrow || useMinimalPresentation ? "" : height,
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
}

HelpTab.displayName = "HelpPanel"

export default HelpTab
