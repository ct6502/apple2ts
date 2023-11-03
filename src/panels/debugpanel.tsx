import React from "react";
import "./debugpanel.css"
import DisassemblyPanel from "./disassemblypanel";
import DebugInfoPanel from "./debuginfopanel";
import TimeTravelPanel from "./timetravelpanel";

class DebugPanel extends React.Component<object, object>
{
  render() {
    return (
      <div className="flexRow">
        <DisassemblyPanel/>
        <span className="flexColumn">
          <DebugInfoPanel/>
          <TimeTravelPanel/>
        </span>
      </div>
    )
  }
}

export default DebugPanel;
