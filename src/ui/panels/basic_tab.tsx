import "./debugsection.css"
import { faPlay, faStop } from "@fortawesome/free-solid-svg-icons"
import { isMinimalTheme } from "../ui_settings"
import { useEffect, useState } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import defaultProgram from "./basic_program.bas?raw"
import BasicEditor from "./basic_editorview"
import { BasicCompiler } from "./basic_compiler"
import { handleGetRunMode, handleGetState6502, passPasteText, passSetRunMode } from "../main2worker"
import { RUN_MODE } from "../../common/utility"
import { handleSetDiskFromURL } from "../devices/disk/driveprops"

const BasicTab = (props: { updateDisplay: UpdateDisplay }) => {
  const [programText, setprogramText] = useState<string>(defaultProgram)
  const [programError, setprogramError] = useState<string>("")

  if (isMinimalTheme()) {
    import("./debugsection.minimal.css")
  }

  useEffect(() => {
    try {
      BasicCompiler(programText)
      setprogramError("")
    } catch (error) {
      setprogramError(`${error}`)
    }
  }, [programText])

  const isRunning = () => {
    return false
  }

  const bootAndRunProgram = (text: string) => {
    const waitForBoot = setInterval(() => {
      // Wait a bit to give the emulator time to start and boot any disks.
      const cycleCount = handleGetState6502().cycleCount
      if (cycleCount > 1500000) {
        clearInterval(waitForBoot)
        passPasteText(text)
      }
    }, 100)
  }

  const handleRunButtonClick = async () => {
    if (isRunning()) {
      // Stop program - TBD
    } else {
      // Run program - TBD
      if (handleGetRunMode() === RUN_MODE.IDLE) {
        handleSetDiskFromURL("blank.po", props.updateDisplay)
        bootAndRunProgram("NEW\n" + programText + "\nRUN\n")
        return
      } else if (handleGetRunMode() === RUN_MODE.PAUSED) {
        passSetRunMode(RUN_MODE.RUNNING)
      }
      passPasteText("NEW\n")
      passPasteText(programText)
      passPasteText("\nRUN\n")
    }
  }

  return (
    <div className="flex-column-gap debug-section">
      <BasicEditor value={programText} setValue={setprogramText}/>
      <div className="flex-row-gap">
        <div
          style={{ gridColumn: programError === "" ? "span 1" : "span 2" }}
          title={programError}
          className="dbg-program-error">{programError}</div>
        {programError === "" &&
          <button
            className="dbg-expect-button"
            title={isRunning() ? "Stop Script" : "Run Script"}
            onClick={handleRunButtonClick}>{isRunning() ?
              <FontAwesomeIcon icon={faStop} /> :
              <FontAwesomeIcon icon={faPlay} />
              }
          </button>}
      </div>
    </div>
  )
}

export default BasicTab
