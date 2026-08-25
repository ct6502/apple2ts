import { i18n } from "../../../i18n"
import { isGameMode } from "../../ui_settings"



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
let startupTextLanguage = ""
const startupTextPage = new Uint16Array(40 * 24)

const constructStartupTextPage = (machineName: MACHINE_NAME) => {

  const year = String(new Date().getFullYear())
  let emulatorStartText = `${i18n.t("startup.welcome")}

${i18n.t("startup.subtitle")}

${i18n.t("startup.copyright", { year })}`

  let mode = "]["
  switch (machineName) {
  case "APPLE2P": mode = "][+"; break
  case "APPLE2EU": mode = "][e unenhanced"; break
  case "APPLE2EE": mode = "//e enhanced"; break
  default:
  }

  emulatorStartText += `\n\nApple ${mode} mode`

  if (!isGameMode()) {
    emulatorStartText += `\n\n${i18n.t("startup.diskCollections")}`
    emulatorStartText += `\n\n${i18n.t("startup.retroControlPanel")}\n`
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
    const len = Math.max(0, (38 - textPage[j].length) / 2)
    const left = " ".repeat(Math.floor(len))
    const right = " ".repeat(Math.ceil(len))
    textPage[j] = `*${left}${textPage[j]}${right}*`
  }

  for (let j = 0; j < 24; j++) {
    for (let i = 0; i < 40; i++) {
      const c = textPage[j].charCodeAt(i)
      startupTextPage[40 * j + i] = isNaN(c) ? 0x20 : c
    }
  }
}

export const getStartupTextPage = (machineName: MACHINE_NAME) => {

  if (!initStartupTextPage || startupTextMachineName !== machineName || startupTextLanguage !== i18n.getLanguage()) {
    constructStartupTextPage(machineName)
    initStartupTextPage = true
    startupTextMachineName = machineName
    startupTextLanguage = i18n.getLanguage()
  }
  
  // Move asterisk every few frames
  frameCounter++
  if (frameCounter % 3 !== 0) {
    // Put back the old asterisk
    startupTextPage[idx(index)] = 0x2A  // '*'
    // Move to new position
    index = (index + 1) % 126
    // Place new blank space
    startupTextPage[idx(index)] = 0x20  // space
  }
  
  return startupTextPage
}
