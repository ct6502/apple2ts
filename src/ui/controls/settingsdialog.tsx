import { useState } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faXmark, faGear } from "@fortawesome/free-solid-svg-icons"
import { useTranslation } from "../../i18n/useTranslation"
import { createControlContext } from "../retro/retromenucontext"
import { settingsResetBinding } from "./resetcontrols"

export const getBaseAppUrl = (): string => {
  if (typeof window === "undefined") return "http://localhost:6502/"
  const url = new URL(window.location.href)
  let pathname = url.pathname
  if (pathname.endsWith("/index.html")) {
    pathname = pathname.slice(0, -"/index.html".length + 1)
  } else if (!pathname.endsWith("/")) {
    const lastSlash = pathname.lastIndexOf("/")
    const lastPart = pathname.slice(lastSlash + 1)
    if (lastPart.includes(".")) {
      pathname = pathname.slice(0, lastSlash + 1)
    } else {
      pathname = `${pathname}/`
    }
  }
  return `${url.origin}${pathname}`
}

export const SettingsDialog = (props: DisplayProps) => {
  const { t, language, changeLanguage } = useTranslation()
  const [showDialog, setShowDialog] = useState(false)

  // Reuse the retro control panel's reset action so both surfaces share the
  // same confirmation dialog and the same resetPreferences() call.
  const resetSettings = () => {
    settingsResetBinding.action?.(createControlContext(props, t, language, changeLanguage))
  }

  const builderDialog =
    <div className="modal-overlay"
      tabIndex={0} // Make the div focusable
      onKeyDown={(event) => {
        if (event.key === "Escape") setShowDialog(false)
      }}>
      <div className="floating-dialog flex-column-gap"
        style={{ width: "550px",
          height: "auto",
          minHeight: "400px",
          userSelect: "none" }}>
        <div>
          <div className="flex-row-space-between" style={{ marginLeft: "10px", marginRight: "10px" }}>
            <div className="dialog-title" style={{ padding: 0, paddingTop: "6px" }}>{t("controls.settings")}</div>
            <button className="push-button"
              type="button"
              onClick={() => setShowDialog(false)}>
              <FontAwesomeIcon icon={faXmark} style={{ fontSize: "0.8em" }} />
            </button>
          </div>
          <div className="horiz-rule"></div>


        </div>
        <div className="flex-row-space-between" style={{ margin: "10px", marginTop: "auto", flexShrink: 0 }}>
          <button className="push-button text-button"
            onClick={resetSettings}>
            <span className="centered-title">{t("config.resetSettings")}</span>
          </button>
          <button className="push-button text-button"
            onClick={() => { setShowDialog(false) }}>
            <span className="centered-title">{t("linkBuilder.close")}</span>
          </button>
        </div>
      </div>
    </div>

  return (
    <div>
      {showDialog && builderDialog}
      <button className="push-button"
        id="tour-settings"
        title={t("controls.settings")}
        onClick={() => {
          setShowDialog(true)
        }}>
        <FontAwesomeIcon icon={faGear} />
      </button>
    </div>
  )
}
