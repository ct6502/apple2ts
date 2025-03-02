import { KeyboardEvent, useRef, useState } from "react"
import {
  handleGetRunMode,
  handleGetState6502,
  passStepInto, passStepOut, passStepOver
} from "../main2worker"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faPause,
  faPlay,
  faFolderOpen,
} from "@fortawesome/free-solid-svg-icons"
import React from "react"
import { loadUserSymbolTable, RUN_MODE } from "../../common/utility"
import { handleSetCPUState } from "../controller"
import { bpStepInto } from "../img/icon_stepinto"
import { bpStepOut } from "../img/icon_stepout"
import { bpStepOver } from "../img/icon_stepover"
import { setDisassemblyAddress, setVisibleLine } from "./debugpanelutilities"

const DisassemblyControls = (props: DisassemblyProps) => {
  // The tooltips obscure the first line of disassembly.
  // Only show them until each button has been clicked once.
  const [tooltipOverShow, setTooltipOverShow] = useState(true)
  const [tooltipIntoShow, setTooltipIntoShow] = useState(true)
  const [tooltipOutShow, setTooltipOutShow] = useState(true)
  // The tooltip "show's" get reset when the instruction changes to/from JSR.
  const [address, setAddress] = useState("")
  const [showFileOpenDialog, setShowFileOpenDialog] = useState(false)
  const hiddenFileOpen = useRef<HTMLInputElement>(null)

  const doUpdateAddress = (addr: number) => {
    setDisassemblyAddress(addr)
    setAddress(addr.toString(16).toUpperCase())
    props.refresh()
  }

  const handleDisassembleAddrChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newvalue = e.target.value.replace(/[^0-9a-f]/gi, "").toUpperCase().substring(0, 4)
    setAddress(newvalue)
  }

  const handleDisassembleAddrKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      const addr = parseInt(address || "0", 16)
      doUpdateAddress(addr)
    }
  }

  const goToCurrentPC = () => {
    const pc = handleGetState6502().PC
    doUpdateAddress(pc)
  }

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target?.files?.length) {
      loadUserSymbolTable(e.target.files[0])
//      readFile(e.target.files[0], props.showFileOpenDialog.index)
    }
  }

  const runMode = handleGetRunMode()
  const isTouchDevice = "ontouchstart" in document.documentElement

  // This is how we actually display the file selection dialog.
  if (showFileOpenDialog) {
    // Now that we're in here, turn off our property.
    setTimeout(() => setShowFileOpenDialog(false), 0)
    if (hiddenFileOpen.current) {
      const fileInput = hiddenFileOpen.current
      // Hack - clear out old file so we can pick the same file again
      fileInput.value = ""
      // Display the dialog.
      fileInput.click()
    }
  }

  return (
    <span className="flex-row" style={{ marginBottom: "5px" }}>
      <input className="hex-field"
        type="text"
        placeholder="FFFF"
        value={address}
        onChange={handleDisassembleAddrChange}
        onKeyDown={handleDisassembleAddrKeyDown}
      />
      <button className="push-button" id="tour-debug-pause"
        title={runMode === RUN_MODE.PAUSED ? "Resume" : "Pause"}
        onClick={() => {
          handleSetCPUState(runMode === RUN_MODE.PAUSED ?
            RUN_MODE.RUNNING : RUN_MODE.PAUSED)
        }}
        disabled={runMode === RUN_MODE.IDLE}>
        {runMode === RUN_MODE.PAUSED ?
          <FontAwesomeIcon icon={faPlay} /> :
          <FontAwesomeIcon icon={faPause} />}
      </button>
      <div className="flex-row" id="tour-debug-controls">
      <button className="push-button"
        title={tooltipOverShow ? "Step Over" : ""}
        onClick={() => {
          setTooltipOverShow(false)
          passStepOver()
          setVisibleLine(-1)
        }}
        disabled={runMode !== RUN_MODE.PAUSED}>
        <svg width="23" height="23" className="fill-color">{bpStepOver}</svg>
      </button>
      <button className="push-button"
        title={tooltipIntoShow ? "Step Into" : ""}
        onClick={() => {
          setTooltipIntoShow(false)
          passStepInto()
          setVisibleLine(-1)
        }}
        disabled={runMode !== RUN_MODE.PAUSED}>
        <svg width="23" height="23" className="fill-color">{bpStepInto}</svg>
      </button>
      <button className="push-button"
        title={tooltipOutShow ? "Step Out" : ""}
        onClick={() => {
          setTooltipOutShow(false)
          passStepOut()
          setVisibleLine(-1)
        }}
        disabled={runMode !== RUN_MODE.PAUSED}>
        <svg width="23" height="23" className="fill-color">{bpStepOut}</svg>
      </button>
      <button className="push-button"
        title="Go to Current PC"
        onClick={goToCurrentPC}
        disabled={runMode !== RUN_MODE.PAUSED}>
        <div className="bigger-font">PC</div>
      </button>
      </div>
      <button className="push-button"
        title="Load Symbol Table"
        onClick={() => setShowFileOpenDialog(true)}>
        <div className="icon-container">
          <FontAwesomeIcon icon={faFolderOpen} />
          <span className="icon-text">SYM</span>
        </div>
      </button>
      <input
        type="file"
        accept={isTouchDevice ? "" : ".sym"}
        ref={hiddenFileOpen}
        onChange={handleFileSelected}
        style={{ display: "none" }}
      />
    </span>
  )
}

export default DisassemblyControls
