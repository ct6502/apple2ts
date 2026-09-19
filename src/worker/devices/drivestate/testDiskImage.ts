/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-explicit-any */
// Shared helper for the per-game isolated disk-boot tests in this directory.
// Each test file that imports this pulls in its own fresh copy of every
// module it transitively depends on (Jest isolates modules per test FILE),
// so games tested in separate files can never leak diskdata.ts's
// module-level timing state (cycleRemainder, fullRevolutionCount, etc.)
// into each other -- unlike the original combined drivestate.test.ts.
import path from "path"
import * as fs from "fs"
import { doSetEmuDriveNewData } from "../drivestate"
import { setIsTesting } from "../../worker2main"
import { doBoot, doSetRunMode } from "../../motherboard"
import { s6502 } from "../../instructions"
import { processInstruction } from "../../cpu6502"
import { RUN_MODE } from "../../../common/utility"

export const testDiskImage = async (disk: string, address: number, minCycleCount: number, maxCycleCount: number) => {
  setIsTesting()
  const filePath = path.resolve(__dirname, "../../../../public/disks/", disk)
  let data: Buffer

  if (fs.existsSync(filePath)) {
    data = fs.readFileSync(filePath)
  } else {
    const url = `https://raw.githubusercontent.com/anomixer/apple2ts/disks/public/disks/${encodeURIComponent(disk)}`
    console.log(`Downloading missing test disk image: ${url}`)
    try {
      if (typeof fetch === "function") {
        const response = await fetch(url)
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }
        const arrayBuffer = await response.arrayBuffer()
        data = Buffer.from(arrayBuffer)
      } else {
        data = await new Promise<Buffer>((resolve, reject) => {
          const https = require("https")
          https.get(url, (res: any) => {
            if (res.statusCode !== 200) {
              reject(new Error(`HTTP ${res.statusCode}`))
              return
            }
            const chunks: any[] = []
            res.on("data", (chunk: any) => chunks.push(chunk))
            res.on("end", () => resolve(Buffer.concat(chunks)))
          }).on("error", reject)
        })
      }
    } catch (error) {
      throw new Error(`Failed to download missing disk image ${disk} for testing: ${error}`)
    }
  }

  const props: DriveProps = {
    index: 2,
    hardDrive: false,
    drive: 1,
    filename: disk,
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
  doSetEmuDriveNewData(props)
  doBoot()
  doSetRunMode(RUN_MODE.RUNNING)
  if (s6502.cycleCount >= 0) {
    for (let i = 0; i < 15000000; i++) {
      processInstruction()
      if (s6502.PC === address && s6502.cycleCount > minCycleCount) {
        break
      }
    }
    expect(s6502.PC).toEqual(address)
    expect(s6502.cycleCount).toBeGreaterThan(minCycleCount)
    expect(s6502.cycleCount).toBeLessThan(maxCycleCount)
  } else {
    expect("").toEqual("cycle count should be greater than 0")
  }
}
