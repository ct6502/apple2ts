import { MouseEventSimple } from "../common/utility"

export const getMouseButtonReleaseEvents = (buttons: number, isTouchDevice: boolean) => {
  const released: MouseEventSimple[] = []
  if (isTouchDevice) return released
  // Only synthesize a release for the main button (button 0). The previous
  // code also pushed a button-1 (closed apple) release whenever any of the
  // high bits were clear, which fired on every mouseEnter with no button held
  // and injected a spurious ADB button transition into the middle of a click
  // sequence. That extra transition is what GS/OS read as a second mouseDown
  // (a double click) on a single physical click.
  if (!(buttons & 0x01)) released.push({ x: 0, y: 0, buttons: 0x00 })
  return released
}
