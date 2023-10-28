import { KeyboardEvent } from "react";
import "./debugpanel.css"
import { handleGetDebugDump,
  handleGetState,
  passSetDisassembleAddress, passStepInto, passStepOut, passStepOver } from "../main2worker";
import bpStepOver from './img/bpStepOver.svg';
import bpStepInto from './img/bpStepInto.svg';
import bpStepOut from './img/bpStepOut.svg';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPause,
  faPlay,
} from "@fortawesome/free-solid-svg-icons";
import React from "react";
import Disassembly from "./disassembly";
import { STATE } from "../emulator/utility/utility";

class DebugPanel extends React.Component<{setCPUState: (state: STATE) => void},
  { address: string;
  }> {

  constructor(props: {setCPUState: (state: STATE) => void}) {
    super(props);
    this.state = {
      address: '',
    };
  }

  handleDisassembleAddrChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newvalue = e.target.value.replace(/[^0-9a-f]/gi, '').toUpperCase().substring(0, 4)
    this.setState({address: newvalue});
  }

  handleDisassembleAddrKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      const addr = parseInt(this.state.address || '0', 16)
      passSetDisassembleAddress(addr)
      this.setState({address: addr.toString(16).toUpperCase()})
    }
  }

  render() {
    const machineState = handleGetState()
    return (
      <div className="controlBar">
        <span>
          <span className="flexRow">
            <input className="address"
              type="text"
              placeholder=""
              value={this.state.address}
              onChange={this.handleDisassembleAddrChange}
              onKeyDown={this.handleDisassembleAddrKeyDown}
            />
            <button className="pushButton"
              title={machineState === STATE.PAUSED ? "Resume" : "Pause"}
              onClick={() => {
                this.props.setCPUState(machineState === STATE.PAUSED ?
                  STATE.RUNNING : STATE.PAUSED)
              }}
              disabled={machineState === STATE.IDLE}>
              {machineState === STATE.PAUSED ?
              <FontAwesomeIcon icon={faPlay}/> :
              <FontAwesomeIcon icon={faPause}/>}
            </button>
            <button className="pushButton"
              title={"Step Over"}
              onClick={passStepOver}
              disabled={machineState !== STATE.PAUSED}>
              <img src={bpStepOver} alt="Step Over" width={23} height={23}/>
            </button>
            <button className="pushButton"
              title={"Step Into"}
              onClick={passStepInto}
              disabled={machineState !== STATE.PAUSED}>
              <img src={bpStepInto} alt="Step Into" width={23} height={23}/>
            </button>
            <button className="pushButton"
              title={"Step Out"}
              onClick={passStepOut}
              disabled={machineState !== STATE.PAUSED}>
              <img src={bpStepOut} alt="Step Out" width={23} height={23}/>
            </button>
          </span>
          <Disassembly/>
        </span>
        <span>
          <div className="debugPanel"
            style={{
              width: '330px', // Set the width to your desired value
              height: `350pt`, // Set the height to your desired value
              overflow: 'auto',
              }}>
            {handleGetDebugDump()}
          </div>
        </span>
      </div>
    )
  }
}

export default DebugPanel;
