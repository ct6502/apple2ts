import { useState } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faGear } from "@fortawesome/free-solid-svg-icons"
import { handleGetMachineName, handleGetMemSize, handleGetSlotConfig } from "../main2worker"
import {
  getPreferenceIigsRomVersion,
  setPreferenceIigsRomVersion,
  setPreferenceMachineName,
  setPreferenceRamWorks,
  setPreferenceSlotConfig,
  setPreferenceVeraSlot,
} from "../localstorage"
import { setUIStateBoolean, setTabView } from "../ui_settings"
import { notifySettingsChanged } from "../settingschange"
import PopupMenu from "../controls/popupmenu"
import { useTranslation } from "../../i18n/useTranslation"
import { DEFAULT_SLOT_CONFIG, DEFAULT_SLOT_CONFIG_GS, RUN_MODE } from "../../common/utility"
import { isIigsBuiltinSlot } from "../../common/iigs_slots"
import { handleSetCPUState } from "../controller"
import { isCanvasFullscreen, setCanvasFullscreen } from "../controls/fullscreenbutton"
import type { RetroControlMetadata, RetroMenuContext } from "../retro/retromenucontext"
import { createControlContext } from "../retro/retromenucontext"
import { ControlRegistry } from "../controls/controlregistry"
import { controlOptionsToPopupItems } from "../controls/controlpopup"
import { choiceBinding, controlsFromJson, type RetroControlBindings } from "../retro/retrocontrolmetadata"
import { changeSerialMode, getSerialMode } from "./serial/serialhub"

export {
  RAM_OPTIONS,
  SLOT_NUMBERS,
  type SlotNumber,
  type SlotOption,
  getSlotOptions,
  sanitizeSlotConfig,
} from "../../common/slot_options"
import {
  SLOT_NUMBERS,
  type SlotNumber,
  type SlotOption,
  getSlotOptions,
} from "../../common/slot_options"

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
  disk35: "3.5\" Floppy Drive",
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
    value: context => {
      const machine = handleGetMachineName()
      const config = handleGetSlotConfig()
      const count = SLOT_NUMBERS.filter(slot => {
        const card = config[slot]
        // On the IIgs every slot normally runs a built-in function; only
        // installed cards count as configured.
        return machine === "APPLE2GS" ? !isIigsBuiltinSlot(card) && card !== "none" : card !== "none"
      }).length
      return context.t("retroControl.configured", { count: String(count) })
    },
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
          const options = getSlotOptions(slot, handleGetMachineName())
          const idx = options.findIndex(option =>
            option.card === currentCard
            && (option.card !== "aux" || option.ramSizeKb === currentRamSize))
          return idx >= 0 ? idx : 0
        },
        select: (context, optionIndex) => {
          selectRetroSlotCard(context, slot, getSlotOptions(slot, handleGetMachineName())[optionIndex])
        },
      }),
      defaultIndex: () => {
        const machine = handleGetMachineName()
        const defaultCard = machine === "APPLE2GS"
          ? DEFAULT_SLOT_CONFIG_GS[slot]
          : (slot === 3 && machine === "APPLE2P" ? "videoterm" : DEFAULT_SLOT_CONFIG[slot])
        const idx = getSlotOptions(slot, machine).findIndex(option =>
          option.card === defaultCard
          && (option.card !== "aux" || option.ramSizeKb === 64))
        return idx >= 0 ? idx : 0
      },
    } satisfies Partial<RetroControlMetadata>,
  ])),
}

export const retroMachineControls: RetroControlMetadata[] = controlsFromJson("machine", machineBindings)

const machineControlRegistry = new ControlRegistry(retroMachineControls)

export const MachineConfig = (props: DisplayProps) => {
  const { t, language, changeLanguage } = useTranslation()
  const [popupLocation, setPopupLocation] = useState<[number, number]>()

  const handleClick = (event: React.MouseEvent) => {
    setPopupLocation([event.clientX, event.clientY])
  }

  const machineNames: MACHINE_NAME[] = ["APPLE2P", "APPLE2EU", "APPLE2EE", "APPLE2GS"]
  const roms = [t("machine.models.apple2p"), t("machine.models.apple2eu"), t("machine.models.apple2ee"), "Apple IIgs"]
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
    disk35: "3.5\" Floppy Drive",
    smartport: "SmartPort Hard Drive Card",
    gsPrinter: "Printer Port",
    gsModem: "Modem Port",
    gsText80: "80-Column Text",
    gsMouse: "Mouse Port",
    gsSmartPort: "Smart Port",
    gsDiskPort: "Disk Port",
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
      setUIStateBoolean("infoPanel", true)
      setTabView(4)
      notifySettingsChanged(["panels.tab", "options.infoPanel"], "external")
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
          ...Array.from(Array(machineNames.length).keys()).map((i) => (
            {
              label: roms[i],
              isSelected: () => { return machineName === machineNames[i] },
              onClick: () => {
                setPreferenceMachineName(machineNames[i])
                props.updateDisplay()
              },
              // The IIgs ships two system ROMs. The ROMs are a submenu of the
              // Apple IIgs entry; picking one also selects the IIgs, because
              // a parent item with a submenu never runs its own onClick.
              subMenu: machineNames[i] === "APPLE2GS" ? [
                {
                  label: "ROM 01",
                  isSelected: () => getPreferenceIigsRomVersion() === "01",
                  onClick: () => {
                    setPreferenceIigsRomVersion("01")
                    if (machineName !== "APPLE2GS") setPreferenceMachineName("APPLE2GS")
                    props.updateDisplay()
                  },
                },
                {
                  label: "ROM 03 (custom)",
                  isSelected: () => getPreferenceIigsRomVersion() === "03",
                  onClick: () => {
                    setPreferenceIigsRomVersion("03")
                    if (machineName !== "APPLE2GS") setPreferenceMachineName("APPLE2GS")
                    props.updateDisplay()
                  },
                },
              ] : undefined,
            }
          )),
          { label: "-" },
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
          { label: "-" },
          { label: t("machine.slotConfigurator"), isHeading: true },
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
