// import { handleGetStackString } from "../main2worker";

import { RUN_MODE } from "../../common/utility"
import { handleGetC800Slot, handleGetRunMode, handleGetSoftSwitches, passSetSoftSwitches } from "../main2worker"

const MemoryMap = (props: {updateDisplay: UpdateDisplay}) => {
  const switches = handleGetSoftSwitches()
  if (Object.keys(switches).length <= 1) return (<div></div>)
  const altZP = switches.ALTZP
  let bankSwitchedRam = "ROM"
  let bankD000 = "ROM\n "
  let classBSR = "mem-rom"
  if (switches.BSRREADRAM || switches.BSR_WRITE) {
    classBSR = altZP ? "mem-aux" : ""
    if (switches.BSRREADRAM && switches.BSR_WRITE) {
      bankSwitchedRam = "R/W RAM"
    } else {
      bankSwitchedRam = switches.BSRREADRAM ? "Read RAM" : "Rd ROM/Wr RAM"
    }
    bankD000 = bankSwitchedRam + "\nBank " + (switches.BSRBANK2 ? "2" : "1")
  }
  const auxRead = switches.RAMRD
  const auxWrite = switches.RAMWRT
  const isAux = auxRead || auxWrite
  const store80 = switches.STORE80
  const page2 = switches.PAGE2
  const isHGR = switches.HIRES
  const textIsAux = store80 ? page2 : isAux
  const videoIsPage2 = store80 ? false : page2
  // See Inside the Apple //e, p. 296-7
  const hgrIsAux = store80 ? (isHGR ? page2 : isAux) : isAux
  // if (is80column) {
  //   // Only select second 80-column text page if STORE80 is also OFF
  //   const pageOffset = (SWITCHES.PAGE2.isSet && !SWITCHES.STORE80.isSet) ? TEXT_PAGE2 : TEXT_PAGE1
  const internalCxRom = switches.INTCXROM
  // Are we still hooked up to the internal ROM for C300?
  const internalC3Rom = switches.INTCXROM || (!switches.SLOTC3ROM)
  // 255 is our flag for internal C8ROM
  const c800Slot = internalCxRom ? 255 : handleGetC800Slot()
  const c800SlotText = (c800Slot < 255) ?
    (c800Slot > 0 ? `Slot ${c800Slot}` : "Slot ROM") : "Internal ROM"
  const runMode = handleGetRunMode()

  const setSoftSwitches = (switches: Array<number>) => {
    if (handleGetRunMode() === RUN_MODE.PAUSED) {
      passSetSoftSwitches(switches)
      props.updateDisplay()
    }
  }

  const toggleReadRAM = () => {
    const bit3 = switches.BSRBANK2 ? 0 : 1    // unchanged
    const bit0 = switches.BSR_WRITE ? 1 : 0   // unchanged
    // Read RAM is true if it equals the write-select bit. So toggle it.
    const bit1 = switches.BSRREADRAM ? (1 - bit0) : bit0  // toggling this one
    const addr = 0xC080 + (bit3 << 3) + (bit1 << 1) + bit0
    setSoftSwitches([addr])
  }

  const toggleWriteRAM = () => {
    const bit3 = switches.BSRBANK2 ? 0 : 1    // unchanged
    const bit0 = switches.BSR_WRITE ? 0 : 1   // toggling this one
    // Read RAM is true if it equals the write-select bit.
    // So to keep its value unchanged we need to toggle it and make
    // it either the same as the write-select bit or the opposite.
    const bit1 = switches.BSRREADRAM ? bit0 : (1 - bit0)  // unchanged
    const addr = 0xC080 + (bit3 << 3) + (bit1 << 1) + bit0
    setSoftSwitches([addr])
    // To enable write, we need to set the switch twice
    if (bit0) {
      setSoftSwitches([addr])
    }
  }

  const toggleBank2 = () => {
    const bit3 = switches.BSRBANK2 ? 1 : 0    // toggling this one
    const bit0 = switches.BSR_WRITE ? 1 : 0   // unchanged
    // Read RAM is true if it equals the write-select bit.
    // So to keep its value unchanged we need to toggle it and make
    // it either the same as the write-select bit or the opposite.
    const bit1 = switches.BSRREADRAM ? bit0 : (1 - bit0)  // unchanged
    const addr = 0xC080 + (bit3 << 3) + (bit1 << 1) + bit0
    setSoftSwitches([addr])
  }

  const CheckedBox = (props: {name: string, checked: boolean, func: () => void}) => {
    return <span style={{display: "inline-flex", userSelect: "none"}}>
      <input type="checkbox"
        className="debug-checkbox"
        style={{margin: 0, marginRight: "2px"}}
        checked={props.checked}
        disabled={runMode !== RUN_MODE.PAUSED}
        onChange={props.func}
      />
      <span style={{}}>{props.name}</span>
      </span>
  }

  return (
    <div>
      <div className="bigger-font" style={{ marginBottom: "6px" }}>Memory Map</div>
      <div className="flex-row-gap">
      <table className="memory-map mono-text">
        <tbody>
          <tr>
            <td>$0000</td><td className={altZP ? "mem-aux" : ""}>Zero Page</td>
          </tr>
          <tr>
            <td>$0100</td><td className={altZP ? "mem-aux" : ""}>6502 Stack</td>
          </tr>
          <tr>
            <td>$0200</td><td className={isAux ? "mem-aux" : ""}></td>
          </tr>
          <tr>
            <td>$0400</td><td className={textIsAux ? "mem-aux" : ""}>{videoIsPage2 ? "" : "Text"}</td>
          </tr>
          <tr>
            <td>$0800</td><td className={isAux ? "mem-aux" : ""}>{videoIsPage2 ? "Text" : ""}</td>
          </tr>
          <tr>
            <td>$2000</td><td className={hgrIsAux ? "mem-aux" : ""}>{videoIsPage2 ? "" : "HGR"}</td>
          </tr>
          <tr>
            <td>$4000</td><td className={isAux ? "mem-aux" : ""}>{videoIsPage2 ? "HGR" : ""}</td>
          </tr>
          <tr>
            <td>$C1-$C7</td><td className={internalCxRom ? "mem-rom" : ""}>{internalCxRom ? "Internal ROM" : "Slot ROM"}</td>
          </tr>
          <tr>
            <td>$C300</td><td className={internalC3Rom ? "mem-rom" : ""}>{internalC3Rom ? "Internal ROM" : "Slot ROM"}</td>
          </tr>
          <tr>
            <td>$C800</td><td className={(c800Slot === 255) ? "mem-rom" : ""}>{c800SlotText}</td>
          </tr>
          <tr>
            <td>$D000</td><td className={classBSR}>{bankD000}</td>
          </tr>
          <tr>
            <td>$E0-$FF</td><td className={classBSR}>{bankSwitchedRam}</td>
          </tr>
        </tbody>
      </table>
      <div className="mono-text flex-column" style={{gap: "1px"}}>
        <CheckedBox name="Aux ZP" checked={switches.ALTZP}
          func={() => setSoftSwitches([switches.ALTZP ? 0xC008 : 0xC009])} />
        <CheckedBox name="Aux Read" checked={switches.RAMRD}
          func={() => setSoftSwitches([switches.RAMRD ? 0xC002 : 0xC003])} />
        <CheckedBox name="Aux Write" checked={switches.RAMWRT}
          func={() => setSoftSwitches([switches.RAMWRT ? 0xC004 : 0xC005])} />
        <CheckedBox name="80Store" checked={switches.STORE80}
          func={() => setSoftSwitches([switches.STORE80 ? 0xC000 : 0xC001])} />
        <CheckedBox name="Text" checked={switches.TEXT}
          func={() => setSoftSwitches([switches.TEXT ? 0xC050 : 0xC051])} />
        <CheckedBox name="Hires" checked={switches.HIRES}
          func={() => setSoftSwitches([switches.HIRES ? 0xC056 : 0xC057])} />
        <CheckedBox name="Mixed" checked={switches.MIXED}
          func={() => setSoftSwitches([switches.MIXED ? 0xC052 : 0xC053])} />
        <CheckedBox name="Page 2" checked={switches.PAGE2}
          func={() => setSoftSwitches([switches.PAGE2 ? 0xC054 : 0xC055])} />
        <CheckedBox name="80 Column" checked={switches.COLUMN80}
          func={() => setSoftSwitches([switches.COLUMN80 ? 0xC00C : 0xC00D])} />
        <CheckedBox name="Cxxx ROM" checked={switches.INTCXROM}
          func={() => setSoftSwitches([switches.INTCXROM ? 0xC006 : 0xC007])} />
        <CheckedBox name="C300 ROM" checked={switches.SLOTC3ROM}
          func={() => setSoftSwitches([switches.SLOTC3ROM ? 0xC00A : 0xC00B])} />
        <CheckedBox name="Read RAM" checked={switches.BSRREADRAM} func={toggleReadRAM} />
        <CheckedBox name="Write RAM" checked={switches.BSR_WRITE} func={toggleWriteRAM} />
        <CheckedBox name="Bank 2" checked={switches.BSRBANK2} func={toggleBank2} />
      </div>
      {/* <table className="memory-map mono-text" style={{height: "2em", marginBottom: "6px"}}>
        <tbody>
          <tr><td>Main</td></tr>
          <tr><td className="mem-rom">ROM</td></tr>
          <tr><td className="mem-aux">Aux</td></tr>
        </tbody>
      </table> */}
      </div>
    </div>
  )
}

export default MemoryMap
