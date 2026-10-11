import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faCircleInfo,
  faTriangleExclamation,
  faCircleXmark,
  faCircleQuestion,
} from "@fortawesome/free-solid-svg-icons"
import { useTranslation } from "../i18n/useTranslation"
import { clearDialogMessageContext, getDialogMessageContext } from "./ui_utilities"
import { ERROR_CODE } from "../common/utility"

export const DialogMessage = ({ updateDisplay }: { updateDisplay: () => void }) => {
  const { t } = useTranslation()

  const handleCancel = () => {
    getDialogMessageContext().actionCancel?.()
    clearDialogMessageContext()
    updateDisplay()
  }

  const handleConfirm = () => {
    getDialogMessageContext().actionConfirm?.()
    clearDialogMessageContext()
    updateDisplay()
  }

  const dialogMsg = getDialogMessageContext()
  let icon = <></>
  switch (dialogMsg.code) {
    case ERROR_CODE.INFO:
      icon = <FontAwesomeIcon className="push-button dialog-button" icon={faCircleInfo} />
      break
    case ERROR_CODE.WARNING:
      icon = <FontAwesomeIcon className="push-button dialog-button" icon={faTriangleExclamation} />
      break
    case ERROR_CODE.ERROR:
      icon = <FontAwesomeIcon className="push-button dialog-button" icon={faCircleXmark} />
      break
    case ERROR_CODE.QUESTION:
      icon = <FontAwesomeIcon className="push-button dialog-button" icon={faCircleQuestion} />
      break
  }

  return (
    <div className="modal-overlay"
      tabIndex={0} // Make the div focusable
      onKeyDown={(event) => {
        if (event.key === "Escape") handleCancel()
      }}>
      <div className="floating-dialog flex-column"
        style={{ left: "40%",
          top: "35%",
          width: "min(28rem, calc(100vw - 2rem))", }}>
        <div className="flex-column">
          <div className="flex-row-space-between">
            <div className="flex-row" style={{ alignItems: "center" }}>
              {icon}
              <div className="dialog-title">{dialogMsg.title}</div>
            </div>
            {/* <button className="push-button"
              onClick={handleCancel}>
              <FontAwesomeIcon icon={faXmark} style={{ fontSize: "0.8em" }} />
            </button> */}
          </div>
          <div className="horiz-rule"></div>
        </div>
        <div className="flex-column" style={{ margin: "10px" }}>
          <div>{dialogMsg.message}</div>
        </div>
        <div className="flex-row-space-between">
          <div></div>
          <div className="flex-row">
            <button autoFocus
              className="push-button text-button"
              onClick={handleConfirm}>
              <span className="centered-title">{t("messages.ok")}</span>
            </button>
            {dialogMsg.code === ERROR_CODE.QUESTION && (
            <button className="push-button text-button"
              onClick={handleCancel}>
              <span className="centered-title">{t("messages.cancel")}</span>
            </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
