import { handleGetStackString } from "../main2worker";
import MemoryMap from "./memorymap";

const DebugInfoPanel = () => {
  return (
    <div className="flex-column-gap round-rect-border"  id="tour-debug-info">
      <div className="flex-column debug-panel">
        <div className="bigger-font" style={{ marginBottom: '6px' }}>Stack Dump</div>
        <div className="thin-border mono-text" style={{ padding: '3px', overflow: 'auto', height: '145px' }}>{handleGetStackString()}</div>
      </div>
      <MemoryMap />
    </div>
  )
}

export default DebugInfoPanel
