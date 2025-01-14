import React from "react";
import { handleGetDarkMode } from "../main2worker";
import "./helppanel.css"
import { defaultHelpText } from "./startuptextpage";

type HelpPanelProps = {
  narrow: boolean,
  helptext: string,
  height: number,
  width: number
}

// Use the React.memo() function to optimize the HelpPanel component.
// It was re-rendering on every machine state update, which was ridiculous.
// Now it only re-renders when the help text changes.
const HelpPanel = React.memo((props: HelpPanelProps) => {
  const helpText = (props.helptext.length > 1 && props.helptext !== '<Default>') ? props.helptext : defaultHelpText
  return (
    <div style={{
      boxSizing: 'content-box',
      margin: "0",
      padding: "0",
      height: (props.narrow ? 'auto' : (props.height - 30)), width: props.width,
      overflow: (props.narrow ? 'visible' : 'auto'),
    }}>
      <div className={handleGetDarkMode() ? "" : "help-paper"}>
        <pre className={"help-text " + (handleGetDarkMode() ? "help-text-dark" : "help-text-light")}
          dangerouslySetInnerHTML={{ __html: helpText }}>
        </pre>
      </div>
    </div>
  )
}, (prevProps, nextProps) => {
  return prevProps.helptext === nextProps.helptext;
})

export default HelpPanel;
