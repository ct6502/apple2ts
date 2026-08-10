const audioEnable = jest.fn()
const getAudioStatus = jest.fn()
const retrySpeakerAudio = jest.fn()

jest.mock("../devices/audio/speaker", () => ({
  audioEnable,
  getAudioStatus,
  retrySpeakerAudio,
}))
jest.mock("../main2worker", () => ({
  passSetMachineName: jest.fn(),
  passSpeedMode: jest.fn(),
}))
jest.mock("../localstorage", () => ({
  setPreferenceColorMode: jest.fn(),
}))

import { toolSetSound } from "./mcp_tool_settings"

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
