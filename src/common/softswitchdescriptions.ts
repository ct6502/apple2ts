import { SWITCHES } from "../worker/softswitches"
import { toHex } from "./utility"

const SoftSwitchDescriptions: Array<string> = []

export const getSoftSwitchDescriptions = () => {
  if (SoftSwitchDescriptions.length === 0) {
    for (const key in SWITCHES) {
      const sswitch = SWITCHES[key as keyof typeof SWITCHES]
      const isSwitch = sswitch.onAddr > 0
      const writeOnly = sswitch.writeOnly ? " (write)" : ""
      if (sswitch.offAddr > 0) {
        const addr = toHex(sswitch.offAddr) + ' ' + key
        SoftSwitchDescriptions[sswitch.offAddr] = addr + (isSwitch ? "-OFF" : "") + writeOnly
      }
      if (sswitch.onAddr > 0) {
        const addr = toHex(sswitch.onAddr) + ' ' + key
          SoftSwitchDescriptions[sswitch.onAddr] = addr + "-ON" + writeOnly
      }
      if (sswitch.isSetAddr > 0) {
        const addr = toHex(sswitch.isSetAddr) + ' ' + key
        SoftSwitchDescriptions[sswitch.isSetAddr] = addr + "-STATUS" + writeOnly
      }
    }
  }
  SoftSwitchDescriptions[0xC000] = 'C000 KBRD/STORE80-OFF'
  return SoftSwitchDescriptions
}
