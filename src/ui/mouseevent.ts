import { MouseEventSimple } from "../common/utility"

export const getMouseButtonReleaseEvents = (buttons: number, isTouchDevice: boolean) => {
  const released: MouseEventSimple[] = []
  if (isTouchDevice) return released
  if (!(buttons & 0x01)) released.push({ x: 0, y: 0, buttons: 0x00 })
  if (!(buttons & 0x1E)) released.push({ x: 0, y: 0, buttons: 0x01 })
  return released
}
