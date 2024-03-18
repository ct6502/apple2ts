import "./helppanel.css"
import { defaultHelpText } from "./startuptextpage";

type HelpPanelProps = {
  darkMode: boolean,
  narrow: boolean,
  helptext: string,
  height: number,
  width: number
}

const HelpPanel = (props: HelpPanelProps) => {
  return (
    <div style={{
      boxSizing: 'content-box',
      margin: "0",
      padding: "0",
      height: (props.narrow ? 'auto' : (props.height - 30)), width: props.width,
      overflow: (props.narrow ? 'none' : 'auto')
    }}>
      <div className={props.darkMode ? "" : "help-paper"}>
        <pre className={props.darkMode ? "help-text-dark" : "help-text"}>{props.helptext.length > 1 ? props.helptext : defaultHelpText}</pre>
      </div>
    </div>
  )
}

export default HelpPanel;
