import { act, useState } from "react"
import { createRoot } from "react-dom/client"
import type { Root } from "react-dom/client"
import { GlobalContext } from "./globalcontext"
import { drawHiresTile } from "./graphicshgr"
import HgrMagnifier from "./hgrmagnifier"

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean })
  .IS_REACT_ACT_ENVIRONMENT = true

const mockGetOverrideHiresPixels = jest.fn<number[][] | null, [number, number]>(() => null)

jest.mock("./graphics", () => ({
  canvasCoordToNormScreenCoord: () => [0.5, 0.5],
  getOverrideHiresPixels: (x: number, y: number) => mockGetOverrideHiresPixels(x, y),
  nColsHgrMagnifier: 2,
  nRowsHgrMagnifier: 16,
  screenBytesToCanvasPixels: () => [28, 32],
  screenCoordToCanvasCoord: () => [100, 100],
}))
jest.mock("./graphicshgr", () => ({ drawHiresTile: jest.fn() }))

const Harness = ({ mainCanvas, updateFromMemoryTable = true, initiallyLocked = false }: {
  mainCanvas: HTMLCanvasElement,
  updateFromMemoryTable?: boolean,
  initiallyLocked?: boolean,
}) => {
  const [updateHgrMagnifier, setUpdateHgrMagnifier] = useState(updateFromMemoryTable)
  const [hgrMagnifierLoc, setHgrMagnifierLoc] = useState([4, 7])
  const [lockHgrMagnifier, setLockHgrMagnifier] = useState(initiallyLocked)

  return <GlobalContext.Provider value={{
    hgrMagnifierLoc,
    lockHgrMagnifier,
    memdumpAddress: 0,
    returnToTourHelp: false,
    runTour: "",
    setHgrMagnifierLoc,
    setLockHgrMagnifier,
    setMemdumpAddress: () => {},
    setReturnToTourHelp: () => {},
    setRunTour: () => {},
    setTourIndex: () => {},
    setTourSourceTheme: () => {},
    setUpdateBreakpoint: () => {},
    setUpdateHgrMagnifier,
    tourIndex: 0,
    tourSourceTheme: 0,
    updateBreakpoint: 0,
    updateHgrMagnifier,
  }}>
    <HgrMagnifier
      lockHgrMagnifier={lockHgrMagnifier}
      mainCanvas={mainCanvas}
      mouseLoc={[200, 100]}
    />
    <button onClick={() => setLockHgrMagnifier(true)}>Lock</button>
    <button onClick={() => {
      setHgrMagnifierLoc([8, 9])
      setUpdateHgrMagnifier(true)
    }}>Select table location</button>
    <output>{hgrMagnifierLoc.join(",")}</output>
  </GlobalContext.Provider>
}

it("uses a memory-table location throughout the lock transition", () => {
  const container = document.createElement("div")
  const mainCanvas = document.createElement("canvas")
  let root: Root

  act(() => {
    root = createRoot(container)
    root.render(<Harness mainCanvas={mainCanvas} />)
  })

  expect(container.querySelector("output")?.textContent).toBe("4,7")
  expect(mockGetOverrideHiresPixels).toHaveBeenCalledWith(4, 7)
  expect(mockGetOverrideHiresPixels).not.toHaveBeenCalledWith(20, 89)

  act(() => root.unmount())
})

it("uses the mouse location for an ordinary canvas lock", () => {
  const container = document.createElement("div")
  const mainCanvas = document.createElement("canvas")
  let root: Root

  act(() => {
    root = createRoot(container)
    root.render(<Harness mainCanvas={mainCanvas} updateFromMemoryTable={false} />)
  })
  act(() => container.querySelector("button")?.click())

  expect(container.querySelector("output")?.textContent).toBe("20,89")

  act(() => root.unmount())
})

it("does not redraw the previous table location after a new selection", () => {
  jest.useFakeTimers()
  const context = {
    beginPath: jest.fn(),
    fillRect: jest.fn(),
    lineTo: jest.fn(),
    moveTo: jest.fn(),
    stroke: jest.fn(),
  } as unknown as CanvasRenderingContext2D
  const getContext = jest.spyOn(HTMLCanvasElement.prototype, "getContext")
    .mockReturnValue(context)
  mockGetOverrideHiresPixels.mockImplementation((x, y) =>
    Array.from({ length: 16 }, () => [0x2000, x, y]))
  const mockDrawHiresTile = jest.mocked(drawHiresTile)
  const container = document.createElement("div")
  const mainCanvas = document.createElement("canvas")
  let root: Root

  act(() => {
    root = createRoot(container)
    root.render(<Harness mainCanvas={mainCanvas}
      updateFromMemoryTable={false} initiallyLocked={true} />)
  })
  mockDrawHiresTile.mockClear()

  act(() => container.querySelectorAll("button")[1].click())
  act(() => jest.runOnlyPendingTimers())

  const expectedTile = Array.from(
    { length: 32 }, (_, index) => index % 2 === 0 ? 8 : 9,
  )
  expect(mockDrawHiresTile).toHaveBeenCalled()
  for (const call of mockDrawHiresTile.mock.calls) {
    expect(Array.from(call[1])).toEqual(expectedTile)
  }

  act(() => root.unmount())
  getContext.mockRestore()
  mockGetOverrideHiresPixels.mockReset()
  mockGetOverrideHiresPixels.mockReturnValue(null)
  jest.useRealTimers()
})
