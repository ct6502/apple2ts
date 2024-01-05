import "./helppanel.css"
import { extraHelpText } from "./startuptextpage";

const HelpPanel = (props: {helptext: string, height: number, width: number}) => {
  return (
    <span>
      <div className="help-paper" style={{height: props.height - 30, width: props.width}}>
        <pre className="help-text">{props.helptext.length > 1 ? props.helptext : extraHelpText}</pre>
      </div>
    </span>
  )
}

export default HelpPanel;
