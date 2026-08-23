import { act } from "react"
import { createRoot } from "react-dom/client"
import { overrideHires } from "../../graphics"
import MemoryDump from "./memorydump"

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean })
  .IS_REACT_ACT_ENVIRONMENT = true
Object.defineProperty(globalThis, "TextDecoder", {
  configurable: true,
  value: class { decode() { return "" } },
})

jest.mock("../../main2worker", () => ({
  handleGetAddressGetTable: () => new Uint32Array(),
  handleGetBreakpoints: () => new Map(),
  handleGetMemoryDump: () => new Uint8Array(),
  handleGetRunMode: () => 0,
  passSetMemory: jest.fn(),
}))
jest.mock("../../graphics", () => ({ overrideHires: jest.fn() }))
jest.mock("./memorytable", () => () => null)
jest.mock("../droplist", () => ({
  Droplist: ({ setValue, value }: { setValue: (value: string) => void, value: string }) =>
    <button onClick={() => setValue("HGR page 1 (screen order)")}>{value}</button>,
}))

it("restores the selected HGR override when the memory view remounts", () => {
  const container = document.createElement("div")
  const firstRoot = createRoot(container)
  act(() => firstRoot.render(<MemoryDump />))
  expect(overrideHires).not.toHaveBeenCalled()

  act(() => container.querySelector("button")?.click())
  expect(overrideHires).toHaveBeenLastCalledWith(true, false)

  act(() => firstRoot.unmount())
  expect(overrideHires).toHaveBeenLastCalledWith(false, false)

  const secondRoot = createRoot(container)
  act(() => secondRoot.render(<MemoryDump />))
  expect(container.querySelector("button")?.textContent)
    .toBe("HGR page 1 (screen order)")
  expect(overrideHires).toHaveBeenLastCalledWith(true, false)

  act(() => secondRoot.unmount())
})
