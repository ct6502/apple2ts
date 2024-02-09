import { KeyboardEvent, useState } from "react";
import {
  handleGetNextInstruction,
  handleGetRunMode,
  passSetDisassembleAddress, passStepInto, passStepOut, passStepOver
} from "../main2worker";
import bpStepOver from './img/bpStepOver.svg';
import bpStepInto from './img/bpStepInto.svg';
import bpStepOut from './img/bpStepOut.svg';
import bpStepStmt from './img/bpStepStmt.svg';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPause,
  faPlay,
} from "@fortawesome/free-solid-svg-icons";
import React from "react";
import { RUN_MODE } from "../emulator/utility/utility";
import { handleSetCPUState } from "../controller";

const DisassemblyControls = () => {
  // The tooltips obscure the first line of disassembly.
  // Only show them until each button has been clicked once.
  const [tooltipOverShow, setTooltipOverShow] = useState(true)
  const [tooltipIntoShow, setTooltipIntoShow] = useState(true)
  const [tooltipOutShow, setTooltipOutShow] = useState(true)
  // The tooltip "show's" get reset when the instruction changes to/from JSR.
  const [wasJSR, setWasJSR] = useState(true)
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

  const runMode = handleGetRunMode()
  const isJSR = handleGetNextInstruction() === 'JSR'

  // If the instruction changes to/from JSR, reset the tooltips,
  // on the assumption that the user won't remember what the buttons mean.
  if (isJSR !== wasJSR) {
    setTooltipOverShow(true)
    setTooltipIntoShow(true)
    setWasJSR(isJSR)
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
        title={tooltipOverShow ? (isJSR ? "Step Over" : " Step") : ""}
        onClick={() => { setTooltipOverShow(false); passStepOver() }}
        disabled={runMode !== RUN_MODE.PAUSED}>
        <img src={isJSR ? bpStepOver : bpStepStmt} alt="Step Over" width={23} height={23} />
      </button>
      <button className="push-button"
        title={tooltipIntoShow ? "Step Into" : ""}
        onClick={() => { setTooltipIntoShow(false); passStepInto() }}
        disabled={runMode !== RUN_MODE.PAUSED || !isJSR}>
        <img src={bpStepInto} alt="Step Into" width={23} height={23} />
      </button>
      <button className="push-button"
        title={tooltipOutShow ? "Step Out" : ""}
        onClick={() => { setTooltipOutShow(false); passStepOut() }}
        disabled={runMode !== RUN_MODE.PAUSED}>
        <img src={bpStepOut} alt="Step Out" width={23} height={23} />
      </button>
    </span>
  )
}

export default DisassemblyControls;
