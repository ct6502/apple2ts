import { useRef, useState } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faXmark, faGear } from "@fortawesome/free-solid-svg-icons"
import { useTranslation } from "../../i18n/useTranslation"
import { createControlContext } from "../retro/retromenucontext"
import { settingsResetBinding } from "./resetcontrols"
import { Droplist } from "../panels/droplist"
import { handleGetMachineName, handleGetMemSize, handleGetSlotConfig, handleGetSpeedMode } from "../main2worker"
import { getPreferenceBoolean, getPreferenceIigsRomVersion, notifySettingsChanged, setPreferenceAutoSnapshot, setPreferenceBoolean, setPreferenceColorMode, setPreferenceMachineName, setPreferenceMonitorMode, setPreferenceRamWorks, setPreferenceSlotConfig, setPreferenceSpeedMode, setPreferenceTheme, setPreferenceVeraSlot, setPreferenceIigsRomVersion } from "../localstorage"
import { getSlotOptions, SLOT_NUMBERS } from "../../common/slot_options"
import { getCardShortLabels, COLOR_MODES, colorLabels, MONITOR_MODES, monitorModeLabels, ramdiskParams, getRamdiskValues, themeLabels } from "../ui_utilities"
import { BooleanKeyOf, getAutoSnapshot, getColorMode, getMonitorMode, getTheme, setTabView, setUIStateBoolean } from "../ui_settings"
import CheckBox from "../panels/checkbox"
import { getModKeyName } from "../retro/retrocontrolmetadata"
import { UI_THEMES } from "../../common/utility"
import { SlotAudioConfig } from "../devices/audio/audioconfig"
import TabBase from "../tabbase"
import Tab from "../tab"

const dialogPosition = [Math.max(window.innerWidth / 2 - 275, 0), Math.max(window.innerHeight / 2 - 400, 0)]

export const SettingsDialog = (props: DisplayProps) => {
  const { t, language, changeLanguage } = useTranslation()
  const cardShortLabels = getCardShortLabels(t)
  const ramdiskValues = getRamdiskValues(t)
  const [showDialog, setShowDialog] = useState(false)
  const dialogRef = useRef<HTMLDivElement>(null)
  const [offset, setOffset] = useState([0, 0])
  const [dragging, setDragging] = useState(false)

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
  // Keep this order fixed: II+, IIe (unenhanced), IIe (enhanced), IIgs.
  const machineNames: MACHINE_NAME[] = ["APPLE2P", "APPLE2EU", "APPLE2EE", "APPLE2GS"]
  const machineStrings = [
    t("machine.models.apple2p"),
    t("machine.models.apple2eu"),
    t("machine.models.apple2ee"),
    "Apple IIgs",
  ]
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
        value={themeLabels(t)[UI_THEMES.findIndex(option => option.value === getTheme())]}
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
        if (i < 0) return
        const nextMachine = machineNames[i]
        setPreferenceMachineName(nextMachine)
        props.updateDisplay()
        // The IIgs has its own built-in slot layout (and no RAMWorks slot 3),
        // so switching to or from it must keep setPreferenceMachineName's
        // GS defaults / sanitization instead of applying the classic slot-3
        // Videoterm/Aux switch.
        if (nextMachine === "APPLE2GS" || machineName === "APPLE2GS") return
        // Adjust slot 3 when crossing between II+ and IIe families
        const newIsIIp = nextMachine === "APPLE2P"
        const wasIIp = machineName === "APPLE2P"
        if (newIsIIp !== wasIIp) {
          handleSelectSlotCard(3, newIsIIp ? "videoterm" : "aux")
          if (!newIsIIp) setPreferenceRamWorks() // reset to 64KB default
        }
      }}
      />
    )
  }

  const romConfig = () => {
    return (
      <Droplist name="ROM Version"
        value={getPreferenceIigsRomVersion() === "03" ? "ROM 03" : "ROM 01"}
        values={["ROM 01", "ROM 03"]}
        setValue={(val: string) => {
          setPreferenceIigsRomVersion(val === "ROM 03" ? "03" : "01")
          props.updateDisplay()
        }}
      />
    )
  }

  const speedConfig = () => {
    const speedMode = handleGetSpeedMode()
    const speedIndex = speedMode + 2
    // const iconSize = 22
    const SPEED_MODES = [-2, -1, 0, 1, 2, 3, 4] as const
    const SPEED_LABEL_KEYS = [
      t("retroControl.snail"),
      t("retroControl.slow"),
      t("retroControl.normal"),
      t("retroControl.twoMhz"),
      t("retroControl.threeMhz"),
      t("retroControl.fast"),
      t("retroControl.warp"),
    ]
    return (
      <Droplist name={t("config.speed")}
        value={SPEED_LABEL_KEYS[speedIndex]}
        values={SPEED_LABEL_KEYS}
        setValue={(val: string) => {
          const index = SPEED_LABEL_KEYS.indexOf(val)
          setPreferenceSpeedMode(SPEED_MODES[index])
          props.updateDisplay()
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

  const slotConfiguration = () => {
    return (
    <>
      <div className="dialog-title" style={{ marginTop: "6px" }}>{t("linkBuilder.slots.configure")}</div>
      {/* Two columns filled top-to-bottom: slots 1-4 left, 5-7 right. The grid
          flows column-major through the four declared rows, so the single map
          below keeps SLOT_NUMBERS order. */}
      <div className="flex-column" style={{gap: "3px"}}>
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
            {(currentCard === "mockingboard" || currentCard === "passport" || currentCard === "vera") &&
              <SlotAudioConfig {...props} card={currentCard} slot={slot} />}
            </div>
          )
        })}
      </div>
    </>
    )
  }

  const timeTravelOptions = () => {
    const autoSnapshot = getAutoSnapshot()
    const ttnames = [t("timetravel.auto_Off"), t("timetravel.auto_100k"), t("timetravel.auto_1M")]
    return (
    <div>
      <div className="dialog-title" style={{ paddingBottom: "4px" }}>{t("debug.timeTravelSnapshots")}</div>
      <CheckBox name={t("timetravel.snapshotOnKeyPress")}
        checked={getPreferenceBoolean("snapshotOnKeyPress")}
        setChecked={(on: boolean) => doSetPreferenceBoolean("snapshotOnKeyPress", on)} />
      <Droplist name={t("timetravel.autoSnapshot")}
        value={ttnames[autoSnapshot]}
        values={ttnames}
        setValue={(val: string) => {
          const i = ttnames.indexOf(val)
          setPreferenceAutoSnapshot(i)
          props.updateDisplay()
        }}
      />
    </div>
    )
  }

  // const saveStateOptions = () => {
  //   return (
  //     <div>
  //       <div className="dialog-title" style={{ marginTop: "10px", marginBottom: "4px" }}>
  //         {t("config.autoSaveState")}</div>
  //       <CheckBox name={t("config.autoSaveState")}
  //         checked={getPreferenceBoolean("saveStateToLocalStorage")}
  //         setChecked={(on: boolean) => doSetPreferenceBoolean("saveStateToLocalStorage", on)} />
  //       <button className="push-button text-button"
  //         style={{marginTop: "20px", marginLeft: "5px"}}
  //         onClick={resetSavedStateFromLocalStorage}>
  //         <span className="centered-title">{t("config.resetSavedState")}</span>
  //       </button>
  //     </div>
  //   )
  // }

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
        style={{ width: "600px",
          left: `${dialogPosition[0]}px`,
          top: `${dialogPosition[1]}px`,
          height: "auto",
          userSelect: "none" }}>
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
          {/* <div className="horiz-rule"></div> */}

          <div style={{margin: "10px"}}>
          <TabBase>
            <Tab title={t("machine.configuration")}>
              <div className="flex-row" style={{marginTop: "10px", marginBottom: "10px"}}>
                <div className="flex-column" style={{gap: "3px"}}>
                  {themeConfig()}
                  {machineConfig()}
                  {machineName === "APPLE2GS" && romConfig()}
                  {speedConfig()}
                  {slotConfiguration()}
                </div>
                <div className="flex-column" style={{gap: "3px", marginLeft: "20px" }}>
                  {graphicsOptions()}
                  {keyboardJoystickOptions()}
                </div>
              </div>
              <button className="push-button text-button"
                style={{marginTop: "10px", marginLeft: "5px"}}
                onClick={resetSettings}>
                <span className="centered-title">{t("config.resetSettings")}</span>
              </button>
            </Tab>
            <Tab title={t("config.saveState")}>
              <div className="flex-row" style={{marginTop: "10px", marginBottom: "10px"}}>
                {timeTravelOptions()}
              </div>
              {/* {saveStateOptions()} */}
            </Tab>
          </TabBase>
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
