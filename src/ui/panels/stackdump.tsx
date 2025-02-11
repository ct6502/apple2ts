import { handleGetStackString } from "../main2worker";

const StackDump = () => {
  return (
    <div className="debug-panel">
      <div className="bigger-font" style={{ marginBottom: '6px' }}>Stack Dump</div>
      <div className="thin-border mono-text"
        style={{ padding: '3px', overflow: 'auto', width: '150px', height: '208px' }}>
          {handleGetStackString() + `\n\n\n\n\n12345`}</div>
    </div>
  )
}

export default StackDump
