import { handleGetDarkMode } from "../main2worker";
import "./helppanel.css"
import { defaultHelpText } from "./startuptextpage";

type HelpPanelProps = {
  narrow: boolean,
  helptext: string,
  height: number,
  width: number
}

const HelpPanel = (props: HelpPanelProps) => {
  const helpText = props.helptext.length > 1 ? props.helptext : defaultHelpText
  return (
    <div style={{
      boxSizing: 'content-box',
      margin: "0",
      padding: "0",
      height: (props.narrow ? 'auto' : (props.height - 30)), width: props.width,
      overflow: (props.narrow ? 'visible' : 'auto'),
    }}>
      <div className={handleGetDarkMode() ? "" : "help-paper"}>
        <pre className={"help-text " + (handleGetDarkMode() ? "help-text-dark" : "help-text-light")}>{helpText}</pre>
      </div>
    </div>
  )
}

export default HelpPanel;
