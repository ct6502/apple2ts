
const HelpPanel = (props: {helpText: string, height: number, width: number}) => {
  return (
    <span>
      <div className="helpPanel" style={{height: props.height - 30, width: props.width}}>
        <pre className="helpText">{props.helpText}</pre>
      </div>
    </span>
  )
}

export default HelpPanel;
