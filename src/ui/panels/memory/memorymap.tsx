// import { handleGetStackString } from "../main2worker";

import { RUN_MODE } from "../../../common/utility"
import { handleGetC800Slot, handleGetRunMode, handleGetSoftSwitches,
  passSetSoftSwitches, passSetVideo7Override } from "../../main2worker"

const MEMORY_MAP_LABELS = {
  zeroPage: "Zero Page",
  stack: "Stack",
  text: "Text",
  hgr: "HGR",
  internalRom: "Internal ROM",
  slotRom: "Slot ROM",
  bank1: "1",
  bank2: "2",
} as const

const formatSlotLabel = (slot: number) => `Slot ${slot}`

const CheckedBox = (props: {name: string, runMode: number, checked: boolean, func: () => void}) => {
  return <span style={{display: "inline-flex", userSelect: "none"}}>
    <input type="checkbox"
      className="debug-checkbox"
      name={props.name}
      style={{margin: 0, marginRight: "2px"}}
      checked={props.checked}
      disabled={props.runMode !== RUN_MODE.PAUSED}
      onChange={props.func}
    />
    <span style={{}}>{props.name}</span>
    </span>
}

const MemoryMap = (props: {updateDisplay: UpdateDisplay}) => {
  const switches = handleGetSoftSwitches()
  if (Object.keys(switches).length <= 1) return (<div></div>)
  const altZP = switches.ALTZP
  let bankD000read = ""
  let bankD000write = ""
  let classBSRread = "mem-rom"
  let classBSRwrite = "mem-rom"
  if (switches.BSRREADRAM) {
    classBSRread = altZP ? "mem-aux" : ""
    bankD000read = (switches.BSRBANK2 ? MEMORY_MAP_LABELS.bank2 : MEMORY_MAP_LABELS.bank1)
  }
  if (switches.BSR_WRITE) {
    classBSRwrite = altZP ? "mem-aux" : ""
    bankD000write = (switches.BSRBANK2 ? MEMORY_MAP_LABELS.bank2 : MEMORY_MAP_LABELS.bank1)
  }
  const auxRead = switches.AUXRAMREAD
  const auxWrite = switches.AUXRAMWRITE
  const store80 = switches.STORE80
  const page2 = switches.PAGE2
  const isHGR = switches.HIRES
  const textIsAuxRead = store80 ? page2 : auxRead
  const textIsAuxWrite = store80 ? page2 : auxWrite
  const videoIsPage2 = store80 ? false : page2
  // See Inside the Apple //e, p. 296-7
  const hgrIsAuxRead = store80 ? (isHGR ? page2 : auxRead) : auxRead
  const hgrIsAuxWrite = store80 ? (isHGR ? page2 : auxWrite) : auxWrite
  //   // Only select second 80-column text page if STORE80 is also OFF
  //   const pageOffset = (SWITCHES.PAGE2.isSet && !SWITCHES.STORE80.isSet) ? TEXT_PAGE2 : TEXT_PAGE1
  const internalCxRom = switches.INTCXROM
  // Are we still hooked up to the internal ROM for C300?
  const internalC3Rom = switches.INTCXROM || (!switches.SLOTC3ROM)
  // 255 is our flag for internal C8ROM
  const c800Slot = internalCxRom ? 255 : handleGetC800Slot()
  const c800SlotText = (c800Slot < 255) ?
    (c800Slot > 0 ? formatSlotLabel(c800Slot) : MEMORY_MAP_LABELS.slotRom) :
    MEMORY_MAP_LABELS.internalRom
  const runMode = handleGetRunMode()

  const setSoftSwitches = (switches: Array<number>) => {
    if (handleGetRunMode() === RUN_MODE.PAUSED) {
      passSetSoftSwitches(switches)
      props.updateDisplay()
    }
  }

  const setVideo7Override = (mode: Video7Mode, enabled: boolean) => {
    if (handleGetRunMode() === RUN_MODE.PAUSED) {
      passSetVideo7Override(mode, enabled)
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

  return (
    <div>
      <div className="bigger-font" style={{ marginBottom: "6px" }}>Memory Map</div>
      <div className="flex-row-gap">
      <table className="memory-map mono-text">
        <tbody>
          <tr className="memory-map-header">
            <td>&nbsp;</td><td>Read</td><td>Write</td>
          </tr>
          <tr>
            <td>$0000</td><td colSpan={2} className={altZP ? "mem-aux" : ""}>{MEMORY_MAP_LABELS.zeroPage}</td>
          </tr>
          <tr>
            <td>$0100</td><td colSpan={2} className={altZP ? "mem-aux" : ""}>{MEMORY_MAP_LABELS.stack}</td>
          </tr>
          <tr>
            <td>$0200</td><td className={auxRead ? "mem-aux" : ""}></td><td className={auxWrite ? "mem-aux" : ""}>&nbsp;&nbsp;&nbsp;&nbsp;</td>
          </tr>
          <tr>
            <td>$0400</td><td className={textIsAuxRead ? "mem-aux" : ""}>{videoIsPage2 ? "" : MEMORY_MAP_LABELS.text}</td><td className={textIsAuxWrite ? "mem-aux" : ""}>&nbsp;</td>
          </tr>
          <tr>
            <td>$0800</td><td className={auxRead ? "mem-aux" : ""}>{videoIsPage2 ? MEMORY_MAP_LABELS.text : ""}</td><td className={auxWrite ? "mem-aux" : ""}>&nbsp;</td>
          </tr>
          <tr>
            <td>$2000</td><td className={hgrIsAuxRead ? "mem-aux" : ""}>{videoIsPage2 ? "" : MEMORY_MAP_LABELS.hgr}</td><td className={hgrIsAuxWrite ? "mem-aux" : ""}>&nbsp;</td>
          </tr>
          <tr>
            <td>$4000</td><td className={auxRead ? "mem-aux" : ""}>{videoIsPage2 ? MEMORY_MAP_LABELS.hgr : ""}</td><td className={auxWrite ? "mem-aux" : ""}>&nbsp;</td>
          </tr>
          <tr>
            <td>$C1-C7</td><td colSpan={2} className={internalCxRom ? "mem-rom" : ""}>{internalCxRom ? MEMORY_MAP_LABELS.internalRom : MEMORY_MAP_LABELS.slotRom}</td>
          </tr>
          <tr>
            <td>$C300</td><td colSpan={2} className={internalC3Rom ? "mem-rom" : ""}>{internalC3Rom ? MEMORY_MAP_LABELS.internalRom : MEMORY_MAP_LABELS.slotRom}</td>
          </tr>
          <tr>
            <td>$C800</td><td colSpan={2} className={(c800Slot === 255) ? "mem-rom" : ""}>{c800SlotText}</td>
          </tr>
          <tr>
            <td>$D000</td><td className={classBSRread}>{bankD000read}</td><td className={classBSRwrite}>{bankD000write}</td>
          </tr>
          <tr>
            <td>$E0-FF</td><td className={classBSRread}>&nbsp;</td><td className={classBSRwrite}>&nbsp;</td>
          </tr>
        </tbody>
      </table>
      <div className="mono-text flex-column" style={{gap: "1px"}}>
        <CheckedBox name="Aux Bank" runMode={runMode} checked={switches.ALTZP}
          func={() => setSoftSwitches([switches.ALTZP ? 0xC008 : 0xC009])} />
        <CheckedBox name="Aux Read" runMode={runMode} checked={switches.AUXRAMREAD}
          func={() => setSoftSwitches([switches.AUXRAMREAD ? 0xC002 : 0xC003])} />
        <CheckedBox name="Aux Write" runMode={runMode} checked={switches.AUXRAMWRITE}
          func={() => setSoftSwitches([switches.AUXRAMWRITE ? 0xC004 : 0xC005])} />
        <CheckedBox name="80 Store" runMode={runMode} checked={switches.STORE80}
          func={() => setSoftSwitches([switches.STORE80 ? 0xC000 : 0xC001])} />
        <CheckedBox name="Text" runMode={runMode} checked={switches.TEXT}
          func={() => setSoftSwitches([switches.TEXT ? 0xC050 : 0xC051])} />
        <CheckedBox name="Hires" runMode={runMode} checked={switches.HIRES}
          func={() => setSoftSwitches([switches.HIRES ? 0xC056 : 0xC057])} />
        <CheckedBox name="Mixed" runMode={runMode} checked={switches.MIXED}
          func={() => setSoftSwitches([switches.MIXED ? 0xC052 : 0xC053])} />
        <CheckedBox name="Page 2" runMode={runMode} checked={switches.PAGE2}
          func={() => setSoftSwitches([switches.PAGE2 ? 0xC054 : 0xC055])} />
        <CheckedBox name="80 Column" runMode={runMode} checked={switches.COLUMN80}
          func={() => setSoftSwitches([switches.COLUMN80 ? 0xC00C : 0xC00D])} />
        <CheckedBox name="Dbl Hires" runMode={runMode} checked={switches.DHIRES}
          func={() => setSoftSwitches([switches.DHIRES ? 0xC05F : 0xC05E])} />
        <CheckedBox name="V7 160x" runMode={runMode} checked={switches.VIDEO7_160}
          func={() => setVideo7Override("160x192", !switches.VIDEO7_160)} />
        <CheckedBox name="V7 Mono" runMode={runMode} checked={switches.VIDEO7_MONO}
          func={() => setVideo7Override("monochrome", !switches.VIDEO7_MONO)} />
        <CheckedBox name="V7 Mixed" runMode={runMode} checked={switches.VIDEO7_MIXED}
          func={() => setVideo7Override("mixed", !switches.VIDEO7_MIXED)} />
        <CheckedBox name="Cxxx ROM" runMode={runMode} checked={switches.INTCXROM}
          func={() => setSoftSwitches([switches.INTCXROM ? 0xC006 : 0xC007])} />
        <CheckedBox name="C300 ROM" runMode={runMode} checked={switches.SLOTC3ROM}
          func={() => setSoftSwitches([switches.SLOTC3ROM ? 0xC00A : 0xC00B])} />
        <CheckedBox name="Read RAM" runMode={runMode} checked={switches.BSRREADRAM} func={toggleReadRAM} />
        <CheckedBox name="Write RAM" runMode={runMode} checked={switches.BSR_WRITE} func={toggleWriteRAM} />
        <CheckedBox name="Bank 2" runMode={runMode} checked={switches.BSRBANK2} func={toggleBank2} />
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
