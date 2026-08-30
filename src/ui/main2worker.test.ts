import { default6502State, MSG_MAIN, MSG_WORKER, RUN_MODE } from "../common/utility"
import {
  doOnMessage,
  requestLoadBinary,
  requestKeyboardState,
  requestSetDriveNewData,
  requestSetState6502,
  requestSetRunMode,
  requestSpeedMode,
  setMain2Worker,
} from "./main2worker"

jest.mock("./panels/disassembly/disassembly_utilities", () => ({
  set6502Instructions: jest.fn(),
  setDisassemblyVisibleMode: jest.fn(),
}))
jest.mock("./devices/audio/speaker", () => ({
  emulatorSoundEnable: jest.fn(),
  clickSpeaker: jest.fn(),
}))
jest.mock("./devices/disk/driveprops", () => ({ doSetUIDriveProps: jest.fn() }))
jest.mock("./ui_settings", () => ({ getHelpText: () => "" }))

const worker = { postMessage: jest.fn() }

const sendMachineState = (runMode: RUN_MODE) => {
  doOnMessage({
    data: {
      msg: MSG_WORKER.MACHINE_STATE,
      payload: { runMode, speedMode: 0, cpuSpeed: 0 } as MachineState,
    },
  } as MessageEvent)
}

const sendOperationResult = (operationId: number, error?: string) => {
  doOnMessage({
    data: {
      msg: MSG_WORKER.OPERATION_RESULT,
      payload: { operationId, error },
    },
  } as MessageEvent)
}

const lastOperationId = () => worker.postMessage.mock.calls.at(-1)[0].operationId as number

describe("worker operations", () => {
  beforeAll(() => setMain2Worker(worker as unknown as Worker))
  beforeEach(() => worker.postMessage.mockClear())

  test("resolves only the operation named by the worker result", async () => {
    const operation = requestSpeedMode(4)
    const operationId = lastOperationId()

    sendOperationResult(operationId)

    await expect(operation).resolves.toBeUndefined()
  })

  test("does not resolve an operation with another result", async () => {
    let resolved = false
    const operation = requestSetRunMode(RUN_MODE.PAUSED).then(() => {
      resolved = true
    })
    const operationId = lastOperationId()

    sendOperationResult(operationId + 1)
    await Promise.resolve()
    expect(resolved).toBe(false)

    sendMachineState(RUN_MODE.PAUSED)
    sendOperationResult(operationId)
    await expect(operation).resolves.toBeUndefined()
  })

  test("reports a worker error", async () => {
    const operation = requestSetRunMode(RUN_MODE.NEED_RESET)
    sendOperationResult(lastOperationId(), "Worker operation was superseded")

    await expect(operation).rejects.toThrow("Worker operation was superseded")
  })

  test("reports an operation timeout", async () => {
    jest.useFakeTimers()
    try {
      const operation = expect(requestSpeedMode(4, 25)).rejects.toThrow(
        "Timed out waiting for worker operation",
      )
      jest.advanceTimersByTime(25)
      await operation
    } finally {
      jest.useRealTimers()
    }
  })

  test("sends binary loads as confirmed worker operations", async () => {
    const data = new Uint8Array([0xA9, 0x42])
    const operation = requestLoadBinary(0x6000, data)
    const message = worker.postMessage.mock.calls.at(-1)[0]
    expect(message).toEqual(expect.objectContaining({
      msg: MSG_MAIN.LOAD_BINARY,
      payload: {address: 0x6000, data},
    }))

    sendOperationResult(message.operationId)
    await expect(operation).resolves.toBeUndefined()
  })

  test("sends CPU state changes as confirmed worker operations", async () => {
    const state = {...default6502State(), PC: 0x6000, Accum: 0x42}
    const operation = requestSetState6502(state)
    const message = worker.postMessage.mock.calls.at(-1)[0]
    expect(message).toEqual(expect.objectContaining({
      msg: MSG_MAIN.STATE6502,
      payload: state,
    }))

    sendOperationResult(message.operationId)
    await expect(operation).resolves.toBeUndefined()
  })

  test.each([
    {key: 0x41, isDown: true, repeat: false},
    {key: 0x41, isDown: true, repeat: true},
    {key: 0, isDown: false, repeat: false},
  ])("sends keyboard state as a confirmed worker operation", async (keyboardState) => {
    const operation = requestKeyboardState(keyboardState)
    const message = worker.postMessage.mock.calls.at(-1)[0]
    expect(message).toEqual(expect.objectContaining({
      msg: MSG_MAIN.KEYBOARD_STATE,
      payload: keyboardState,
    }))

    sendOperationResult(message.operationId)
    await expect(operation).resolves.toBeUndefined()
  })

  test("sends drive data as a confirmed worker operation", async () => {
    const props = {index: 2, filename: "test.woz"} as DriveProps
    let resolved = false
    const operation = requestSetDriveNewData(props).then(() => {
      resolved = true
    })
    const message = worker.postMessage.mock.calls.at(-1)[0]
    expect(message).toEqual(expect.objectContaining({
      msg: MSG_MAIN.DRIVE_NEW_DATA,
      payload: props,
    }))

    await Promise.resolve()
    expect(resolved).toBe(false)
    sendOperationResult(message.operationId)
    await expect(operation).resolves.toBeUndefined()
  })

  test("reports a rejected drive operation", async () => {
    const operation = requestSetDriveNewData({index: 2, filename: "bad.woz"} as DriveProps)

    sendOperationResult(lastOperationId(), "Invalid disk image")

    await expect(operation).rejects.toThrow("Invalid disk image")
  })
})
