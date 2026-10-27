import { useState } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faGear,
} from "@fortawesome/free-solid-svg-icons"
import PopupMenu from "../../controls/popupmenu"
import { Printer } from "./iwii"
import { getPreferencePageLength } from "../../localstorage"
import { useTranslation } from "../../../i18n/useTranslation"
import { changeSerialMode, getSerialMode } from "../serial/serialhub"

export const PrinterDialogConfig = (props: { printer: Printer }) => {
  const [popupLocation, setPopupLocation] = useState<[number, number]>()

  const handleClick = (event: React.MouseEvent) => {
    setPopupLocation([event.clientX, event.clientY])
  }

  const setPageLength = (length: number) => {
    props.printer.setPageLength(length)
  }

  const { t } = useTranslation()
  const pageLength = getPreferencePageLength()

  return (
    <span>
      <button
        id="basic-button"
        className="push-button"
        title={t("print.printerConfig")}
        onClick={handleClick}
      >
        <FontAwesomeIcon icon={faGear} />
      </button>

      <PopupMenu
        location={popupLocation}
        onClose={() => { setPopupLocation(undefined) }}
        menuItems={[[
          { label: t("retroControl.builtinImageWriter"),
            isSelected: () => getSerialMode() === 0,
            onClick: () => {
              changeSerialMode(0)
            }
           },
          { label: getSerialMode() === 0 ? t("retroControl.selectExternalPort") : t("retroControl.externalPort"),
            isSelected: () => getSerialMode() !== 0,
            onClick: () => {
              changeSerialMode(1)
            }
          },
          {label: t("print.pageLength"), isHeading: true},
          {label: t("print.pageLengthLetter"), isSelected: () => {return pageLength === 11}, onClick: () => { setPageLength(11) }},
          {label: t("print.pageLengthA4"), isSelected: () => {return pageLength === 11.7}, onClick: () => { setPageLength(11.7) }},
          {label: t("print.pageLengthTwelve"), isSelected: () => {return pageLength === 12}, onClick: () => { setPageLength(12) }},
        ]]}
      />
    </span>
  )
}
