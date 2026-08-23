import "../panels.css"
import { faPlay, faStop } from "@fortawesome/free-solid-svg-icons"
import { isMinimalTheme } from "../../ui_settings"
import { useState } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import defaultExpectin from "./default_expectin.json"
import { Expectin } from "../../api/expectin"
import CodeMirrorEditor from "./editorview"
import { useTranslation } from "../../../i18n/useTranslation"

const ExpectinTab = () => {
  const { t } = useTranslation()
  const [expectinObject, setExpectinObject] = useState<Expectin>()
  const [expectinText, setExpectinText] = useState<string>(JSON.stringify(defaultExpectin, null, 2))

  if (isMinimalTheme()) {
    import("../panels.minimal.css")
  }

  let expectinError = ""
  try {
    new Expectin(expectinText)
  } catch (error) {
    expectinError = `${error}`
  }

  const handleExpectButtonClick = async () => {
    if (expectinObject && expectinObject.IsRunning()) {
      expectinObject.Cancel()
      setExpectinObject(undefined)
    } else {
      const expectin = new Expectin(expectinText)
      expectin.Run()
      setExpectinObject(expectin)
    }
  }

  return (
    <div className="flex-column-gap debug-section desktop-code-workspace">
      <CodeMirrorEditor value={expectinText} setValue={setExpectinText} />
      <div className="flex-row-gap desktop-code-controls">
        {expectinError === "" ?
          <button
            className="push-button"
            title={expectinObject?.IsRunning() ? t("expectin.stopScript") : t("expectin.runScript")}
            onClick={handleExpectButtonClick}>{expectinObject?.IsRunning() ?
              <FontAwesomeIcon icon={faStop} /> :
              <FontAwesomeIcon icon={faPlay} />
            }
          </button> : <div
            style={{ gridColumn: expectinError === "" ? "span 1" : "span 2" }}
            title={expectinError}
            className="dbg-program-error">{expectinError}</div>}
      </div>
    </div>
  )
}

export default ExpectinTab
