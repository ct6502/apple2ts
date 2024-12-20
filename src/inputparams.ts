import { handleSetDiskFromURL, setDefaultBinaryAddress } from "./devices/driveprops"
import { audioEnable } from "./devices/speaker"
import { COLOR_MODE } from "./emulator/utility/utility"
import { passCapsLock, passSetDebug, passSpeedMode, passColorMode, passSetRamWorks, passDarkMode, passPasteText } from "./main2worker"

export const handleInputParams = () => {
  // Most parameters are case insensitive. The only exception is the BASIC
  // parameter, where we want to preserve the case of the program.
  const params = new URLSearchParams(window.location.search.toLowerCase())
  const porig = new URLSearchParams(window.location.search)
  if (params.get('capslock') === 'off') {
    passCapsLock(false)
  }
  if (params.get('debug') === 'on') {
    passSetDebug(true)
  }
  const speed = params.get('speed')
  if (speed) {
    switch (speed) {
      case 'fast':
        passSpeedMode(1)
        break
      case 'ludicrous':
      case 'warp':
          passSpeedMode(2)
        break
    }
  }
  if (params.get('sound') === 'off') {
    audioEnable(false)
  }
  const colorMode = params.get('color')
  if (colorMode) {
    const colors = ['color', 'nofringe', 'green', 'amber', 'white']
    const mode = colors.indexOf(colorMode)
    if (mode >= 0) passColorMode(mode as COLOR_MODE)
  }
  const ramDisk = params.get('ramdisk')
  if (ramDisk) {
    const sizes = ['64', '512', '1024', '4096', '8192']
    const index = sizes.indexOf(ramDisk)
    if (index >= 0) {
      passSetRamWorks(parseInt(sizes[index]))
    }
  }
  if (params.get('theme') === 'dark') {
    passDarkMode(true)
  }
  const address = params.get('address')
  if (address) {
    setDefaultBinaryAddress(parseInt(address, 16))
  }
  const run = params.get('run')
  const doRun = !(run === '0' || run === 'false')
  // Use the original case of the BASIC program.
  const basic = porig.get('basic') || porig.get('BASIC')
  if (basic) {
    const trimmed = basic.trim()
    const hasLineNumbers = /^[0-9]/.test(trimmed) || /[\n\r][0-9]/.test(trimmed)
    const cmd = (hasLineNumbers && doRun) ? '\nRUN\n' : '\n'
    passPasteText(basic + cmd)
  }
}

// Examples:
// https://apple2ts.com/?color=white&speed=fast#https://a2desktop.s3.amazonaws.com/A2DeskTop-1.4-en_800k.2mg
// https://apple2ts.com/#https://archive.org/download/TotalReplay/Total%20Replay%20v5.0.1.hdv
// https://apple2ts.com/#https://archive.org/download/wozaday_Davids_Midnight_Magic/00playable.woz
export const handleFragment = async (updateDisplay: UpdateDisplay) => {
  const fragment = window.location.hash
  // If you start npm locally with 'npm start --xyz=blahblah', then npm
  // will automatically create an environment variable "npm_config_xyz".
  // So here we check for a --urlparam command line argument and load it if it exists.
  // For example, npm start --urlparam=speed=fast#Replay
  if (process.env.npm_config_urlparam) {
    if (window.location.search === '') {
      window.location.href = window.location.pathname + '?' + process.env.npm_config_urlparam
    }
  }
  if (fragment.length >= 2) {
    const url = fragment.substring(1)
    handleSetDiskFromURL(url, updateDisplay)
  }
}
