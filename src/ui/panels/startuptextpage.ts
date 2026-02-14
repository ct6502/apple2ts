import { isGameMode } from "../ui_settings"



let index = 0
let frameCounter = 0


const idx = (i: number) => {
  if (i < 40) return i
  if (i <= 61) return (i - 39) * 40 + 39
  if (i <= 103) return 23 * 40 + (103 - i)
  return (126 - i) * 40
}

let initStartupTextPage = false
let startupTextMachineName: MACHINE_NAME | "" = ""
const startupTextPage = new Uint8Array(40 * 24)

const constructStartupTextPage = (machineName: MACHINE_NAME) => {

  let emulatorStartText = `Welcome to Apple2TS

TypeScript Apple IIe Emulator

(c) ${new Date().getFullYear()} CT6502`

  if (machineName === "APPLE2P") {
    emulatorStartText += "\n(APPLE ][+ MODE)"
  }

  if (!isGameMode()) {
    emulatorStartText +=`

Click on the Start Tour globe
button to begin a guided tour.
`
  }

  // const isMac = navigator.platform.startsWith('Mac')
  // const keyMod = isMac ? `Cmd+` : 'Alt+'
  // const arrowMod = isMac ? 'Cmd+' : 'Ctrl+'
  const isTouchDevice = "ontouchstart" in document.documentElement

  if (isTouchDevice) {
    emulatorStartText += `\n\nTo show keyboard, touch screen.
To send special keys, touch the
arrows, esc, or tab buttons.
To send Ctrl or Open Apple keys,
touch button to enable it, then
touch screen to show keyboard.
Touch twice to lock it on.`

  }
  if (machineName === "APPLE2P") {
    emulatorStartText = emulatorStartText.toUpperCase()
  }

  const textPage = new Array<string>(24).fill("")
  const startupTextSplit = emulatorStartText.split("\n")
  const n = startupTextSplit.length
  for (let j = 0; j < n; j++) {
    textPage[j + 12 - Math.floor(n/2)] = startupTextSplit[j]
  }
  textPage[0] = "*".repeat(40)
  textPage[23] = "*".repeat(40)
  for (let j = 1; j < 23; j++) {
    const len = (38 - textPage[j].length) / 2
    const left = " ".repeat(Math.floor(len))
    const right = " ".repeat(Math.ceil(len))
    textPage[j] = `*${left}${textPage[j]}${right}*`
  }

  for (let j = 0; j < 24; j++) {
    for (let i = 0; i < 40; i++) {
      const c = textPage[j].charCodeAt(i)
      startupTextPage[40 * j + i] = (c + 128) % 256
    }
  }
}

export const getStartupTextPage = (machineName: MACHINE_NAME) => {

  if (!initStartupTextPage || startupTextMachineName !== machineName) {
    constructStartupTextPage(machineName)
    initStartupTextPage = true
    startupTextMachineName = machineName
  }
  
  // Advance frame counter and move asterisk every 10 frames (simulates 0.1 speed)
  frameCounter++
  if (frameCounter % 3 === 0) {
    // Clear the old asterisk position
    startupTextPage[idx(index)] = 170
    // Move to new position
    index = (index + 1) % 126
    // Place new asterisk
    startupTextPage[idx(index)] = 160
  }
  
  return startupTextPage
}
