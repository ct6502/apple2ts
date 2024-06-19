import "./debugsection.css"
import DisassemblyPanel from "./disassemblypanel";
import TimeTravelPanel from "./timetravelpanel";
import MachinePane from "./machinepane";

const DebugSection = () => {
  return (
    <div className="flex-row-gap">
      <DisassemblyPanel />
      <span className="flex-column-gap">
        <MachinePane />
        <TimeTravelPanel />
      </span>
    </div>
  )
}

export default DebugSection;
