import React from "react";
import "./debugpanel.css"
import DisassemblyPanel from "./disassemblypanel";
import DebugInfoPanel from "./debuginfopanel";
import TimeTravelPanel from "./timetravelpanel";

class DebugPanel extends React.Component<object, object>
{
  render() {
    return (
      <div className="flex-row">
        <DisassemblyPanel/>
        <span className="flex-column">
          <DebugInfoPanel/>
          <TimeTravelPanel/>
        </span>
      </div>
    )
  }
}

export default DebugPanel;
