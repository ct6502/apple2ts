import { handleGetDebugDump } from "../main2worker";
import State6502Controls from "./state6502controls";

const DebugInfoPanel = () => {
  return (
    <div className="flex-column tall-panel">
      <State6502Controls />
      <div className="debug-panel"
        style={{
          width: '370px',
          marginTop: '7px',
          overflow: 'auto',
        }}>
        {handleGetDebugDump()}
      </div>
    </div>
  )
}

export default DebugInfoPanel
