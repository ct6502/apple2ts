import React, { KeyboardEvent } from "react";
import "./debugpanel.css"
import { handleGetState6502, passSetDisassembleAddress } from "../main2worker";

class State6502Controls extends React.Component<object, { PC: string; }>
{
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
      passSetDisassembleAddress(addr)
      this.setState({PC: addr.toString(16).toUpperCase()})
    }
  }
  render() {
    const s6502 = handleGetState6502()
    console.log(s6502.PC)
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
          value={this.state.PC}
          onChange={this.handleDisassembleAddrChange}
          onKeyDown={this.handleDisassembleAddrKeyDown}
        />
      </div>
    )
  }
}

export default State6502Controls;
