import { useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronDown as iconPulldown,
} from "@fortawesome/free-solid-svg-icons";
import { toHex } from "../emulator/utility/utility";

interface PullDownProps {
  values: Array<string>;
  setValue: (v: string) => void;
}

const PullDownMenu = (props: PullDownProps) => {
  const dialogRef = useRef(null)
  const [open, setOpen] = useState(false)

  const handleToggleDialog = () => {
    setOpen(!open)
  }

  const handleChooseItem = (value: number) => {
    setOpen(false)
    if (value) props.setValue(value.toString(16))
  }

  return (
    <div ref={dialogRef}
      onClick={handleToggleDialog}>
      <FontAwesomeIcon icon={iconPulldown}
        className='breakpoint-pushbutton'
        style={{ color: "white", fontSize: "12pt", marginTop: "4pt" }} />
      {open &&
        <div className="floating-dialog flex-column dark-mode-edit small-mono-text"
          style={{
            margin: '0', padding: '5px',
            overflow: 'auto',
            height: `${window.innerHeight / 2}px`
          }}>
          {props.values.map((description, addr) => (
            <div style={{ cursor: 'pointer' }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#aaa'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'inherit'}
              key={addr} onClick={() => handleChooseItem(addr)}>
              {`${toHex(addr)} ${description}`}
            </div>))
          }
        </div>
      }
    </div>
  )
}

export default PullDownMenu
