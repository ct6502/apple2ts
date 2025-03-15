import React, { useState } from "react"
import { handleGetTheme } from "../main2worker"
import "./helppanel.css"
import { defaultHelpText } from "./defaulthelptext"
import Flyout from "../flyout"
import { faNoteSticky } from "@fortawesome/free-solid-svg-icons"
import { UI_THEME } from "../../common/utility"

type HelpPanelProps = {
  narrow: boolean,
  helptext: string,
}

// Use the React.memo() function to optimize the HelpPanel component.
// It was re-rendering on every machine state update, which was ridiculous.
// Now it only re-renders when the help text changes.
const HelpPanel = React.memo((props: HelpPanelProps) => {
  const [isFlyoutOpen, setIsFlyoutOpen] = useState(false)
  const height = window.innerHeight ? window.innerHeight - 170 : (window.outerHeight - 170)
  const helpText = (props.helptext.length > 1 && props.helptext !== "<Default>") ? props.helptext : defaultHelpText
  const isDarkMode = handleGetTheme() == UI_THEME.DARK
  const isMinimalTheme = handleGetTheme() == UI_THEME.MINIMAL

  if (isMinimalTheme) {
    import("./helppanel.minimal.css")
  }

  return (
    <Flyout
      icon={faNoteSticky}
      isOpen={() => { return isFlyoutOpen }}
      onClick={() => { setIsFlyoutOpen(!isFlyoutOpen) }}
      position="top-right">
      <div className="help-section">
        <div className="help-parent"
          style={{
            width: props.narrow || isMinimalTheme ? "" : 500, height:
              props.narrow || isMinimalTheme ? "" : height,
            overflow: (props.narrow ? "visible" : "auto")
          }}>
          <div className={isDarkMode ? "" : "help-paper"}>
            <pre className={"help-text " + (isDarkMode ? "help-text-dark" : "help-text-light")}
              dangerouslySetInnerHTML={{ __html: helpText }}>
            </pre>
          </div>
        </div>
      </div>
    </Flyout>
  )
}, (prevProps, nextProps) => {
  return prevProps.helptext === nextProps.helptext
})

// Avoid a lint error "Component definition is missing display name".
// Presumably this is because this component is wrapped in a React.memo
// so the displayName cannot be inferred from the TSX.
HelpPanel.displayName = "HelpPanel"

export default HelpPanel
