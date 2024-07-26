import { extraHelpText } from "./extrahelptext"

let emulatorStartText = `Welcome to Apple2TS

TypeScript Apple IIe Emulator
(c) 2024 Chris Torrence

Click the floppy disks to
choose a disk, or click on a
drive to load your own.

Press the Power button to start.
`

const isMac = navigator.platform.startsWith('Mac')
const key = isMac ? `Ctrl+⌘` : 'Ctrl+Alt+'
const isTouchDevice = "ontouchstart" in document.documentElement

export let defaultHelpText = emulatorStartText

if (isTouchDevice) {

  emulatorStartText += `\n\nTo show keyboard, touch screen.
To send special keys, touch the
arrows, esc, or tab buttons.
To send Ctrl or Open Apple keys,
touch button to enable it, then
touch screen to show keyboard.
Touch twice to lock it on.`

  defaultHelpText += `\nMobile platforms:
Tap the screen to show the keyboard.
Press the arrow keys, esc, or tab buttons to send those keys to the emulator.
To send a control character, press the ctrl button once. Then tap the screen to show the keyboard and press the desired key. The ctrl button will automatically be released.
To send multiple control characters, press the ctrl button twice to lock it on (indicated by a green dot). Then tap the screen to show the keyboard and press the desired keys. Press the ctrl button again to release it.
The open apple and closed apple keys behave the same as the ctrl key.`

} else {

  const keyboardShortcutText =
`${key}C Copy Screen
${key}V Paste Text
${key}O Open State
${key}S Save State
${key}← Go Back in Time
${key}→ Forward in Time

Open Apple:   press Left Alt/Option
Closed Apple: press Right Alt/Option`
  
  // Replace Unicode ⌘ with my fake MouseText character
  let tmp = defaultHelpText + `\n` + keyboardShortcutText
  tmp = tmp.replaceAll(`⌘`, '\xC3').replaceAll('←', '\xC8').replaceAll('→', '\xD5')
  emulatorStartText = tmp

  defaultHelpText += `\n` + keyboardShortcutText
}

defaultHelpText += extraHelpText

const textPage = new Array<string>(24).fill('')
const startupTextSplit = emulatorStartText.split('\n')
const n = startupTextSplit.length
for (let j = 0; j < n; j++) {
  textPage[j + 12 - Math.floor(n/2)] = startupTextSplit[j]
}
textPage[0] = '*'.repeat(40)
textPage[23] = '*'.repeat(40)
for (let j = 1; j < 23; j++) {
  const len = (38 - textPage[j].length) / 2
  const left = ' '.repeat(Math.floor(len))
  const right = ' '.repeat(Math.ceil(len))
  textPage[j] = `*${left}${textPage[j]}${right}*`
}

export const startupTextPage = new Uint8Array(40 * 24)
for (let j = 0; j < 24; j++) {
  for (let i = 0; i < 40; i++) {
    const c = textPage[j].charCodeAt(i)
    startupTextPage[40 * j + i] = (c + 128) % 256
  }
}
