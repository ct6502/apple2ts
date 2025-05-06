import "./debugsection.css"
import { faPlay, faStop } from "@fortawesome/free-solid-svg-icons"
import { UI_THEME } from "../../common/utility"
import { getTheme } from "../ui_settings"
import { useEffect, useState } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import defaultExpectin from "./default_expectin.json"
import { Expectin } from "../expectin"
import CodeMirrorEditor from "./editorview"

const ExpectinTab = () => {

  const isMinimalTheme = getTheme() == UI_THEME.MINIMAL
  const [expectinObject, setExpectinObject] = useState<Expectin>()
  const [expectinText, setExpectinText] = useState<string>(JSON.stringify(defaultExpectin, null, 2))
  const [expectinError, setExpectinError] = useState<string>("")

  if (isMinimalTheme) {
    import("./debugsection.minimal.css")
  }

  useEffect(() => {
    try {
      new Expectin(expectinText)
      setExpectinError("")
    } catch (error) {
      setExpectinError(`${error}`)
    }
  }, [expectinText])

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
    <div className="flex-column-gap debug-section">
      <CodeMirrorEditor value={expectinText} setValue={setExpectinText}/>
      <div className="flex-row-gap">
        <div
          style={{ gridColumn: expectinError === "" ? "span 1" : "span 2" }}
          title={expectinError}
          className="dbg-expectin-error">{expectinError}</div>
        {expectinError === "" &&
          <button
            className="dbg-expect-button"
            title={expectinObject?.IsRunning() ? "Stop Script" : "Run Script"}
            onClick={handleExpectButtonClick}>{expectinObject?.IsRunning() ?
              <FontAwesomeIcon icon={faStop} /> :
              <FontAwesomeIcon icon={faPlay} />
              }
          </button>}
      </div>
    </div>
  )
}

export default ExpectinTab
