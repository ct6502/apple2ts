import React from "react"
import { handleGetDarkMode } from "../main2worker"
import "./helppanel.css"
import { defaultHelpText } from "./defaulthelptext"

type HelpPanelProps = {
  narrow: boolean,
  helptext: string,
}

// Use the React.memo() function to optimize the HelpPanel component.
// It was re-rendering on every machine state update, which was ridiculous.
// Now it only re-renders when the help text changes.
const HelpPanel = React.memo((props: HelpPanelProps) => {
  const height = window.innerHeight ? window.innerHeight - 170 : (window.outerHeight - 170)
  const helpText = (props.helptext.length > 1 && props.helptext !== "<Default>") ? props.helptext : defaultHelpText
  return (
    <div className="help-parent"
      style={{width: props.narrow ? "" : 500, height:
        props.narrow ? "" : height,
        overflow: (props.narrow ? "visible" : "auto")}}>
      <div className={handleGetDarkMode() ? "" : "help-paper"}>
        <pre className={"help-text " + (handleGetDarkMode() ? "help-text-dark" : "help-text-light")}
          dangerouslySetInnerHTML={{ __html: helpText }}>
        </pre>
      </div>
    </div>
  )
}, (prevProps, nextProps) => {
  return prevProps.helptext === nextProps.helptext
})

// Avoid a lint error "Component definition is missing display name".
// Presumably this is because this component is wrapped in a React.memo
// so the displayName cannot be inferred from the TSX.
HelpPanel.displayName = "HelpPanel"

export default HelpPanel
