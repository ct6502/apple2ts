import { useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronDown as iconPulldown,
} from "@fortawesome/free-solid-svg-icons";

interface PullDownProps {
  values: Array<string>;
  setValue: (v: string) => void;
  open?: boolean;
}

const PullDownMenu = (props: PullDownProps) => {
  const dialogRef = useRef(null)
  const [open, setOpen] = useState(props.open || false)
  const [selectedItem, setSelectedItem] = useState(0);

  const handleToggleDialog = () => {
    setOpen(!open)
  }

  const handleChooseItem = (value: number) => {
    setOpen(false)
    props.setValue(value.toString(16))
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    let newIndex = selectedItem;
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      newIndex = (selectedItem + props.values.length +
        ((e.key === 'ArrowDown') ? 1 : -1)) % props.values.length
      setSelectedItem(newIndex)
      document.getElementById(`item-${newIndex}`)?.focus()
    } else if (e.key === 'Enter' || e.key === ' ') {
      handleChooseItem(newIndex)
    }
  }

  return (
    <div ref={dialogRef}
      onClick={handleToggleDialog}>
      <FontAwesomeIcon icon={iconPulldown}
        className='breakpoint-pushbutton'
        style={{ color: "white", fontSize: "12pt", marginTop: "4pt" }} />
      {open &&
        <div className="floating-dialog flex-column edit-field small-mono-text"
          style={{
            margin: '0', padding: '5px',
            overflow: 'auto',
            height: `${Math.min(props.values.length, 25) * 10}pt`
          }}
          onKeyDown={onKeyDown}>
          {props.values.map((description, index) => (
            <div style={{
              cursor: 'pointer',
            }}
              id={`item-${index}`}
              tabIndex={0} // Make the div focusable
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#aaa'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'inherit'}
              key={index}
              onClick={() => handleChooseItem(index)}
            >
              {`${description}`}
            </div>))
          }
        </div>
      }
    </div>
  )
}

export default PullDownMenu
