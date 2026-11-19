import { doSetMachineName, doSetRunMode, doBoot, resetCpuSpeedForTesting, getCPU, doSetSlotConfig } from "./motherboard"
import { memGet24 } from "./memory"
import { doSetEmuDriveNewData } from "./devices/drivestate"
import { DEFAULT_SLOT_CONFIG_GS, RUN_MODE } from "../common/utility"
import { setIsTesting } from "./worker2main"
import { setKeyboardState } from "./devices/keyboard"
import * as fs from "fs"

const IMG = "public/disks/Ultima IV.hdv"
const advance = (n: number) => { for (let i = 0; i < n; i++) jest.advanceTimersByTime(17) }

test("GS Ultima IV slot-4 Mockingboard activation does not crash", () => {
  jest.useFakeTimers()
  setIsTesting()
  try {
    doSetMachineName("APPLE2GS")
    doSetSlotConfig({ ...DEFAULT_SLOT_CONFIG_GS, 4: "mockingboard", 7: "smartport" })
    doSetEmuDriveNewData({
      index: 0, hardDrive: true, drive: 1, filename: "Ultima IV.hdv", status: "",
      motorRunning: false, diskHasChanges: false, isWriteProtected: false,
      diskData: new Uint8Array(fs.readFileSync(IMG)), lastAppleWriteTime: 0,
      cloudData: null, writableFileHandle: null, lastLocalFileWriteTime: 0,
    } as DriveProps)
    doBoot()
    doSetRunMode(RUN_MODE.RUNNING, false)
    const cpu = getCPU() as any
    const trace: string[] = []
    const fwtrace: string[] = []
    const reads: string[] = []
    const trace8000: string[] = []
    const traceKB: string[] = []
    const traceMenu: string[] = []
    const traceHigh: string[] = []
    const traceMBSI: string[] = []
    const callers: string[] = []
    const brk: string[] = []
    let frameNow = 0
    const origPI = cpu.processInstruction.bind(cpu)
    cpu.processInstruction = (cb?: any) => {
      const pc = cpu.PC
      const pb = cpu.PB
      if (pb === 0 && pc >= 0x1D00 && pc <= 0x1D80) trace.push(`00:${pc.toString(16).padStart(4, "0")} op=${memGet24((pb << 16) | pc).toString(16)}`)
      if (pb === 0 && pc >= 0x0500 && pc <= 0x0570) traceMBSI.push(`00:${pc.toString(16).padStart(4, "0")} op=${memGet24((pb << 16) | pc).toString(16)} frame=${frameNow}`)
      if (pc === 0x1D72 && pb === 0) trace.push(`AT1D72 PC=00:1D72 frame=${frameNow}`)
      if (memGet24((pb << 16) | pc) === 0x00) brk.push(`BRK-OP ${pb.toString(16).padStart(2, "0")}:${pc.toString(16).padStart(4, "0")} frame=${frameNow}`)
      if ((pb === 0 || pb === 0xFF) && pc >= 0xC070 && pc <= 0xC0BF) fwtrace.push(`${pb.toString(16).padStart(2, "0")}:${pc.toString(16).padStart(4, "0")} op=${memGet24((pb << 16) | pc).toString(16)}`)
      if (pb === 0 && pc >= 0x8000 && pc <= 0x8FFF) trace8000.push(`00:${pc.toString(16).padStart(4, "0")} op=${memGet24((pb << 16) | pc).toString(16)}`)
      if (pb === 0 && pc >= 0x6AF0 && pc <= 0x6BFF) traceKB.push(`00:${pc.toString(16).padStart(4, "0")} op=${memGet24((pb << 16) | pc).toString(16)}`)
      if (pb === 0 && pc >= 0x6700 && pc <= 0x6AFF) traceMenu.push(`00:${pc.toString(16).padStart(4, "0")} op=${memGet24((pb << 16) | pc).toString(16)}`)
      if (pb === 0 && pc >= 0x6760 && pc <= 0x69FF) traceHigh.push(`00:${pc.toString(16).padStart(4, "0")} op=${memGet24((pb << 16) | pc).toString(16)}`)
      if (pb === 0 && pc >= 0x6700 && pc <= 0x6FFF && memGet24((pb << 16) | pc) === 0x20) {
        const target = memGet24((pb << 16) | (pc + 1)) | (memGet24((pb << 16) | (pc + 2)) << 8)
        if (target === 0x6AF4) callers.push(`caller=${pc.toString(16)} frame=${frameNow} S=${cpu.S.toString(16)}`)
      }
      return origPI(cb)
    }
    const origRead = (cpu as any).read8or16.bind(cpu)
    ;(cpu as any).read8or16 = (addr: number, eightBit: boolean) => {
      if (addr === 0xC000 && frameNow >= 2595) {
        const value = origRead(addr, eightBit)
        reads.push(`f=${frameNow} PC=${cpu.PB.toString(16)}:${cpu.PC.toString(16)} v=${value.toString(16)}`)
        return value
      }
      return origRead(addr, eightBit)
    }
    for (let f = 1; f <= 6000; f++) {
      frameNow = f
      advance(1)
      if (f === 2601) {
        setKeyboardState({ key: 0x41, isDown: true, repeat: false })
      }
      if (f === 2602) {
        setKeyboardState({ key: 0x41, isDown: false, repeat: false })
      }
      if (f === 2610) {
        setKeyboardState({ key: 0x41, isDown: true, repeat: false })
      }
      if (f === 2611) {
        setKeyboardState({ key: 0x41, isDown: false, repeat: false })
      }
      if (f === 2620) {
        setKeyboardState({ key: 0x4F, isDown: true, repeat: false })
      }
      if (f === 2621) {
        setKeyboardState({ key: 0x4F, isDown: false, repeat: false })
      }
      if (f === 2630) {
        setKeyboardState({ key: 0x33, isDown: true, repeat: false })
      }
      if (f === 2631) {
        setKeyboardState({ key: 0x33, isDown: false, repeat: false })
      }
      if (f === 2640) {
        setKeyboardState({ key: 0x34, isDown: true, repeat: false })
      }
      if (f === 2641) {
        setKeyboardState({ key: 0x34, isDown: false, repeat: false })
      }
      if (f === 2600 || f === 2630 || f === 2640 || f === 2700 || f === 2800 || f === 3000 || f === 4000 || f === 5000 || f === 6000) {
        // console.log(`frame ${f} hires=${hires.length} txt=${txt.length} text=${SWITCHES.TEXT.isSet} hiresOn=${SWITCHES.HIRES.isSet} page2=${SWITCHES.PAGE2.isSet} C00B=${memGet24(0x00C00B).toString(16)}`)
        // console.log(`  card IER=${memGetSlotROM(4, 0x0E).toString(16)} IFR=${memGetSlotROM(4, 0x0D).toString(16)} T1CL=${memGetSlotROM(4, 0x04).toString(16)} T1CH=${memGetSlotROM(4, 0x05).toString(16)}`)
        // console.log(`  slotreg=${memGet24(0x00C02D).toString(16)} vec03FE=${memGet24(0x0003FE).toString(16)}/${memGet24(0x0003FF).toString(16)} vecFFFE=${memGet24(0x00FFFE).toString(16)}/${memGet24(0x00FFFF).toString(16)} zp80=${memGet24(0x000080).toString(16)} zpB0=${memGet24(0x0000B0).toString(16)} act=${memGet24(0x00674C).toString(16)}`)
      }
      // keep running; 6000 frames exercises activated playback long enough to
      // catch the GS monitor / BRK storm that the card activation caused.
    }
    // console.log("trace 8000 count:", trace8000.length, "first:", trace8000.slice(0, 20).join(" | "), "last:", trace8000.slice(-20).join(" | "))
    // console.log("trace KB count:", traceKB.length, "first:", traceKB.slice(0, 20).join(" | "), "last:", traceKB.slice(-20).join(" | "))
    // console.log("trace MENU count:", traceMenu.length, "first:", traceMenu.slice(0, 60).join(" | "), "last:", traceMenu.slice(-60).join(" | "))
    // console.log("trace HIGH count:", traceHigh.length, "all:", traceHigh.join(" | "))
    // console.log("callers:", callers.join(" | "))
    // console.log("reads C000:", reads.join(" | "))
    // console.log("trace 1D:", trace.filter(line => !line.startsWith("BRK-OP")).join(" | "))
    // console.log("trace MBSI count:", traceMBSI.length, "first:", traceMBSI.slice(0, 12).join(" | "), "last:", traceMBSI.slice(-12).join(" | "))
    // console.log("trace FW count:", fwtrace.length, "first:", fwtrace.slice(0, 8).join(" | "), "last:", fwtrace.slice(-8).join(" | "))
    const brkStorm = brk.filter(line => line.startsWith("BRK-OP 00:b900") && Number(line.split("frame=")[1]) >= 2700)
    // console.log("trace BRK count:", brk.length, "storm:", brkStorm.length, "first:", brkStorm.slice(0, 10).join(" | "), "last:", brkStorm.slice(-10).join(" | "))
    expect(brkStorm).toHaveLength(0)
    expect(traceMBSI.length).toBeGreaterThan(0)
    expect(memGet24(0x00674C)).toBe(0xFF)
    expect((cpu.PB << 16) | cpu.PC).not.toBe(0xFFBA01)
    // console.log("vectors:", memGet24(0x00FFFE).toString(16), memGet24(0x00FFFF).toString(16), memGet24(0x00FFEE).toString(16), memGet24(0x00FFEF).toString(16))
    // console.log("final PC=", (cpu.PC).toString(16), "PB=", cpu.PB.toString(16), "S=", cpu.S.toString(16))
  } finally {
    doSetRunMode(RUN_MODE.PAUSED, false)
    resetCpuSpeedForTesting()
    jest.useRealTimers()
  }
}, 300000)
