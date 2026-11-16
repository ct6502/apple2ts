import { doSetMachineName, doSetRunMode, doBoot, doReset, resetCpuSpeedForTesting, getCPU } from "./motherboard"
import { getTextPageAsString, memGet24 } from "./memory"
import { iigsADB } from "./iigs_adb"
import { RUN_MODE } from "../common/utility"
import { setIsTesting } from "./worker2main"

test("test Ctrl-Reset from Check startup device screen", () => {
  jest.useFakeTimers()
  setIsTesting()
  try {
    doSetMachineName("APPLE2GS")
    doBoot()
    doSetRunMode(RUN_MODE.RUNNING, false)
    // Run 600 frames to reach Check startup device
    for (let f = 0; f < 600; f++) {
      jest.advanceTimersByTime(17)
    }
    const screenBefore = getTextPageAsString()
    console.log("Screen before reset:\n", screenBefore.slice(0, 120))
    console.log("ADB RAM 0x51 before reset:", (iigsADB as unknown as { ucMemory: Uint8Array }).ucMemory[0x51])
    console.log("$03F2-$03F4 before reset:", memGet24(0x0003F2).toString(16), memGet24(0x0003F3).toString(16), memGet24(0x0003F4).toString(16))

    // Trace instructions around reset
    const cpu = getCPU() as any
    const trace: string[] = []
    const origPI = cpu.processInstruction.bind(cpu)
    cpu.processInstruction = (cb?: any) => {
      const pb = cpu.PB, pc = cpu.PC
      if (trace.length < 500) {
        trace.push(`${pb.toString(16).padStart(2, "0")}:${pc.toString(16).padStart(4, "0")} op=${memGet24((pb << 16) | pc).toString(16)} A=${cpu.A.toString(16)} X=${cpu.X.toString(16)} Y=${cpu.Y.toString(16)} S=${cpu.S.toString(16)} P=${cpu.P.toString(16)}`)
      }
      return origPI(cb)
    }

    console.log("Triggering doReset() ...")
    doReset()

    // Advance 600 frames
    for (let f = 0; f < 600; f++) {
      jest.advanceTimersByTime(17)
    }

    const screenAfter = getTextPageAsString()
    console.log("End CPU state:", `PB=${cpu.PB.toString(16)} PC=${cpu.PC.toString(16)} S=${cpu.S.toString(16)} P=${cpu.P.toString(16)} A=${cpu.A.toString(16)} X=${cpu.X.toString(16)} Y=${cpu.Y.toString(16)}`)
    console.log("Screen after reset:\n", screenAfter)
    expect(screenAfter).toContain("]")
  } finally {
    doSetRunMode(RUN_MODE.PAUSED, false)
    resetCpuSpeedForTesting()
    jest.useRealTimers()
  }
})
