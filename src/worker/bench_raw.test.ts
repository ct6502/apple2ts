/**
 * Raw CPU-core throughput benchmark (REAL wall time via process.hrtime, since
 * jest fake timers freeze performance.now). Executes a fixed number of
 * instructions on the booted IIgs CPU and reports instructions/sec and
 * cycles/sec. Compare core optimizations with this, not the timer bench.
 */
import { doSetMachineName, doSetRunMode, doBoot } from "./motherboard"
import { RUN_MODE } from "../common/utility"
import { setIsTesting } from "./worker2main"
import { s6502 } from "./instructions"
import { CPU65816 } from "./cpu65816"
import { getCPU } from "./motherboard"

jest.setTimeout(120000)

const N_INSTRUCTIONS = 2000000

const hr = () => Number(process.hrtime.bigint()) / 1e6 // ms

test("rawcore", () => {
  setIsTesting()
  doSetMachineName("APPLE2GS")
  doBoot()
  doSetRunMode(RUN_MODE.RUNNING, false)
  // Drive the run loop manually for a while so we land in steady-state GS/OS
  const cpu = getCPU() as CPU65816
  console.log(`[RAWCORE] cpu=${cpu?.constructor?.name}`)
  const cpuAny = cpu as any
  // Execute one refresh's worth of budget per step manually:
  let t0 = hr()
  for (let f = 0; f < 100; f++) {
    let tot = 0
    while (tot < 46727 && cpuAny.processInstruction) {
      const c = cpu.processInstruction(null)
      if (c <= 0) break
      s6502.cycleCount += c
      tot += c
    }
  }
  console.log(`[RAWCORE] run-loop warmup: ${N_INSTRUCTIONS && (hr() - t0).toFixed(0)}ms`)
  const cyc0 = s6502.cycleCount
  let csum = 0
  t0 = hr()
  for (let i = 0; i < N_INSTRUCTIONS; i++) {
    csum += cpu.processInstruction(null)
  }
  const dt = hr() - t0
  const cyc = s6502.cycleCount - cyc0
  console.log(`[RAWCORE] instr=${N_INSTRUCTIONS} time=${dt.toFixed(0)}ms csum=${csum} ${(N_INSTRUCTIONS / dt * 1000 / 1e6).toFixed(2)}Minstr/s cycles=${cyc} -> ${(cyc / dt * 1000 / 1e6).toFixed(2)} Mcycles/s  (${(cyc / N_INSTRUCTIONS).toFixed(1)} cyc/instr)`)
})
