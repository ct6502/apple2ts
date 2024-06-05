import { KeyboardEvent, useState } from "react";
import {
  handleGetRunMode,
  handleGetState6502,
  passSetDisassembleAddress, passStepInto, passStepOut, passStepOver
} from "../main2worker";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPause,
  faPlay,
} from "@fortawesome/free-solid-svg-icons";
import React from "react";
import { RUN_MODE } from "../emulator/utility/utility";
import { handleSetCPUState } from "../controller";
import { bpStepInto, bpStepOut, bpStepOver } from "../img/icons";

const DisassemblyControls = () => {
  // The tooltips obscure the first line of disassembly.
  // Only show them until each button has been clicked once.
  const [tooltipOverShow, setTooltipOverShow] = useState(true)
  const [tooltipIntoShow, setTooltipIntoShow] = useState(true)
  const [tooltipOutShow, setTooltipOutShow] = useState(true)
  // The tooltip "show's" get reset when the instruction changes to/from JSR.
  const [address, setAddress] = useState('')

  const handleDisassembleAddrChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newvalue = e.target.value.replace(/[^0-9a-f]/gi, '').toUpperCase().substring(0, 4)
    setAddress(newvalue)
  }

  const handleDisassembleAddrKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      const addr = parseInt(address || '0', 16)
      passSetDisassembleAddress(addr)
      setAddress(addr.toString(16).toUpperCase())
    }
  }

  const goToCurrentPC = () => {
    const pc = handleGetState6502().PC
    passSetDisassembleAddress(pc)
    setAddress(pc.toString(16).toUpperCase())
  }

  const runMode = handleGetRunMode()

  return (
    <span className="flex-row" style={{ marginBottom: "5px" }}>
      <input className="hex-field"
        type="text"
        placeholder="FFFF"
        value={address}
        onChange={handleDisassembleAddrChange}
        onKeyDown={handleDisassembleAddrKeyDown}
      />
      <button className="push-button"
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
      <button className="push-button"
        title={tooltipOverShow ? "Step Over" : ""}
        onClick={() => { setTooltipOverShow(false); passStepOver() }}
        disabled={runMode !== RUN_MODE.PAUSED}>
        <svg width="23" height="23" className="fill-color">{bpStepOver}</svg>
      </button>
      <button className="push-button"
        title={tooltipIntoShow ? "Step Into" : ""}
        onClick={() => { setTooltipIntoShow(false); passStepInto() }}
        disabled={runMode !== RUN_MODE.PAUSED}>
        <svg width="23" height="23" className="fill-color">{bpStepInto}</svg>
      </button>
      <button className="push-button"
        title={tooltipOutShow ? "Step Out" : ""}
        onClick={() => { setTooltipOutShow(false); passStepOut() }}
        disabled={runMode !== RUN_MODE.PAUSED}>
        <svg width="23" height="23" className="fill-color">{bpStepOut}</svg>
      </button>
      <button className="push-button"
        title="Go to Current PC"
        onClick={goToCurrentPC}
        disabled={runMode !== RUN_MODE.PAUSED}>
        <div className="bigger-font">PC</div>
      </button>
    </span>
  )
}

export default DisassemblyControls;
