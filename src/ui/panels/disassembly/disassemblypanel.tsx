import { useState } from "react"
import DisassemblyControls from "./disassemblycontrols"
import DisassemblyView from "./disassemblyview"

const DisassemblyPanel = (propsIn: { isShort: boolean }) => {
  const [update, setUpdate] = useState(0)

  const refresh = () => {
    setUpdate(prevUpdate => prevUpdate + 1)
  }

  const isLandscape = (window.innerWidth > window.innerHeight)
  const height = isLandscape ? Math.max((window.innerHeight - 270), 435) : 590

  const props: DisassemblyProps = {
    update: update,
    refresh: refresh,
    isShort: propsIn.isShort,
    height: height,
  }

  return (
    <div className="round-rect-border tall-panel" style={{ width: "calc(100% - 20px)", height: height }}>
      <div className="bigger-font column-gap">Disassembly</div>
      <DisassemblyControls {...props}/>
      <DisassemblyView {...props}/>
    </div>
  )
}

export default DisassemblyPanel
