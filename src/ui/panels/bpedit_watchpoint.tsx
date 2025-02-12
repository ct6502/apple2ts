import React, { useState } from "react";
import EditField from "./editfield";
import PullDownMenu from "./pulldownmenu";
import { Droplist } from "./droplist";
import { MEMORY_BANKS, MemoryBankKeys, MemoryBankNames } from "../../common/memorybanks";
import { toHex } from "../../common/utility";
import { Breakpoint } from "../../common/breakpoint";
import { handleGetSoftSwitchDescriptions } from "../main2worker";

const BPEdit_Watchpoint = (props: {
  breakpoint: Breakpoint,
}) => {
  const [triggerUpdate, setTriggerUpdate] = useState(false)
  const [bpAddress, setBpAddress] = useState(props.breakpoint.address >= 0 ?
    toHex(props.breakpoint.address) : '')

  const handleAddressChange = (value: string) => {
    value = value.replace(/[^0-9a-f]/gi, '').slice(0, 4).toUpperCase()
    setBpAddress(value)
    if (props.breakpoint) {
      const address = parseInt(value || '0', 16)
      if (address >= 0xC000 && address <= 0xC0FF) {
        props.breakpoint.memget = true
        props.breakpoint.memset = true
        const switches = handleGetSoftSwitchDescriptions()
        if (switches[address]) {
          if (switches[address].includes("status")) {
            props.breakpoint.memset = false
          } else if (switches[address].includes("write")) {
            props.breakpoint.memget = false
          }
        }
      }
      props.breakpoint.address = address
      setTriggerUpdate(!triggerUpdate)
    }
  }

  const handleHexValueChange = (value: string) => {
    const hexSize = props.breakpoint.instruction ? 4 : 2
    value = value.replace(/[^0-9a-f]/gi, '').slice(0, hexSize).toUpperCase()
    if (props.breakpoint) {
      props.breakpoint.hexvalue = parseInt(value ? value : '-1', 16)
      setTriggerUpdate(!triggerUpdate)
    }
  }

  const handleMemgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    props.breakpoint.memget = e.target.checked
    setTriggerUpdate(!triggerUpdate)
  }

  const handleMemsetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    props.breakpoint.memset = e.target.checked
    setTriggerUpdate(!triggerUpdate)
  }

  const handleMemoryBankChange = (value: string) => {
    for (const key of MemoryBankKeys) {
      const bank = MEMORY_BANKS[key];
      if (bank.name === value) {
        props.breakpoint.memoryBank = key
        setTriggerUpdate(!triggerUpdate)
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
  const hexvalue = v >= 0 ? v.toString(16).toUpperCase() : ''

  return (
    <div>
      <div className="flex-row" style={{ alignItems: 'baseline' }}>
        <EditField name="Address: "
          initialFocus={true}
          value={bpAddress}
          setValue={handleAddressChange}
          placeholder="F800"
          width="5em" />
        <PullDownMenu values={handleGetSoftSwitchDescriptions()} setValue={handleAddressChange} />
      </div>
      <div>
        <div style={{ height: "8px" }} />
        <input type="checkbox" id="memget" value="memget"
          className="check-radio-box shift-down"
          checked={props.breakpoint.memget}
          onChange={(e) => { handleMemgetChange(e) }} />
        <label htmlFor="memget" className="dialog-title flush-left">Read</label>
        <input type="checkbox" id="memset" value="memset"
          className="check-radio-box shift-down"
          checked={props.breakpoint.memset}
          onChange={(e) => { handleMemsetChange(e) }} />
        <label htmlFor="memset" className="dialog-title flush-left">Write</label>
      </div>
      <div>
        <EditField name="With hex value:"
          value={hexvalue}
          setValue={handleHexValueChange}
          placeholder="any"
          width="5em" />
      </div>
      <Droplist name="Memory&nbsp;Bank: "
        value={MEMORY_BANKS[props.breakpoint.memoryBank].name}
        values={MemoryBankNames}
        setValue={handleMemoryBankChange}
        userdata={props.breakpoint.address}
        isDisabled={isBankDisabledForAddress} />
    </div>
  )
}

export default BPEdit_Watchpoint;
