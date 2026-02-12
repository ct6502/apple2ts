import "./debugsection.css"
import { faDatabase, faGear, faListOl, faPause, faPlay, faRepeat, faStop } from "@fortawesome/free-solid-svg-icons"
import { handleGetAutoNumbering, handleGetCapitalizeBasic, isMinimalTheme } from "../ui_settings"
import { useEffect, useState } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import defaultProgram from "./basic_program.bas?raw"
import BasicEditor from "./basic_editorview"
import { BasicCompiler } from "./basic_compiler"
import { handleGetRunMode, handleGetSpeedMode, handleGetStackString, handleGetState6502, handleGetZeroPage, passKeypress, passKeyRelease, passPasteText, passSetRunMode } from "../main2worker"
import { RUN_MODE } from "../../common/utility"
import { handleSetDiskFromURL } from "../devices/disk/driveprops"
import { setPreferenceAutoNumbering, setPreferenceCapitalizeBasic, setPreferenceSpeedMode } from "../localstorage"
import { MaximumSpeedMode } from "../controls/speeddropdown"
import PopupMenu from "../controls/popupmenu"
import { BasicRenumber } from "./basic_renumber"
import { BasicRebuildFromMemory } from "./basic_rebuild_memory"

const BasicTab = (props: { updateDisplay: UpdateDisplay }) => {
  const [programText, setprogramText] = useState<string>(defaultProgram)
  const [programError, setprogramError] = useState<string>("")
  const [isBooting, setIsBooting] = useState<boolean>(false)
  const [highlightLine, setHighlightLine] = useState<number>(5)

  const [popupLocation, setPopupLocation] = useState<[number, number]>()
  const handleSettingsClick = (event: React.MouseEvent) => {
    setPopupLocation([event.clientX, event.clientY])
  }

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

  const isPaused = () => {
    if (isBooting) {
      // While emulator is booting to run a program, force it to look like running.
      return false
    }
    const stack = handleGetStackString()
    // This is a tight loop that checks for key presses.
    if (stack.endsWith("JSR $FB78") && !stack.includes("JSR $DB3D")) {
      return true
    }
    return false
  }
  
  const currentEditorLineNumber = () => {
    if (programText.trim() === "") {
      return 0
    }
    const zeroPage = handleGetZeroPage()
    const lineNumber = zeroPage[0x75] + (zeroPage[0x76] << 8)
    let finalIndex = 0
    // Convert from the BASIC line number to the editor line number
    programText.split("\n").forEach((line, index) => {
      const lineNumberMatch = line.trim().match(/^(\d+)/)
      if (lineNumberMatch) {
        const lineNum = parseInt(lineNumberMatch[1])
        if (lineNum === lineNumber) {
          finalIndex = index + 1
          return
        }
      }
    })
    return finalIndex
  }

  const isRunning = () => {
    const newHighlightLine = currentEditorLineNumber()
    if (newHighlightLine != highlightLine) {
      setHighlightLine(newHighlightLine)
    }
    if (isBooting) {
      // While emulator is booting to run a program, force it to look like running.
      return true
    }
    const stack = handleGetStackString()
    // Are we at the BASIC prompt?
    if (stack.includes("JSR $D52E")) {
      return false
    }
    // Are we in the Applesoft interpreter loop?
    if (stack.includes("JSR $D828")) {
      return true
    }
    // Are we within the Applesoft code?
    const s6502 = handleGetState6502()
    if (s6502.PC >= 0xD365 && s6502.PC <= 0xEFFF) {
      return true
    }
    return false
  }

  const pasteProgramAndWait = (text: string) => {
    const prevSpeedMode = handleGetSpeedMode()
    setPreferenceSpeedMode(MaximumSpeedMode)
    passPasteText(text)
    const waitForPaste = setInterval(() => {
      const stack = handleGetStackString()
      if (stack.includes("JSR $D828")) {
        clearInterval(waitForPaste)
        setPreferenceSpeedMode(prevSpeedMode)
      }
    }, 100)
  }

  const bootAndRunProgram = (text: string) => {
    // This is a hack to force the isRunning flag to be true while booting.
    setIsBooting(true)
    const waitForBoot = setInterval(() => {
      // Wait a bit to give the emulator time to start and boot any disks.
      const cycleCount = handleGetState6502().cycleCount
      if (cycleCount > 1500000) {
        clearInterval(waitForBoot)
        pasteProgramAndWait(text)
        // Another hack keep isRunning true while the program is pasted.
        setTimeout(() => {
          setIsBooting(false)}, 300)
      }
    }, 100)
  }

  const handleRunButtonClick = async () => {
    if (isRunning()) {
      // Stop program, pass Ctrl+C to break out of the interpreter loop
      // Pass an extra newline to make sure we break out of any input statements
      passPasteText("\x03\n")
    } else {
      // Run program
      if (handleGetRunMode() === RUN_MODE.IDLE) {
        handleSetDiskFromURL("blank.po", props.updateDisplay)
        bootAndRunProgram("NEW\n" + programText + "\nRUN\n")
      } else {
        if (handleGetRunMode() === RUN_MODE.PAUSED) {
          passSetRunMode(RUN_MODE.RUNNING)
        }
        pasteProgramAndWait("NEW\n" + programText + "\nRUN\n")
      }
    }
  }

  const handleContinueButtonClick = async () => {
    passPasteText("CONT\n")
  }

  const handlePauseButtonClick = async () => {
    passKeypress(0x13)
    passKeyRelease()
  }

  const handleRenumberClick = async () => {
    const newProgramText = BasicRenumber(programText)
    setprogramText(newProgramText)
  }

  const handleRebuildClick = async () => {
    if (programText.trim() !== "") {
      const confirmRebuild = window.confirm(
        "This will replace the current program with a version rebuilt from the Apple II memory. " +
        "You will lose any unsaved changes. Are you sure?"
      )
      if (!confirmRebuild) {
        return
      }
    }
    BasicRebuildFromMemory(setprogramText)
  }

  const running = isRunning()
  const paused = isPaused()

  return (
    <div className="flex-column-gap debug-section">
      <BasicEditor value={programText} setValue={setprogramText}
        highlightLine={highlightLine} readOnly={running}/>
      <div className="flex-row">
          <button
            className="push-button"
            title={running ? "Break" : "Run"}
            onClick={handleRunButtonClick}>
              <FontAwesomeIcon icon={running ? faStop : faPlay} />
          </button>
          <button
            className="push-button"
            title="Continue Running"
            disabled={running}
            onClick={handleContinueButtonClick}>
              <FontAwesomeIcon icon={faRepeat} />
          </button>
          <button
            className={paused ? "push-button button-active" : "push-button"}
            title={paused ? "Resume" : "Pause"}
            onClick={handlePauseButtonClick}>
              <FontAwesomeIcon icon={faPause} />
          </button>
          <button
            className="push-button"
            title="Renumber Program"
            onClick={handleRenumberClick}>
              <FontAwesomeIcon icon={faListOl} />
          </button>
          <button
            className={handleGetRunMode() === RUN_MODE.IDLE ?
              "push-button disabled" : "push-button"}
            title="Rebuild Program from Memory"
            disabled={handleGetRunMode() === RUN_MODE.IDLE}
            onClick={handleRebuildClick}>
              <FontAwesomeIcon icon={faDatabase} />
          </button>
          
          <button
            id="basic-button"
            className="push-button"
            title="Display Settings"
            onClick={handleSettingsClick}
          >
            <FontAwesomeIcon icon={faGear} />
          </button>          
          
          <PopupMenu
            location={popupLocation}
            onClose={() => { setPopupLocation(undefined) }}
            menuItems={[[
              {
                label: "Auto Line Numbering",
                isSelected: () => { return handleGetAutoNumbering() },
                onClick: () => {
                  setPreferenceAutoNumbering(!handleGetAutoNumbering())
                }
              },
              {
                label: "Capitalize Keywords",
                isSelected: () => { return handleGetCapitalizeBasic() },
                onClick: () => {
                  setPreferenceCapitalizeBasic(!handleGetCapitalizeBasic())
                }
              },
            ]]}
          />
      </div>
        {programError !== "" && <div
          style={{ gridColumn: "span 2" }}
          title={programError}
          className="dbg-program-error">❌ {programError}</div>}
    </div>
  )
}

export default BasicTab
