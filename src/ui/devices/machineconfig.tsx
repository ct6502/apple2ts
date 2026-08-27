import { useState } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faGear } from "@fortawesome/free-solid-svg-icons"
import { handleGetMachineName, handleGetMemSize, handleGetProdosFloppy, handleGetSlotConfig, passSetProdosFloppy } from "../main2worker"
import { setPreferenceBoolean, setPreferenceMachineName, setPreferenceRamWorks, setPreferenceSlotConfig, setPreferenceVeraSlot } from "../localstorage"
import PopupMenu from "../controls/popupmenu"
import { useTranslation } from "../../i18n/useTranslation"
import { DEFAULT_SLOT_CONFIG, RUN_MODE } from "../../common/utility"
import { handleSetCPUState } from "../controller"
import { isCanvasFullscreen, setCanvasFullscreen } from "../controls/fullscreenbutton"
import { choiceMetadata } from "../retro/retromenuhelpers"
import type { RetroControlMetadata, RetroMenuContext } from "../retro/retromenucontext"
import { createControlContext } from "../retro/retromenucontext"
import { ControlRegistry } from "../controls/controlregistry"
import { controlOptionsToPopupItems } from "../controls/controlpopup"

export const RAM_OPTIONS = [64, 512, 1024, 4096, 8192] as const

export const SLOT_NUMBERS = [1, 2, 3, 4, 5, 6, 7] as const
type SlotNumber = typeof SLOT_NUMBERS[number]

type SlotOption = {
  card: SLOT_CARD_ID
  ramSizeKb?: typeof RAM_OPTIONS[number]
}

const getSlotOptions = (slot: SlotNumber, machine: MACHINE_NAME): SlotOption[] => {
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
  return `AE RamWorks III (${sizeStr} / 80-Col / dHGR)`
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
  smartport: context.t("retroControl.card.smartport"),
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

export const retroMachineControls: RetroControlMetadata[] = [
  {
    id: "machine",
    parentId: null,
    order: 0,
    tourTargets: ["#tour-maincontrols"],
    label: context => context.t("retroControl.machine"),
    actionLabel: context => context.t("retroControl.select"),
  },
  {
    id: "machine.boot",
    parentId: "machine",
    order: 0,
    tourTargets: ["#tour-boot-button"],
    label: context => context.t("controls.boot"),
    action: context => {
      handleSetCPUState(RUN_MODE.NEED_BOOT)
      context.close()
    },
  },
  {
    id: "machine.reset",
    parentId: "machine",
    order: 1,
    tourTargets: ["#tour-reset-button"],
    label: context => context.t("controls.reset"),
    action: context => {
      handleSetCPUState(RUN_MODE.NEED_RESET)
      context.close()
    },
  },
  choiceMetadata({
    id: "machine.fullscreen",
    parentId: "display",
    order: 4,
    label: context => context.t("retroControl.fullscreen"),
    labels: context => [context.t("messages.off"), context.t("messages.on")],
    currentIndex: () => isCanvasFullscreen() ? 1 : 0,
    select: (context, index) => setCanvasFullscreen(index === 1, context.settingsOrigin),
    defaultIndex: 0,
  }),
  {
    id: "slots",
    parentId: null,
    order: 8,
    label: context => context.t("retroControl.slots"),
    value: context => context.t("retroControl.configured", {
      count: String(SLOT_NUMBERS.filter(slot => handleGetSlotConfig()[slot] !== "none").length),
    }),
  },
  ...SLOT_NUMBERS.map((slot, index) => choiceMetadata({
    id: `slots.${slot}`,
    parentId: "slots",
    order: index,
    label: context => context.t("retroControl.slot", { slot: String(slot) }),
    labels: context => getSlotOptions(slot, handleGetMachineName())
      .map(option => getRetroSlotOptionLabel(context, option)),
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
    defaultIndex: getSlotOptions(slot, handleGetMachineName()).findIndex(option =>
      option.card === (slot === 3 && handleGetMachineName() === "APPLE2P"
        ? "videoterm"
        : DEFAULT_SLOT_CONFIG[slot])
      && (option.card !== "aux" || option.ramSizeKb === 64)),
  })),
]

const machineControlRegistry = new ControlRegistry(retroMachineControls)

export const MachineConfig = (props: DisplayProps) => {
  const { t, language, changeLanguage } = useTranslation()
  const [popupLocation, setPopupLocation] = useState<[number, number]>()

  const handleClick = (event: React.MouseEvent) => {
    setPopupLocation([event.clientX, event.clientY])
  }

  const machineNames: MACHINE_NAME[] = ["APPLE2P", "APPLE2EU", "APPLE2EE"]
  const roms = [t("machine.models.apple2p"), t("machine.models.apple2eu"), t("machine.models.apple2ee")]
  const extraMemSize = handleGetMemSize()
  const machineName = handleGetMachineName()
  const slotConfig = handleGetSlotConfig()
  const sharedSlotControls = machineControlRegistry.resolve(
    createControlContext(props, t, language, changeLanguage),
    "slots",
  )

  const cardLabels: Record<SLOT_CARD_ID, string> = {
    none: "None",
    ssc: "Super Serial Card",
    softcard: "Microsoft Z-80 SoftCard",
    aux: getAuxCardLabel(extraMemSize),
    videoterm: "Videx VideoTerm 80-Col Card",
    vidhd: "VidHD (64KB / 80-Col / SHR)",
    mockingboard: "Mockingboard Sound Card",
    mouse: "Apple II Mouse Card",
    vera: "VERA Graphics Card",
    passport: "Passport MIDI Card",
    disk2: "Disk II Floppy Controller",
    smartport: "SmartPort Hard Drive Card",
  }

  const handleSelectSlotCard = (slot: 1 | 2 | 3 | 4 | 5 | 6 | 7, cardId: SLOT_CARD_ID, ramSizeKb = 64) => {
    const currentConfig = handleGetSlotConfig()
    const newConfig = { ...currentConfig }

    // Single-instance cards (all except 'none' and 'mockingboard'): remove from other slots
    if (cardId !== "none" && cardId !== "mockingboard") {
      for (let s = 1; s <= 7; s++) {
        if (s !== slot && newConfig[s as keyof SlotConfig] === cardId) {
          newConfig[s as keyof SlotConfig] = "none"
        }
      }
    }

    if (cardId === "vera") {
      setPreferenceVeraSlot(slot as VERA_SLOT)
    } else if (currentConfig[slot] === "vera") {
      setPreferenceVeraSlot(0)
    }

    if (slot === 3) {
      if (cardId === "aux") {
        setPreferenceRamWorks(ramSizeKb)
      }
    }

    newConfig[slot] = cardId
    setPreferenceSlotConfig(newConfig)
    props.updateDisplay()
  }

  const getSlotSubMenu = (slot: 1 | 2 | 3 | 4 | 5 | 6 | 7): PopupMenuItem[] => {
    if (slot === 3) {
      return getSlotOptions(slot, machineName).map(option => ({
        label: option.card === "aux" && option.ramSizeKb !== undefined
          ? `${getAuxCardLabel(option.ramSizeKb)}`
          : `${cardLabels[option.card]}`,
        isSelected: () => slotConfig[3] === option.card
          && (option.card !== "aux" || option.ramSizeKb === extraMemSize),
        onClick: () => handleSelectSlotCard(3, option.card, option.ramSizeKb),
      }))
    }
    const control = sharedSlotControls.find(item => item.id === `slots.${slot}`)
    return control ? controlOptionsToPopupItems(control) : []
  }

  return (
    <span>
      <button
        id="basic-button"
        className="push-button"
        title={t("machine.configuration")}
        onClick={handleClick}
      >
        <FontAwesomeIcon icon={faGear} />
      </button>

      <PopupMenu
        location={popupLocation}
        onClose={() => { setPopupLocation(undefined) }}
        menuItems={[[
          ...Array.from(Array(3).keys()).map((i) => (
            {
              label: roms[i],
              isSelected: () => { return machineName === machineNames[i] },
              onClick: () => {
                setPreferenceMachineName(machineNames[i])
                props.updateDisplay()
              }
            }
          )),
          { label: "-" },
          {
            label: t("config.prodosFloppy"),
            isSelected: () => { return handleGetProdosFloppy() },
            onClick: () => {
              const newValue = !handleGetProdosFloppy()
              passSetProdosFloppy(newValue)
              setPreferenceBoolean("prodosFloppy", newValue)
            }
          },
          { label: "-" },
          ...[{ label: t("machine.slotConfigurator"), isHeading: true }],
          ...([1, 2, 3, 4, 5, 6, 7] as const).map((slot) => {
            const currentCard = slotConfig[slot]
            return {
              label: `Slot ${slot}: ${cardLabels[currentCard]}`,
              subMenu: getSlotSubMenu(slot)
            }
          })
        ]]}
      />
    </span>
  )
}
