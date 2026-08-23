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

const serialPortControl = (id: string, order: number, labelKey: string): RetroControlMetadata[] => [
  {
    id,
    parentId: null,
    order,
    label: context => context.t(labelKey),
    value: context => serialNames(context)[getSerialMode()],
  },
  choiceMetadata({
    id: `${id}.port`,
    parentId: id,
    order: 0,
    label: context => context.t("retroControl.port"),
    labels: serialNames,
    currentIndex: getSerialMode,
    select: (context, index) => {
      changeSerialMode(index)
      context.displayProps.updateDisplay()
    },
    defaultIndex: 0,
  }),
]

export const retroSerialControls: RetroControlMetadata[] = [
  ...serialPortControl("printerPort", 8, "retroControl.printerPort"),
  ...serialPortControl("modemPort", 9, "retroControl.modemPort"),
]

const serialControlRegistry = new ControlRegistry(retroSerialControls)

export const SerialPortSelect = (props: DisplayProps) => {
  const { t, language, changeLanguage } = useTranslation()
  const control = serialControlRegistry.resolve(
    createControlContext(props, t, language, changeLanguage),
    "printerPort",
  )[0]

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
