import { useState } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faGear,
} from "@fortawesome/free-solid-svg-icons"
import PopupMenu from "../../controls/popupmenu"
import { Printer } from "./iwii"
import { getPreferencePageLength } from "../../localstorage"

export const PrinterDialogConfig = (props: { printer: Printer }) => {
  const [popupLocation, setPopupLocation] = useState<[number, number]>()

  const handleClick = (event: React.MouseEvent) => {
    setPopupLocation([event.clientX, event.clientY])
  }

  const setPageLength = (length: number) => {
    props.printer.setPageLength(length)
  }

  const pageLength = getPreferencePageLength()

  return (
    <span>
      <button
        id="basic-button"
        className="push-button"
        title="Printer Configuration"
        onClick={handleClick}
      >
        <FontAwesomeIcon icon={faGear} />
      </button>

      <PopupMenu
        location={popupLocation}
        onClose={() => { setPopupLocation(undefined) }}
        menuItems={[[
          {label: "Page Length", isHeading: true},
          {label: "11 inch (Letter)", isSelected: () => {return pageLength === 11}, onClick: () => { setPageLength(11) }},
          {label: "11.7 inch (A4)", isSelected: () => {return pageLength === 11.7}, onClick: () => { setPageLength(11.7) }},
          {label: "12 inch", isSelected: () => {return pageLength === 12}, onClick: () => { setPageLength(12) }},
        ]]}
      />
    </span>
  )
}
