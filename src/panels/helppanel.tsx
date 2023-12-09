import "./helppanel.css"
import { extraHelpText } from "./startuptextpage";

const HelpPanel = (props: {helptext: string, height: number, width: number}) => {
  return (
    <span>
      <div className="helpPaper" style={{height: props.height - 30, width: props.width}}>
        <pre className="helpText">{props.helptext.length > 1 ? props.helptext : extraHelpText}</pre>
      </div>
    </span>
  )
}

export default HelpPanel;
