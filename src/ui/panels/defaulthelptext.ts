
const tourSVG = "<svg viewBox=\"0 0 512 512\" width=\"20\" height=\"20\" style=\"vertical-align: middle;\"><path d=\"M352 256c0 22.2-1.2 43.6-3.3 64l-185.3 0c-2.2-20.4-3.3-41.8-3.3-64s1.2-43.6 3.3-64l185.3 0c2.2 20.4 3.3 41.8 3.3 64zm28.8-64l123.1 0c5.3 20.5 8.1 41.9 8.1 64s-2.8 43.5-8.1 64l-123.1 0c2.1-20.6 3.2-42 3.2-64s-1.1-43.4-3.2-64zm112.6-32l-116.7 0c-10-63.9-29.8-117.4-55.3-151.6c78.3 20.7 142 77.5 171.9 151.6zm-149.1 0l-176.6 0c6.1-36.4 15.5-68.6 27-94.7c10.5-23.6 22.2-40.7 33.5-51.5C239.4 3.2 248.7 0 256 0s16.6 3.2 27.8 13.8c11.3 10.8 23 27.9 33.5 51.5c11.6 26 20.9 58.2 27 94.7zm-209 0L18.6 160C48.6 85.9 112.2 29.1 190.6 8.4C165.1 42.6 145.3 96.1 135.3 160zM8.1 192l123.1 0c-2.1 20.6-3.2 42-3.2 64s1.1 43.4 3.2 64L8.1 320C2.8 299.5 0 278.1 0 256s2.8-43.5 8.1-64zM194.7 446.6c-11.6-26-20.9-58.2-27-94.6l176.6 0c-6.1 36.4-15.5 68.6-27 94.6c-10.5 23.6-22.2 40.7-33.5 51.5C272.6 508.8 263.3 512 256 512s-16.6-3.2-27.8-13.8c-11.3-10.8-23-27.9-33.5-51.5zM135.3 352c10 63.9 29.8 117.4 55.3 151.6C112.2 482.9 48.6 426.1 18.6 352l116.7 0zm358.1 0c-30 74.1-93.6 130.9-171.9 151.6c25.5-34.2 45.2-87.7 55.3-151.6l116.7 0z\"/></svg>"

export let defaultHelpText = `Welcome to Apple2TS
TypeScript Apple IIe Emulator
(c) ${new Date().getFullYear()} CT6502

Click on the Start Tour <a href="/?tour=main">${tourSVG}</a> button to begin a guided tour of the emulator.
`

const isMac = navigator.platform.startsWith("Mac")
const keyMod = isMac ? "⌘" : "Alt+"
const arrowMod = isMac ? "⌘" : "Ctrl+"
const isTouchDevice = "ontouchstart" in document.documentElement

if (isTouchDevice) {

  defaultHelpText += `\nMobile platforms:
Tap the screen to show the keyboard.
Press the arrow keys, esc, or tab buttons to send those keys to the emulator.
To send a control character, press the ctrl button once. Then tap the screen to show the keyboard and press the desired key. The ctrl button will automatically be released.
To send multiple control characters, press the ctrl button twice to lock it on (indicated by a green dot). Then tap the screen to show the keyboard and press the desired keys. Press the ctrl button again to release it.
The open apple and closed apple keys behave the same as the ctrl key.`

} else {

  defaultHelpText += `\n
<b>Keyboard Shortcuts</b>
${keyMod}B Boot              ${arrowMod}1 1 MHz (Normal Speed)
${keyMod}C Copy Screen       ${arrowMod}2 2 MHz
${keyMod}O Open State        ${arrowMod}3 3 MHz
${keyMod}R Reset             ${arrowMod}4 4 MHz (Fast)
${keyMod}S Save State        ${arrowMod}5 Ludicrous/Warp Speed
${keyMod}V Paste Text        ${arrowMod}0 Snail Speed (0.1 MHz)
${keyMod}← Back in Time
${keyMod}→ Forward in Time

Open Apple:   press Left Alt/Option
Closed Apple: press Right Alt/Option`

}

defaultHelpText += `

<b>Disk images:</b> hdv, 2mg, dsk, woz, po, do, bin, bas

<b>Optional URL Parameters</b>
address=1234 (hex load address for binary files)
capslock=off
color=color|nofringe|green|amber|white|inverse
debug=on
ramdisk=64|512|1024|4096|8192
run=false (do not run BASIC program)
scanlines=on
sound=off
speed=snail|slow|normal|two|three|fast|warp
text=<a href="https://www.urlencoder.org" target="_blank" rel="noopener noreferrer">urlencoded</a> string or BASIC program to paste
theme=classic|dark|minimal
tour=main|debug|settings
#urltodiskimage

<b>Examples</b>
<a href="https://apple2ts.com/?debug=on#Replay" target="_blank">Total Replay with debugging</a>
<a href="https://apple2ts.com/?text=chop#Replay" target="_blank">Total Replay, load Choplifter</a>
<a href="https://apple2ts.com/?color=white&speed=fast#https://a2desktop.s3.amazonaws.com/A2DeskTop-1.4-en_800k.2mg" target="_blank">A2Desktop 2MG with fast speed and white color</a>
<a href="https://apple2ts.com/?color=green&text=10%3F%22Welcome%20to%20Apple2TS%21%22%3AGOTO10" target="_blank">Embedded Applesoft BASIC Program</a>
<a href="https://apple2ts.com/?address=07FD#https://github.com/ct6502/apple2ts/raw/refs/heads/main/public/disks/snoggle_0x7FD.bin" target="_blank">Binary File with Hex Address</a>
`
