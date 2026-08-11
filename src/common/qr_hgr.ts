import { gunzipSync } from "fflate"

// Extracted from QR.BIN in qrdemo.po at badvision/apple2-qr-hgr commit
// fba734057ae8cb08d11445f4cacdce83260feeb3.
// SHA-256: 086048c29832a929350393d729be58dc966bc842b469b6177cc63a01da110d0a
const QR_HGR_GZIP_BASE64 =
  "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"

const QR_HGR_BINARY_LENGTH = 3787
const QR_HGR_TRAMPOLINE_OFFSET = 0x1000
const QR_HGR_MODE_ROUTINE_OFFSET = 0x0140
const QR_HGR_MODE_ROUTINE = Uint8Array.from([
  0xd0, 0x04,
  0xea, 0xea, 0xea, 0x60,
  0xea, 0xea, 0xea, 0x60,
])

// Reads parameters from $7020-$7024, invokes QR.BIN at $6000 with interrupts
// disabled, then returns to Applesoft. This is the upstream demo convention.
const QR_HGR_TRAMPOLINE = Uint8Array.from([
  0xad, 0x20, 0x70, 0x85, 0xeb,
  0xad, 0x21, 0x70, 0x85, 0xec,
  0xad, 0x22, 0x70, 0x85, 0xed,
  0xad, 0x23, 0x70, 0x85, 0xee,
  0xad, 0x24, 0x70, 0x85, 0xef,
  0x78, 0x20, 0x00, 0x60, 0x58, 0x60,
])

export const createQrHgrRuntimeBinary = (): Uint8Array => {
  const compressed = Uint8Array.from(atob(QR_HGR_GZIP_BASE64), character => character.charCodeAt(0))
  const qrBinary = gunzipSync(compressed)
  if (qrBinary.length !== QR_HGR_BINARY_LENGTH) {
    throw new Error(`Unexpected QR.BIN length: ${qrBinary.length}`)
  }
  qrBinary.set(QR_HGR_MODE_ROUTINE, QR_HGR_MODE_ROUTINE_OFFSET)

  const scaler = createQrHgrScalerBinary()
  const scalerOffset = QR_HGR_SCALER_ADDRESS - 0x6000
  const runtime = new Uint8Array(scalerOffset + scaler.length)
  runtime.set(qrBinary)
  runtime.set(QR_HGR_TRAMPOLINE, QR_HGR_TRAMPOLINE_OFFSET)
  runtime.set(scaler, scalerOffset)
  return runtime
}

const QR_HGR_SCALER_ADDRESS = 0x8400
const QR_HGR_SOURCE_X = 49
const QR_HGR_SOURCE_Y = 7
const QR_HGR_SCALE = 4
const QR_HGR_MODULE_BUFFER = 0x9200

export const createQrHgrScalerBinary = (): Uint8Array => {
  const code: number[] = []
  const labels = new Map<string, number>()
  const absoluteFixups: Array<{ offset: number; label: string }> = []
  const branchFixups: Array<{ offset: number; label: string }> = []
  const emit = (...bytes: number[]) => code.push(...bytes)
  const label = (name: string) => labels.set(name, code.length)
  const absolute = (opcode: number, target: string) => {
    emit(opcode, 0, 0)
    absoluteFixups.push({ offset: code.length - 2, label: target })
  }
  const branch = (opcode: number, target: string) => {
    emit(opcode, 0)
    branchFixups.push({ offset: code.length - 1, label: target })
  }

  const bufferPointer = 0x06
  const pixelPointer = 0x08

  emit(0xa5, 0x06); absolute(0x8d, "saved06")
  emit(0xa5, 0x07); absolute(0x8d, "saved07")
  emit(0xa5, 0x08); absolute(0x8d, "saved08")
  emit(0xa5, 0x09); absolute(0x8d, "saved09")

  emit(0xad, 0xd7, 0x00, 0x0a)
  absolute(0x8d, "sizeTimesTwo")
  emit(0xa9, 140, 0x38)
  absolute(0xed, "sizeTimesTwo")
  absolute(0x8d, "destinationX")
  emit(0xa9, 96, 0x38)
  absolute(0xed, "sizeTimesTwo")
  absolute(0x8d, "destinationY")
  emit(0xa9, QR_HGR_MODULE_BUFFER & 0xff, 0x85, bufferPointer)
  emit(0xa9, QR_HGR_MODULE_BUFFER >> 8, 0x85, bufferPointer + 1)
  emit(0xa9, 0x00)
  absolute(0x8d, "moduleRow")

  label("captureRow")
  emit(0xa9, 0x00)
  absolute(0x8d, "moduleColumn")
  label("captureColumn")
  absolute(0xad, "moduleColumn")
  emit(0x18, 0x69, QR_HGR_SOURCE_X)
  absolute(0x8d, "pixelX")
  absolute(0xad, "moduleRow")
  emit(0x18, 0x69, QR_HGR_SOURCE_Y)
  absolute(0x8d, "pixelY")
  absolute(0x20, "isDarkPixel")
  branch(0x90, "captureLight")
  emit(0xa9, 0x01)
  branch(0xd0, "storeModule")
  label("captureLight")
  emit(0xa9, 0x00)
  label("storeModule")
  emit(0xa0, 0x00, 0x91, bufferPointer)
  absolute(0x20, "incrementBuffer")
  absolute(0xee, "moduleColumn")
  absolute(0xad, "moduleColumn")
  emit(0xcd, 0xd7, 0x00)
  branch(0xd0, "captureColumn")
  absolute(0xee, "moduleRow")
  absolute(0xad, "moduleRow")
  emit(0xcd, 0xd7, 0x00)
  branch(0xd0, "captureRow")

  emit(0xa9, 0x00, 0xa2, 0x00)
  label("clearHgr")
  for (let page = 0x20; page <= 0x3f; page++) emit(0x9d, 0x00, page)
  emit(0xe8)
  branch(0xd0, "clearHgr")

  emit(0xa9, QR_HGR_MODULE_BUFFER & 0xff, 0x85, bufferPointer)
  emit(0xa9, QR_HGR_MODULE_BUFFER >> 8, 0x85, bufferPointer + 1)
  absolute(0xad, "destinationY")
  absolute(0x8d, "outputY")
  emit(0xa9, 0x00)
  absolute(0x8d, "moduleRow")

  label("drawRow")
  absolute(0xad, "destinationX")
  absolute(0x8d, "outputX")
  emit(0xa9, 0x00)
  absolute(0x8d, "moduleColumn")
  label("drawColumn")
  emit(0xa0, 0x00, 0xb1, bufferPointer)
  branch(0xf0, "skipModule")
  emit(0xa9, 0x00)
  absolute(0x8d, "scaleY")
  label("drawPixelRow")
  emit(0xa9, 0x00)
  absolute(0x8d, "scaleX")
  label("drawPixelColumn")
  absolute(0xad, "outputX")
  emit(0x18)
  absolute(0x6d, "scaleX")
  absolute(0x8d, "pixelX")
  absolute(0xad, "outputY")
  emit(0x18)
  absolute(0x6d, "scaleY")
  absolute(0x8d, "pixelY")
  absolute(0x20, "setPixel")
  absolute(0xee, "scaleX")
  absolute(0xad, "scaleX")
  emit(0xc9, QR_HGR_SCALE)
  branch(0xd0, "drawPixelColumn")
  absolute(0xee, "scaleY")
  absolute(0xad, "scaleY")
  emit(0xc9, QR_HGR_SCALE)
  branch(0xd0, "drawPixelRow")

  label("skipModule")
  absolute(0x20, "incrementBuffer")
  absolute(0xad, "outputX")
  emit(0x18, 0x69, QR_HGR_SCALE)
  absolute(0x8d, "outputX")
  absolute(0xee, "moduleColumn")
  absolute(0xad, "moduleColumn")
  emit(0xcd, 0xd7, 0x00)
  branch(0xf0, "drawRowDone")
  absolute(0x4c, "drawColumn")

  label("drawRowDone")
  absolute(0xad, "outputY")
  emit(0x18, 0x69, QR_HGR_SCALE)
  absolute(0x8d, "outputY")
  absolute(0xee, "moduleRow")
  absolute(0xad, "moduleRow")
  emit(0xcd, 0xd7, 0x00)
  branch(0xf0, "scalingDone")
  absolute(0x4c, "drawRow")
  label("scalingDone")
  absolute(0xad, "saved09"); emit(0x85, 0x09)
  absolute(0xad, "saved08"); emit(0x85, 0x08)
  absolute(0xad, "saved07"); emit(0x85, 0x07)
  absolute(0xad, "saved06"); emit(0x85, 0x06)
  emit(0x2c, 0x52, 0xc0, 0x2c, 0x54, 0xc0, 0x2c, 0x50, 0xc0, 0x60)

  label("incrementBuffer")
  emit(0xe6, bufferPointer)
  branch(0xd0, "bufferIncremented")
  emit(0xe6, bufferPointer + 1)
  label("bufferIncremented")
  emit(0x60)

  label("isDarkPixel")
  absolute(0xac, "pixelY")
  absolute(0xb9, "rowLow")
  emit(0x85, pixelPointer)
  absolute(0xb9, "rowHigh")
  emit(0x85, pixelPointer + 1)
  absolute(0xac, "pixelX")
  absolute(0xb9, "pixelByte")
  emit(0xaa)
  absolute(0xb9, "pixelMask")
  absolute(0x8d, "mask")
  emit(0x8a, 0xa8, 0xb1, pixelPointer)
  absolute(0x2d, "mask")
  branch(0xf0, "darkPixel")
  emit(0x18, 0x60)
  label("darkPixel")
  emit(0x38, 0x60)

  label("setPixel")
  absolute(0xac, "pixelY")
  absolute(0xb9, "rowLow")
  emit(0x85, pixelPointer)
  absolute(0xb9, "rowHigh")
  emit(0x85, pixelPointer + 1)
  absolute(0xac, "pixelX")
  absolute(0xb9, "pixelMask")
  absolute(0x8d, "mask")
  absolute(0xb9, "pixelByte")
  emit(0xa8, 0xb1, pixelPointer)
  absolute(0x0d, "mask")
  emit(0x91, pixelPointer, 0x60)

  for (const variable of [
    "sizeTimesTwo", "destinationX", "destinationY", "moduleRow", "moduleColumn",
    "outputX", "outputY", "scaleX", "scaleY", "pixelX", "pixelY", "mask",
    "saved06", "saved07", "saved08", "saved09",
  ]) {
    label(variable)
    emit(0x00)
  }

  label("rowLow")
  for (let y = 0; y < 192; y++) {
    const address = 0x2000 + (y & 0x07) * 0x400 + ((y >> 3) & 0x07) * 0x80 + ((y >> 6) & 0x03) * 0x28
    emit(address & 0xff)
  }
  label("rowHigh")
  for (let y = 0; y < 192; y++) {
    const address = 0x2000 + (y & 0x07) * 0x400 + ((y >> 3) & 0x07) * 0x80 + ((y >> 6) & 0x03) * 0x28
    emit(address >> 8)
  }
  label("pixelByte")
  for (let x = 0; x < 280; x++) emit(Math.floor(x / 7))
  label("pixelMask")
  for (let x = 0; x < 280; x++) emit(1 << (x % 7))

  for (const fixup of absoluteFixups) {
    const target = labels.get(fixup.label)
    if (target === undefined) throw new Error(`Missing QR scaler label: ${fixup.label}`)
    const address = QR_HGR_SCALER_ADDRESS + target
    code[fixup.offset] = address & 0xff
    code[fixup.offset + 1] = address >> 8
  }
  for (const fixup of branchFixups) {
    const target = labels.get(fixup.label)
    if (target === undefined) throw new Error(`Missing QR scaler label: ${fixup.label}`)
    const displacement = target - (fixup.offset + 1)
    if (displacement < -128 || displacement > 127) {
      throw new Error(`QR scaler branch out of range: ${fixup.label}`)
    }
    code[fixup.offset] = displacement & 0xff
  }

  return Uint8Array.from(code)
}