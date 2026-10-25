import { useRef, useState } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faXmark, faGear } from "@fortawesome/free-solid-svg-icons"
import { useTranslation } from "../../i18n/useTranslation"
import { createControlContext } from "../retro/retromenucontext"
import { settingsResetBinding } from "./resetcontrols"

const dialogPosition = [window.innerWidth / 2 - 275, window.innerHeight / 2 - 200]

export const SettingsDialog = (props: DisplayProps) => {
  const { t, language, changeLanguage } = useTranslation()
  const [showDialog, setShowDialog] = useState(false)
  const dialogRef = useRef<HTMLDivElement>(null)
  const [offset, setOffset] = useState([0, 0])
  const [dragging, setDragging] = useState(false)

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (dialogRef.current) {
      setDragging(true)
      const div = dialogRef.current as HTMLDivElement
      // Offset of the mouse down event within the dialog title bar.
      // This way we drag the window from where the user clicked.
      setOffset([e.clientX - div.offsetLeft, e.clientY - div.offsetTop])
    }
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (dragging && dialogRef.current) {
      const div = dialogRef.current as HTMLDivElement
      const left = e.clientX - offset[0]
      const top = e.clientY - offset[1]
      dialogPosition[0] = left
      dialogPosition[1] = top
      div.style.left = `${left}px`
      div.style.top = `${top}px`
    }
  }

  const handleMouseUp = () => {
    setDragging(false)
  }

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
      }}
      onMouseMove={(e) => handleMouseMove(e)}
      onMouseUp={handleMouseUp}>
      <div className="floating-dialog flex-column"
        ref={dialogRef}
        style={{ width: "550px",
          left: `${dialogPosition[0]}px`,
          top: `${dialogPosition[1]}px`,
          height: "auto",
          userSelect: "none" }}>
        <div>
          <div className="flex-row-space-between"
            style={{ marginLeft: "10px", marginRight: "10px" }}
            onMouseDown={(e) => handleMouseDown(e)}
            onMouseMove={(e) => handleMouseMove(e)}
            onMouseUp={handleMouseUp}>
            <div className="dialog-title" style={{ padding: 0, paddingTop: "6px" }}>{t("controls.settings")}</div>
            <button className="push-button"
              type="button"
              onClick={() => setShowDialog(false)}>
              <FontAwesomeIcon icon={faXmark} style={{ fontSize: "0.8em" }} />
            </button>
          </div>
          <div className="horiz-rule"></div>


        </div>
        <div className="flex-row-space-between" style={{ marginLeft: "10px", flexShrink: 0 }}>
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
