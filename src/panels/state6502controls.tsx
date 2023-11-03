import React, { KeyboardEvent } from "react";
import "./debugpanel.css"
import { handleGetRunMode, handleGetState6502, passSetState6502 } from "../main2worker";
import { RUN_MODE, toHex } from "../emulator/utility/utility";

class State6502Controls extends React.Component<object, { PC: string; }>
{
  previousRunMode = RUN_MODE.IDLE
  constructor(props: object) {
    super(props);
    this.state = {
      PC: '',
    };
  }

  handleDisassembleAddrChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newvalue = e.target.value.replace(/[^0-9a-f]/gi, '').toUpperCase().substring(0, 4)
    this.setState({PC: newvalue});
  }

  handleDisassembleAddrKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      const addr = parseInt(this.state.PC || '0', 16)
      const s6502 = handleGetState6502()
      s6502.PC = addr
      passSetState6502(s6502)
//      passSetDisassembleAddress(addr)
    }
  }
  render() {
    const runMode = handleGetRunMode()
    let PC = this.state.PC
    if (this.previousRunMode !== runMode) {
      this.previousRunMode = runMode
      if (runMode === RUN_MODE.PAUSED) {
        const s6502 = handleGetState6502()
        PC = toHex(s6502.PC, 4)
      }
    }
    // PStatus: number,
    // PC: number,
    // Accum: number,
    // XReg: number,
    // YReg: number,
    // StackPtr: number,
    // flagIRQ: number,
    // flagNMI: boolean
    return (
      <div className="flexRow">
        <div className="biggerFont">PC</div>
        <input className="address"
          type="text"
          placeholder=""
          disabled={runMode !== RUN_MODE.PAUSED}
          value={PC}
          onChange={this.handleDisassembleAddrChange}
          onKeyDown={this.handleDisassembleAddrKeyDown}
        />
      </div>
    )
  }
}

export default State6502Controls;
