import { useRef, useState } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faXmark, faGear, faMusic } from "@fortawesome/free-solid-svg-icons"
import { useTranslation } from "../../i18n/useTranslation"
import { createControlContext } from "../retro/retromenucontext"
import { settingsResetBinding } from "./resetcontrols"
import { Droplist } from "../panels/droplist"
import { handleGetMachineName, handleGetMemSize, handleGetSlotConfig } from "../main2worker"
import { getPreferenceBoolean, notifySettingsChanged, setPreferenceBoolean, setPreferenceColorMode, setPreferenceMachineName, setPreferenceMonitorMode, setPreferenceRamWorks, setPreferenceSlotConfig, setPreferenceTheme, setPreferenceVeraSlot } from "../localstorage"
import { getSlotOptions, SLOT_NUMBERS } from "../devices/machineconfig"
import { cardShortLabels, COLOR_MODES, colorLabels, MONITOR_MODES, monitorModeLabels, ramdiskParams, ramdiskValues, themeLabels } from "../ui_utilities"
import { BooleanKeyOf, getColorMode, getMonitorMode, getTheme, setTabView, setUIStateBoolean } from "../ui_settings"
import CheckBox from "../panels/checkbox"
import { getModKeyName } from "../retro/retrocontrolmetadata"
import { themeToName, UI_THEMES } from "../../common/utility"
import PopupMenu from "./popupmenu"
import { controlsToPopupItems } from "./controlpopup"
import { audioControlRegistry } from "../devices/audio/audioconfig"

const dialogPosition = [window.innerWidth / 2 - 275, window.innerHeight / 2 - 200]

export const SettingsDialog = (props: DisplayProps) => {
  const { t, language, changeLanguage } = useTranslation()
  const [showDialog, setShowDialog] = useState(false)
  const dialogRef = useRef<HTMLDivElement>(null)
  const [offset, setOffset] = useState([0, 0])
  const [dragging, setDragging] = useState(false)
  const [audioPopup, setAudioPopup] = useState<[number, number]>()

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (dialogRef.current) {
      setDragging(true)
      const div = dialogRef.current as HTMLDivElement
      // Offset of the mouse down event within the dialog title bar.
      // This way we drag the window from where the user clicked.
      setOffset([e.clientX - div.offsetLeft, e.clientY - div.offsetTop])
    }
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (dragging && dialogRef.current) {
      const div = dialogRef.current as HTMLDivElement
      const left = e.clientX - offset[0]
      const top = e.clientY - offset[1]
      dialogPosition[0] = left
      dialogPosition[1] = top
      div.style.left = `${left}px`
      div.style.top = `${top}px`
    }
  }

  const handleMouseUp = () => {
    setDragging(false)
  }

  // Reuse the retro control panel's reset action so both surfaces share the
  // same confirmation dialog and the same resetPreferences() call.
  const resetSettings = () => {
    settingsResetBinding.action?.(createControlContext(props, t, language, changeLanguage))
  }

  const machineName = handleGetMachineName()
  const machineNames: MACHINE_NAME[] = ["APPLE2EE", "APPLE2EU", "APPLE2P"]
  const machineStrings = [t("machine.models.apple2ee"), t("machine.models.apple2eu"), t("machine.models.apple2p")]
  const machineIndex = machineNames.indexOf(machineName)

  const slotConfig = handleGetSlotConfig()

  const mem = handleGetMemSize()
  const memIndex = mem > 8000 ? 4 : mem > 4000 ? 3 : mem > 1000 ? 2 : mem > 500 ? 1 : 0
  const ramdisk = ramdiskValues[memIndex]

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

  const themeConfig = () => {
    return (
      <Droplist name={t("config.theme")}
        value={themeToName(getTheme())}
        values={themeLabels(t)}
        setValue={(val: string) => {
          const i = themeLabels(t).indexOf(val)
          setPreferenceTheme(UI_THEMES[i].value)
          const url = new URL(window.location.href)
          url.searchParams.delete("theme")
          url.searchParams.set("cache", Date.now().toString())
          window.location.href = url.toString()
        }}
      />
    )
  }

  const machineConfig = () => {
    return (
      <Droplist name={t("linkBuilder.machine")}
      value={machineStrings[machineIndex]}
      values={machineStrings}
      setValue={(val: string) => {
        const i = machineStrings.indexOf(val)
        setPreferenceMachineName(machineNames[i])
        props.updateDisplay()
        // // Adjust slot 3 when crossing between II+ and IIe families
        const newIsIIp = val === machineStrings[2]
        const wasIIp = machineName === "APPLE2P"
        if (newIsIIp !== wasIIp) {
          handleSelectSlotCard(3, newIsIIp ? "videoterm" : "aux")
          if (!newIsIIp) setPreferenceRamWorks() // reset to 64KB default
        }
      }}
      />
    )
  }

  const colorConfig = () => {
    return (
      <Droplist name={t("linkBuilder.colorMode")}
        value={colorLabels(t)[getColorMode()]}
        values={colorLabels(t)}
        setValue={(val: string) => {
          const i = colorLabels(t).indexOf(val)
          setPreferenceColorMode(COLOR_MODES[i])
          props.updateDisplay()
        }}
      />
    )
  }

  const monitorModeConfig = () => {
    return (
      <Droplist name={t("linkBuilder.monitorMode")}
        value={monitorModeLabels(t)[getMonitorMode()]}
        values={monitorModeLabels(t)}
        setValue={(val: string) => {
          const i = monitorModeLabels(t).indexOf(val)
          setPreferenceMonitorMode(MONITOR_MODES[i])
          props.updateDisplay()
        }}
      />
    )
  }

  const doSetPreferenceBoolean = (key: BooleanKeyOf<UIState>, value: boolean) => {
    setPreferenceBoolean(key, value)
    props.updateDisplay()
  }

  const graphicsOptions = () => {
    return (
      <>
        <div className="dialog-title" style={{ paddingBottom: "0", marginTop: "0" }}>{t("config.graphics")}</div>
        {colorConfig()}
        {monitorModeConfig()}
        <CheckBox name={t("config.crtDistortion")}
          checked={getPreferenceBoolean("crtDistortion")}
          setChecked={(on: boolean) => doSetPreferenceBoolean("crtDistortion", on)} />
        <CheckBox name={t("config.ghosting")}
          checked={getPreferenceBoolean("ghosting")}
          setChecked={(on: boolean) => doSetPreferenceBoolean("ghosting", on)} />
        <CheckBox name={t("config.scanlines")}
          checked={getPreferenceBoolean("showScanlines")}
          setChecked={(on: boolean) => doSetPreferenceBoolean("showScanlines", on)} />
      </>
    )
  }

  const keyboardJoystickOptions = () => {
    const isTouchDevice = "ontouchstart" in document.documentElement
    return (
      <>
        <div className="dialog-title" style={{ paddingBottom: "0", marginTop: "6px" }}>{t("config.joystick")}</div>
        <CheckBox name={t("config.capsLock")}
          checked={!getPreferenceBoolean("lowercaseMode")}
          setChecked={(on: boolean) => doSetPreferenceBoolean("lowercaseMode", !on)} />
        <CheckBox name={t("config.useArrowKeys")}
          checked={getPreferenceBoolean("arrowKeysAsJoystick")}
          setChecked={(on: boolean) => doSetPreferenceBoolean("arrowKeysAsJoystick", on)} />
        <CheckBox name={t("gamepad.reverseYAxis")}
          checked={getPreferenceBoolean("reverseYAxis")}
          setChecked={(on: boolean) => doSetPreferenceBoolean("reverseYAxis", on)} />
        <CheckBox name={t("keyboard.enableGamePatches")}
          checked={getPreferenceBoolean("enableGamePatches")}
          setChecked={(on: boolean) => doSetPreferenceBoolean("enableGamePatches", on)} />
        {!isTouchDevice && <CheckBox name={t("config.useOpenApple", { modKey: getModKeyName() })}
          checked={getPreferenceBoolean("useOpenAppleKey")}
          setChecked={(on: boolean) => doSetPreferenceBoolean("useOpenAppleKey", on)} /> }
        {!isTouchDevice && <CheckBox name={t("gamepad.siriusJoyport")}
          checked={getPreferenceBoolean("siriusJoyport")}
          setChecked={(on: boolean) => doSetPreferenceBoolean("siriusJoyport", on)} /> }
        { isTouchDevice && <CheckBox name={t("gamepad.touchJoystick")}
          checked={getPreferenceBoolean("touchJoystick")}
          setChecked={(on: boolean) => doSetPreferenceBoolean("touchJoystick", on)} /> }
        { isTouchDevice && <CheckBox name={t("gamepad.tiltSensorJoystick")}
          checked={getPreferenceBoolean("tiltSensorJoystick")}
          setChecked={(on: boolean) => doSetPreferenceBoolean("tiltSensorJoystick", on)} /> }
      </>
    )
  }

  const mockingboardConfiguration = () => {
    const [, mockingboardControl] = audioControlRegistry.resolve(
      createControlContext(props, t, language, changeLanguage),
      "sound",
    )
    return (
      <>
        {/* "sound.mockingboard": {
          ...choiceBinding({
            options: () => MockingboardNames.map(label => ({ label })),
            currentIndex: getMockingboardMode,
            select: (context, index) => setPreferenceMockingboardMode(index, context.settingsOrigin),
          }),
          defaultIndex: 0,
        }, */}
      <button
        id="basic-button"
        className="push-button"
        style={{ width: "24px", height: "24px",
          marginTop: "3px", marginLeft: "6px",
          outlineWidth: "1px",
          outlineStyle: "solid",
          outlineColor: "inherit" }}
        title={t("audio.configuration")}
        onClick={(e) => setAudioPopup([e.clientX, e.clientY])}
      >
        <FontAwesomeIcon icon={faMusic} style={{ fontSize: "0.8em" }}/>
      </button>
      <PopupMenu
        location={audioPopup}
        onClose={() => { setAudioPopup(undefined) }}
        menuItems={[[
          ...controlsToPopupItems([mockingboardControl]),
        ]]}
      />
      </>
    )
  }

  const slotConfiguration = () => {
    return (
    <>
      <div className="dialog-title" style={{ marginTop: "6px" }}>{t("linkBuilder.slots.configure")}</div>
      {/* Two columns filled top-to-bottom: slots 1-4 left, 5-7 right. The grid
          flows column-major through the four declared rows, so the single map
          below keeps SLOT_NUMBERS order. */}
      <div className="flex-column">
        {SLOT_NUMBERS.map(slot => {
          const rawOptions = getSlotOptions(slot, machineName)
          // Filter out cards already installed in another slot (unless card is none or mockingboard)
          const options = rawOptions.filter(o => {
            if (o.card === "none" || o.card === "mockingboard") return true
            if (slotConfig[slot] === o.card) return true
            return !SLOT_NUMBERS.some(otherSlot => otherSlot !== slot && slotConfig[otherSlot] === o.card)
          })
          // Build display label for each option (aux entries include RAM size)
          const getOptionLabel = (o: typeof options[0]) => {
            if (o.card === "aux" && o.ramSizeKb !== undefined) {
              if (o.ramSizeKb <= 64) return "Aux/80Col (64KB)"
              const sizeStr = o.ramSizeKb >= 1024 ? `${o.ramSizeKb / 1024}MB` : `${o.ramSizeKb}KB`
              return `RamWorks (${sizeStr})`
            }
            return cardShortLabels[o.card]
          }
          const cardLabels = options.map(getOptionLabel)
          // Current label: for slot 3 aux, reflect currently chosen ramdisk size
          const currentCard = slotConfig[slot]
          let currentLabel = cardShortLabels[currentCard]
          if (slot === 3 && currentCard === "aux") {
            const ramIdx = ramdiskValues.indexOf(ramdisk)
            const ramSizeKb = parseInt(ramdiskParams[Math.max(ramIdx, 0)]) || 64
            currentLabel = ramSizeKb <= 64 ? "Aux/80Col (64KB)"
              : `RamWorks (${ramSizeKb >= 1024 ? `${ramSizeKb / 1024}MB` : `${ramSizeKb}KB`})`
          }
          return (
            <div className="flex-row" key={slot} style={{ alignItems: "center" }}>
            <Droplist
              key={slot}
              name={t("linkBuilder.slots.slot", { slot: String(slot) })}
              value={currentLabel}
              values={cardLabels}
              setValue={(label: string) => {
                const idx = cardLabels.indexOf(label)
                if (idx >= 0) {
                  const chosen = options[idx]
                  handleSelectSlotCard(slot, chosen.card, chosen.ramSizeKb)
                  // For slot 3: sync or reset ramdisk
                  if (slot === 3) {
                    if (chosen.card === "aux" && chosen.ramSizeKb !== undefined) {
                      const paramStr = String(chosen.ramSizeKb)
                      const ramIdx = ramdiskParams.indexOf(paramStr)
                      if (ramIdx >= 0) setPreferenceRamWorks(chosen.ramSizeKb)
                    } else {
                      setPreferenceRamWorks()
                    }
                  }
                }
              }}
            />
            {currentCard === "mockingboard" &&  mockingboardConfiguration()}
            </div>
          )
        })}
      </div>
    </>
    )
  }

  const builderDialog =
    <div className="modal-overlay"
      tabIndex={0} // Make the div focusable
      onKeyDown={(event) => {
        if (event.key === "Escape") setShowDialog(false)
      }}
      onMouseMove={(e) => handleMouseMove(e)}
      onMouseUp={handleMouseUp}>
      <div className="floating-dialog flex-column"
        ref={dialogRef}
        style={{ width: "550px",
          left: `${dialogPosition[0]}px`,
          top: `${dialogPosition[1]}px`,
          height: "auto",
          userSelect: "none" }}>
        <div>
          <div className="flex-row-space-between"
            style={{ marginLeft: "10px", marginRight: "10px" }}
            onMouseDown={(e) => handleMouseDown(e)}
            onMouseMove={(e) => handleMouseMove(e)}
            onMouseUp={handleMouseUp}>
            <div className="dialog-title" style={{ padding: 0, paddingTop: "6px" }}>{t("controls.settings")}</div>
            <button className="push-button"
              type="button"
              onClick={() => setShowDialog(false)}>
              <FontAwesomeIcon icon={faXmark} style={{ fontSize: "0.8em" }} />
            </button>
          </div>
          <div className="horiz-rule"></div>
          <div className="flex-row">
            <div className="flex-column">
              {themeConfig()}
              {machineConfig()}
              {slotConfiguration()}
            </div>
            <div className="flex-column" style={{ marginLeft: "20px" }}>
              {graphicsOptions()}
              {keyboardJoystickOptions()}
            </div>
          </div>
        </div>
        <div className="flex-row-space-between" style={{ marginLeft: "10px", marginTop: "10px", flexShrink: 0 }}>
          <button className="push-button text-button"
            onClick={resetSettings}>
            <span className="centered-title">{t("config.resetSettings")}</span>
          </button>
          <button className="push-button text-button"
            onClick={() => { setShowDialog(false) }}>
            <span className="centered-title">{t("dialog.close")}</span>
          </button>
        </div>
      </div>
    </div>

  return (
    <div>
      {showDialog && builderDialog}
      <button className="push-button"
        id="tour-settings"
        title={t("controls.settings")}
        onClick={() => {
          setShowDialog(true)
        }}>
        <FontAwesomeIcon icon={faGear} />
      </button>
    </div>
  )
}
