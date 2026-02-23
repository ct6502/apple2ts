import { useState } from "react"
import DisassemblyControls from "./disassemblycontrols"
import DisassemblyView from "./disassemblyview"

const DisassemblyPanel = () => {
  const [update, setUpdate] = useState(0)

  const refresh = () => {
    setUpdate(prevUpdate => prevUpdate + 1)
  }

  const props: DisassemblyProps = {
    update: update,
    refresh: refresh,
  }

  return (
    <div className="round-rect-border tall-panel wide-panel">
      <div className="bigger-font column-gap">Disassembly</div>
      <DisassemblyControls {...props}/>
      <DisassemblyView {...props}/>
    </div>
  )
}

export default DisassemblyPanel
