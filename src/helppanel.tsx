
const HelpPanel = (props: {helptext: string, height: number, width: number}) => {
  return (
    <span>
      <div className="helpPanel" style={{height: props.height - 30, width: props.width}}>
        <pre className="helptext">{props.helptext}</pre>
      </div>
    </span>
  )
}

export default HelpPanel;
