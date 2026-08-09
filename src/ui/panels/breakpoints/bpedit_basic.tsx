import { useState } from "react"
import EditField from "../editfield"
import Breakpoint_Once from "./breakpoint_once"
import { useTranslation } from "../../../i18n/useTranslation"

const BPEdit_Basic = (props: {
  breakpoint: Breakpoint,
  setBreakpoint: (bp: Breakpoint) => void,
}) => {
  const { t } = useTranslation()
  const [bpAddress, setBpAddress] = useState(props.breakpoint.address >= 0 ?
    props.breakpoint.address.toString() : "")

  const handleAddressChange = (value: string) => {
    value = value.replace(/[^0-9]/gi, "").slice(0, 5)
    setBpAddress(value)
    const address = parseInt(value || "-1")
    props.setBreakpoint({ ...props.breakpoint, address })
  }

  return (
    <div>
      <div className="flex-row">
        <EditField name={t("debug.basicLineNumber")}
          initialFocus={true}
          value={bpAddress}
          setValue={handleAddressChange}
          isHex={!props.breakpoint.basic}
          isNumber={props.breakpoint.basic}
          placeholder={t("debug.any")}
          width="5em" />
      </div>
      <Breakpoint_Once breakpoint={props.breakpoint} setBreakpoint={props.setBreakpoint}/>
    </div>
  )
}

export default BPEdit_Basic
