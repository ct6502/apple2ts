import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPenToSquare, faUpRightFromSquare, faMicrochip, faMagnifyingGlass, faSync } from "@fortawesome/free-solid-svg-icons"
import { HEATMAP_STATE, RUN_MODE } from "../../../common/utility"
import { handleGetRunMode, passSetCycleCount } from "../../main2worker"
import PopupMenu from "../../controls/popupmenu"
import { useState } from "react"
import { getViridisColorsRGB } from "../../ui_utilities"

const HeatMapControls = (props: {
  state: HEATMAP_STATE,
  setState: (value: HEATMAP_STATE) => void,
  colorTable: string,
  setColorTable: (value: string) => void,
  setShowMagnifier: (value: boolean) => void }) => {
  // const { t } = useTranslation() 
  const runMode = handleGetRunMode()
  const [popupLocation, setPopupLocation] = useState<[number, number]>()
  const handleClick = (event: React.MouseEvent) => {
    setPopupLocation([event.clientX, event.clientY])
  }

  const colorTableNames = ["Viridis", "Plasma", "Inferno", "Magma"]

  const constructColorBar = (colorTable: string) => {
    const colors = getViridisColorsRGB(colorTable, 16)
    return (
      <span className="flex-row">
        {colors.map((color, index) => (
          <span key={index} style={{ margin: 0, width: "6px", height: "16px", backgroundColor: `rgb(${color.join(",")})` }}>
          </span>
        ))}
      </span>
    )
  }
  const menuItems = colorTableNames.map((name, index) => ({
    label: name,
    icon: constructColorBar(name),
    hover: () => {
      props.setColorTable(colorTableNames[index])
    },
    onClick: () => {
      setPopupLocation(undefined)
      props.setColorTable(colorTableNames[index])
    }
  }))

  return (
    <span className="flex-row" style={{ marginBottom: "5px" }}>
      <button className={`push-button ${props.state === HEATMAP_STATE.CPU ? "button-active" : ""}`}
        title="6502 Program Counter"
        onClick={() => {
          props.setState(HEATMAP_STATE.CPU)
        }}
        disabled={runMode === RUN_MODE.IDLE}>
        <FontAwesomeIcon icon={faMicrochip} />
      </button>
      <button className={`push-button
        ${props.state === HEATMAP_STATE.GETMEM ? "button-active" : ""}`}
        title="Get Memory Calls"
        onClick={() => {
          props.setState(HEATMAP_STATE.GETMEM)
        }}
        disabled={runMode === RUN_MODE.IDLE}>
        <FontAwesomeIcon icon={faUpRightFromSquare} />
      </button>
      <button className={`push-button
        ${props.state === HEATMAP_STATE.SETMEM ? "button-active" : ""}`}
        title="Set Memory Calls"
        onClick={() => {
          props.setState(HEATMAP_STATE.SETMEM)
        }}
        disabled={runMode === RUN_MODE.IDLE}>
        <FontAwesomeIcon icon={faPenToSquare} />
      </button>
      <span className={`flex-row ${runMode === RUN_MODE.IDLE ? "disabled" : ""}`}
        title="Color Table"
        style={{alignItems: "center",
        }}
        onClick={handleClick}
      >
        {getViridisColorsRGB(props.colorTable, 16).map((color, index) => (
          <span key={index} style={{ margin: 0, width: "6px", height: "16px", backgroundColor: `rgb(${color.join(",")})` }}>
          </span>
        ))}
      </span>
      <PopupMenu
        location={popupLocation}
        onClose={() => { setPopupLocation(undefined) }}
        menuItems={[
          menuItems,
        ]}
      />
      <button className="push-button"
        title="Show Magnifier"
        onClick={() => {props.setShowMagnifier(true)}}
        disabled={runMode === RUN_MODE.IDLE}>
        <FontAwesomeIcon icon={faMagnifyingGlass} />
      </button>
      <button className="push-button"
        title="Reset cycle count and heat maps"
        onClick={() => { passSetCycleCount(0) }}
        disabled={runMode === RUN_MODE.IDLE}>
        <FontAwesomeIcon icon={faSync}/>
      </button>
    </span>
  )
}

export default HeatMapControls
