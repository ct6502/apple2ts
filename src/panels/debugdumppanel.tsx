import React from "react";
import "./debugpanel.css"
import { handleGetDebugDump } from "../main2worker";

class DebugDumpPanel extends React.Component<object, object>
{
  render() {
    return (
      <span>
        <div className="debugPanel"
          style={{
            width: '330px', // Set the width to your desired value
            height: `350pt`, // Set the height to your desired value
            overflow: 'auto',
            }}>
          {handleGetDebugDump()}
        </div>
      </span>
    )
  }
}

export default DebugDumpPanel;
