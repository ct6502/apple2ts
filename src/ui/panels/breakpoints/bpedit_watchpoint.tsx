import { useState } from "react"
import EditField from "../editfield"
import PullDownMenu from "../pulldownmenu"
import { Droplist } from "../droplist"
import { MEMORY_BANKS, MemoryBankKeys, MemoryBankNames } from "../../../common/memorybanks"
import { toHex } from "../../../common/utility"
import { handleGetSoftSwitchDescriptions } from "../../main2worker"
import Breakpoint_Actions from "./breakpoint_actions"
import CheckBox from "../checkbox"

const BPEdit_Watchpoint = (props: {
  breakpoint: Breakpoint,
  setBreakpoint: (bp: Breakpoint) => void,
}) => {
  const [bpAddress, setBpAddress] = useState(props.breakpoint.address >= 0 ?
    toHex(props.breakpoint.address) : "")

  const handleAddressChange = (value: string) => {
    value = value.replace(/[^0-9a-f]/gi, "").slice(0, 4).toUpperCase()
    setBpAddress(value)
    if (props.breakpoint) {
      const address = parseInt(value || "0", 16)
      let memget = props.breakpoint.memget
      let memset = props.breakpoint.memset
      if (address >= 0xC000 && address <= 0xC0FF) {
        memget = true
        memset = true
        const switches = handleGetSoftSwitchDescriptions()
        if (switches[address]) {
          if (switches[address].includes("status")) {
            memset = false
          } else if (switches[address].includes("write")) {
            memget = false
          }
        }
      }
      props.setBreakpoint({ ...props.breakpoint, address, memget, memset })
    }
  }

  const handleHexValueChange = (value: string) => {
    const hexSize = props.breakpoint.instruction ? 4 : 2
    value = value.replace(/[^0-9a-f]/gi, "").slice(0, hexSize).toUpperCase()
    if (props.breakpoint) {
      props.setBreakpoint({ ...props.breakpoint, hexvalue: parseInt(value ? value : "-1", 16) })
    }
  }

  const handleMemoryBankChange = (value: string) => {
    for (const key of MemoryBankKeys) {
      const bank = MEMORY_BANKS[key]
      if (bank.name === value) {
        props.setBreakpoint({ ...props.breakpoint, memoryBank: key })
        // bail early since we found a match
        return false
      }
    }
  }

  const isBankDisabledForAddress = (value: string, address: number) => {
    for (const bank of Object.values(MEMORY_BANKS)) {
      if (bank.name === value && address >= bank.min && address <= bank.max) {
        return false
      }
    }
    return true
  }

  const v = props.breakpoint.hexvalue
  const hexvalue = v >= 0 ? v.toString(16).toUpperCase() : ""

  return (
    <div>
      <div className="flex-row" style={{ alignItems: "baseline" }}>
        <EditField name="Address: "
          initialFocus={true}
          value={bpAddress}
          setValue={handleAddressChange}
          isHex={true}
          placeholder="F800"
          width="5em" />
        <PullDownMenu values={handleGetSoftSwitchDescriptions()} setValue={handleAddressChange} />
      </div>
      <div className="flex-row" style={{ alignItems: "baseline" }}>
        <CheckBox name="Read"
          checked={props.breakpoint.memget}
          setChecked={(checked) => props.setBreakpoint({ ...props.breakpoint, memget: checked })} />
        <CheckBox name="Write"
          checked={props.breakpoint.memset}
          setChecked={(checked) => props.setBreakpoint({ ...props.breakpoint, memset: checked })} />
      </div>
      <div>
        <EditField name="With hex value:"
          value={hexvalue}
          setValue={handleHexValueChange}
          isHex={true}
          placeholder="any"
          width="5em" />
      </div>
      <Droplist name="Memory&nbsp;Bank: "
        value={MEMORY_BANKS[props.breakpoint.memoryBank].name}
        values={MemoryBankNames}
        setValue={handleMemoryBankChange}
        userdata={props.breakpoint.address}
        isDisabled={isBankDisabledForAddress} />

      <Breakpoint_Actions breakpoint={props.breakpoint} setBreakpoint={props.setBreakpoint}/>
    </div>
  )
}

export default BPEdit_Watchpoint
