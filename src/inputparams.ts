import { handleSetDiskFromURL } from "./devices/driveprops"
import { audioEnable } from "./devices/speaker"
import { COLOR_MODE } from "./emulator/utility/utility"
import { passCapsLock, passSetDebug, passSetSpeedMode, passColorMode, passSetRamWorks, passDarkMode } from "./main2worker"

export const handleInputParams = () => {
  const params = new URLSearchParams(window.location.search)
  if (params.get('capslock')?.toLowerCase() === 'off') {
    passCapsLock(false)
  }
  if (params.get('debug')?.toLowerCase() === 'on') {
    passSetDebug(true)
  }
  const speed = params.get('speed')?.toLowerCase()
  if (speed) {
    switch (speed) {
      case 'fast':
        passSetSpeedMode(1)
        break
      case 'ludicrous':
      case 'warp':
          passSetSpeedMode(2)
        break
    }
  }
  if (params.get('sound')?.toLowerCase() === 'off') {
    audioEnable(false)
  }
  const colorMode = params.get('color')?.toLowerCase()
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
  if (params.get('theme')?.toLowerCase() === 'dark') {
    passDarkMode(true)
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
