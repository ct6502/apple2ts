import { useState } from "react"
import EditField from "../editfield"

const BPEdit_Basic = (props: {
  breakpoint: Breakpoint,
  setBreakpoint: (bp: Breakpoint) => void,
}) => {
  const [bpAddress, setBpAddress] = useState(props.breakpoint.address >= 0 ?
    props.breakpoint.address.toString() : "")

  const handleAddressChange = (value: string) => {
    value = value.replace(/[^0-9]/gi, "").slice(0, 4)
    setBpAddress(value)
    const address = parseInt(value || "-1")
    props.setBreakpoint({ ...props.breakpoint, address })
  }

  return (
    <div>
      <div className="flex-row">
        <EditField name={props.breakpoint.basic ? "BASIC Line Number: " : "Address: $"}
          initialFocus={true}
          value={bpAddress}
          setValue={handleAddressChange}
          isHex={!props.breakpoint.basic}
          isNumber={props.breakpoint.basic}
          placeholder="Any"
          width="5em" />
      </div>
    </div>
  )
}

export default BPEdit_Basic
