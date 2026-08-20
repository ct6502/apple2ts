import { useState } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faGear } from "@fortawesome/free-solid-svg-icons"
import { handleGetMachineName, handleGetMemSize, handleGetSlotConfig } from "../main2worker"
import { setPreferenceMachineName, setPreferenceRamWorks, setPreferenceSlotConfig, setPreferenceVeraSlot } from "../localstorage"
import PopupMenu from "../controls/popupmenu"
import { useTranslation } from "../../i18n/useTranslation"

export const MachineConfig = (props: { updateDisplay: UpdateDisplay }) => {
  const { t } = useTranslation()
  const [popupLocation, setPopupLocation] = useState<[number, number]>()

  const handleClick = (event: React.MouseEvent) => {
    setPopupLocation([event.clientX, event.clientY])
  }

  const machineNames: MACHINE_NAME[] = ["APPLE2P", "APPLE2EU", "APPLE2EE"]
  const roms = [t("machine.models.apple2p"), t("machine.models.apple2eu"), t("machine.models.apple2ee")]
  const extraMemSize = handleGetMemSize()
  const machineName = handleGetMachineName()
  const slotConfig = handleGetSlotConfig()

  const getAuxCardLabel = (sizeKb = extraMemSize): string => {
    if (sizeKb <= 64) {
      return "Apple 699-0221 (64KB / 80-Col / dHGR)"
    }
    const sizeStr = sizeKb >= 1024 ? `${sizeKb / 1024}MB` : `${sizeKb}KB`
    return `AE RamWorks III (${sizeStr} / 80-Col / dHGR)`
  }

  const cardLabels: Record<SLOT_CARD_ID, string> = {
    none: "None",
    ssc: "Super Serial Card",
    softcard: "Microsoft Z-80 SoftCard",
    aux: getAuxCardLabel(extraMemSize),
    videoterm: "Videx VideoTerm 80-Col Card",
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
      if (machineName === "APPLE2P") {
        return [
          {
            label: "None",
            isSelected: () => slotConfig[3] === "none",
            onClick: () => handleSelectSlotCard(3, "none"),
          },
          {
            label: "*Videx VideoTerm 80-Col Card",
            isSelected: () => slotConfig[3] === "videoterm",
            onClick: () => handleSelectSlotCard(3, "videoterm"),
          },
        ]
      }

      // Apple IIe options
      const auxOptions: { label: string; sizeKb: number; isDefault?: boolean }[] = [
        { label: "*Apple 699-0221 (64KB / 80-Col / dHGR)", sizeKb: 64, isDefault: true },
        { label: "AE RamWorks III (512KB / 80-Col / dHGR)", sizeKb: 512 },
        { label: "AE RamWorks III (1MB / 80-Col / dHGR)", sizeKb: 1024 },
        { label: "AE RamWorks III (4MB / 80-Col / dHGR)", sizeKb: 4096 },
        { label: "AE RamWorks III (8MB / 80-Col / dHGR)", sizeKb: 8192 },
      ]

      return [
        {
          label: "None",
          isSelected: () => slotConfig[3] === "none",
          onClick: () => handleSelectSlotCard(3, "none"),
        },
        ...auxOptions.map((opt) => ({
          label: opt.label,
          isSelected: () => slotConfig[3] === "aux" && (opt.sizeKb === 64 ? extraMemSize <= 64 : extraMemSize === opt.sizeKb),
          onClick: () => handleSelectSlotCard(3, "aux", opt.sizeKb),
        })),
      ]
    }

    let options: SLOT_CARD_ID[] = []
    if (slot === 1) options = ["none", "ssc"]
    else if (slot === 2) options = ["none", "vera", "passport", "softcard"]
    else if (slot === 4) options = ["none", "mouse", "mockingboard", "vera", "softcard"]
    else if (slot === 5) options = ["none", "mouse", "mockingboard", "softcard"]
    else if (slot === 6) options = ["none", "disk2"]
    else if (slot === 7) options = ["none", "smartport"]

    return options.map((cardId) => {
      const isDefault =
        (slot === 1 && cardId === "ssc") ||
        (slot === 2 && cardId === "softcard") ||
        (slot === 4 && cardId === "mockingboard") ||
        (slot === 5 && cardId === "mouse") ||
        (slot === 6 && cardId === "disk2") ||
        (slot === 7 && cardId === "smartport")

      return {
        label: `${isDefault ? "*" : ""}${cardLabels[cardId]}`,
        isSelected: () => slotConfig[slot] === cardId,
        onClick: () => handleSelectSlotCard(slot, cardId),
      }
    })
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
          ...[{ label: "-" }],
          ...[{ label: "Slot Manager", isHeading: true }],
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
