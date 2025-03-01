import { useState } from "react"
import DisassemblyControls from "./disassemblycontrols"
import DisassemblyView from "./disassemblyview"

const DisassemblyPanel = () => {
  const [, setUpdate] = useState(0)

  const refresh = () => {
    setUpdate(prevUpdate => prevUpdate + 1)
  }

  return (
    <div className="round-rect-border tall-panel wide-panel">
      <div className="bigger-font column-gap">Disassembly</div>
      <DisassemblyControls refresh = {refresh}/>
      <DisassemblyView refresh = {refresh}/>
    </div>
  )
}

export default DisassemblyPanel
