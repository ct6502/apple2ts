import { useState } from "react";
import DebugInfoPanel from "./debuginfopanel";
import MemoryDump from "./memorydump";

const MachinePane = () => {
  const [selectedTab, setSelectedTab] = useState('debuginfo')
  const buttonStyle = (tab: string) => "tab-button" + ((selectedTab === tab) ? " tab-active" : "")
  return (
    <div className="roundRectBorder" style={{ marginTop: "17px", borderTopLeftRadius: "0" }}>
      <div className="defaultFont panelTitle bgColor"
        style={{ top: "-19px", left: "1em", paddingLeft: "0", paddingRight: "0" }}>
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
