import { audioEnable } from "./devices/speaker"
import { COLOR_MODE } from "./emulator/utility/utility"
import { passCapsLock, passSetDebug, passSetSpeedMode, passColorMode, handleSetDiskFromURL } from "./main2worker"

export const handleInputParams = () => {
  const params = new URLSearchParams(window.location.search)
  if (params.get('capslock')?.toLowerCase() === 'off') {
    passCapsLock(false)
  }
  if (params.get('debug')?.toLowerCase() === 'on') {
    passSetDebug(true)
  }
  if (params.get('speed')?.toLowerCase() === 'fast') {
    passSetSpeedMode(1)
  }
  if (params.get('sound')?.toLowerCase() === 'off') {
    audioEnable(false)
  }
  const colorMode = params.get('color')
  if (colorMode) {
    const colors = ['color', 'nofringe', 'green', 'amber', 'white']
    const mode = colors.indexOf(colorMode)
    if (mode >= 0) passColorMode(mode as COLOR_MODE)
  }
}

// Examples:
// https://apple2ts.com/?color=white&speed=fast#https://a2desktop.s3.amazonaws.com/A2DeskTop-1.3-en_800k.2mg
// https://apple2ts.com/#https://archive.org/download/TotalReplay/Total%20Replay%20v5.0.1.hdv
// https://apple2ts.com/#https://archive.org/download/wozaday_Davids_Midnight_Magic/00playable.woz
export const handleFragment = async () => {
  const fragment = window.location.hash
  if (fragment.length < 2) return
  const url = fragment.substring(1)
  handleSetDiskFromURL(url)
}
