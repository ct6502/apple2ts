import "../panels.css"
import { faDatabase, faDollarSign, faFile, faFolderOpen, faForwardStep, faGear, faListOl, faPlay, faRepeat, faSave, faSlash, faSnowflake, faStop } from "@fortawesome/free-solid-svg-icons"
import { handleGetManualNumbering, handleGetCapitalizeBasic, isMinimalTheme } from "../../ui_settings"
import { useEffect, useState } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import defaultProgram from "./test_syntax.bas?raw"
import BasicEditor from "./basic_editorview"
import { BasicCompiler } from "./basic_compiler"
import { handleGetRunMode, handleGetSpeedMode, handleGetStackString, handleGetState6502, handleGetZeroPage, passBasicStep, passPasteText, passSetRunMode, passSingleKeyPress } from "../../main2worker"
import { RUN_MODE } from "../../../common/utility"
import { handleSetDiskFromURL } from "../../devices/disk/driveprops"
import { getPreferenceBasicProgram, setPreferenceBasicProgram, setPreferenceSpeedMode, setPreferenceBoolean } from "../../localstorage"
import { MaximumSpeedMode } from "../../controls/speeddropdown"
import PopupMenu from "../../controls/popupmenu"
import { BasicRenumber } from "./basic_renumber"
import { BasicRebuildFromMemory } from "./basic_rebuild_memory"
import { useTranslation } from "../../../i18n/useTranslation"
import BasicDebugView from "./basic_debugview"

const BasicTab = (props: { updateDisplay: UpdateDisplay }) => {
  const { t } = useTranslation()
  const [programText, setProgramText] = useState<string>(() => {
    // Load from localStorage if available, otherwise use default
    const saved = getPreferenceBasicProgram()
    return saved !== null ? saved : defaultProgram
  })
  const [isBooting, setIsBooting] = useState<boolean>(false)
  const [highlightLine, setHighlightLine] = useState<number>(5)
  const [showVariables, setShowVariables] = useState(false)

  const [popupLocation, setPopupLocation] = useState<[number, number]>()
  const handleSettingsClick = (event: React.MouseEvent) => {
    setPopupLocation([event.clientX, event.clientY])
  }

  if (isMinimalTheme()) {
    import("../panels.minimal.css")
  }

  useEffect(() => {
    setPreferenceBasicProgram(programText)

  }, [programText])

  let programError = ""
  try {
    BasicCompiler(programText)
  } catch (error) {
    programError = `${error}`
  }

  const isPaused = () => {
    if (isBooting) {
      // While emulator is booting to run a program, force it to look like running.
      return false
    }
    const stack = handleGetStackString()
    // This is a tight loop that checks for key presses.
    if ((stack.endsWith("JSR $FB78") || stack.includes("JSR $FD10")) && !stack.includes("JSR $DB3D")) {
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

  const updateHighlightLine = () => {
    const newHighlightLine = currentEditorLineNumber()
    if (newHighlightLine != highlightLine) {
      setHighlightLine(newHighlightLine)
    }
  }

  const isRunning = () => {
    updateHighlightLine()
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

  const pasteProgramAndWait = (sendText: string) => {
    const prevSpeedMode = handleGetSpeedMode()
    let timeout = 0
    if (sendText.length > 200) {
      setPreferenceSpeedMode(MaximumSpeedMode)
      timeout = sendText.length / 250
    }
    passPasteText(sendText)
    let counter = 0
    const waitForPaste = setInterval(() => {
      counter++
      if (counter > timeout || handleGetStackString().includes("JSR $D828")) {
        clearInterval(waitForPaste)
        setPreferenceSpeedMode(prevSpeedMode)
        passPasteText("\nRUN\n")
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
          setIsBooting(false)
        }, 300)
      }
    }, 100)
  }

  const handleRunButtonClick = async () => {
    // Run program
    if (handleGetRunMode() === RUN_MODE.IDLE) {
      handleSetDiskFromURL("blank.po", props.updateDisplay)
      bootAndRunProgram("NEW\n" + programText + "\n")
    } else {
      if (handleGetRunMode() === RUN_MODE.PAUSED) {
        passSetRunMode(RUN_MODE.RUNNING)
      }
      if (isRunning()) {
        if (handleGetRunMode() === RUN_MODE.PAUSED) {
          passSetRunMode(RUN_MODE.RUNNING)
        }
        // Stop program, pass Ctrl+C to break out of the interpreter loop
        // Pass an extra newline to make sure we break out of any input statements
        passPasteText("\x03\n")
      }
      pasteProgramAndWait("NEW\n" + programText + "\n")
    }
  }

  const handleBreakButtonClick = async () => {
    if (handleGetRunMode() === RUN_MODE.PAUSED) {
      passSetRunMode(RUN_MODE.RUNNING)
    }
    // Stop program, pass Ctrl+C to break out of the interpreter loop
    // Pass an extra newline to make sure we break out of any input statements
    passPasteText("\x03\n")
  }

  const handleContinueButtonClick = async () => {
    if (handleGetRunMode() === RUN_MODE.PAUSED) {
      passSetRunMode(RUN_MODE.RUNNING)
    } else {
      passPasteText("CONT\n")
    }
  }

  const handlePauseButtonClick = async () => {
    passSingleKeyPress(0x13)
  }

  const handleStepButtonClick = async () => {
    if (isPaused()) {
      passPasteText("CONT\n")
    }
    passBasicStep()
    if (handleGetRunMode() === RUN_MODE.PAUSED) {
      passSetRunMode(RUN_MODE.RUNNING)
    }
    setTimeout(() => {
      updateHighlightLine()
    }, 500)
  }

  const handleNewButtonClick = async () => {
    if (programText.trim() !== "") {
      const confirmNew = window.confirm(
        t("basic.newProgramWarning")
      )
      if (!confirmNew) {
        return
      }
    }
    setProgramText("")
  }

  const handleImportButtonClick = async () => {
    const fileInput = document.createElement("input")
    fileInput.type = "file"
    fileInput.accept = ".a,.bas,.txt"
    fileInput.onchange = (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = (e) => {
        const text = e.target?.result as string
        setProgramText(text)
      }
      reader.readAsText(file)
    }
    fileInput.click()
  }

  const handleExportButtonClick = async () => {
    const blob = new Blob([programText], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "program.bas"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleRenumberClick = async () => {
    const newProgramText = BasicRenumber(programText)
    setProgramText(newProgramText)
  }

  const handleRebuildClick = async () => {
    if (programText.trim() !== "") {
      const confirmRebuild = window.confirm(
        t("basic.rebuildWarning")
      )
      if (!confirmRebuild) {
        return
      }
    }
    BasicRebuildFromMemory(setProgramText)
  }

  const running = isRunning()
  const paused = isPaused()
  const runMode = handleGetRunMode()

  return (
    <div className={`flex-column-gap debug-section desktop-code-workspace desktop-basic-workspace${showVariables ? " desktop-basic-variables-visible" : ""}`}>
      <div className="desktop-basic-primary">
        <BasicEditor value={programText} setValue={setProgramText}
          highlightLine={highlightLine} readOnly={running} />
        <div className="flex-row desktop-code-controls">
          <div className="flex-row">
            <button
              className="push-button"
              title={t("basic.runFromBeginning")}
              onClick={handleRunButtonClick}>
              <FontAwesomeIcon icon={faPlay} />
            </button>
            <button
              className="push-button"
              title={t("basic.break")}
              disabled={runMode === RUN_MODE.IDLE || !isRunning()}
              onClick={handleBreakButtonClick}>
              <FontAwesomeIcon icon={faStop} />
            </button>
            <button
              className="push-button"
              title={t("basic.continueRunning")}
              disabled={runMode === RUN_MODE.IDLE || (running && runMode !== RUN_MODE.PAUSED)}
              onClick={handleContinueButtonClick}>
              <FontAwesomeIcon icon={faRepeat} />
            </button>
            <button
              className="push-button"
              title={t("basic.stepProgram")}
              disabled={(running && runMode !== RUN_MODE.PAUSED) || runMode === RUN_MODE.IDLE}
              onClick={handleStepButtonClick}>
              <FontAwesomeIcon icon={faForwardStep} />
            </button>
            <button
              className={paused ? "push-button button-active" : "push-button"}
              title={paused ? t("basic.resumeOutput") : t("basic.freezeOutput")}
              disabled={!running || runMode === RUN_MODE.PAUSED || runMode === RUN_MODE.IDLE}
              onClick={handlePauseButtonClick}>
              <FontAwesomeIcon icon={faSnowflake} />
            </button>
            <button
              className="push-button"
              title={t("basic.importProgram")}
              onClick={handleImportButtonClick}>
              <FontAwesomeIcon icon={faFolderOpen} />
            </button>
            <button
              className="push-button"
              title={t("basic.exportProgram")}
              onClick={handleExportButtonClick}>
              <FontAwesomeIcon icon={faSave} />
            </button>
            <button
              className="push-button"
              title={t("basic.renumberProgram")}
              onClick={handleRenumberClick}>
              <FontAwesomeIcon icon={faListOl} />
            </button>
          </div>

          <div className="flex-row" style={{ marginLeft: "10px" }}>
          <button
            className="push-button"
            title={t("basic.newProgram")}
            onClick={handleNewButtonClick}>
            <FontAwesomeIcon icon={faFile} />
          </button>
          <button
            className={handleGetRunMode() === RUN_MODE.IDLE ?
              "push-button disabled" : "push-button"}
            title={t("basic.rebuildProgram")}
            disabled={handleGetRunMode() === RUN_MODE.IDLE}
            onClick={handleRebuildClick}>
            <FontAwesomeIcon icon={faDatabase} />
          </button>

          <button
            id="basic-button"
            className="push-button"
            title={t("basic.displaySettings")}
            onClick={handleSettingsClick}
          >
            <FontAwesomeIcon icon={faGear} />
          </button>
          </div>

          <PopupMenu
          location={popupLocation}
          onClose={() => { setPopupLocation(undefined) }}
          menuItems={[[
            {
              label: t("basic.autoLineNumbering"),
              isSelected: () => { return handleGetManualNumbering() },
              onClick: () => {
                setPreferenceBoolean("manualNumbering", !handleGetManualNumbering())
              }
            },
            {
              label: t("basic.capitalizeKeywords"),
              isSelected: () => { return handleGetCapitalizeBasic() },
              onClick: () => {
                setPreferenceBoolean("capitalizeBasic", !handleGetCapitalizeBasic())
              }
            },
          ]]}
          />
          <button
          type="button"
          className="push-button basic-variables-toggle"
          aria-pressed={showVariables}
          title={showVariables ? t("basic.hideVariables") : t("basic.showVariables")}
          aria-label={showVariables ? t("basic.hideVariables") : t("basic.showVariables")}
          onClick={() => setShowVariables(previous => !previous)}>
          <span className="basic-variables-toggle-icon">
            <FontAwesomeIcon icon={faDollarSign} />
            {showVariables && <FontAwesomeIcon
              className="basic-variables-toggle-slash"
              icon={faSlash}
              aria-hidden="true" />}
          </span>
          </button>
        </div>
        {programError !== "" && <div
          title={programError}
          className="dbg-program-error">❌ {programError}</div>}
      </div>
      {showVariables && <BasicDebugView/>}
    </div>
  )
}

export default BasicTab
