import "./keyboardcontrol.css"
import { useState } from "react"
import { passAppleCommandKeyPress, passAppleCommandKeyRelease, passKeypress, passKeyRelease } from "../main2worker"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faKeyboard, faXmark } from "@fortawesome/free-solid-svg-icons"
import { getCapsLock } from "../ui_settings"
import { appleOutline } from "../img/icon_appleoutline"
import { appleSolid } from "../img/icon_applesolid"

enum KEY {
  OPEN_APPLE = 256,
  CLOSED_APPLE = 257,
  CTRL = 258,
  SHIFT = 259,
  ESC = 27,
}

enum LOCK {
  NONE,
  TEMP,
  LOCKED,
}

export const KeyboardControl = () => {
  const [showKeyboard, setShowKeyboard] = useState(false)
  const [shiftMode, setShiftMode] = useState(LOCK.NONE)
  const [ctrlMode, setCtrlMode] = useState(LOCK.NONE)
  const [escMode, setEscMode] = useState(LOCK.NONE)
  const isTouchDevice = "ontouchstart" in document.documentElement

  if (!isTouchDevice) {
    return null
  }

  const handleKeyDown = (keyCode: number, e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault() // Prevent synthetic mouse events on touch devices
    if (keyCode >= KEY.OPEN_APPLE || keyCode === KEY.ESC) {
      switch (keyCode) {
        case KEY.CTRL:
          setCtrlMode((ctrlMode + 1) % 3)
          break
        case KEY.SHIFT:
          setShiftMode((shiftMode + 1) % 3)
          break
        case KEY.ESC:
          setEscMode((escMode === LOCK.NONE) ? LOCK.LOCKED : LOCK.NONE)
          passKeypress(keyCode)
          break
        case KEY.OPEN_APPLE:
          passAppleCommandKeyPress(true)
          break
        case KEY.CLOSED_APPLE:
          passAppleCommandKeyPress(false)
          break
      }
    } else {
      if (keyCode >= 65 && keyCode <= 90 && !shiftMode && !getCapsLock() && !ctrlMode && !escMode) {
        keyCode += 32 // Convert to lowercase
      }
      if (shiftMode === LOCK.TEMP) {
        setShiftMode(LOCK.NONE)
      }
      if (ctrlMode) {
        // Map certain keys to control codes when Ctrl is held
        if (keyCode >= 64 && keyCode <= 95) {
          keyCode -= 64 // Ctrl+A becomes 1, Ctrl+B becomes 2, etc.
        } else if (keyCode >= 96 || (keyCode >= 27 && keyCode < 64)) {
          return
        }
      }
      if (ctrlMode === LOCK.TEMP) {
        setCtrlMode(LOCK.NONE)
      }
      if (escMode === LOCK.LOCKED) {
        if (![73, 74, 75, 77].includes(keyCode)) {
          setEscMode(LOCK.NONE)
        }
      }
      passKeypress(keyCode)
    }
  }

  const handleKeyUp = (keyCode: number, e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault() // Prevent synthetic mouse events on touch devices
    if (keyCode >= KEY.OPEN_APPLE) {
      switch (keyCode) {
        case KEY.CTRL:
          break
        case KEY.SHIFT:
          break
        case KEY.OPEN_APPLE:
          passAppleCommandKeyRelease(true)
          break
        case KEY.CLOSED_APPLE:
          passAppleCommandKeyRelease(false)
          break
      }
    } else {
      passKeyRelease()
    }
  }

  // Apple IIe keyboard layout
  const specialKeys = [
    { label: "Esc", code: 27 },
    { label: "Tab", code: 9 },
  ]

  const keyboardLayout = [
    // Row 1: ESC through DELETE
    [
      { label: "`", code: 224 },
      { label: "\u2013", code: 45 },
      { label: "=", code: 61 },
      { label: "[", code: 91 },
      { label: "]", code: 93 },
      { label: "\\", code: 92 },
      { label: ";", code: 59 },
      { label: "'", code: 39 },
      { label: ",", code: 44 },
      { label: ".", code: 46 },
      { label: "/", code: 47 },
    ],
    [
      { label: "1", code: 49 },
      { label: "2", code: 50 },
      { label: "3", code: 51 },
      { label: "4", code: 52 },
      { label: "5", code: 53 },
      { label: "6", code: 54 },
      { label: "7", code: 55 },
      { label: "8", code: 56 },
      { label: "9", code: 57 },
      { label: "0", code: 48 },
      { label: "\u232B", code: 8, width: 1.5 },
    ],
    // Row 2: TAB through ]
    [
      { label: "Q", code: 81 },
      { label: "W", code: 87 },
      { label: "E", code: 69 },
      { label: "R", code: 82 },
      { label: "T", code: 84 },
      { label: "Y", code: 89 },
      { label: "U", code: 85 },
      { label: "I", code: 73 },
      { label: "O", code: 79 },
      { label: "P", code: 80 },
    ],
    // Row 3: A through '
    [
      { label: "Ctrl", code: KEY.CTRL, width: 1.75 },
      { label: "A", code: 65 },
      { label: "S", code: 83 },
      { label: "D", code: 68 },
      { label: "F", code: 70 },
      { label: "G", code: 71 },
      { label: "H", code: 72 },
      { label: "J", code: 74 },
      { label: "K", code: 75 },
      { label: "L", code: 76 },
    ],
    // Row 4: Z through /
    [
      { label: "Shift", code: KEY.SHIFT, width: 2 },
      { label: "Z", code: 90 },
      { label: "X", code: 88 },
      { label: "C", code: 67 },
      { label: "V", code: 86 },
      { label: "B", code: 66 },
      { label: "N", code: 78 },
      { label: "M", code: 77 },
      { label: "Return", code: 13, width: 1.5 },
    ],
    // Row 5: Space bar and arrows
    [
      { label: "A", code: KEY.OPEN_APPLE },
      { label: " ", code: 32, width: 8 },
      { label: "A", code: KEY.CLOSED_APPLE },
      { label: "←", code: 8 },
      { label: "→", code: 21 },
      { label: "↓", code: 10 },
      { label: "↑", code: 11 },
    ],
  ]

  // Make a copy of the keyboard layout for shifted keys
  const keyboardLayoutShifted = JSON.parse(JSON.stringify(keyboardLayout)) as typeof keyboardLayout
  keyboardLayoutShifted[0] = 
    [
      { label: "~", code: 254 },
      { label: "_", code: 95 },
      { label: "+", code: 43 },
      { label: "{", code: 123 },
      { label: "}", code: 125 },
      { label: "|", code: 124 },
      { label: ":", code: 58 },
      { label: "\"", code: 34 },
      { label: "<", code: 60 },
      { label: ">", code: 62 },
      { label: "?", code: 63 },
    ]
  keyboardLayoutShifted[1] = 
    [
      { label: "!", code: 33 },
      { label: "@", code: 64 },
      { label: "#", code: 35 },
      { label: "$", code: 36 },
      { label: "%", code: 37 },
      { label: "^", code: 94 },
      { label: "&", code: 38 },
      { label: "*", code: 42 },
      { label: "(", code: 40 },
      { label: ")", code: 41 },
    ]
  const del = keyboardLayoutShifted[1].length - 1
  keyboardLayoutShifted[1][del] = { label: "Del", code: 127, width: 1.5 }

  const kbrd = shiftMode ? keyboardLayoutShifted : keyboardLayout

  const getKeyLabel = (key: { label: string; code: number }) => {
    const { code, label } = key
    if (code === KEY.OPEN_APPLE) {
      return  <svg width="20" height="20" style={{fill: "#fff"}}>{appleOutline}</svg>
    }
    if (code === KEY.CLOSED_APPLE) {
      return  <svg width="20" height="20" style={{fill: "#ddd"}}>{appleSolid}</svg>
    }
    if (code >= 65 && code <= 90 && !shiftMode && !getCapsLock() && !ctrlMode) {
      return String.fromCharCode(code + 32) // Convert to lowercase
    }
    return label
  }

  const getKeyStyle = (code : number) => {
    let style = "keyboard-key"
    let mode = LOCK.NONE
    if (code === KEY.SHIFT) {
      mode = shiftMode
    } else if (code === KEY.CTRL) {
      mode = ctrlMode
    } else if (code === KEY.ESC) {
      mode = escMode
    }
    switch (mode) {
      case LOCK.TEMP:
        style += " key-down"
        break
      case LOCK.LOCKED:
        style += " key-down key-locked"
        break
    }
    return style
  }

  return (
    <>
      {/* Toggle button */}
      <button
        className="keyboard-toggle-button"
        onClick={() => setShowKeyboard(!showKeyboard)}
        title={showKeyboard ? "Hide Keyboard" : "Show Keyboard"}
      >
        <FontAwesomeIcon icon={faKeyboard} />
      </button>

      {/* Floating keyboard */}
      {showKeyboard && (
        <div className="floating-keyboard">
          <div className="keyboard-header">
              <div className="keyboard-row" style={{ marginBottom: "4px" }}>
                {specialKeys.map((key, keyIndex) => (
                  <button
                    key={keyIndex}
                    className={getKeyStyle(key.code)}
                    style={{ minWidth: "50px" }}
                    onMouseDown={(e) => key.code > 0 && handleKeyDown(key.code, e)}
                    onMouseUp={(e) => handleKeyUp(key.code, e)}
                    onTouchStart={(e) => key.code > 0 && handleKeyDown(key.code, e)}
                    onTouchEnd={(e) => handleKeyUp(key.code, e)}
                    disabled={key.code < 0}>
                    {getKeyLabel(key)}
                  </button>
                ))}
              </div>
            <button
              className="keyboard-close-button"
              onClick={() => setShowKeyboard(false)}
            >
              <FontAwesomeIcon icon={faXmark} style={{userSelect: "none"}}/>
            </button>
          </div>
          <div className="keyboard-rows">
            {kbrd.map((row, rowIndex) => (
              <div key={rowIndex} className="keyboard-row">
                {row.map((key, keyIndex) => (
                  <button
                    key={keyIndex}
                    className={getKeyStyle(key.code)}
                    style={{ flexGrow: key.width || 1 }}
                    onMouseDown={(e) => key.code > 0 && handleKeyDown(key.code, e)}
                    onMouseUp={(e) => handleKeyUp(key.code, e)}
                    onTouchStart={(e) => key.code > 0 && handleKeyDown(key.code, e)}
                    onTouchEnd={(e) => handleKeyUp(key.code, e)}
                    disabled={key.code < 0}>
                    {getKeyLabel(key)}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  )
}

export default KeyboardControl
