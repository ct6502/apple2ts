import { useEffect, useRef, useState } from "react"
import DisassemblyControls from "./disassemblycontrols"
import DisassemblyView from "./disassemblyview"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faArrowLeft, faArrowRight } from "@fortawesome/free-solid-svg-icons"
import { getCurrentAddressIndex, getVisitedAddresses, setCurrentAddressIndex, setDisassemblyAddress, setVisitedAddresses } from "./disassembly_utilities"
import { handleGetRunMode, handleGetState6502 } from "../../main2worker"
import { RUN_MODE, toHex } from "../../../common/utility"

const DisassemblyPanel = (propsIn: { isShort: boolean }) => {
  const [update, setUpdate] = useState(0)

  const refresh = () => {
    setUpdate(prevUpdate => prevUpdate + 1)
  }

  const isLandscape = (window.innerWidth > window.innerHeight)
  const height = isLandscape ? Math.max((window.innerHeight - 270), 435) : 590
  
  const props: DisassemblyProps = {
    update: update,
    refresh: refresh,
    isShort: propsIn.isShort,
    height: height,
  }

  const previousLocation = () => {
    const currentAddressIndex = getCurrentAddressIndex()
    const visitedAddresses = getVisitedAddresses()
    if (visitedAddresses.length > 0 && currentAddressIndex > 0) {
      const newIndex = currentAddressIndex - 1
      setCurrentAddressIndex(newIndex)
      const addr = visitedAddresses[newIndex]
      setDisassemblyAddress(addr)
    }
  }

  const nextLocation = () => {
    const currentAddressIndex = getCurrentAddressIndex()
    const visitedAddresses = getVisitedAddresses()
    const n = visitedAddresses.length
    if (n > 0 && currentAddressIndex < (n - 1)) {
      const newIndex = currentAddressIndex + 1
      setCurrentAddressIndex(newIndex)
      const addr = visitedAddresses[newIndex]
      setDisassemblyAddress(addr)
    }
  }

  const runMode = handleGetRunMode()
  const isPaused = runMode === RUN_MODE.PAUSED
  const prevPausedRef = useRef(isPaused)

  useEffect(() => {
    // Detect transition from false -> true (not paused -> paused)
    if (!prevPausedRef.current && isPaused) {
      const state = handleGetState6502()
      setVisitedAddresses([state.prevPC, state.PC])
      setCurrentAddressIndex(1)
    }
    // Update ref for the next render
    prevPausedRef.current = isPaused
  }, [isPaused])

  const currentAddressIndex = getCurrentAddressIndex()
  const visitedAddresses = getVisitedAddresses()
  const hasPrevious = visitedAddresses.length > 0 && currentAddressIndex > 0
  const hasNext = visitedAddresses.length > 0 && currentAddressIndex < (visitedAddresses.length - 1)
  const prevAddr = hasPrevious ? `$${toHex(visitedAddresses[currentAddressIndex - 1], 4)}` : ""
  const nextAddr = hasNext ? `$${toHex(visitedAddresses[currentAddressIndex + 1], 4)}` : ""

  return (
    <div className="round-rect-border tall-panel" style={{ width: "calc(100% - 20px)", height: height }}>
      <div className="flex-row-space-between" style={{ marginBottom: "8px" }}>
        <div className="bigger-font">Disassembly</div>
        <div className="flex-row">
          <button className="push-button tight-button"
            title={`Previous Location ${prevAddr}`}
            onClick={previousLocation}
            disabled={!isPaused || !hasPrevious}>
            <FontAwesomeIcon icon={faArrowLeft} style={{ fontSize: "0.5em" }} />
          </button>
          <button className="push-button tight-button"
            title={`Next Location ${nextAddr}`}
            onClick={nextLocation}
            disabled={!isPaused || !hasNext}>
            <FontAwesomeIcon icon={faArrowRight} style={{ fontSize: "0.5em" }} />
          </button>
        </div>
      </div>
      <DisassemblyControls {...props}/>
      <DisassemblyView {...props}/>
    </div>
  )
}

export default DisassemblyPanel
