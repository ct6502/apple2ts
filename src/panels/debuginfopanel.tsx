import { handleGetDebugDump } from "../main2worker";
import State6502Controls from "./state6502controls";

const DebugInfoPanel = () => {
  return (
    <div className="flex-column">
      <State6502Controls />
      <div className="debug-panel"
        style={{
          width: '370px', // Set the width to your desired value
          height: '350pt', // Set the height to your desired value
          overflow: 'auto',
        }}>
        {handleGetDebugDump()}
      </div>
    </div>
  )
}

export default DebugInfoPanel
