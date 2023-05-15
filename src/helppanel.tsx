
const HelpPanel = (props: {helpText: string, height: number}) => {
  return (
    <span>
      <div className="helpPanel" style={{height: props.height - 30}}>
        <pre className="helpText">{props.helpText}</pre>
      </div>
    </span>
  )
}

export default HelpPanel;
