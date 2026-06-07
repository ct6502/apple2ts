import "./keyboardcontrol.css"
import { useState, useRef } from "react"
import { passAppleCommandKeyPress, passAppleCommandKeyRelease, passKeypress, passKeyRelease, passPasteText } from "../main2worker"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faKeyboard } from "@fortawesome/free-solid-svg-icons"
import { getLowercaseMode } from "../ui_settings"
import { appleOutline } from "../img/icon_appleoutline"
import { appleSolid } from "../img/icon_applesolid"
import { setPreferenceBoolean } from "../localstorage"

enum KEY {
  OPEN_APPLE = 256,
  CLOSED_APPLE = 257,
  CTRL = 258,
  SHIFT = 259,
  CAPSLOCK = 260,
  SYMBOLS = 261,
  CUSTOM = 262,
  COLLAPSE = 263,
  ESC = 27,
}

enum LOCK {
  NONE,
  TEMP,
  LOCKED,
}

type KeyCap = {
  label: string;
  code: number;
  width?: number;
}

enum MODE {
  LETTER,
  SYMBOL,
  CUSTOM
}

export const KeyboardControl = () => {
  const [showKeyboard, setShowKeyboard] = useState(false)
  const [shiftMode, setShiftMode] = useState(LOCK.NONE)
  const [symbolMode, setSymbolMode] = useState(MODE.LETTER)
  const [ctrlMode, setCtrlMode] = useState(LOCK.NONE)
  const [escMode, setEscMode] = useState(LOCK.NONE)
  const lastTouchTime = useRef(0)
//  const isTouchDevice = "ontouchstart" in document.documentElement

  // if (!isTouchDevice) {
  //   return null
  // }

  const handleKeyDown = (key: KeyCap, e: React.TouchEvent | React.MouseEvent) => {
    // Prevent double-firing on touch devices (touch events generate synthetic mouse events)
    const now = Date.now()
    if (now - lastTouchTime.current < 100) {
      e.preventDefault()
      return
    }
    lastTouchTime.current = now
    if (key.code < 0) {
      passPasteText(key.label)
      return
    }
    if (key.code >= KEY.OPEN_APPLE || key.code === KEY.ESC) {
      switch (key.code) {
        case KEY.CTRL:
          setCtrlMode((ctrlMode + 1) % 3)
          break
        case KEY.SHIFT:
          setShiftMode((shiftMode === LOCK.NONE) ? LOCK.TEMP : LOCK.NONE)
          break
        case KEY.ESC:
          setEscMode((escMode === LOCK.NONE) ? LOCK.LOCKED : LOCK.NONE)
          passKeypress(key.code)
          break
        case KEY.CAPSLOCK:
          setPreferenceBoolean("lowercaseMode", !getLowercaseMode())
          break
        case KEY.OPEN_APPLE:
          passAppleCommandKeyPress(true)
          break
        case KEY.CLOSED_APPLE:
          passAppleCommandKeyPress(false)
          break
        case KEY.SYMBOLS:
          setSymbolMode((symbolMode === MODE.LETTER) ? MODE.SYMBOL : MODE.LETTER)
          break
        case KEY.CUSTOM:
          setSymbolMode((symbolMode === MODE.CUSTOM) ? MODE.SYMBOL : MODE.CUSTOM)
          break
        case KEY.COLLAPSE:
          setShowKeyboard(false)
          break
      }
      return
    }
    if (key.code >= 65 && key.code <= 90 && !shiftMode && getLowercaseMode() && !ctrlMode && !escMode) {
      key.code += 32 // Convert to lowercase
    }
    if (shiftMode !== LOCK.NONE) {
      setShiftMode(LOCK.NONE)
    }
    if (ctrlMode) {
      // Map certain keys to control codes when Ctrl is held
      if (key.code >= 64 && key.code <= 95) {
        key.code -= 64 // Ctrl+A becomes 1, Ctrl+B becomes 2, etc.
      } else if (key.code >= 96 || (key.code >= 27 && key.code < 64)) {
        return
      }
    }
    if (ctrlMode === LOCK.TEMP) {
      setCtrlMode(LOCK.NONE)
    }
    if (escMode === LOCK.LOCKED) {
      if (![73, 74, 75, 77].includes(key.code)) {
        setEscMode(LOCK.NONE)
      }
    }
    passKeypress(key.code)
  }

  const handleKeyUp = (keyCode: number, e: React.TouchEvent | React.MouseEvent) => {
    // Prevent double-firing on touch devices (touch events generate synthetic mouse events)
    const now = Date.now()
    if (e.type === "mouseup" && now - lastTouchTime.current < 100) {
      e.preventDefault()
      return
    }
    if (e.type === "touchend") {
      lastTouchTime.current = now
    }
    
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
    { label: "Caps", code: KEY.CAPSLOCK },
    { label: "Ctrl", code: KEY.CTRL, width: 1.75 },
    { label: "Esc", code: KEY.ESC },
    { label: "Tab", code: 9 },
    { label: "←", code: 8 },
    { label: "→", code: 21 },
    { label: "↓", code: 10 },
    { label: "↑", code: 11 },
  ]

  const keyLetter1 = [
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
  ]

  const keyLetter2 = [
    { label: "A", code: 65 },
    { label: "S", code: 83 },
    { label: "D", code: 68 },
    { label: "F", code: 70 },
    { label: "G", code: 71 },
    { label: "H", code: 72 },
    { label: "J", code: 74 },
    { label: "K", code: 75 },
    { label: "L", code: 76 },
    { label: "\u23CE", code: 13, width: 1.5 },
  ]
  const keyLetter3 = [
    { label: "\u21E7", code: KEY.SHIFT },
    { label: "Z", code: 90 },
    { label: "X", code: 88 },
    { label: "C", code: 67 },
    { label: "V", code: 86 },
    { label: "B", code: 66 },
    { label: "N", code: 78 },
    { label: "M", code: 77 },
    { label: (symbolMode === MODE.CUSTOM) ? "Del" : "\u232B",
      code: (symbolMode === MODE.CUSTOM) ? 127 : 8, width: 1 },
  ]

  const keyNumbers = [
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
  ]
  const keySym1 = [
    { label: ".", code: 46 },
    { label: "+", code: 43 },
    { label: "\u2013", code: 45 },
    { label: "*", code: 42 },
    { label: "/", code: 47 },
    { label: "=", code: 61 },
    { label: "(", code: 40 },
    { label: ")", code: 41 },
    { label: "<", code: 60 },
    { label: ">", code: 62 },
  ]

  const keySym2 = [
    { label: "_", code: 95 },
    { label: "!", code: 33 },
    { label: "#", code: 35 },
    { label: "^", code: 94 },
    { label: "?", code: 63 },
    { label: "'", code: 39 },
    { label: "[", code: 91 },
    { label: "]", code: 93 },
    { label: "\u23CE", code: 13, width: 1.5 },
  ]
 const keySym3 = [
    { label: (symbolMode === MODE.CUSTOM) ? "123" : "#!@", code: KEY.CUSTOM, width: 1.5 },
    { label: "&", code: 38 },
    { label: ",", code: 44 },
    { label: ";", code: 59 },
    { label: ":", code: 58 },
    { label: "\"", code: 34 },
    { label: "$", code: 36 },
    { label: "%", code: 37 },
    { label: "\u232B", code: 8 },
  ]
  const keySym4 = [
    { label: "IF ", code: -1 },
    { label: "THEN ", code: -1 },
    { label: "FOR ", code: -1 },
    { label: "NEXT ", code: -1 },
    { label: "GOTO ", code: -1 },
    { label: "GOSUB ", code: -1 },
    { label: "RETURN", code: -1 },
  ]
  const keySym5 = [
    { label: "@", code: 64 },
    { label: "`", code: 224 },
    { label: "~", code: 254 },
    { label: "{", code: 123 },
    { label: "}", code: 125 },
    { label: "|", code: 124 },
    { label: "\\", code: 92 },
    { label: "\u25A9", code: 127 },
    { label: "\u23CE", code: 13, width: 1.5 },
  ]

  const keyCmds = [
    { label: "CATALOG\n", code: -1 },
    { label: "LIST\n", code: -1 },
    { label: "RUN\n", code: -1 },
    { label: "CALL-151\n", code: -1 },
    { label: "PR#", code: -1 },
    { label: "PRINT ", code: -1 },
  ]

  const keyBottom = [
      { label: (symbolMode === MODE.LETTER) ? "123" : "ABC", code: KEY.SYMBOLS, width: 2 },
      { label: "A", code: KEY.OPEN_APPLE },
      { label: " ", code: 32, width: 8 },
      { label: "A", code: KEY.CLOSED_APPLE },
      { label: "\u21E9", code: KEY.COLLAPSE, width: 1.5 },
    ]

  let keyboardLayout: KeyCap[][]
  switch (symbolMode) {
    case MODE.LETTER:
      keyboardLayout = [
        specialKeys,
        keyLetter1,
        keyLetter2,
        keyLetter3,
        keyBottom
      ]
      break
    case MODE.SYMBOL:
      keyboardLayout = [
        keyNumbers,
        keySym1,
        keySym2,
        keySym3,
        keyBottom
      ]
      break
    case MODE.CUSTOM:
       keyboardLayout = [
         keyCmds,
         keySym4,
         keySym5,
         keySym3,
         keyBottom
       ]
       break
  }

  const getKeyLabel = (key: KeyCap) => {
    const { code, label } = key
    if (code === KEY.OPEN_APPLE) {
      return  <svg width="24" height="24" style={{fill: "#fff"}}>{appleOutline}</svg>
    }
    if (code === KEY.CLOSED_APPLE) {
      return  <svg width="24" height="24" style={{fill: "#ddd"}}>{appleSolid}</svg>
    }
    if (code === KEY.COLLAPSE) {
      return <FontAwesomeIcon icon={faKeyboard} style={{ fontSize: "24px" }} />
    }
    if (code >= 65 && code <= 90 && !shiftMode && getLowercaseMode() && !ctrlMode) {
      return String.fromCharCode(code + 32) // Convert to lowercase
    }
    return label
  }

  const getKeyStyle = (key: KeyCap) => {
    const { code, label } = key
    let style = "keyboard-key"
    if (label.length > 1 && !label.startsWith("&")) {
      style += " keyboard-key-wide"
    }
    let mode = LOCK.NONE
    if (code === KEY.SHIFT) {
      mode = shiftMode
    } else if (code === KEY.CTRL) {
      mode = ctrlMode
    } else if (code === KEY.ESC) {
      mode = escMode
    } else if (code === KEY.CAPSLOCK) {
      mode = getLowercaseMode() ? LOCK.NONE : LOCK.LOCKED
    }
    switch (mode) {
      case LOCK.TEMP:
        style += " key-down"
        break
      case LOCK.LOCKED:
        style += " key-locked"
        break
    }
    return style
  }

  return (
    <>
      {/* Toggle button */}
      {!showKeyboard && <button
        className="keyboard-toggle-button"
        disabled={Date.now() - lastTouchTime.current < 150}
        onClick={() => setShowKeyboard(!showKeyboard)}
        title={showKeyboard ? "Hide Keyboard" : "Show Keyboard"}
      >
        <FontAwesomeIcon icon={faKeyboard} />
      </button>}

      {/* Floating keyboard */}
      {showKeyboard && (
        <div 
          className="floating-keyboard"
          onTouchMove={(e) => e.preventDefault()}
          onTouchStart={(e) => e.stopPropagation()}
        >
          <div className="keyboard-rows">
            {keyboardLayout.map((row, rowIndex) => (
              <div key={rowIndex} className="keyboard-row">
                {row.map((key, keyIndex) => (
                  <button
                    key={`key-${rowIndex}-${keyIndex}-${key.code}`}
                    className={getKeyStyle(key)}
                    style={{ flexGrow: key.width || 1 }}
                    onMouseDown={(e) => handleKeyDown(key, e)}
                    onMouseUp={(e) => handleKeyUp(key.code, e)}
                    onTouchStart={(e) => handleKeyDown(key, e)}
                    onTouchEnd={(e) => handleKeyUp(key.code, e)}>
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
