import "./helppanel.css"
import { defaultHelpText } from "./startuptextpage";

type HelpPanelProps = {
  helptext: string,
  height: number,
  width: number
}

const HelpPanel = (props: HelpPanelProps) => {
  return (
    <span>
      <div className="help-paper" style={{ height: props.height - 30, width: props.width }}>
        <pre className="help-text">{props.helptext.length > 1 ? props.helptext : defaultHelpText}</pre>
      </div>
    </span>
  )
}

export default HelpPanel;
