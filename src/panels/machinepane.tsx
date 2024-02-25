import { useState } from "react";
import DebugInfoPanel from "./debuginfopanel";
import MemoryDump from "./memorydump";

const MachinePane = () => {
  const [selectedTab, setSelectedTab] = useState('debuginfo')
  const buttonStyle = (tab: string) => "bigger-font tab-button" + ((selectedTab === tab) ? " tab-active" : "")
  return (
    <div className="round-rect-border tall-panel">
      <div className="bigger-font flex-row-gap">
        <button className={buttonStyle('debuginfo')}
          onClick={() => setSelectedTab('debuginfo')}>Debug Info</button>
        <button className={buttonStyle('memorydump')}
          onClick={() => setSelectedTab('memorydump')}>Memory Dump</button>
      </div>
      {selectedTab === 'debuginfo' && <DebugInfoPanel />}
      {selectedTab === 'memorydump' && <MemoryDump />}
    </div>
  )
}

export default MachinePane;
