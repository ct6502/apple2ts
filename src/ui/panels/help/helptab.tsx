import React from "react"
import "./helppanel.css"
import { UI_THEME } from "../../../common/utility"
import { isMinimalTheme } from "../../ui_settings"
import { useTranslation } from "../../../i18n/useTranslation"

type HelpPanelProps = {
  helptext: string,
  theme: UI_THEME,
}

const HelpTab = React.memo((props: HelpPanelProps) => {
  const { t } = useTranslation()
  const paperheight = window.innerHeight ? window.innerHeight - 170 : (window.outerHeight - 170)

  // If helpText is empty or default, use our translated default help text
  let helpText = props.helptext
  if (!helpText || helpText.length <= 1 || helpText === "<Default>" || helpText.includes("Welcome to Apple2TS")) {
    const isMac = navigator.platform.startsWith("Mac")
    const keyMod = isMac ? "O~" : "Alt+"
    const arrowMod = isMac ? "O~" : "Ctrl+"
    const isTouchDevice = "ontouchstart" in document.documentElement

    let content = ""
    if (isTouchDevice) {
      content = `
<b>${t("help.mobileInstructions")}</b>
${t("help.tapScreen")}
${t("help.arrowKeys")}
${t("help.ctrlKey")}
${t("help.ctrlLock")}
${t("help.appleKeys")}
`
    } else {
      const shortcuts = t("help.shortcutsTable")
        .replace(/{{keyMod}}/g, keyMod)
        .replace(/{{arrowMod}}/g, arrowMod)

      content = `<b>${t("help.keyboardShortcuts")}</b>
${shortcuts}
`
    }

    helpText = `${t("help.title")} - ${t("help.subtitle")}<br/>
(c) ${new Date().getFullYear()} CT6502 / i18n by anomixer<br/><br/>
${content}
<b>${t("help.diskImages")}</b> hdv, 2mg, dsk, woz, po, do, bin, bas

<b>${t("help.urlParameters")}</b>
${t("help.urlParametersBody")}

<b>${t("help.examples")}</b>
${t("help.examplesBody")}

<b>${t("help.links")}</b>
${t("help.linksBody")}`
  }

  const isDarkMode = props.theme == UI_THEME.DARK

  if (isMinimalTheme()) {
    import("./helppanel.minimal.css")
  }

  const isTouchDevice = "ontouchstart" in document.documentElement
  const height = window.innerHeight ? window.innerHeight : (window.outerHeight - 120)
  const width = window.innerWidth ? window.innerWidth : (window.outerWidth - 20)
  const narrow = isTouchDevice || (width < height)

  return (
    <div className="help-parent"
      style={{
        width: narrow || isMinimalTheme() ? "687px" : 500,
        height: narrow || isMinimalTheme() ? "" : paperheight,
        overflow: (narrow ? "visible" : "auto")
      }}>
      <div className={isDarkMode ? "" : "help-paper"}>
        <pre className={"help-text " + (isDarkMode ? "help-text-dark" : "help-text-light")}
          dangerouslySetInnerHTML={{ __html: helpText }}>
        </pre>
      </div>
    </div>
  )
}, (prevProps, nextProps) => {
  return prevProps.helptext === nextProps.helptext && prevProps.theme === nextProps.theme
})

HelpTab.displayName = "HelpPanel"

export default HelpTab
