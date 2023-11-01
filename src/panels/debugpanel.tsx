import React from "react";
import "./debugpanel.css"
import DisassemblyPanel from "./disassemblypanel";
import DebugDumpPanel from "./debugdumppanel";
import TimeTravelPanel from "./timetravelpanel";

class DebugPanel extends React.Component<object, object>
{
  render() {
    return (
      <div className="flexRow">
        <DisassemblyPanel/>
        <span className="flexColumn">
          <TimeTravelPanel/>
          <DebugDumpPanel/>
        </span>
      </div>
    )
  }
}

export default DebugPanel;
