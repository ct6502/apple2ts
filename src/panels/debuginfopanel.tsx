import React from "react";
import "./debugpanel.css"
import { handleGetDebugDump } from "../main2worker";
import State6502Controls from "./state6502controls";

class DebugInfoPanel extends React.Component<object, object>
{
  render() {
    return (
      <div className="roundRectBorder">
        <p className="defaultFont panelTitle bgColor">Debug Info</p>
        <State6502Controls/>
        <div className="debug-panel"
          style={{
            width: '330px', // Set the width to your desired value
            height: `350pt`, // Set the height to your desired value
            overflow: 'auto',
            }}>
          {handleGetDebugDump()}
        </div>
      </div>
    )
  }
}

export default DebugInfoPanel;
