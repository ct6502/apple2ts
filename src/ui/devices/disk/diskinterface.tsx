import "./diskinterface.css"
import DiskDrive from "./diskdrive"
import { DiskImageChooser } from "./diskimagechooser"
import { faHdd } from "@fortawesome/free-solid-svg-icons"
import { useState } from "react"
import Flyout from "../../flyout"
import ImageWriter from "../printer/imagewriter"
import { isMinimalTheme } from "../../ui_settings"
import { useTranslation } from "../../../i18n/useTranslation"
import { handleGetSlotConfig } from "../../main2worker"

const DiskInterface = (props: DisplayProps & { singleRow?: boolean }) => {
  const { t } = useTranslation()
  const [isFlyoutOpen, setIsFlyoutOpen] = useState(false)
  const height = window.innerHeight ? window.innerHeight : (window.outerHeight - 120)
  const width = window.innerWidth ? window.innerWidth : (window.outerWidth - 20)
  const isScreenNarrow = width < height

  const slotConfig = handleGetSlotConfig()
  const allSlotsDisabled = slotConfig[1] === "none" && slotConfig[6] === "none" && slotConfig[7] === "none"

  return (
    <span style={{ opacity: allSlotsDisabled ? 0.4 : 1, filter: allSlotsDisabled ? "grayscale(100%)" : "none", pointerEvents: allSlotsDisabled ? "none" : "auto", cursor: allSlotsDisabled ? "not-allowed" : "pointer" }}>
      <Flyout
        icon={faHdd}
        title={t("disk.diskDrivesAndDevices")}
        isOpen={() => { return isFlyoutOpen && !allSlotsDisabled }}
        onClick={() => { if (!allSlotsDisabled) setIsFlyoutOpen(!isFlyoutOpen) }}
        position="bottom-left">
      <div className={props.singleRow
        ? "disk-interface-single-row"
        : `${isMinimalTheme() && isScreenNarrow ? "flex-column" : "flex-row"} flexwrap`}>
        <span className="flex-row">
          {!isMinimalTheme() && <DiskImageChooser {...props} />}
          <DiskDrive key={0} index={0} renderCount={props.renderCount}
            setShowFileOpenDialog={props.setShowFileOpenDialog} />
          <DiskDrive key={1} index={1} renderCount={props.renderCount}
            setShowFileOpenDialog={props.setShowFileOpenDialog} />
          {(isMinimalTheme() && isScreenNarrow) && <ImageWriter />}
        </span>
        <span className="flex-row">
          <DiskDrive key={2} index={2} renderCount={props.renderCount}
            setShowFileOpenDialog={props.setShowFileOpenDialog} />
          <DiskDrive key={3} index={3} renderCount={props.renderCount}
            setShowFileOpenDialog={props.setShowFileOpenDialog} />
          {(!isMinimalTheme() || !isScreenNarrow) && <ImageWriter />}
        </span>
      </div>
    </Flyout>
    </span>
  )
}

export default DiskInterface
