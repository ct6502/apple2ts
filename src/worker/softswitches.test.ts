import { memGet, memSet, memoryReset } from "./memory"
import { getSoftSwitchDescriptions, resetSoftSwitches, setVideo7Override, SWITCHES } from "./softswitches"

const video7Modes: Array<[Video7Mode, keyof typeof SWITCHES]> = [
  ["160x192", "VIDEO7_160"],
  ["monochrome", "VIDEO7_MONO"],
  ["mixed", "VIDEO7_MIXED"],
]

const expectVideo7Mode = (selected: Video7Mode | null) => {
  for (const [mode, switchName] of video7Modes) {
    expect(SWITCHES[switchName].isSet).toBe(mode === selected)
  }
}

const access = (address: number) => memGet(address)

const resetVideo7TestState = () => {
  memoryReset()
  resetSoftSwitches()
  memSet(0xC001, 0) // 80STORE on so AN3 clocks Video-7 state
  for (let i = 0; i < 2; i++) {
    memSet(0xC00D, 0) // 80COL on: clock a zero
    access(0xC05E) // AN3 off
    access(0xC05F) // AN3 on
  }
  resetSoftSwitches()
}

beforeEach(resetVideo7TestState)

test.each([
  ["reads", (address: number) => memGet(address)],
  ["writes", (address: number) => memSet(address, 0)],
])("CPU %s to $C078-$C07D do not select Video-7 modes", (_name, cpuAccess) => {
  const unknownSwitch = jest.spyOn(console, "error").mockImplementation()
  try {
    for (let address = 0xC078; address <= 0xC07D; address++) {
      cpuAccess(address)
      expectVideo7Mode(null)
      for (const [mode] of video7Modes) {
        setVideo7Override(mode, true)
        cpuAccess(address)
        expectVideo7Mode(mode)
        setVideo7Override(mode, false)
      }
    }
  } finally {
    unknownSwitch.mockRestore()
  }
})

test("the documented AN3/80COL sequence selects Video-7 monochrome mode", () => {
  memSet(0xC001, 0) // 80STORE on
  memSet(0xC00C, 0) // 80COL off
  access(0xC05E) // AN3 off
  access(0xC05F) // AN3 on: clock 1
  access(0xC05E) // AN3 off
  access(0xC05F) // AN3 on: clock 1
  memSet(0xC00D, 0) // 80COL on
  access(0xC05E) // AN3 off

  expectVideo7Mode("monochrome")
})

test("the documented AN3/80COL sequence selects Video-7 mixed mode", () => {
  memSet(0xC001, 0) // 80STORE on
  memSet(0xC00C, 0) // 80COL off
  access(0xC05E) // AN3 off
  access(0xC05F) // AN3 on: clock 1
  memSet(0xC00D, 0) // 80COL on
  access(0xC05E) // AN3 off
  access(0xC05F) // AN3 on: clock 0
  access(0xC05E) // AN3 off

  expectVideo7Mode("mixed")
})

test("the documented AN3/80COL sequence selects Video-7 160x192 mode", () => {
  memSet(0xC001, 0) // 80STORE on
  memSet(0xC00C, 0) // 80COL off
  access(0xC05E) // AN3 off
  access(0xC05F) // AN3 on: clock 1

  expectVideo7Mode("160x192")
})

test.each(video7Modes)("the debugger can override %s without a CPU address", (mode, switchName) => {
  setVideo7Override(mode, true)
  expect(SWITCHES[switchName].isSet).toBe(true)

  setVideo7Override(mode, false)
  expect(SWITCHES[switchName].isSet).toBe(false)
})

test("soft-switch discovery does not advertise internal Video-7 overrides", () => {
  const descriptions = getSoftSwitchDescriptions()
  for (let address = 0xC078; address <= 0xC07D; address++) {
    expect(descriptions[address]).toBeUndefined()
  }
})
