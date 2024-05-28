import { handleGetDebugDump } from "../main2worker";
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
          <div>{handleGetDebugDump()}</div>
          <MemoryMap />
        </div>
      </div>
    </div>
  )
}

export default DebugInfoPanel
