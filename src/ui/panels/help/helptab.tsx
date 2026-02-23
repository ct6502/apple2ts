import React, { } from "react"
import "./helppanel.css"
import { defaultHelpText } from "./defaulthelptext"
import { UI_THEME } from "../../../common/utility"
import { isMinimalTheme } from "../../ui_settings"

type HelpPanelProps = {
  helptext: string,
  theme: UI_THEME,
}

//const defaultHelpTextCrc = crc32(new TextEncoder().encode(defaultHelpText))

// Use the React.memo() function to optimize the HelpPanel component.
// It was re-rendering on every machine state update, which was ridiculous.
// Now it only re-renders when the help text changes.
const HelpTab = React.memo((props: HelpPanelProps) => {
  //  const [setHelpTextCrc] = useState(defaultHelpTextCrc)

  const paperheight = window.innerHeight ? window.innerHeight - 170 : (window.outerHeight - 170)
  const helpText = (props.helptext.length > 1 && props.helptext !== "<Default>") ? props.helptext : defaultHelpText
  const isDarkMode = props.theme == UI_THEME.DARK

  if (isMinimalTheme()) {
    import("./helppanel.minimal.css")
  }

  //  const newHelpTextCrc = crc32(new TextEncoder().encode(helpText))

  // useMemo(() => {
  //   setHelpTextCrc(newHelpTextCrc)
  // // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [])

  const isTouchDevice = "ontouchstart" in document.documentElement
  const height = window.innerHeight ? window.innerHeight : (window.outerHeight - 120)
  const width = window.innerWidth ? window.innerWidth : (window.outerWidth - 20)
  const narrow = isTouchDevice || (width < height)

  return (
    <div className="help-parent"
      style={{
        width: narrow || isMinimalTheme() ? "687px" : 500,
        height: narrow || isMinimalTheme() ? "" : paperheight,
        overflow: (narrow ? "visible" : "auto")
      }}>
      <div className={isDarkMode ? "" : "help-paper"}>
        <pre className={"help-text " + (isDarkMode ? "help-text-dark" : "help-text-light")}
          dangerouslySetInnerHTML={{ __html: helpText }}>
        </pre>
      </div>
    </div>
  )
}, (prevProps, nextProps) => {
  return prevProps.helptext === nextProps.helptext && prevProps.theme === nextProps.theme
})

// Avoid a lint error "Component definition is missing display name".
// Presumably this is because this component is wrapped in a React.memo
// so the displayName cannot be inferred from the TSX.
HelpTab.displayName = "HelpPanel"

export default HelpTab
