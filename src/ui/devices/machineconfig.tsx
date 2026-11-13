import { handleGetMachineName, handleGetMemSize, handleGetSlotConfig } from "../main2worker"
import { setPreferenceRamWorks, setPreferenceSlotConfig, setPreferenceVeraSlot } from "../localstorage"
import { setUIStateBoolean, setTabView } from "../ui_settings"
import { notifySettingsChanged } from "../settingschange"
import { DEFAULT_SLOT_CONFIG, RUN_MODE } from "../../common/utility"
import { handleSetCPUState } from "../controller"
import { isCanvasFullscreen, setCanvasFullscreen } from "../controls/fullscreenbutton"
import type { RetroControlMetadata, RetroMenuContext } from "../retro/retromenucontext"
import { choiceBinding, controlsFromJson, type RetroControlBindings } from "../retro/retrocontrolmetadata"

export const RAM_OPTIONS = [64, 512, 1024, 4096, 8192] as const

export const SLOT_NUMBERS = [1, 2, 3, 4, 5, 6, 7] as const
type SlotNumber = typeof SLOT_NUMBERS[number]

type SlotOption = {
  card: SLOT_CARD_ID
  ramSizeKb?: typeof RAM_OPTIONS[number]
}

export const getSlotOptions = (slot: SlotNumber, machine: MACHINE_NAME): SlotOption[] => {
  if (slot === 3) {
    return machine === "APPLE2P"
      ? [{ card: "none" }, { card: "videoterm" }, { card: "vidhd" }]
      : [
        { card: "none" },
        ...RAM_OPTIONS.map(ramSizeKb => ({ card: "aux" as const, ramSizeKb })),
        { card: "vidhd" },
      ]
  }
  const options: Record<SlotNumber, SLOT_CARD_ID[]> = {
    1: ["none", "ssc"],
    2: ["none", "vera", "passport", "softcard"],
    3: [],
    4: ["none", "mouse", "mockingboard", "vera", "softcard"],
    5: ["none", "mouse", "mockingboard", "softcard"],
    6: ["none", "disk2"],
    7: ["none", "smartport"],
  }
  return options[slot].map(card => ({ card }))
}

const getAuxCardLabel = (sizeKb: number): string => {
  if (sizeKb <= 64) {
    return "Apple 699-0221 (64KB / 80-Col / dHGR)"
  }
  const sizeStr = sizeKb >= 1024 ? `${sizeKb / 1024}MB` : `${sizeKb}KB`
  return `RamWorks III (${sizeStr} / 80-Col / dHGR)`
}

const retroCardLabels = (context: RetroMenuContext): Record<SLOT_CARD_ID, string> => ({
  none: context.t("retroControl.card.empty"),
  ssc: context.t("retroControl.card.ssc"),
  softcard: context.t("retroControl.card.softcard"),
  aux: context.t("retroControl.card.aux"),
  videoterm: context.t("retroControl.card.videoterm"),
  vidhd: "VidHD (64KB / 80-Col / SHR)",
  mockingboard: context.t("retroControl.card.mockingboard"),
  mouse: context.t("retroControl.card.mouse"),
  vera: context.t("retroControl.card.vera"),
  passport: context.t("retroControl.card.passport"),
  disk2: context.t("retroControl.card.disk2"),
  disk35: "3.5\" Disk Drive",
  smartport: context.t("retroControl.card.smartport"),
  gsPrinter: "Printer Port",
  gsModem: "Modem Port",
  gsText80: "80-Column Text",
  gsMouse: "Mouse Port",
  gsSmartPort: "Smart Port",
  gsDiskPort: "Disk Port",
})

const getRetroSlotOptionLabel = (context: RetroMenuContext, option: SlotOption) =>
  option.card === "aux" && option.ramSizeKb !== undefined
    ? getAuxCardLabel(option.ramSizeKb)
    : retroCardLabels(context)[option.card]

const selectRetroSlotCard = (context: RetroMenuContext, slot: SlotNumber, option: SlotOption) => {
  const currentConfig = handleGetSlotConfig()
  const nextConfig = { ...currentConfig }
  const { card, ramSizeKb } = option
  if (card !== "none" && card !== "mockingboard") {
    SLOT_NUMBERS.forEach(otherSlot => {
      if (otherSlot !== slot && nextConfig[otherSlot] === card) nextConfig[otherSlot] = "none"
    })
  }
  if (card === "vera") {
    setPreferenceVeraSlot(slot as VERA_SLOT)
    setUIStateBoolean("infoPanel", true)
    setTabView(4)
    notifySettingsChanged(["panels.tab", "options.infoPanel"], "external")
  } else if (currentConfig[slot] === "vera") {
    setPreferenceVeraSlot(0)
  }
  if (slot === 3 && card === "aux" && ramSizeKb !== undefined) {
    setPreferenceRamWorks(ramSizeKb, context.settingsOrigin)
  }
  nextConfig[slot] = card
  setPreferenceSlotConfig(nextConfig, context.settingsOrigin)
  context.displayProps.updateDisplay()
}

const machineBindings: RetroControlBindings = {
  "machine.boot": {
    action: context => {
      handleSetCPUState(RUN_MODE.NEED_BOOT)
      context.close()
    },
  },
  "machine.reset": {
    action: context => {
      handleSetCPUState(RUN_MODE.NEED_RESET)
      context.close()
    },
  },
  "machine.fullscreen": {
    ...choiceBinding({
      options: context => [
        { label: context.t("messages.off") },
        { label: context.t("messages.on") },
      ],
      currentIndex: () => isCanvasFullscreen() ? 1 : 0,
      select: (context, index) => setCanvasFullscreen(index === 1, context.settingsOrigin),
    }),
    defaultIndex: 0,
  },
  slots: {
    value: context => context.t("retroControl.configured", {
      count: String(SLOT_NUMBERS.filter(slot => handleGetSlotConfig()[slot] !== "none").length),
    }),
  },
  ...Object.fromEntries(SLOT_NUMBERS.map(slot => [
    `slots.${slot}`,
    {
      ...choiceBinding({
        options: context => getSlotOptions(slot, handleGetMachineName())
          .map(option => ({ label: getRetroSlotOptionLabel(context, option) })),
        currentIndex: () => {
          const currentCard = handleGetSlotConfig()[slot]
          const currentRamSize = handleGetMemSize()
          return getSlotOptions(slot, handleGetMachineName()).findIndex(option =>
            option.card === currentCard
            && (option.card !== "aux" || option.ramSizeKb === currentRamSize))
        },
        select: (context, optionIndex) => {
          selectRetroSlotCard(context, slot, getSlotOptions(slot, handleGetMachineName())[optionIndex])
        },
      }),
      defaultIndex: () => getSlotOptions(slot, handleGetMachineName()).findIndex(option =>
        option.card === (slot === 3 && handleGetMachineName() === "APPLE2P"
          ? "videoterm"
          : DEFAULT_SLOT_CONFIG[slot])
        && (option.card !== "aux" || option.ramSizeKb === 64)),
    } satisfies Partial<RetroControlMetadata>,
  ])),
}

export const retroMachineControls: RetroControlMetadata[] = controlsFromJson("machine", machineBindings)
