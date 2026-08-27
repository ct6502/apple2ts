import { DropdownButton } from "../../controls/dropdownbutton"
import { serialport } from "./db9"
import { changeSerialMode, getSerialMode, getSerialNames } from "./serialhub"
import { choiceMetadata } from "../../retro/retromenuhelpers"
import type { RetroControlMetadata, RetroMenuContext } from "../../retro/retromenucontext"
import { createControlContext } from "../../retro/retromenucontext"
import { ControlRegistry } from "../../controls/controlregistry"
import { useTranslation } from "../../../i18n/useTranslation"

const serialNames = (context: RetroMenuContext) => [
  context.t("retroControl.builtinImageWriter"),
  context.t(getSerialMode() === 0 ? "retroControl.selectExternalPort" : "retroControl.externalPort"),
]

const serialPortControl = (id: string, order: number, labelKey: string): RetroControlMetadata =>
  choiceMetadata({
    id,
    parentId: "ports",
    order,
    label: context => context.t(labelKey),
    labels: serialNames,
    currentIndex: getSerialMode,
    select: (context, index) => {
      changeSerialMode(index)
      context.displayProps.updateDisplay()
    },
    defaultIndex: 0,
  })

export const retroSerialControls: RetroControlMetadata[] = [
  {
    id: "ports",
    parentId: null,
    order: 7,
    label: context => context.t("print.printer"),
  },
  serialPortControl("printerPort", 0, "retroControl.printerPort"),
]

const serialControlRegistry = new ControlRegistry(retroSerialControls)

export const SerialPortSelect = (props: DisplayProps) => {
  const { t, language, changeLanguage } = useTranslation()
  const control = serialControlRegistry.resolve(
    createControlContext(props, t, language, changeLanguage),
    "ports",
  ).find(item => item.id === "printerPort")!

  return (
    <DropdownButton 
      currentIndex = {control.optionIndex ?? getSerialMode()}
      itemNames = {control.options?.map(option => option.label) ?? getSerialNames()}
      closeCallback = {(index) => { control.options?.[index]?.action?.() }}
      icon = {<svg width="30" height="30" className="fill-color">{serialport}</svg>}
      tooltip = "Serial Port Select"
    />
  )

}
