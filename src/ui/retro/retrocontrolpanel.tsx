import { useEffect, useState } from "react"
import { COLOR_MODE } from "../../common/utility"
import {
  setPreferenceBoolean,
  setPreferenceColorMode,
  setPreferenceRamWorks,
  setPreferenceSlotConfig,
  setPreferenceSpeedMode,
} from "../localstorage"
import {
  handleGetMachineName,
  handleGetMemSize,
  handleGetSlotConfig,
  handleGetSpeedMode,
} from "../main2worker"
import {
  getColorMode,
  getCrtDistortion,
  getGhosting,
  getLowercaseMode,
  getShowScanlines,
  getUseOpenAppleKey,
} from "../ui_settings"
import { audioEnable, getAudioStatus } from "../devices/audio/speaker"
import { changeSerialMode, getSerialMode, getSerialNames } from "../devices/serial/serialhub"
import DemoZooDialog from "../devices/disk/demozoodialog"
import {
  demoZooEnabled,
  loadDiskFromCloudDrive,
} from "../devices/disk/diskdrive"
import { GoogleDrive } from "../devices/disk/googledrive"
import InternetArchivePopup from "../devices/disk/internetarchivedialog"
import { OneDriveCloudDrive } from "../devices/disk/onedriveclouddrive"
import Apple2Canvas from "../canvas"
import "./retrocontrolpanel.css"

type RetroMenuItem = {
  label: string
  value?: string
  selected?: boolean
  action?: () => void
  children?: RetroMenuItem[]
}

type DiskLoadDialog = {
  driveIndex: number
  type: "demoZoo" | "internetArchive"
}

const mouseTextDown = String.fromCodePoint(0x2193)
const mouseTextUp = String.fromCodePoint(0x2191)
const mouseTextReturn = String.fromCodePoint(0x21B5)

const RetroBorder = ({ className, separatorRow }: {
  className: string
  separatorRow?: number
}) => (
  <div className={`retro-border ${className}`} aria-hidden="true">
    {separatorRow && (
      <span
        className="retro-border-separator"
        style={{
          top: `calc(${separatorRow - 1} * var(--retro-row-height) + var(--retro-border-width))`,
        }}
      />
    )}
  </div>
)

const colorOptions = ["Color", "Color (no fringe)", "Green", "Amber", "White", "Inverse"]
const speedOptions = ["Snail", "Slow", "Normal", "2 MHz", "3 MHz", "Fast", "Warp"]
const speedModes = [-2, -1, 0, 1, 2, 3, 4]
const ramOptions = [64, 512, 1024, 4096, 8192]
const slotNumbers = [1, 2, 3, 4, 5, 6, 7] as const
const cardLabels: Record<SLOT_CARD_ID, string> = {
  none: "Empty",
  ssc: "Super Serial Card",
  softcard: "Z-80 SoftCard",
  aux: "Auxiliary memory",
  videoterm: "Videx VideoTerm",
  mockingboard: "Mockingboard",
  mouse: "Mouse card",
  vera: "VERA graphics",
  passport: "Passport MIDI",
  disk2: "Disk II controller",
  smartport: "SmartPort drive",
}

const choiceItems = (
  labels: string[],
  currentIndex: number,
  select: (index: number) => void,
): RetroMenuItem[] => labels.map((label, index) => ({
  label,
  selected: index === currentIndex,
  action: () => select(index),
}))

const toggleItem = (label: string, enabled: boolean, action: () => void): RetroMenuItem => ({
  label,
  value: enabled ? "On" : "Off",
  selected: enabled,
  action,
})

const getRetroMenu = (
  displayProps: DisplayProps,
  close: () => void,
  openDiskDialog: (dialog: DiskLoadDialog) => void,
): RetroMenuItem[] => {
  const { updateDisplay } = displayProps
  const audioEnabled = getAudioStatus() === "enabled"
  const serialNames = getSerialNames()
  const serialMode = getSerialMode()
  const currentMachine = handleGetMachineName()
  const currentRam = handleGetMemSize()
  const slotConfig = handleGetSlotConfig()
  const slotOptions: Record<typeof slotNumbers[number], SLOT_CARD_ID[]> = {
    1: ["none", "ssc"],
    2: ["none", "softcard", "passport"],
    3: currentMachine === "APPLE2P" ? ["none", "videoterm"] : ["none", "aux"],
    4: ["none", "mouse", "mockingboard"],
    5: ["none", "mouse", "mockingboard"],
    6: ["none", "disk2"],
    7: ["none", "smartport"],
  }
  const selectSlotCard = (slot: typeof slotNumbers[number], card: SLOT_CARD_ID) => {
    const nextConfig = { ...handleGetSlotConfig() }
    if (card !== "none" && card !== "mockingboard") {
      slotNumbers.forEach(otherSlot => {
        if (otherSlot !== slot && nextConfig[otherSlot] === card) nextConfig[otherSlot] = "none"
      })
    }
    nextConfig[slot] = card
    setPreferenceSlotConfig(nextConfig)
    updateDisplay()
  }
  const mouseSlot = slotConfig[4] === "mouse" ? 4 : slotConfig[5] === "mouse" ? 5 : 0
  const isElectron = navigator.userAgent.includes("Electron")
  const diskDrives = ([
    { drive: 1, index: 0, slot: 7 },
    { drive: 2, index: 1, slot: 7 },
    { drive: 1, index: 2, slot: 6 },
    { drive: 2, index: 3, slot: 6 },
  ] as const).filter(({ slot }) => slotConfig[slot] !== "none")
  const diskLoadItems = (driveIndex: number): RetroMenuItem[] => [
    {
      label: "Load Disk",
      action: () => {
        close()
        displayProps.setShowFileOpenDialog(true, driveIndex)
      },
    },
    {
      label: "Load Disk from Internet Archive",
      action: () => openDiskDialog({ driveIndex, type: "internetArchive" }),
    },
    ...(demoZooEnabled ? [{
      label: "Load Disk from DemoZoo",
      action: () => openDiskDialog({ driveIndex, type: "demoZoo" as const }),
    }] : []),
    ...(!isElectron ? [
      {
        label: "Load Disk from OneDrive",
        action: () => {
          close()
          void loadDiskFromCloudDrive(new OneDriveCloudDrive(), driveIndex)
        },
      },
      {
        label: "Load Disk from Google Drive",
        action: () => {
          close()
          void loadDiskFromCloudDrive(new GoogleDrive(), driveIndex)
        },
      },
    ] : []),
  ]

  return [
    {
      label: "Disk Drives",
      children: diskDrives.length > 0
        ? diskDrives.map(({ drive, index, slot }) => ({
          label: `Slot ${slot}, Drive ${drive}`,
          children: diskLoadItems(index),
        }))
        : [{ label: "No disk drives available" }],
    },
    {
      label: "Display",
      value: colorOptions[getColorMode()],
      children: [
        ...choiceItems(colorOptions, getColorMode(), index => {
          setPreferenceColorMode(index as COLOR_MODE)
          updateDisplay()
        }),
        toggleItem("Scanlines", getShowScanlines(), () => {
          setPreferenceBoolean("showScanlines", !getShowScanlines())
          document.body.style.setProperty("--scanlines-display", getShowScanlines() ? "block" : "none")
          updateDisplay()
        }),
        toggleItem("Ghosting", getGhosting(), () => {
          setPreferenceBoolean("ghosting", !getGhosting())
          updateDisplay()
        }),
        toggleItem("CRT distortion", getCrtDistortion(), () => {
          setPreferenceBoolean("crtDistortion", !getCrtDistortion())
          updateDisplay()
        }),
      ],
    },
    {
      label: "Sound",
      value: audioEnabled ? "On" : "Off",
      children: choiceItems(["Off", "On"], audioEnabled ? 1 : 0, index => {
        audioEnable(index === 1)
        updateDisplay()
      }),
    },
    {
      label: "System Speed",
      value: speedOptions[speedModes.indexOf(handleGetSpeedMode())],
      children: choiceItems(speedOptions, speedModes.indexOf(handleGetSpeedMode()), index => {
        setPreferenceSpeedMode(speedModes[index])
        updateDisplay()
      }),
    },
    {
      label: "Clock",
      value: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      children: [{ label: "Host system clock", selected: true }],
    },
    {
      label: "Keyboard",
      value: getLowercaseMode() ? "Lowercase" : "Caps Lock",
      children: [
        toggleItem("Lowercase input", getLowercaseMode(), () => {
          setPreferenceBoolean("lowercaseMode", !getLowercaseMode())
          updateDisplay()
        }),
        toggleItem("Open Apple key", getUseOpenAppleKey(), () => {
          setPreferenceBoolean("useOpenAppleKey", !getUseOpenAppleKey())
          updateDisplay()
        }),
      ],
    },
    {
      label: "Slots",
      value: `${slotNumbers.filter(slot => slotConfig[slot] !== "none").length} configured`,
      children: slotNumbers.map(slot => ({
        label: `Slot ${slot}`,
        value: cardLabels[slotConfig[slot]],
        children: slotOptions[slot].map(card => ({
          label: cardLabels[card],
          selected: slotConfig[slot] === card,
          action: () => selectSlotCard(slot, card),
        })),
      })),
    },
    {
      label: "Printer Port",
      value: serialNames[serialMode],
      children: choiceItems(serialNames, serialMode, index => {
        changeSerialMode(index)
        updateDisplay()
      }),
    },
    {
      label: "Modem Port",
      value: serialNames[serialMode],
      children: choiceItems(serialNames, serialMode, index => {
        changeSerialMode(index)
        updateDisplay()
      }),
    },
    {
      label: "RAM Disk",
      value: currentRam >= 1024 ? `${currentRam / 1024} MB` : `${currentRam} KB`,
      children: ramOptions.map(size => ({
        label: size >= 1024 ? `${size / 1024} MB` : `${size} KB`,
        selected: size === currentRam,
        action: () => {
          setPreferenceRamWorks(size)
          updateDisplay()
        },
      })),
    },
    {
      label: "Mouse",
      value: mouseSlot === 0 ? "Off" : `Slot ${mouseSlot}`,
      children: [
        {
          label: "Off",
          selected: mouseSlot === 0,
          action: () => {
            const nextConfig = { ...handleGetSlotConfig() }
            if (nextConfig[4] === "mouse") nextConfig[4] = "none"
            if (nextConfig[5] === "mouse") nextConfig[5] = "none"
            setPreferenceSlotConfig(nextConfig)
            updateDisplay()
          },
        },
        { label: "Slot 4", selected: mouseSlot === 4, action: () => selectSlotCard(4, "mouse") },
        { label: "Slot 5", selected: mouseSlot === 5, action: () => selectSlotCard(5, "mouse") },
      ],
    },
    { label: "Quit", action: close },
  ]
}

const RetroControlPanel = ({ displayProps }: { displayProps: DisplayProps }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [diskLoadDialog, setDiskLoadDialog] = useState<DiskLoadDialog | null>(null)
  const [menuStack, setMenuStack] = useState<RetroMenuItem[][]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [now, setNow] = useState(() => new Date())
  const close = () => setIsOpen(false)
  const openDiskDialog = (dialog: DiskLoadDialog) => {
    close()
    setDiskLoadDialog(dialog)
  }
  const rootMenu = getRetroMenu(displayProps, close, openDiskDialog)
  const currentMenu = menuStack.length > 0 ? menuStack[menuStack.length - 1] : rootMenu

  useEffect(() => {
    if (!isOpen) return
    const timer = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(timer)
  }, [isOpen])

  useEffect(() => {
    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.shiftKey && !event.ctrlKey && !event.altKey && !event.metaKey && event.key === "Escape") {
        event.preventDefault()
        event.stopPropagation()
        setNow(new Date())
        setIsOpen(open => !open)
        setMenuStack([])
        setSelectedIndex(0)
        return
      }
      if (!isOpen) return

      if (event.key === "ArrowUp" || event.key === "ArrowDown") {
        event.preventDefault()
        event.stopPropagation()
        const direction = event.key === "ArrowUp" ? -1 : 1
        setSelectedIndex(index => (index + direction + currentMenu.length) % currentMenu.length)
      } else if (event.key === "Enter") {
        event.preventDefault()
        event.stopPropagation()
        const item = currentMenu[selectedIndex]
        if (item.children) {
          setMenuStack(stack => [...stack, item.children ?? []])
          setSelectedIndex(0)
        } else {
          item.action?.()
          if (menuStack.length > 0) {
            setMenuStack([])
            setSelectedIndex(0)
          }
        }
      } else if (event.key === "Escape" || event.key === "ArrowLeft") {
        event.preventDefault()
        event.stopPropagation()
        if (menuStack.length > 0) {
          setMenuStack(stack => stack.slice(0, -1))
          setSelectedIndex(0)
        }
      } else if (!event.ctrlKey && !event.altKey && !event.metaKey && /^[a-z]$/i.test(event.key)) {
        const shortcut = event.key.toLocaleLowerCase()
        const nextIndex = Array.from(
          { length: currentMenu.length },
          (_, offset) => (selectedIndex + offset + 1) % currentMenu.length,
        ).find(index => currentMenu[index].label.toLocaleLowerCase().startsWith(shortcut))
        if (nextIndex !== undefined) {
          event.preventDefault()
          event.stopPropagation()
          setSelectedIndex(nextIndex)
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown, true)
    return () => window.removeEventListener("keydown", handleKeyDown, true)
  }, [currentMenu, isOpen, menuStack.length, selectedIndex])

  return (
    <main className={`retro-shell${isOpen ? " menu-open" : ""}`}>
      <Apple2Canvas {...displayProps} />
      {isOpen && (
        <section className="retro-panel scanline-gradient" role="dialog" aria-label="Apple2TS control panel">
          <div className="retro-window">
            <RetroBorder className="retro-outer-border" separatorRow={2} />
            <header className="retro-title"><span>{"Apple2TS "}&#8198;</span></header>
            {menuStack.length === 0 && <div className="retro-clock" aria-label={`${now.toLocaleTimeString()} ${now.toLocaleDateString()}`}>
              <RetroBorder className="retro-clock-border" />
              <time>{now.toLocaleTimeString([], {
                hour: "numeric",
                minute: "2-digit",
                second: "2-digit",
              })}</time>
              <time>{now.toLocaleDateString([], {
                month: "numeric",
                day: "numeric",
                year: "2-digit",
              })}</time>
            </div>}
            <div className={`retro-menu${menuStack.length === 0 ? " retro-root-menu" : ""}`} role="menu">
              {currentMenu.map((item, index) => (
                <div
                  className={`retro-menu-item${selectedIndex === index ? " selected" : ""}`}
                  key={item.label}
                  role="menuitem"
                  aria-current={selectedIndex === index ? "true" : undefined}
                >
                  <span>{item.selected ? "*" : " "}{item.label}</span>
                </div>
              ))}
            </div>
            <footer>
              <span>{" Select: "}<i className="retro-mousetext">{mouseTextDown} {mouseTextUp}</i></span>
              <span>{"Open: "}<i className="retro-mousetext">{mouseTextReturn}</i>{" "}</span>
            </footer>
          </div>
        </section>
      )}
      <InternetArchivePopup
        driveIndex={diskLoadDialog?.driveIndex ?? 0}
        open={diskLoadDialog?.type === "internetArchive"}
        onClose={() => setDiskLoadDialog(null)}
      />
      <DemoZooDialog
        driveIndex={diskLoadDialog?.driveIndex ?? 0}
        open={diskLoadDialog?.type === "demoZoo"}
        onClose={() => setDiskLoadDialog(null)}
      />
    </main>
  )
}

export default RetroControlPanel