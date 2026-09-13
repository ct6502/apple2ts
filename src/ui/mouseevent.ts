export const getReleasedMouseButtons = (buttons: number) => {
  const released: number[] = []
  if (!(buttons & 0x01)) released.push(0x00)
  if (!(buttons & 0x06)) released.push(0x01)
  return released
}
