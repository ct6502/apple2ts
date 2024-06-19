import { handleGetStackString } from "../main2worker";
import MemoryMap from "./memorymap";
import State6502Controls from "./state6502controls";

const DebugInfoPanel = () => {
  return (
    <div className="flex-column">
      <State6502Controls />
      <div className="debug-panel"
        style={{
          width: '370px',
          marginTop: '7px',
          overflow: 'auto',
        }}>
        <div className="flex-row-space-between">
          <div className="flex-column" style={{ width: '45%' }}>
            <div className="bigger-font" style={{ marginBottom: '6px' }}>Stack Dump</div>
            <div className="thinBorder" style={{ padding: '3px', overflow: 'auto', width: '100%', height: '465px' }}>{handleGetStackString()}</div>
          </div>
          <div className="flex-column" style={{ width: '45%' }}>
            <div className="bigger-font" style={{ marginBottom: '6px' }}>Memory Map</div>
            <MemoryMap />
          </div>
        </div>
      </div>
    </div>
  )
}

export default DebugInfoPanel
