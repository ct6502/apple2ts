import { useState } from "react";
import { passSetBinaryBlock } from "../main2worker";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faXmark as faBreakpointDelete,
} from "@fortawesome/free-solid-svg-icons";
import EditField from "../panels/editfield";

const BinaryFileDialog = (props:
  {
    displayDialog: boolean,
    displayClose: () => void,
    binaryBuffer: Uint8Array
  }) => {
  const [runCode, setRunCode] = useState(false);
  const [runAddress, setRunAddress] = useState(() => {
    const savedRunAddress = localStorage.getItem('binaryRunAddress')
    return savedRunAddress ? savedRunAddress : '07FD'
  });

  const handleSetRunAddress = (value: string) => {
    const newValue = value.toUpperCase()
    if (newValue.match(/^([A-F0-9]{0,4})$/)) {
      setRunAddress(newValue)
      localStorage.setItem('binaryRunAddress', newValue)
    } else {
      setRunAddress(runAddress)
    }
  }

  const handleCancel = () => {
    props.displayClose()
  }

  const handleLoadBinary = () => {
    props.displayClose()
    if (props.binaryBuffer.length > 0) {
      const addr = parseInt('0x' + runAddress)
      passSetBinaryBlock(addr, props.binaryBuffer, runCode)
    }
  }

  if (!props.displayDialog) return (<></>)

  return (
    <div className="modal-overlay"
      tabIndex={0} // Make the div focusable
      onKeyDown={(event) => {
        if (event.key === 'Escape') handleCancel()
      }}>
      <div className="floating-dialog flex-column"
        style={{ left: "15%", top: "25%" }}>
        <div className="flex-column">
          <div className="flex-row-space-between">
            <div className="dialog-title">Load Binary File</div>
            <div onClick={handleCancel}>
              <FontAwesomeIcon icon={faBreakpointDelete}
                className='breakpoint-pushbutton'
                style={{ color: "white" }} />
            </div>
          </div>
          <div className="horiz-rule"></div>
        </div>
        <div className="flex-column">
          <EditField name="Load into memory at address $"
            initialFocus={true}
            value={runAddress}
            setValue={handleSetRunAddress}
            placeholder="07FD"
            width="5em" />
        </div>
        <div className="flex-row">
          <input type="checkbox" id="memset" value="memset"
            className="check-radio-box shift-down"
            checked={runCode}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              setRunCode(event.target.checked)
            }} />
          <label htmlFor="memset"
            className="dialog-title flush-left">Run code after loading</label>
        </div>
        <div className="flex-row-space-between">
          <div></div>
          <div className="flex-row">
            <button className="push-button text-button"
              onClick={handleLoadBinary}>
              <span className="centered-title">OK</span>
            </button>
            <button className="push-button text-button"
              onClick={handleCancel}>
              <span className="centered-title">Cancel</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BinaryFileDialog;
