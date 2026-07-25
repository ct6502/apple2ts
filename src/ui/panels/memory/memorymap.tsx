// import { handleGetStackString } from "../main2worker";

import { RUN_MODE } from "../../../common/utility"
import { handleGetC800Slot, handleGetRunMode, handleGetSoftSwitches, passSetSoftSwitches } from "../../main2worker"
import type { CSSProperties } from "react"

const MEMORY_MAP_LABELS = {
  zeroPage: "Zero Page",
  stack: "6502 Stack",
  text: "Text",
  hgr: "HGR",
  internalRom: "Internal ROM",
  slotRom: "Slot ROM",
  rom: "ROM",
  readWriteRam: "R/W RAM",
  readRam: "Read RAM",
  readRomWriteRam: "RdROM/WrRAM",
  bank1: "Bank 1",
  bank2: "Bank 2",
} as const

const formatSlotLabel = (slot: number) => `Slot ${slot}`

const memoryMapLabelWidth = Math.max(
  ...Object.values(MEMORY_MAP_LABELS).map(label => label.length),
  formatSlotLabel(7).length,
)

const memoryMapStyle = {
  "--memory-map-label-width": `${memoryMapLabelWidth}ch`,
} as CSSProperties

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
  let bankSwitchedRam: string = MEMORY_MAP_LABELS.rom
  let bankD000 = `${MEMORY_MAP_LABELS.rom}\n `
  let classBSR = "mem-rom"
  if (switches.BSRREADRAM || switches.BSR_WRITE) {
    classBSR = altZP ? "mem-aux" : ""
    if (switches.BSRREADRAM && switches.BSR_WRITE) {
      bankSwitchedRam = MEMORY_MAP_LABELS.readWriteRam
    } else {
      bankSwitchedRam = switches.BSRREADRAM ?
        MEMORY_MAP_LABELS.readRam : MEMORY_MAP_LABELS.readRomWriteRam
    }
    bankD000 = bankSwitchedRam + "\n" +
      (switches.BSRBANK2 ? MEMORY_MAP_LABELS.bank2 : MEMORY_MAP_LABELS.bank1)
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
    (c800Slot > 0 ? formatSlotLabel(c800Slot) : MEMORY_MAP_LABELS.slotRom) :
    MEMORY_MAP_LABELS.internalRom
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

  return (
    <div>
      <div className="bigger-font" style={{ marginBottom: "6px" }}>Memory Map</div>
      <div className="flex-row-gap">
      <table className="memory-map mono-text" style={memoryMapStyle}>
        <tbody>
          <tr>
            <td>$0000</td><td className={altZP ? "mem-aux" : ""}>{MEMORY_MAP_LABELS.zeroPage}</td>
          </tr>
          <tr>
            <td>$0100</td><td className={altZP ? "mem-aux" : ""}>{MEMORY_MAP_LABELS.stack}</td>
          </tr>
          <tr>
            <td>$0200</td><td className={isAux ? "mem-aux" : ""}></td>
          </tr>
          <tr>
            <td>$0400</td><td className={textIsAux ? "mem-aux" : ""}>{videoIsPage2 ? "" : MEMORY_MAP_LABELS.text}</td>
          </tr>
          <tr>
            <td>$0800</td><td className={isAux ? "mem-aux" : ""}>{videoIsPage2 ? MEMORY_MAP_LABELS.text : ""}</td>
          </tr>
          <tr>
            <td>$2000</td><td className={hgrIsAux ? "mem-aux" : ""}>{videoIsPage2 ? "" : MEMORY_MAP_LABELS.hgr}</td>
          </tr>
          <tr>
            <td>$4000</td><td className={isAux ? "mem-aux" : ""}>{videoIsPage2 ? MEMORY_MAP_LABELS.hgr : ""}</td>
          </tr>
          <tr>
            <td>$C1-$C7</td><td className={internalCxRom ? "mem-rom" : ""}>{internalCxRom ? MEMORY_MAP_LABELS.internalRom : MEMORY_MAP_LABELS.slotRom}</td>
          </tr>
          <tr>
            <td>$C300</td><td className={internalC3Rom ? "mem-rom" : ""}>{internalC3Rom ? MEMORY_MAP_LABELS.internalRom : MEMORY_MAP_LABELS.slotRom}</td>
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
        <CheckedBox name="Aux ZP" runMode={runMode} checked={switches.ALTZP}
          func={() => setSoftSwitches([switches.ALTZP ? 0xC008 : 0xC009])} />
        <CheckedBox name="Aux Read" runMode={runMode} checked={switches.RAMRD}
          func={() => setSoftSwitches([switches.RAMRD ? 0xC002 : 0xC003])} />
        <CheckedBox name="Aux Write" runMode={runMode} checked={switches.RAMWRT}
          func={() => setSoftSwitches([switches.RAMWRT ? 0xC004 : 0xC005])} />
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
          func={() => setSoftSwitches([switches.VIDEO7_160 ? 0xC078 : 0xC079])} />
        <CheckedBox name="V7 Mono" runMode={runMode} checked={switches.VIDEO7_MONO}
          func={() => setSoftSwitches([switches.VIDEO7_MONO ? 0xC07A : 0xC07B])} />
        <CheckedBox name="V7 Mixed" runMode={runMode} checked={switches.VIDEO7_MIXED}
          func={() => setSoftSwitches([switches.VIDEO7_MIXED ? 0xC07C : 0xC07D])} />
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
