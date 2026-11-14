import { doSetMachineName, doSetRunMode, doBoot, resetCpuSpeedForTesting, getCPU } from "./motherboard"
import { memGet24, memory, megaIIAux, iigsRegisters, iigsGetVblPending, getShr } from "./memory"
import { SWITCHES } from "./softswitches"
import { s6502 } from "./instructions"
import { doSetEmuDriveNewData } from "./devices/drivestate"
import { RUN_MODE } from "../common/utility"
import { setIsTesting } from "./worker2main"
import * as fs from "fs"

test("Test boot with C:\\dev\\emu\\ap2\\GSOS601.po", () => {
  jest.useFakeTimers()
  setIsTesting()
  try {
    doSetMachineName("APPLE2GS")

    const poPath = "C:\\dev\\emu\\ap2\\GSOS601.po"
    const data = fs.readFileSync(poPath)
    console.log(`Loaded GSOS601.po, size=${data.length}`)

    const props: DriveProps = {
      index: 0,
      hardDrive: true,
      drive: 1,
      filename: "GSOS601.po",
      status: "",
      motorRunning: false,
      diskHasChanges: false,
      isWriteProtected: false,
      diskData: new Uint8Array(data),
      lastAppleWriteTime: 0,
      cloudData: null,
      writableFileHandle: null,
      lastLocalFileWriteTime: 0,
    }
    const mounted = doSetEmuDriveNewData(props)
    console.log(`doSetEmuDriveNewData result: ${mounted}`)

    const cpu = getCPU() as any
    ;(globalThis as any).cpu = cpu
    const ringBuffer: string[] = []
    const origPI = cpu.processInstruction.bind(cpu)
    const past681d = false
    let dumpedBrk = false
    cpu.processInstruction = (cb?: any) => {
      const pb = cpu.PB, pc = cpu.PC
      const op = memGet24((pb << 16) | pc)
      let skipTrace = false
      if (ringBuffer.length > 0) {
        const last = ringBuffer[ringBuffer.length - 1]
        if (last.startsWith(`${pb.toString(16).padStart(2, "0")}:${pc.toString(16).padStart(4, "0")}`)) {
          skipTrace = true
        }
      }
      // Don't flood ringBuffer with the block copy loop at 00:f587..f58d
      if (pb === 0 && pc >= 0xf587 && pc <= 0xf58d) {
        skipTrace = true
      }
      if (pb === 0 && pc >= 0xf45c && pc <= 0xf463) {
        skipTrace = true
      }
      if (pb === 0xff && pc >= 0xa5a0 && pc <= 0xa5b0) {
        skipTrace = true
      }
      if (!skipTrace) {
        if (ringBuffer.length >= 2000) ringBuffer.shift()
        ringBuffer.push(`${pb.toString(16).padStart(2, "0")}:${pc.toString(16).padStart(4, "0")} op=${op.toString(16).padStart(2, "0")} A=${cpu.A.toString(16)} X=${cpu.X.toString(16)} Y=${cpu.Y.toString(16)} S=${cpu.S.toString(16)} D=${cpu.D.toString(16)} DB=${cpu.DB.toString(16)} P=${cpu.P.toString(16)} E=${cpu.emulationMode}`)
      }

      if (pb === 0 && pc === 0x8315 && (!cpu.lastA8315 || cpu.A > cpu.lastA8315)) {
        console.log(`[MVN START AT 00:8315] destBank=${memGet24(0x8316).toString(16)} srcBank=${memGet24(0x8317).toString(16)} A=${cpu.A.toString(16)} X=${cpu.X.toString(16)} Y=${cpu.Y.toString(16)}`)
      }
      if (pb === 0 && pc === 0x8315) {
        cpu.lastA8315 = cpu.A
      }
      if (pb === 0 && pc === 0xd46e) {
        console.log(`[AT 00:D46E] S=${cpu.S.toString(16)}`)
        for (let s = 1; s <= 30; s++) {
          console.log(`S+${s}=$${memGet24(cpu.S + s).toString(16).padStart(2, "0")}`)
        }
      }

      if (!cpu.lastD8) cpu.lastD8 = 0
      if (!cpu.lastD9) cpu.lastD9 = 0
      if (megaIIAux[0x00D8] !== cpu.lastD8 || megaIIAux[0x00D9] !== cpu.lastD9) {
        console.log(`[E1:00D8 CHANGED] old=${cpu.lastD8.toString(16)}:${cpu.lastD9.toString(16)} new=${megaIIAux[0x00D8].toString(16)}:${megaIIAux[0x00D9].toString(16)} at ${pb.toString(16)}:${pc.toString(16)} A=${cpu.A.toString(16)} X=${cpu.X.toString(16)} Y=${cpu.Y.toString(16)}`)
        const qBank = megaIIAux[0x00DA]
        const qOff = megaIIAux[0x00D8] | (megaIIAux[0x00D9] << 8)
        console.log(`Queue pointer: ${qBank.toString(16)}:${qOff.toString(16)}, sig at ${qBank.toString(16)}:${(qOff+6).toString(16)} = ${memGet24((qBank<<16)|(qOff+6)).toString(16)} ${memGet24((qBank<<16)|(qOff+7)).toString(16)}`)
        console.log("Last 20 instructions before E1:00D8 change:")
        console.log(ringBuffer.slice(-20).join("\n"))
        cpu.lastD8 = megaIIAux[0x00D8]
        cpu.lastD9 = megaIIAux[0x00D9]
      }

      if (cpu.lastD8 === 0x3b && cpu.lastD9 === 0x74 && !cpu.sigCorrupted) {
        const sigLo = memGet24(0x007441)
        const sigHi = memGet24(0x007442)
        if (sigLo !== 0x5a || sigHi !== 0xa5) {
          cpu.sigCorrupted = true
          console.log(`[SIG CORRUPTED AT 00:7441!] sig=${sigHi.toString(16)}:${sigLo.toString(16)} at ${pb.toString(16)}:${pc.toString(16)} op=${op.toString(16)} A=${cpu.A.toString(16)} X=${cpu.X.toString(16)} Y=${cpu.Y.toString(16)} S=${cpu.S.toString(16)} DB=${cpu.DB.toString(16)}`)
          console.log("Disassembly of 00:F570..00:F5A0:")
          for (let p = 0xf570; p <= 0xf5a0; p++) {
            console.log(`00:${p.toString(16)}: ${memGet24(p).toString(16).padStart(2, "0")}`)
          }
          console.log("Stack at corruption: S=" + cpu.S.toString(16))
          for (let s = 1; s <= 16; s++) {
            console.log(`S+${s}=$${memGet24(cpu.S + s).toString(16).padStart(2, "0")}`)
          }
          console.log("Last 50 instructions before sig corruption:")
          console.log(ringBuffer.slice(-50).join("\n"))
        }
      }

      if (op === 0x9f && memGet24((pb << 16) | (pc + 1)) === 0xf7 && memGet24((pb << 16) | (pc + 2)) === 0xd6 && memGet24((pb << 16) | (pc + 3)) === 0xe1) {
        console.log(`[STA $E1D6F7,X] at ${pb.toString(16)}:${pc.toString(16)} A=${cpu.A.toString(16)} X=${cpu.X.toString(16)} Y=${cpu.Y.toString(16)} D=${cpu.D.toString(16)} DP03=${memGet24(cpu.D + 3).toString(16)}:${memGet24(cpu.D + 4).toString(16)}:${memGet24(cpu.D + 5).toString(16)}`)
      }

      if (!cpu.lastBD4C) cpu.lastBD4C = 0
      const curBD4C = memGet24(0x00bd4c) | (memGet24(0x00bd4d) << 8) | (memGet24(0x00bd4e) << 16)
      if (curBD4C === 0x7ff508 && cpu.lastBD4C !== 0x7ff508) {
        console.log(`[00:BD4C CHANGED TO 7FF508] at ${pb.toString(16)}:${pc.toString(16)}`)
        cpu.lastBD4C = curBD4C
      }

      if (pb === 0 && (pc === 0xf573 || pc === 0xf570)) {
        console.log(`[ENTRY TO 00:F573] A=${cpu.A.toString(16)} X=${cpu.X.toString(16)} Y=${cpu.Y.toString(16)} S=${cpu.S.toString(16)} D=${cpu.D.toString(16)} DB=${cpu.DB.toString(16)} P=${cpu.P.toString(16)}`)
        const st: string[] = []
        for (let s = 1; s <= 20; s++) {
          st.push(`S+${s}=$${memGet24(cpu.S + s).toString(16).padStart(2, "0")}`)
        }
        console.log(`Stack at F573: ${st.join(" ")}`)
        console.log(`DP FC..FE: ${memGet24(cpu.D + 0xfc).toString(16)} ${memGet24(cpu.D + 0xfd).toString(16)} ${memGet24(cpu.D + 0xfe).toString(16)}`)
        console.log("Last 150 instructions before 00:F573:")
        console.log(ringBuffer.slice(-150).join("\n"))
      }

      if (pb === 0 && pc === 0xf57d) {
        console.log(`[AT 00:F57D] A=${cpu.A.toString(16)} 5,S=$${memGet24(cpu.S + 5).toString(16).padStart(2, "0")}${memGet24(cpu.S + 6).toString(16).padStart(2, "0")} E8=${memGet24(cpu.D + 0xe8).toString(16)}:${memGet24(cpu.D + 0xe9).toString(16)}:${memGet24(cpu.D + 0xea).toString(16)} FC=${memGet24(cpu.D + 0xfc).toString(16)}:${memGet24(cpu.D + 0xfd).toString(16)}:${memGet24(cpu.D + 0xfe).toString(16)}`)
      }


      if (pb === 0xfe && pc === 0x00af && cpu.X === 0x1503) {
        console.log(`ENTRY TO TOOL 0x1503 at S=${cpu.S.toString(16)}:`)
        const st: string[] = []
        for (let i = 1; i <= 20; i++) {
          st.push(`S+${i}=$${memGet24(cpu.S + i).toString(16).padStart(2, "0")}`)
        }
        console.log(`Stack contents: ${st.join(" ")}`)
        console.log("Last 25 instructions before Tool 0x1503:")
        console.log(ringBuffer.slice(-25).join("\n"))
      }
      if (!cpu.firstFatal && pb === 0xff && pc >= 0xa500 && pc <= 0xa560) {
        cpu.firstFatal = true
        console.log(`FIRST ENTRY TO FATAL ERROR AT ${pb.toString(16)}:${pc.toString(16)} A=${cpu.A.toString(16)} X=${cpu.X.toString(16)} Y=${cpu.Y.toString(16)} S=${cpu.S.toString(16)}`)
        const st: string[] = []
        for (let i = 1; i <= 20; i++) {
          st.push(`S+${i}=$${memGet24(cpu.S + i).toString(16).padStart(2, "0")}`)
        }
        console.log(`Stack at fatal error: ${st.join(" ")}`)
        console.log("Last 60 instructions before Fatal error:")
        console.log(ringBuffer.slice(-60).join("\n"))
      }
      if (pb === 0xff && pc === 0xb7cc) {
        if (!cpu.b7ccCount) cpu.b7ccCount = 0
        cpu.b7ccCount++
        if (cpu.b7ccCount <= 10 || cpu.b7ccCount % 100 === 0) {
          console.log(`[b7ccCount=${cpu.b7ccCount}] REACHED FF:B7CC! PC=${pb.toString(16)}:${pc.toString(16)} P=${cpu.P.toString(16)} S=${cpu.S.toString(16)} E=${cpu.emulationMode} irqPending=${cpu.irqPending} flagIRQ=${s6502.flagIRQ} vblPending=${iigsGetVblPending()}`)
        }
      }
      if (pb === 0xff && pc === 0xbad2 && !dumpedBrk) {
        dumpedBrk = true
        console.log(`REACHED FF:BAD2! Current PC=${pb.toString(16)}:${pc.toString(16)}`)
        console.log("Last 60 instructions before FF:BAD2:")
        console.log(ringBuffer.slice(-60).join("\n"))
      }
      if (past681d && pb === 0 && (pc === 0xfa62 || pc === 0xfa56) && !dumpedBrk) {
        dumpedBrk = true
        console.log(`RE-ENTERED RESET at Frame/cycle! Current PC=${pb.toString(16)}:${pc.toString(16)}`)
        console.log("Last 60 instructions before reset:")
        console.log(ringBuffer.slice(-60).join("\n"))
      }
      return origPI(cb)
    }

    doBoot()
    doSetRunMode(RUN_MODE.RUNNING, false)

    // Run 1500 frames
    for (let f = 0; f < 1500; f++) {
      jest.advanceTimersByTime(17)
      if (f % 100 === 0) {
        console.log(`[Frame ${f}] PB=${cpu.PB.toString(16)} PC=${cpu.PC.toString(16)} E=${cpu.emulationMode} P=${cpu.P.toString(16)} I=${cpu.getFlag(0x04)} INTEN=${iigsRegisters[0x41].toString(16)} vblPending=${iigsGetVblPending()} b7ccCount=${cpu.b7ccCount || 0}`)
      }
    }

    console.log(`[Final] PB=${cpu.PB.toString(16)} PC=${cpu.PC.toString(16)} E=${cpu.emulationMode} P=${cpu.P.toString(16)}`)
    console.log("TEXT isSet:", SWITCHES.TEXT.isSet, "HIRES:", SWITCHES.HIRES.isSet, "DHIRES:", SWITCHES.DHIRES.isSet, "80COL:", SWITCHES.COLUMN80.isSet)
    console.log("NewVideo $C029:", iigsRegisters[0x29].toString(16), "Shadow $C035:", iigsRegisters[0x35].toString(16), "Speed $C036:", iigsRegisters[0x36].toString(16))

    // Check SHR buffer. Read it through getShr(), the same path the renderer
    // uses: once SHR is on, the aux window is linearized, so indexing megaIIAux
    // at $2000+$i reads the wrong half of the screen entirely.
    const shrPage = getShr()
    let shrNonZero = 0
    for (let i = 0; i < shrPage.length; i++) {
      if (shrPage[i] !== 0) shrNonZero++
    }
    console.log(`SHR buffer non-zero bytes: ${shrNonZero}/${shrPage.length}`)
    saveShrToBmp(shrPage, "gsos_screen.bmp")

    // Dump text screen if any
    const textLines: string[] = []
    for (let row = 0; row < 24; row++) {
      let line = ""
      const base = 0x400 + (row % 8) * 0x80 + Math.floor(row / 8) * 0x28
      for (let col = 0; col < 80; col++) {
        const isAux = (col % 2 === 0)
        const cell = isAux ? memory[0x18000 + base + Math.floor(col / 2)] : memory[base + Math.floor(col / 2)]
        const ch = cell & 0x7F
        line += (ch >= 32 && ch < 127) ? String.fromCharCode(ch) : "."
      }
      if (line.trim().length > 0) textLines.push(`Row ${row}: ${line}`)
    }
    if (textLines.length > 0) console.log("80-Col Text screen:\n" + textLines.join("\n"))
    console.log("Last 80 instructions:\n" + ringBuffer.slice(-80).join("\n"))

  } finally {
    doSetRunMode(RUN_MODE.PAUSED, false)
    resetCpuSpeedForTesting()
    jest.useRealTimers()
  }
})

function saveShrToBmp(shrData: Uint8Array, filepath: string) {
  const width = 640
  const height = 200

  const palR = new Uint8Array(256)
  const palG = new Uint8Array(256)
  const palB = new Uint8Array(256)

  for (let p = 0; p < 16; p++) {
    const pOffset = 0x7E00 + p * 32
    for (let c = 0; c < 16; c++) {
      const idx = (p << 4) | c
      const colorLo = shrData[pOffset + c * 2]
      const colorHi = shrData[pOffset + c * 2 + 1]
      const colorWord = colorLo | (colorHi << 8)
      palR[idx] = ((colorWord >> 8) & 0x0F) * 17
      palG[idx] = ((colorWord >> 4) & 0x0F) * 17
      palB[idx] = (colorWord & 0x0F) * 17
    }
  }

  const rowSize = width * 4
  const pixelArraySize = rowSize * height
  const fileSize = 54 + pixelArraySize
  const bmp = Buffer.alloc(fileSize)

  bmp.write("BM", 0)
  bmp.writeUInt32LE(fileSize, 2)
  bmp.writeUInt32LE(54, 10)
  bmp.writeUInt32LE(40, 14)
  bmp.writeInt32LE(width, 18)
  bmp.writeInt32LE(-height, 22)
  bmp.writeUInt16LE(1, 26)
  bmp.writeUInt16LE(32, 28)
  bmp.writeUInt32LE(0, 30)
  bmp.writeUInt32LE(pixelArraySize, 34)

  for (let y = 0; y < height; y++) {
    const lineOffset = y * 160
    const scb = shrData[0x7D00 + y]
    const palIdx = (scb & 0x0F) << 4
    const is640 = (scb & 0x80) !== 0
    const rowOffset = 54 + y * rowSize

    if (!is640) {
      for (let x = 0; x < 320; x++) {
        const byteVal = shrData[lineOffset + (x >> 1)]
        const color4Bit = (x & 1) ? (byteVal & 0x0F) : ((byteVal >> 4) & 0x0F)
        const c = palIdx | color4Bit
        const b = palB[c], g = palG[c], r = palR[c]
        const px1 = rowOffset + (x * 2) * 4
        bmp[px1] = b; bmp[px1 + 1] = g; bmp[px1 + 2] = r; bmp[px1 + 3] = 255
        const px2 = px1 + 4
        bmp[px2] = b; bmp[px2 + 1] = g; bmp[px2 + 2] = r; bmp[px2 + 3] = 255
      }
    } else {
      const quarterOffsets = [8, 12, 0, 4]
      for (let x = 0; x < 640; x++) {
        const byteVal = shrData[lineOffset + (x >> 2)]
        const pixelInByte = x & 3
        const shift = (3 - pixelInByte) * 2
        const color2Bit = (byteVal >> shift) & 0x03
        const colorIndex = quarterOffsets[pixelInByte] + color2Bit
        const c = palIdx | colorIndex
        const px = rowOffset + x * 4
        bmp[px] = palB[c]; bmp[px + 1] = palG[c]; bmp[px + 2] = palR[c]; bmp[px + 3] = 255
      }
    }
  }

  fs.writeFileSync(filepath, bmp)
  console.log(`Saved SHR screen BMP to ${filepath}`)
}
