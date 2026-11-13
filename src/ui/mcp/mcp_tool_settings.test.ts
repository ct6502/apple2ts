const audioEnable = jest.fn()
const getAudioStatus = jest.fn()
const retrySpeakerAudio = jest.fn()

jest.mock("../devices/audio/speaker", () => ({
  audioEnable,
  getAudioStatus,
  retrySpeakerAudio,
}))
jest.mock("../main2worker", () => ({
  handleGetMachineName: jest.fn(),
  passSetMachineName: jest.fn(),
  passSpeedMode: jest.fn(),
}))
jest.mock("../localstorage", () => ({
  setPreferenceColorMode: jest.fn(),
}))

import { passSetMachineName } from "../main2worker"
import { listMCPTools } from "./mcp_tools"
import { toolSetMachineType, toolSetSound } from "./mcp_tool_settings"

describe("toolSetMachineType", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("offers the four machines in the fixed order", () => {
    const tools = listMCPTools()
    const tool = tools.find(candidate => candidate.name === "set_machine_type")
    const machineType = (tool?.inputSchema as {
      properties?: { machineType?: { enum?: string[] } }
    })?.properties?.machineType
    expect(machineType?.enum).toEqual(["APPLE2P", "APPLE2EU", "APPLE2EE", "APPLE2GS"])
  })

  it("accepts APPLE2GS and names it Apple IIgs", () => {
    expect(toolSetMachineType("APPLE2GS")).toMatchObject({
      success: true,
      data: {
        machineType: "APPLE2GS",
        machineName: "Apple IIgs",
        message: "Machine type set to Apple IIgs",
      },
    })
    expect(passSetMachineName).toHaveBeenCalledWith("APPLE2GS")
  })

  it("rejects an unknown machine type", () => {
    expect(toolSetMachineType("MACINTOSH")).toEqual({
      success: false,
      error: "Machine type must be \"APPLE2P\", \"APPLE2EU\", \"APPLE2EE\", or \"APPLE2GS\"",
    })
    expect(passSetMachineName).not.toHaveBeenCalled()
  })
})

describe("toolSetSound", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("retries unavailable audio before reporting it enabled", async () => {
    getAudioStatus
      .mockReturnValueOnce("unavailable")
      .mockReturnValueOnce("enabled")

    await expect(toolSetSound(true)).resolves.toMatchObject({
      success: true,
      data: {enabled: true},
    })
    expect(retrySpeakerAudio).toHaveBeenCalledTimes(1)
  })

  it("reports failure when retry leaves audio unavailable", async () => {
    getAudioStatus.mockReturnValue("unavailable")

    await expect(toolSetSound(true)).resolves.toEqual({
      success: false,
      error: "Sound is unavailable",
    })
  })

  it("disables sound without retrying an unavailable speaker", async () => {
    getAudioStatus.mockReturnValue("unavailable")

    await expect(toolSetSound(false)).resolves.toMatchObject({
      success: true,
      data: {enabled: false},
    })
    expect(retrySpeakerAudio).not.toHaveBeenCalled()
  })
})
