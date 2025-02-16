import { useEffect, useRef, useState } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faChevronDown as iconPulldown,
} from "@fortawesome/free-solid-svg-icons"

interface PullDownProps {
  values: Array<string>;
  setValue: (v: string) => void;
  open?: boolean;
}

const PullDownMenu = (props: PullDownProps) => {
  const dialogRef = useRef<HTMLDivElement>(null)
  const pulldownRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(props.open || false)
  const [selectedItem, setSelectedItem] = useState(0)
  const [pos, setPos] = useState([0, 0])

  const handleOpenDialog = (doOpen: boolean) => {
    setOpen(doOpen)
    if (doOpen) setPos([0, 0])
  }

  useEffect(() => {
    if (pos[0] === 0) {
      if (dialogRef.current) {
        const div = dialogRef.current as HTMLDivElement
        const rect = div.getBoundingClientRect()
        setPos([rect.left + window.scrollX, rect.top + window.scrollY])
      }
    }
  }, [pos])

  const handleChooseItem = (value: number) => {
    handleOpenDialog(false)
    props.setValue(value.toString(16))
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    let newIndex = selectedItem
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault()
      newIndex = (selectedItem + props.values.length +
        ((e.key === "ArrowDown") ? 1 : -1)) % props.values.length
      setSelectedItem(newIndex)
      document.getElementById(`item-${newIndex}`)?.focus()
    } else if (e.key === "Enter" || e.key === " ") {
      handleChooseItem(newIndex)
    }
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (e.currentTarget === e.target) {
      handleOpenDialog(false)
    }
  }

  return (
    <div ref={dialogRef}
      style={{ cursor: "pointer" }}
      onClick={() => handleOpenDialog(!open)}>
      <FontAwesomeIcon icon={iconPulldown}
        className='default-font'
        style={{ fontSize: "1em" }} />
      {open && pos[0] > 0 &&
        <div className="modal-overlay"
          style={{ backgroundColor: "inherit" }}
          tabIndex={0} // Make the div focusable
          onMouseDown={(e) => handleMouseDown(e)}>
          <div className="floating-dialog flex-column droplist-edit mono-text"
            ref={pulldownRef}
            style={{
              left: `${pos[0]}px`, top: `${pos[1] + 20}px`,
              margin: "0", padding: "5px",
              overflow: "auto",
              height: `${Math.min(props.values.length, 25) * 10}pt`
            }}
            onKeyDown={onKeyDown}>
            {props.values.map((description, index) => (
              <div style={{
                cursor: "pointer",
              }}
                id={`item-${index}`}
                tabIndex={0} // Make the div focusable
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#aaa"}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = "inherit"}
                key={index}
                onClick={() => handleChooseItem(index)}
              >
                {`${description}`}
              </div>))
            }
          </div>
        </div>
      }
    </div>
  )
}

export default PullDownMenu
